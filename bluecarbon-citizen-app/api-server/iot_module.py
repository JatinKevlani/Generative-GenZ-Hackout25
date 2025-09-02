import os
import serial
import json
import time
import threading
import logging
import random
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
        """Initialize IoT controller with mock mode support."""
        self.mock_mode = os.getenv('RENDER', 'false').lower() == 'true'
        
        if self.mock_mode:
            logger.info("IoT Module running in MOCK MODE for web deployment")
            self._init_mock_mode(data_history_size)
        else:
            logger.info("IoT Module running in REAL MODE for hardware")
            self._init_real_mode(port, baudrate, data_history_size)
    
    def _init_mock_mode(self, data_history_size):
        """Initialize mock mode settings."""
        self.port = "MOCK_PORT"
        self.baudrate = 9600
        self.serial_connection = None
        self.is_connected = True  # Always "connected" in mock mode
        self.is_monitoring = False
        
        # Mock data storage
        self.current_data = {
            "h2_conc": random.randint(50, 150),
            "h2_alert": 0,
            "water_cm": random.randint(15, 50),
            "servo_pos": 90,
            "timestamp": datetime.now().isoformat(),
            "status": "mock_connected",
            "mock_data": True
        }
        
        self.data_history = deque(maxlen=data_history_size)
        self.gas_threshold = 100
        self.water_critical_level = 10
        self.monitor_thread = None
        self.stop_monitoring = threading.Event()
        
        # Pre-populate some mock history
        self._generate_mock_history(20)
    
    def _init_real_mode(self, port, baudrate, data_history_size):
        """Initialize real hardware mode settings."""
        self.port = port
        self.baudrate = baudrate
        self.serial_connection = None
        self.is_connected = False
        self.is_monitoring = False
        
        self.current_data = {
            "h2_conc": 0,
            "h2_alert": 0,
            "water_cm": 0,
            "servo_pos": 0,
            "timestamp": datetime.now().isoformat(),
            "status": "disconnected"
        }
        
        self.data_history = deque(maxlen=data_history_size)
        self.gas_threshold = 100
        self.water_critical_level = 10
        self.monitor_thread = None
        self.stop_monitoring = threading.Event()
    
    def _generate_mock_history(self, count):
        """Generate realistic mock historical data."""
        for i in range(count):
            timestamp = datetime.now().timestamp() - (count - i) * 5  # 5 seconds apart
            mock_data = {
                "h2_conc": random.randint(30, 200),
                "h2_alert": 1 if random.random() < 0.1 else 0,  # 10% chance of alert
                "water_cm": random.randint(10, 60),
                "servo_pos": random.choice([0, 45, 90, 135, 180]),
                "timestamp": datetime.fromtimestamp(timestamp).isoformat(),
                "status": "mock_connected",
                "mock_data": True
            }
            mock_data["h2_alert"] = 1 if mock_data["h2_conc"] > self.gas_threshold else 0
            self.data_history.append(mock_data)
    
    def find_arduino_port(self):
        """Auto-detect Arduino port."""
        if self.mock_mode:
            return "MOCK_PORT"
        
        ports = serial.tools.list_ports.comports()
        for port in ports:
            if 'Arduino' in port.description or 'CH340' in port.description or 'USB' in port.description:
                return port.device
        return None
    
    def connect(self, port=None):
        """Connect to Arduino (or simulate connection in mock mode)."""
        if self.mock_mode:
            self.is_connected = True
            self.current_data["status"] = "mock_connected"
            logger.info("Mock connection established")
            return True
        
        # Real hardware connection logic
        try:
            if port:
                self.port = port
            elif not self.port:
                self.port = self.find_arduino_port()
            
            if not self.port:
                raise Exception("No Arduino port found. Please specify port manually.")
            
            self.serial_connection = serial.Serial(self.port, self.baudrate, timeout=2)
            time.sleep(2)  # Arduino initialization
            
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
        if self.mock_mode:
            self.is_connected = False
            self.current_data["status"] = "mock_disconnected"
            logger.info("Mock disconnection")
            return
        
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
        """Read sensor data (mock or real)."""
        if self.mock_mode:
            # Generate realistic mock data
            h2_conc = random.randint(20, 300)
            h2_alert = 1 if h2_conc > self.gas_threshold else 0
            water_cm = random.randint(5, 80)
            
            mock_data = {
                "h2_conc": h2_conc,
                "h2_alert": h2_alert,
                "water_cm": water_cm,
                "servo_pos": random.choice([0, 45, 90, 135, 180]),
                "timestamp": datetime.now().isoformat(),
                "status": "mock_connected",
                "mock_data": True
            }
            
            self.current_data.update(mock_data)
            return mock_data
        
        # Real hardware reading logic
        if not self.is_connected or not self.serial_connection:
            return None
        
        try:
            if self.serial_connection.in_waiting > 0:
                line = self.serial_connection.readline().decode().strip()
                data = json.loads(line)
                data["timestamp"] = datetime.now().isoformat()
                data["status"] = "connected"
                self.current_data.update(data)
                return data
        except Exception as e:
            logger.error(f"Error reading from Arduino: {str(e)}")
            return None
    
    def start_monitoring(self):
        """Start continuous monitoring."""
        if self.is_monitoring:
            return True
        
        if not self.is_connected:
            logger.error("Cannot start monitoring - not connected")
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
                time.sleep(5 if not self.mock_mode else 2)  # Faster updates in mock mode
            except Exception as e:
                logger.error(f"Error in monitoring loop: {str(e)}")
                time.sleep(5)
    
    def get_current_data(self):
        """Get the most recent sensor data."""
        return self.current_data.copy()
    
    def get_historical_data(self, limit=None):
        """Get historical sensor data."""
        history = list(self.data_history)
        if limit:
            history = history[-limit:]
        return history
    
    def get_system_status(self):
        """Get comprehensive system status."""
        return {
            "connected": self.is_connected,
            "port": self.port,
            "status": self.current_data.get("status", "unknown"),
            "monitoring": self.is_monitoring,
            "mock_mode": self.mock_mode,
            "data_points_collected": len(self.data_history),
            "last_reading": self.current_data.get("timestamp"),
            "thresholds": {
                "gas_threshold": self.gas_threshold,
                "water_critical_level": self.water_critical_level
            }
        }
    
    def get_active_alerts(self):
        """Get list of active alerts."""
        alerts = []
        
        if self.current_data.get("h2_alert", 0) == 1:
            alerts.append({
                "type": "gas_leak",
                "severity": "critical",
                "message": f"Hydrogen leak detected! Concentration: {self.current_data.get('h2_conc', 0)}",
                "timestamp": self.current_data.get("timestamp"),
                "mock": self.mock_mode
            })
        
        if self.current_data.get("water_cm", 100) < self.water_critical_level:
            alerts.append({
                "type": "water_level",
                "severity": "warning",
                "message": f"Low water level: {self.current_data.get('water_cm', 0)} cm",
                "timestamp": self.current_data.get("timestamp"),
                "mock": self.mock_mode
            })
        
        return alerts
    
    def update_thresholds(self, gas_threshold=None, water_critical_level=None):
        """Update system thresholds."""
        if gas_threshold is not None:
            self.gas_threshold = gas_threshold
        if water_critical_level is not None:
            self.water_critical_level = water_critical_level
        
        logger.info(f"Updated thresholds - Gas: {self.gas_threshold}, Water: {self.water_critical_level}cm")
    
    def get_analytics(self):
        """Get analytics from historical data."""
        if not self.data_history:
            return {
                "message": "No historical data available",
                "mock_mode": self.mock_mode
            }
        
        history = list(self.data_history)
        
        # Calculate averages
        avg_h2 = sum(d.get("h2_conc", 0) for d in history) / len(history)
        avg_water = sum(d.get("water_cm", 0) for d in history) / len(history)
        
        # Count alerts
        total_alerts = sum(d.get("h2_alert", 0) for d in history)
        
        # Get recent trends (last 10 readings)
        recent_data = history[-10:] if len(history) >= 10 else history
        recent_avg_h2 = sum(d.get("h2_conc", 0) for d in recent_data) / len(recent_data)
        
        return {
            "data_points": len(history),
            "time_span_minutes": len(history) * (5 if not self.mock_mode else 2) / 60,
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
                "trend": "increasing" if recent_avg_h2 > avg_h2 else "decreasing" if recent_avg_h2 < avg_h2 else "stable"
            },
            "mock_mode": self.mock_mode
        }
    
    def get_available_ports(self):
        """Get list of available serial ports."""
        if self.mock_mode:
            return [
                {"port": "MOCK_PORT", "description": "Mock Arduino Device"},
                {"port": "COM_MOCK", "description": "Simulated COM Port"}
            ]
        
        ports = serial.tools.list_ports.comports()
        return [{"port": port.device, "description": port.description} for port in ports]