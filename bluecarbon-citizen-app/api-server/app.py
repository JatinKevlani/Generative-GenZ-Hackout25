from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import uuid
from segmentation_module import SegmentationModel
from iot_module import BlueGuardIoT
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # api-server/
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = UPLOAD_DIR
app.config['OUTPUT_FOLDER'] = OUTPUT_DIR

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}

# Ensure upload and output directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

# Initialize segmentation model
segmentation_model = SegmentationModel()

# Initialize IoT controller
iot_controller = BlueGuardIoT()

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_unique_filename(original_filename):
    """Generate a unique filename to prevent conflicts."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    ext = original_filename.rsplit('.', 1)[1].lower()
    return f"{timestamp}_{unique_id}.{ext}"

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "Image Segmentation API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict_image():
    """
    Predict segmentation on uploaded image.
    
    Expected form data:
    - file: image file
    - confidence: confidence threshold (optional, default: 50)
    - return_annotated: whether to return annotated image (optional, default: true)
    """
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({"error": f"File type not allowed. Supported types: {', '.join(ALLOWED_EXTENSIONS)}"}), 400
        
        # Get optional parameters
        confidence = int(request.form.get('confidence', 50))
        return_annotated = request.form.get('return_annotated', 'true').lower() == 'true'
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        unique_filename = generate_unique_filename(filename)
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(input_path)
        
        logger.info(f"Processing image: {unique_filename} with confidence: {confidence}")
        
        # Process image through segmentation model
        if return_annotated:
            result = segmentation_model.predict_and_annotate(
                image_path=input_path,
                confidence=confidence,
                output_folder=app.config['OUTPUT_FOLDER']
            )
        else:
            result = segmentation_model.predict_only(
                image_path=input_path,
                confidence=confidence
            )
        
        # Clean up input file
        os.remove(input_path)
        
        # Return result
        if return_annotated and 'annotated_image_path' in result:
            result['annotated_image_url'] = f"/download/{os.path.basename(result['annotated_image_path'])}"
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        # Clean up files in case of error
        if 'input_path' in locals() and os.path.exists(input_path):
            os.remove(input_path)
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download processed/annotated image."""
    try:
        file_path = os.path.join(app.config['OUTPUT_FOLDER'], filename)
        print(file_path)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        logger.error(f"Error downloading file {filename}: {str(e)}")
        return jsonify({"error": "Download failed"}), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model."""
    try:
        info = segmentation_model.get_model_info()
        return jsonify(info)
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        return jsonify({"error": "Failed to get model info"}), 500

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error."""
    return jsonify({"error": "File too large. Maximum size is 16MB"}), 413

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors."""
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors."""
    return jsonify({"error": "Internal server error"}), 500

# ==================== IOT ENDPOINTS ====================

@app.route('/iot/connect', methods=['POST'])
def iot_connect():
    """
    Connect to Arduino device.
    
    Expected JSON:
    - port: serial port (optional, auto-detected if not provided)
    """
    try:
        data = request.get_json() or {}
        port = data.get('port', None)
        
        success = iot_controller.connect(port)
        
        if success:
            return jsonify({
                "success": True,
                "message": f"Connected to Arduino on port {iot_controller.port}",
                "port": iot_controller.port,
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to connect to Arduino",
                "status": iot_controller.current_data.get("status", "unknown")
            }), 400
            
    except Exception as e:
        logger.error(f"IoT connect error: {str(e)}")
        return jsonify({"error": f"Connection failed: {str(e)}"}), 500

