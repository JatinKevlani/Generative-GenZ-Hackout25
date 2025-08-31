'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Progress,
  Spinner,
  Divider,
  Select,
  SelectItem,
  Input,
  Selection
} from '@heroui/react';
import {
  Wifi,
  WifiOff,
  Activity,
  Droplets,
  Wind,
  AlertTriangle,
  CheckCircle,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

// Type definitions
interface IoTData {
  h2_conc: number;
  h2_alert: number;
  water_cm: number;
  servo_pos: number;
  timestamp: string;
  status: string;
  h2_status?: string;
  water_status?: string;
  servo_status?: string;
}

interface SystemStatus {
  connection: {
    is_connected: boolean;
    port: string;
    status: string;
  };
  monitoring: {
    is_active: boolean;
    data_points_collected: number;
  };
  current_readings: IoTData;
  thresholds: {
    gas_threshold: number;
    water_critical_level: number;
  };
  alerts: Alert[];
}

interface Alert {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

interface SerialPort {
  port: string;
  description: string;
}

const IoTDashboard: React.FC = () => {
  // State management
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [currentData, setCurrentData] = useState<IoTData | null>(null);
  const [availablePorts, setAvailablePorts] = useState<SerialPort[]>([]);
  const [selectedPort, setSelectedPort] = useState<Selection>(new Set([]));
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [gasThreshold, setGasThreshold] = useState<number>(100);
  const [waterCriticalLevel, setWaterCriticalLevel] = useState<number>(10);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://your-api-domain.com'
    : 'http://localhost:5000';

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && systemStatus?.connection.is_connected) {
      const interval = setInterval(fetchCurrentData, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, systemStatus?.connection.is_connected]);

  // Initial load
  useEffect(() => {
    fetchAvailablePorts();
    fetchSystemStatus();
  }, []);

  const fetchAvailablePorts = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/iot/ports`);
      const data = await response.json();
      if (data.success) {
        setAvailablePorts(data.ports);
      }
    } catch (err) {
      console.error('Failed to fetch ports:', err);
    }
  };

  const fetchSystemStatus = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/iot/status`);
      const data = await response.json();
      setSystemStatus(data);
      if (data.thresholds) {
        setGasThreshold(data.thresholds.gas_threshold);
        setWaterCriticalLevel(data.thresholds.water_critical_level);
      }
    } catch (err) {
      console.error('Failed to fetch system status:', err);
      setError('Failed to fetch system status');
    }
  };

  const fetchCurrentData = async (): Promise<void> => {
    if (!systemStatus?.connection.is_connected) return;

    try {
      const response = await fetch(`${API_BASE_URL}/iot/data/current`);
      const data = await response.json();
      if (response.ok) {
        setCurrentData(data);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Failed to fetch current data:', err);
    }
  };

  const connectToArduino = async (): Promise<void> => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/iot/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedPort ? { port: selectedPort } : {})
      });

      const data = await response.json();

      if (data.success) {
        await fetchSystemStatus();
        setError(null);
      } else {
        throw new Error(data.message || 'Connection failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectFromArduino = async (): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/iot/disconnect`, { method: 'POST' });
      await fetchSystemStatus();
      setCurrentData(null);
      setAutoRefresh(false);
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  const toggleMonitoring = async (): Promise<void> => {
    const isActive = systemStatus?.monitoring.is_active;
    const endpoint = isActive ? '/iot/monitoring/stop' : '/iot/monitoring/start';

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        await fetchSystemStatus();
        if (!isActive) {
          setAutoRefresh(true);
        }
      }
    } catch (err) {
      console.error('Failed to toggle monitoring:', err);
    }
  };

  const updateThresholds = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/iot/thresholds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gas_threshold: gasThreshold,
          water_critical_level: waterCriticalLevel
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchSystemStatus();
      }
    } catch (err) {
      console.error('Failed to update thresholds:', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'primary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'LEAK DETECTED') return 'danger';
    if (status === 'CRITICAL') return 'warning';
    if (status === 'Safe' || status === 'Normal') return 'success';
    return 'default';
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-50 to-blue-100">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            BlueGuard IoT Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time monitoring of gas detection and water level systems
          </p>
        </div>

        {/* Connection Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {systemStatus?.connection.is_connected ? (
                <Wifi className="w-5 h-5 text-success" />
              ) : (
                <WifiOff className="w-5 h-5 text-danger" />
              )}
              <h2 className="text-xl font-semibold">Arduino Connection</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {!systemStatus?.connection.is_connected ? (
              <div className="space-y-4">
                <Select
                  label="Select Arduino Port"
                  placeholder="Choose a port or leave empty for auto-detection"
                  selectedKeys={selectedPort}
                  onSelectionChange={setSelectedPort}
                >
                  {availablePorts.map((port) => (
                    <SelectItem key={port.port}>
                      {port.port} - {port.description}
                    </SelectItem>
                  ))}
                </Select>

                <div className="flex gap-2">
                  <Button
                    color="primary"
                    onClick={connectToArduino}
                    disabled={isConnecting}
                    startContent={isConnecting ? <Spinner size="sm" /> : <Wifi className="w-4 h-4" />}
                    className="flex-1"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect to Arduino'}
                  </Button>
                  <Button
                    variant="bordered"
                    onClick={fetchAvailablePorts}
                    startContent={<RefreshCw className="w-4 h-4" />}
                  >
                    Refresh Ports
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-success">Connected</p>
                    <p className="text-sm text-gray-600">Port: {systemStatus.connection.port}</p>
                  </div>
                  <Button
                    color="danger"
                    variant="bordered"
                    onClick={disconnectFromArduino}
                    startContent={<WifiOff className="w-4 h-4" />}
                  >
                    Disconnect
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    color={systemStatus.monitoring.is_active ? "warning" : "success"}
                    onClick={toggleMonitoring}
                    startContent={systemStatus.monitoring.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    className="flex-1"
                  >
                    {systemStatus.monitoring.is_active ? 'Stop Monitoring' : 'Start Monitoring'}
                  </Button>
                  <Button
                    variant="bordered"
                    onClick={fetchCurrentData}
                    startContent={<RefreshCw className="w-4 h-4" />}
                  >
                    Refresh Data
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-danger">
            <CardBody>
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Active Alerts */}
        {systemStatus?.alerts && systemStatus.alerts.length > 0 && (
          <Card className="border-danger">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-danger" />
                <h2 className="text-xl font-semibold text-danger">Active Alerts</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {systemStatus.alerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-danger/10">
                    <div>
                      <p className="font-medium text-danger">{alert.message}</p>
                      <p className="text-sm text-gray-600">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                    <Chip color={getSeverityColor(alert.severity)} variant="flat">
                      {alert.severity.toUpperCase()}
                    </Chip>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Real-time Data Display */}
        {systemStatus?.connection.is_connected && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

            {/* Gas Concentration */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold">Gas Detection</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {currentData?.h2_conc || systemStatus.current_readings.h2_conc}
                  </div>
                  <Chip
                    color={getStatusColor(currentData?.h2_status || systemStatus.current_readings.h2_status || '')}
                    variant="flat"
                    size="sm"
                  >
                    {currentData?.h2_status || systemStatus.current_readings.h2_status || 'Unknown'}
                  </Chip>
                  <Progress
                    value={((currentData?.h2_conc || systemStatus.current_readings.h2_conc) / 500) * 100}
                    color={currentData?.h2_alert || systemStatus.current_readings.h2_alert ? "danger" : "success"}
                    size="sm"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Water Level */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Water Level</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {currentData?.water_cm || systemStatus.current_readings.water_cm} cm
                  </div>
                  <Chip
                    color={getStatusColor(currentData?.water_status || systemStatus.current_readings.water_status || '')}
                    variant="flat"
                    size="sm"
                  >
                    {currentData?.water_status || systemStatus.current_readings.water_status || 'Unknown'}
                  </Chip>
                  <Progress
                    value={Math.min(((currentData?.water_cm || systemStatus.current_readings.water_cm) / 50) * 100, 100)}
                    color={(currentData?.water_cm || systemStatus.current_readings.water_cm) < waterCriticalLevel ? "warning" : "primary"}
                    size="sm"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Servo Status */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold">Valve Control</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {currentData?.servo_pos || systemStatus.current_readings.servo_pos}°
                  </div>
                  <Chip
                    color={getStatusColor(currentData?.servo_status || systemStatus.current_readings.servo_status || '')}
                    variant="flat"
                    size="sm"
                  >
                    {currentData?.servo_status || systemStatus.current_readings.servo_status || 'Unknown'}
                  </Chip>
                  <Progress
                    value={((currentData?.servo_pos || systemStatus.current_readings.servo_pos) / 90) * 100}
                    color="secondary"
                    size="sm"
                  />
                </div>
              </CardBody>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">System Status</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {systemStatus?.connection.is_connected ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-danger" />
                    )}
                    <span className="text-sm">
                      {systemStatus?.connection.is_connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {systemStatus?.monitoring.is_active ? (
                      <Activity className="w-4 h-4 text-success animate-pulse" />
                    ) : (
                      <Pause className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm">
                      {systemStatus?.monitoring.is_active ? 'Monitoring' : 'Idle'}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Data Points: {systemStatus?.monitoring.data_points_collected || 0}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Settings Card */}
        {systemStatus?.connection.is_connected && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold">Threshold Settings</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Input
                    type="number"
                    label="Gas Threshold"
                    value={gasThreshold.toString()}
                    onChange={(e) => setGasThreshold(parseInt(e.target.value) || 100)}
                    endContent={<span className="text-sm text-gray-400">ppm</span>}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    type="number"
                    label="Water Critical Level"
                    value={waterCriticalLevel.toString()}
                    onChange={(e) => setWaterCriticalLevel(parseInt(e.target.value) || 10)}
                    endContent={<span className="text-sm text-gray-400">cm</span>}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  color="primary"
                  onClick={updateThresholds}
                  startContent={<Settings className="w-4 h-4" />}
                >
                  Update Thresholds
                </Button>

                <Button
                  color={autoRefresh ? "warning" : "success"}
                  variant="bordered"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  startContent={<RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />}
                >
                  {autoRefresh ? 'Stop Auto-Refresh' : 'Auto-Refresh'}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Latest Reading Details */}
        {(currentData || systemStatus?.current_readings) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Latest Readings</h2>
                <Button
                  size="sm"
                  variant="flat"
                  onClick={fetchCurrentData}
                  startContent={<RefreshCw className="w-4 h-4" />}
                  disabled={!systemStatus?.connection.is_connected}
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700">Gas Detection System</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>H₂ Concentration:</span>
                      <span className="font-mono">{currentData?.h2_conc || systemStatus?.current_readings.h2_conc}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Alert Status:</span>
                      <Chip
                        color={currentData?.h2_alert || systemStatus?.current_readings.h2_alert ? "danger" : "success"}
                        size="sm"
                      >
                        {currentData?.h2_alert || systemStatus?.current_readings.h2_alert ? "ALERT" : "SAFE"}
                      </Chip>
                    </div>
                    <div className="flex justify-between">
                      <span>Threshold:</span>
                      <span className="font-mono">{gasThreshold}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700">Water & Valve System</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Water Level:</span>
                      <span className="font-mono">{currentData?.water_cm || systemStatus?.current_readings.water_cm} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valve Position:</span>
                      <span className="font-mono">{currentData?.servo_pos || systemStatus?.current_readings.servo_pos}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valve Status:</span>
                      {currentData && systemStatus && (
                        <Chip
                          color={(currentData.servo_pos || systemStatus.current_readings.servo_pos) > 0 ? "warning" : "success"}
                          size="sm"
                        >
                          {(currentData?.servo_pos || systemStatus.current_readings.servo_pos) > 0 ? "OPEN" : "CLOSED"}
                        </Chip>)}
                    </div>
                  </div>
                </div>
              </div>

              {
                currentData && systemStatus && (
                  <>
                    <Divider className="my-4" />
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        Last Updated: {new Date(currentData.timestamp || systemStatus.current_readings.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </>
                )
              }
            </CardBody>
          </Card>
        )}

        {/* System Info */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">System Information</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
              <div>
                <div className="text-lg font-bold text-primary">
                  {systemStatus?.monitoring.data_points_collected || 0}
                </div>
                <div className="text-sm text-gray-600">Data Points Collected</div>
              </div>

              <div>
                <div className="text-lg font-bold text-secondary">
                  {systemStatus?.alerts?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Active Alerts</div>
              </div>

              <div>
                <div className="text-lg font-bold text-success">
                  {systemStatus?.connection.is_connected ? 'Online' : 'Offline'}
                </div>
                <div className="text-sm text-gray-600">Connection Status</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-sm text-center text-gray-500">
          <p>BlueGuard IoT System • Real-time Environmental Monitoring</p>
        </div>
      </div>
    </div>
  );
};

export default IoTDashboard;