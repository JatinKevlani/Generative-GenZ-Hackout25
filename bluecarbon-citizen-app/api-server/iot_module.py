import serial
import json
import time
import threading
import logging
from datetime import datetime
from collections import deque
import serial.tools.list_ports

logger = logging.getLogger(__name__)

class BlueGuardIoT:
    """
    IoT module for BlueGuard system - handles Arduino communication and data processing.
    Manages gas detection, water level monitoring, and servo control.
    """
    
    def __init__(self, port=None, baudrate=9600, data_history_size=100):
        """
        Initialize IoT controller.
        
        Args:
            port (str): Serial port (auto-detected if None)
            baudrate (int): Serial communication speed
            data_history_size (int): Number of readings to keep in history
        """
        self.port = port
        self.baudrate = baudrate
        self.serial_connection = None
        self.is_connected = False
        self.is_monitoring = False
        
        # Data storage
        self.current_data = {
            "h2_conc": 0,
            "h2_alert": 0,
            "water_cm": 0,
            "servo_pos": 0,
            "timestamp": datetime.now().isoformat(),
            "status": "disconnected"
        }
        
        # Historical data (last N readings)
        self.data_history = deque(maxlen=data_history_size)
        
        # Thresholds and settings
        self.gas_threshold = 100
        self.water_critical_level = 10  # cm
        
        # Monitoring thread
        self.monitor_thread = None
        self.stop_monitoring = threading.Event()
        
        logger.info("BlueGuard IoT module initialized")
    
    def find_arduino_port(self):
        """Auto-detect Arduino port."""
        ports = serial.tools.list_ports.comports()
        for port in ports:
            if 'Arduino' in port.description or 'CH340' in port.description or 'USB' in port.description:
                return port.device
        return None
    
    def connect(self, port=None):
        """
        Connect to Arduino via serial.
        
        Args:
            port (str): Serial port (auto-detected if None)
            
        Returns:
            bool: Connection success status
        """
        try:
            if port:
                self.port = port
            elif not self.port:
                self.port = self.find_arduino_port()
            
            if not self.port:
                raise Exception("No Arduino port found. Please specify port manually.")
            
            self.serial_connection = serial.Serial(
                self.port, 
                self.baudrate, 
                timeout=2
            )
            
            # Wait for Arduino to initialize
            time.sleep(2)
            
            self.is_connected = True
            self.current_data["status"] = "connected"
            
            logger.info(f"Connected to Arduino on port {self.port}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Arduino: {str(e)}")
            self.is_connected = False
            self.current_data["status"] = f"connection_failed: {str(e)}"
            return False
    
    def disconnect(self):
        """Disconnect from Arduino."""
        try:
            self.stop_monitoring_data()
            if self.serial_connection and self.serial_connection.is_open:
                self.serial_connection.close()
            self.is_connected = False
            self.current_data["status"] = "disconnected"
            logger.info("Disconnected from Arduino")
        except Exception as e:
            logger.error(f"Error during disconnect: {str(e)}")
    
    def read_single_data(self):
        """
        Read a single data point from Arduino.
        
        Returns:
            dict: Latest sensor data or None if failed
        """
        if not self.is_connected or not self.serial_connection:
            return None
        
        try:
            # Clear buffer
            self.serial_connection.flushInput()
            
            # Wait for JSON data
            start_time = time.time()
            while time.time() - start_time < 10:  # 10 second timeout
                if self.serial_connection.in_waiting > 0:
                    line = self.serial_connection.readline().decode('utf-8').strip()
                    if line.startswith('{') and line.endswith('}'):
                        data = json.loads(line)
                        data["timestamp"] = datetime.now().isoformat()
                        data["status"] = "active"
                        
                        # Add derived information
                        data["h2_status"] = "LEAK DETECTED" if data["h2_alert"] else "Safe"
                        data["water_status"] = "CRITICAL" if data["water_cm"] < self.water_critical_level else "Normal"
                        data["servo_status"] = "Open" if data["servo_pos"] > 0 else "Closed"
                        
                        self.current_data = data
                        return data
                
                time.sleep(0.1)
            
            raise Exception("Timeout waiting for data from Arduino")
            
        except Exception as e:
            logger.error(f"Error reading data: {str(e)}")
            self.current_data["status"] = f"read_error: {str(e)}"
            return None
    
    def start_monitoring(self):
        """Start continuous monitoring in background thread."""
        if self.is_monitoring:
            return True
        
        if not self.is_connected:
            logger.error("Cannot start monitoring - not connected to Arduino")
            return False
        
        self.stop_monitoring.clear()
        self.is_monitoring = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        
        logger.info("Started continuous monitoring")
        return True
    
    def stop_monitoring_data(self):
        """Stop continuous monitoring."""
        if self.is_monitoring:
            self.stop_monitoring.set()
            self.is_monitoring = False
            if self.monitor_thread:
                self.monitor_thread.join(timeout=5)
            logger.info("Stopped continuous monitoring")
    
    def _monitor_loop(self):
        """Background monitoring loop."""
        while not self.stop_monitoring.is_set():
            try:
                data = self.read_single_data()
                if data:
                    self.data_history.append(data)
                time.sleep(1)  # Match Arduino's 5-second interval
            except Exception as e:
                logger.error(f"Error in monitoring loop: {str(e)}")
                time.sleep(5)
    
    def get_current_data(self):
        """Get the most recent sensor data."""
        return self.current_data.copy()
    
    def get_historical_data(self, limit=None):
        """
        Get historical sensor data.
        
        Args:
            limit (int): Maximum number of records to return
            
        Returns:
            list: Historical data points
        """
        history = list(self.data_history)
        if limit:
            history = history[-limit:]
        return history
    
    def get_system_status(self):
        """Get comprehensive system status."""
        return {
            "connection": {
                "is_connected": self.is_connected,
                "port": self.port,
                "status": self.current_data.get("status", "unknown")
            },
            "monitoring": {
                "is_active": self.is_monitoring,
                "data_points_collected": len(self.data_history)
            },
            "current_readings": self.current_data,
            "thresholds": {
                "gas_threshold": self.gas_threshold,
                "water_critical_level": self.water_critical_level
            },
            "alerts": self.get_active_alerts()
        }
    
    def get_active_alerts(self):
        """Get list of active alerts based on current readings."""
        alerts = []
        
        if self.current_data.get("h2_alert", 0) == 1:
            alerts.append({
                "type": "gas_leak",
                "severity": "critical",
                "message": f"Hydrogen leak detected! Concentration: {self.current_data.get('h2_conc', 0)}",
                "timestamp": self.current_data.get("timestamp")
            })
        
        if self.current_data.get("water_cm", 100) < self.water_critical_level:
            alerts.append({
                "type": "water_level",
                "severity": "warning",
                "message": f"Low water level: {self.current_data.get('water_cm', 0)} cm",
                "timestamp": self.current_data.get("timestamp")
            })
        
        return alerts
    
    def update_thresholds(self, gas_threshold=None, water_critical_level=None):
        """
        Update system thresholds.
        
        Args:
            gas_threshold (int): Gas detection threshold
            water_critical_level (float): Critical water level in cm
        """
        if gas_threshold is not None:
            self.gas_threshold = gas_threshold
        if water_critical_level is not None:
            self.water_critical_level = water_critical_level
        
        logger.info(f"Updated thresholds - Gas: {self.gas_threshold}, Water: {self.water_critical_level}cm")
    
    def get_analytics(self):
        """Get analytics from historical data."""
        if not self.data_history:
            return {"message": "No historical data available"}
        
        history = list(self.data_history)
        
        # Calculate averages
        avg_h2 = sum(d.get("h2_conc", 0) for d in history) / len(history)
        avg_water = sum(d.get("water_cm", 0) for d in history) / len(history)
        
        # Count alerts
        total_alerts = sum(d.get("h2_alert", 0) for d in history)
        
        # Get recent trends
        recent_data = history[-10:] if len(history) >= 10 else history
        recent_avg_h2 = sum(d.get("h2_conc", 0) for d in recent_data) / len(recent_data)
        
        return {
            "data_points": len(history),
            "time_span_hours": len(history) * 1 / 3600,  # 1 seconds per reading
            "averages": {
                "h2_concentration": round(avg_h2, 2),
                "water_level_cm": round(avg_water, 2)
            },
            "alerts": {
                "total_gas_alerts": total_alerts,
                "alert_rate_percent": round((total_alerts / len(history)) * 100, 2)
            },
            "trends": {
                "recent_avg_h2": round(recent_avg_h2, 2),
                "trend": "increasing" if recent_avg_h2 > avg_h2 else "stable"
            }
        }
    
    def get_available_ports(self):
        """Get list of available serial ports."""
        ports = serial.tools.list_ports.comports()
        return [{"port": port.device, "description": port.description} for port in ports]