@app.route('/iot/disconnect', methods=['POST'])
def iot_disconnect():
    """Disconnect from Arduino device."""
    try:
        iot_controller.disconnect()
        return jsonify({
            "success": True,
            "message": "Disconnected from Arduino",
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"IoT disconnect error: {str(e)}")
        return jsonify({"error": f"Disconnect failed: {str(e)}"}), 500

@app.route('/iot/status', methods=['GET'])
def iot_status():
    """Get comprehensive IoT system status."""
    try:
        status = iot_controller.get_system_status()
        return jsonify(status)
    except Exception as e:
        logger.error(f"IoT status error: {str(e)}")
        return jsonify({"error": f"Failed to get status: {str(e)}"}), 500

@app.route('/iot/data/current', methods=['GET'])
def iot_current_data():
    """Get current sensor readings."""
    try:
        if not iot_controller.is_connected:
            return jsonify({
                "error": "Arduino not connected",
                "connected": False
            }), 400
        
        data = iot_controller.read_single_data()
        if data:
            return jsonify(data)
        else:
            return jsonify({
                "error": "Failed to read data from Arduino",
                "last_known_data": iot_controller.get_current_data()
            }), 500
            
    except Exception as e:
        logger.error(f"IoT current data error: {str(e)}")
        return jsonify({"error": f"Failed to read data: {str(e)}"}), 500

@app.route('/iot/data/history', methods=['GET'])
def iot_historical_data():
    """
    Get historical sensor data.
    
    Query parameters:
    - limit: number of recent records to return (default: all)
    """
    try:
        limit = request.args.get('limit', type=int)
        history = iot_controller.get_historical_data(limit)
        
        return jsonify({
            "success": True,
            "data_points": len(history),
            "history": history,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"IoT history error: {str(e)}")
        return jsonify({"error": f"Failed to get history: {str(e)}"}), 500

@app.route('/iot/monitoring/start', methods=['POST'])
def iot_start_monitoring():
    """Start continuous monitoring of Arduino data."""
    try:
        if not iot_controller.is_connected:
            return jsonify({
                "error": "Arduino not connected. Please connect first.",
                "connected": False
            }), 400
        
        success = iot_controller.start_monitoring()
        
        if success:
            return jsonify({
                "success": True,
                "message": "Started continuous monitoring",
                "monitoring": True,
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to start monitoring"
            }), 500
            
    except Exception as e:
        logger.error(f"IoT start monitoring error: {str(e)}")
        return jsonify({"error": f"Failed to start monitoring: {str(e)}"}), 500

@app.route('/iot/monitoring/stop', methods=['POST'])
def iot_stop_monitoring():
    """Stop continuous monitoring."""
    try:
        iot_controller.stop_monitoring_data()
        return jsonify({
            "success": True,
            "message": "Stopped continuous monitoring",
            "monitoring": False,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"IoT stop monitoring error: {str(e)}")
        return jsonify({"error": f"Failed to stop monitoring: {str(e)}"}), 500

@app.route('/iot/alerts', methods=['GET'])
def iot_alerts():
    """Get active alerts from IoT system."""
    try:
        alerts = iot_controller.get_active_alerts()
        return jsonify({
            "success": True,
            "alert_count": len(alerts),
            "alerts": alerts,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"IoT alerts error: {str(e)}")
        return jsonify({"error": f"Failed to get alerts: {str(e)}"}), 500

@app.route('/iot/analytics', methods=['GET'])
def iot_analytics():
    """Get analytics from historical IoT data."""
    try:
        analytics = iot_controller.get_analytics()
        return jsonify({
            "success": True,
            "analytics": analytics,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"IoT analytics error: {str(e)}")
        return jsonify({"error": f"Failed to get analytics: {str(e)}"}), 500

@app.route('/iot/thresholds', methods=['GET', 'POST'])
def iot_thresholds():
    """Get or update IoT system thresholds."""
    try:
        if request.method == 'GET':
            return jsonify({
                "success": True,
                "thresholds": {
                    "gas_threshold": iot_controller.gas_threshold,
                    "water_critical_level": iot_controller.water_critical_level
                },
                "timestamp": datetime.now().isoformat()
            })
        
        elif request.method == 'POST':
            data = request.get_json() or {}
            gas_threshold = data.get('gas_threshold')
            water_critical_level = data.get('water_critical_level')
            
            iot_controller.update_thresholds(gas_threshold, water_critical_level)
            
            return jsonify({
                "success": True,
                "message": "Thresholds updated successfully",
                "thresholds": {
                    "gas_threshold": iot_controller.gas_threshold,
                    "water_critical_level": iot_controller.water_critical_level
                },
                "timestamp": datetime.now().isoformat()
            })
            
    except Exception as e:
        logger.error(f"IoT thresholds error: {str(e)}")
        return jsonify({"error": f"Thresholds operation failed: {str(e)}"}), 500

@app.route('/iot/ports', methods=['GET'])
def iot_available_ports():
    """Get list of available serial ports."""
    try:
        ports = iot_controller.get_available_ports()
        return jsonify({
            "success": True,
            "ports": ports,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"IoT ports error: {str(e)}")
        return jsonify({"error": f"Failed to get ports: {str(e)}"}), 500

# Combined endpoint for dashboard
@app.route('/dashboard/summary', methods=['GET'])
def dashboard_summary():
    """Get combined summary for dashboard display."""
    try:
        # Get model info
        model_info = segmentation_model.get_model_info()
        
        # Get IoT status
        iot_status = iot_controller.get_system_status()
        
        # Get recent IoT data
        recent_data = iot_controller.get_historical_data(limit=10)
        
        return jsonify({
            "success": True,
            "segmentation": {
                "model_info": model_info,
                "status": "ready"
            },
            "iot": {
                "system_status": iot_status,
                "recent_data": recent_data
            },
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Dashboard summary error: {str(e)}")
        return jsonify({"error": f"Failed to get dashboard summary: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)