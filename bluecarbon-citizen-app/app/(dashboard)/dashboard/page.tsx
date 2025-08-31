// File: app/(dashboard)/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Progress,
  Chip,
  Avatar,
  Divider,
  Image,
  Badge
} from '@heroui/react';
import {
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Waves,
  Leaf,
  Camera,
  Wifi,
  Award,
  ArrowUpRight,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  User
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalReports: number;
  aiAnalyses: number;
  activeSensors: number;
  communityMembers: number;
  carbonCaptured: number;
  weeklyGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'report' | 'analysis' | 'sensor' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  status: 'success' | 'warning' | 'pending';
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 1247,
    aiAnalyses: 856,
    activeSensors: 23,
    communityMembers: 1834,
    carbonCaptured: 12.7,
    weeklyGrowth: 8.5
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'report',
      title: 'New Mangrove Report',
      description: 'Citizen uploaded mangrove data from Mumbai coast',
      timestamp: '2 minutes ago',
      user: 'Priya Sharma',
      status: 'success'
    },
    {
      id: '2',
      type: 'analysis',
      title: 'AI Analysis Complete',
      description: 'Seagrass segmentation completed with 94% confidence',
      timestamp: '15 minutes ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'sensor',
      title: 'IoT Alert',
      description: 'Water temperature anomaly detected in Sector 7',
      timestamp: '1 hour ago',
      status: 'warning'
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Achievement Unlocked',
      description: 'Reached 1000 community reports milestone',
      timestamp: '3 hours ago',
      status: 'success'
    }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'report': return <Camera className="w-4 h-4" />;
      case 'analysis': return <Activity className="w-4 h-4" />;
      case 'sensor': return <Wifi className="w-4 h-4" />;
      case 'achievement': return <Award className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  // Add after your existing useEffect for the stats
  useEffect(() => {
    // Initialize admin map
    const initAdminMap = () => {
      if (typeof window === "undefined" || !window.L) return;

      const mapContainer = document.getElementById('admin-map');
      if (!mapContainer || mapContainer.hasChildNodes()) return;

      const L = window.L;
      const map = L.map('admin-map', {
        center: [19.076, 72.8777],
        zoom: 10,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      // Add sample markers with different colors based on intensity
      const sampleUploads = [
        { lat: 19.076, lng: 72.8777, intensity: 'high' },
        { lat: 19.1, lng: 72.9, intensity: 'medium' },
        { lat: 19.05, lng: 72.85, intensity: 'low' },
        { lat: 19.12, lng: 72.88, intensity: 'high' },
      ];

      sampleUploads.forEach(upload => {
        const color = upload.intensity === 'high' ? 'green' :
          upload.intensity === 'medium' ? 'orange' : 'red';

        L.circleMarker([upload.lat, upload.lng], {
          radius: 6,
          fillColor: color,
          color: 'white',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map);
      });
    };

    // Initialize after a short delay to ensure DOM is ready
    const timer = setTimeout(initAdminMap, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-full p-6 space-y-6 bg-gradient-to-br from-content1 to-content2/50">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Welcome back, John! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your blue carbon monitoring today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="solid"
            size="lg"
            as={Link}
            href="/citizen-reports/upload"
            startContent={<Camera className="w-4 h-4" />}
          >
            New Report
          </Button>
          <Button
            color="secondary"
            variant="flat"
            size="lg"
            as={Link}
            href="/ai-analysis"
            startContent={<Activity className="w-4 h-4" />}
          >
            AI Analysis
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Reports */}
        <Card className="text-white shadow-lg bg-gradient-to-br from-primary to-primary/80">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Total Reports</p>
                <p className="text-2xl font-bold">{stats.totalReports.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs">+{stats.weeklyGrowth}% this week</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Camera className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* AI Analyses */}
        <Card className="text-white shadow-lg bg-gradient-to-br from-secondary to-secondary/80">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">AI Analyses</p>
                <p className="text-2xl font-bold">{stats.aiAnalyses.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="w-3 h-3" />
                  <span className="text-xs">94% avg confidence</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Active Sensors */}
        <Card className="text-white shadow-lg bg-gradient-to-br from-success to-success/80">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Active Sensors</p>
                <p className="text-2xl font-bold">{stats.activeSensors}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Wifi className="w-3 h-3" />
                  <span className="text-xs">All systems online</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Wifi className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Community Members */}
        <Card className="text-white shadow-lg bg-gradient-to-br from-warning to-warning/80">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Community</p>
                <p className="text-2xl font-bold">{stats.communityMembers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3" />
                  <span className="text-xs">+127 this month</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity - Takes 2/3 width */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg bg-content1 h-[500px]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                </div>
                <Button
                  size="sm"
                  variant="light"
                  color="primary"
                  as={Link}
                  href="/dashboard/activity"
                  endContent={<ArrowUpRight className="w-3 h-3" />}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardBody className="pt-0 overflow-y-auto">
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <Card key={activity.id} className="border bg-content2/50 border-divider/50">
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`
                    p-2 rounded-lg 
                    ${activity.status === 'success' ? 'bg-success/10 text-success' :
                            activity.status === 'warning' ? 'bg-warning/10 text-warning' :
                              'bg-default/10 text-default'}
                  `}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-800 truncate">{activity.title}</h4>
                            <Chip
                              size="sm"
                              color={getStatusColor(activity.status)}
                              variant="flat"
                            >
                              {activity.status}
                            </Chip>
                          </div>
                          <p className="mb-2 text-sm text-gray-600">{activity.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{activity.timestamp}</span>
                            </div>
                            {activity.user && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{activity.user}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Takes 1/3 width */}
        <div className="space-y-6">
          {/* Map Display - Top 1/3 */}
          <Card className="shadow-lg bg-content1 h-[240px]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <h3 className="text-base font-semibold text-gray-800">Live Map</h3>
                </div>
                <Button
                  size="sm"
                  variant="light"
                  color="secondary"
                  as={Link}
                  href="/dashboard/map"
                  endContent={<ArrowUpRight className="w-3 h-3" />}
                >
                  Expand
                </Button>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="relative">
                <div id="admin-map" className="w-full h-32 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100">
                  {/* This will be replaced with actual map */}
                </div>

                {/* Overlay stats */}
                <div className="absolute flex justify-between top-2 left-2 right-2">
                  <Chip size="sm" color="primary" variant="solid">
                    23 Sites
                  </Chip>
                  <Chip size="sm" color="success" variant="solid">
                    Live
                  </Chip>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Active Reports</span>
                  <span className="font-medium">147</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Coverage</span>
                  <span className="font-medium">89 km²</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* System Health - Bottom 1/3 */}
          <Card className="shadow-lg h-[240px]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-gray-800">System Health</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <Chip size="sm" color="success" variant="flat">
                  Online
                </Chip>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <Chip size="sm" color="success" variant="flat">
                  Connected
                </Chip>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Models</span>
                <Chip size="sm" color="success" variant="flat">
                  Ready
                </Chip>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">IoT Network</span>
                <Chip size="sm" color="warning" variant="flat">
                  3 Alerts
                </Chip>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Bottom Section - Charts & Maps */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Progress Chart */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-gray-800">Weekly Progress</h3>
              </div>
              <Chip size="sm" color="success" variant="flat">
                +{stats.weeklyGrowth}%
              </Chip>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            {/* Simplified chart representation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reports</span>
                <div className="flex items-center gap-2">
                  <Progress value={85} size="sm" className="w-20" color="primary" />
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Analyses</span>
                <div className="flex items-center gap-2">
                  <Progress value={72} size="sm" className="w-20" color="secondary" />
                  <span className="text-sm font-medium">72%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Community Engagement</span>
                <div className="flex items-center gap-2">
                  <Progress value={91} size="sm" className="w-20" color="success" />
                  <span className="text-sm font-medium">91%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Carbon Capture</span>
                <div className="flex items-center gap-2">
                  <Progress value={67} size="sm" className="w-20" color="warning" />
                  <span className="text-sm font-medium">67%</span>
                </div>
              </div>
            </div>

            <Divider className="my-4" />

            <Button
              variant="flat"
              color="primary"
              size="sm"
              className="w-full"
              as={Link}
              href="/dashboard/analytics"
            >
              View Detailed Analytics
            </Button>
          </CardBody>
        </Card>

        {/* Location Overview */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-semibold text-gray-800">Location Overview</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            {/* Map placeholder */}
            <div className="relative mb-4">
              <div className="flex items-center justify-center w-full h-32 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100">
                <div className="text-center">
                  <Waves className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-gray-600">Interactive map coming soon</p>
                </div>
              </div>

              {/* Overlay stats */}
              <div className="absolute flex justify-between top-2 left-2 right-2">
                <Chip size="sm" color="primary" variant="solid">
                  23 Active Sites
                </Chip>
                <Chip size="sm" color="success" variant="solid">
                  Mumbai Coast
                </Chip>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Coverage Area</span>
                <span className="text-sm font-medium">147 km²</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Protected Zones</span>
                <span className="text-sm font-medium">12 areas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Risk Level</span>
                <Chip size="sm" color="warning" variant="flat">Medium</Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Achievement Banner */}
      <Card className="border shadow-lg bg-gradient-to-r from-primary/10 via-secondary/10 to-success/10 border-primary/20">
        <CardBody className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-primary rounded-2xl">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold text-gray-800">
                🎉 Congratulations! You've reached 1000 reports!
              </h3>
              <p className="text-sm text-gray-600">
                Your contributions are making a real difference in coastal conservation.
                Keep up the amazing work!
              </p>
            </div>
            <Button
              color="primary"
              variant="solid"
              as={Link}
              href="/community/achievements"
              endContent={<ArrowUpRight className="w-4 h-4" />}
            >
              View Achievements
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DashboardPage;