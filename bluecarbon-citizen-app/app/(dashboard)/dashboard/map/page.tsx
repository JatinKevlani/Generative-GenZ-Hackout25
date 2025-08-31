'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Select,
  SelectItem,
  Switch,
  Badge,
  Avatar,
  Divider,
  Selection
} from '@heroui/react';
import {
  ArrowLeft,
  MapPin,
  Filter,
  Layers,
  Activity,
  Wifi,
  Camera,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

declare global {
  interface Window {
    L: any;
  }
}

const AdminMapDashboard = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Selection>('all');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showClusters, setShowClusters] = useState(true);

  const uploads = useQuery(api.uploads.getForMap) || [];


  // Mock real-time data
  const [realtimeStats, setRealtimeStats] = useState({
    activeUploads: 147,
    pendingReviews: 23,
    todayUploads: 12,
    averageAccuracy: 94.2
  });

  // Load Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      if (window.L) {
        setIsLoaded(true);
        return;
      }

      // Load CSS
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    };

    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [19.076, 72.8777],
      zoom: 11,
      zoomControl: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, [isLoaded]);

  // Update markers when data or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Fetch uploads from Convex
    const filteredUploads =
      (uploads ?? []).filter(upload => {
        const selectedKey = Array.isArray(selectedFilter)
          ? selectedFilter[0]
          : (selectedFilter instanceof Set ? Array.from(selectedFilter)[0] : selectedFilter);

        if (selectedKey === "all") return true;
        if (selectedKey === "verified") return upload.status === "verified";
        if (selectedKey === "pending") return upload.status === "pending";
        if (selectedKey === "high") return upload.intensity === "high";
        if (selectedKey === "medium") return upload.intensity === "medium";
        if (selectedKey === "low") return upload.intensity === "low";
        return true;
      });

    // Add markers
    filteredUploads.forEach(upload => {
      const getColor = () => {
        switch (upload.intensity) {
          case "high": return "#10b981"; // Green
          case "medium": return "#f59e0b"; // Orange
          case "low": return "#ef4444"; // Red
          default: return "#6b7280"; // Gray
        }
      };

      const marker = L.circleMarker([upload.latitude, upload.longitude], {
        radius: upload.status === "verified" ? 8 : 6,
        fillColor: getColor(),
        color: upload.status === "verified" ? "#ffffff" : "#6b7280",
        weight: 2,
        opacity: 1,
        fillOpacity: upload.status === "verified" ? 0.9 : 0.6,
      });

      marker.bindPopup(`
      <div style="font-family: system-ui; padding: 8px;">
        <h4 style="margin: 0 0 8px 0; font-weight: 600;">${upload.locationName}</h4>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <span style="background: ${getColor()}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">${upload.intensity}</span>
          <span style="background: ${upload.status === "verified" ? "#10b981" : "#f59e0b"}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">${upload.status}</span>
        </div>
        <p style="margin: 0; font-size: 12px; color: #6b7280;">By ${upload.userId}</p>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #9ca3af;">${new Date(upload.createdAt).toLocaleString()}</p>
      </div>
    `);

      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [isLoaded, selectedFilter, uploads]);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-content1 border-divider">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Live Monitoring Map</h1>
              <p className="text-sm text-content3-foreground">Real-time mangrove ecosystem tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge content={realtimeStats.pendingReviews} color="warning" size="sm">
              <Button variant="flat" color="warning" size="sm">
                Pending Reviews
              </Button>
            </Badge>
            <Chip color="success" variant="flat" startContent={<Activity className="w-3 h-3" />}>
              Live
            </Chip>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Controls */}
        <div className="p-4 space-y-4 border-r w-80 bg-content1 border-divider">
          {/* Real-time Stats */}
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-semibold">Real-time Stats</h3>
            </CardHeader>
            <CardBody className="pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-content3-foreground">Active Reports</span>
                <Badge content={realtimeStats.activeUploads} color="primary" size="sm">
                  <span className="text-sm font-medium">{realtimeStats.activeUploads}</span>
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-content3-foreground">Today's Uploads</span>
                <span className="text-sm font-medium text-success">+{realtimeStats.todayUploads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-content3-foreground">Avg Accuracy</span>
                <span className="text-sm font-medium">{realtimeStats.averageAccuracy}%</span>
              </div>
            </CardBody>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <h3 className="text-sm font-semibold">Filters</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-3">
              <Select
                label="Status Filter"
                selectedKeys={selectedFilter}
                onSelectionChange={setSelectedFilter}
                size="sm"
              >
                <SelectItem key="all">All Reports</SelectItem>
                <SelectItem key="verified">Verified Only</SelectItem>
                <SelectItem key="pending">Pending Review</SelectItem>
              </Select>

              <Select
                label="Intensity Filter"
                size="sm"
                selectedKeys={selectedFilter}
                onSelectionChange={setSelectedFilter}
              >
                <SelectItem key="all">All Intensities</SelectItem>
                <SelectItem key="high">High Density</SelectItem>
                <SelectItem key="medium">Medium Density</SelectItem>
                <SelectItem key="low">Low Density</SelectItem>
              </Select>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Clusters</span>
                  <Switch
                    size="sm"
                    isSelected={showClusters}
                    onValueChange={setShowClusters}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Heat Map</span>
                  <Switch
                    size="sm"
                    isSelected={showHeatmap}
                    onValueChange={setShowHeatmap}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <h3 className="text-sm font-semibold">Legend</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-xs">High Density</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <span className="text-xs">Medium Density</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger"></div>
                <span className="text-xs">Low Density</span>
              </div>
              <Divider className="my-2" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white rounded-full bg-success"></div>
                <span className="text-xs">Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full opacity-60"></div>
                <span className="text-xs">Pending</span>
              </div>
            </CardBody>
          </Card>

          {/* Recent Uploads */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <h3 className="text-sm font-semibold">Latest Uploads</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-2 overflow-y-auto max-h-60">
              {[
                { user: 'Rahul Sharma', location: 'Manori Creek', time: '2m ago', status: 'verified' },
                { user: 'Priya Patel', location: 'Versova Beach', time: '15m ago', status: 'pending' },
                { user: 'Arjun Singh', location: 'Mahim Creek', time: '1h ago', status: 'verified' },
                { user: 'Sneha Reddy', location: 'Gorai Beach', time: '2h ago', status: 'verified' },
              ].map((upload, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-content2/50">
                  <Avatar size="sm" name={upload.user} className="w-6 h-6 text-xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{upload.location}</p>
                    <p className="text-xs text-content3-foreground">{upload.time}</p>
                  </div>
                  <Chip
                    size="sm"
                    color={upload.status === 'verified' ? 'success' : 'warning'}
                    variant="flat"
                  >
                    {upload.status}
                  </Chip>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Main Map Area */}
        <div className="relative flex-1">
          {/* Map Container */}
          <div className="w-full h-full">
            <div
              ref={mapRef}
              className="w-full h-full"
            />
            {!isLoaded && (
              <div className="flex items-center justify-center w-full h-full bg-content2">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 border-2 rounded-full border-primary border-t-transparent animate-spin"></div>
                  <p className="text-sm text-content3-foreground">Loading map...</p>
                </div>
              </div>
            )}
          </div>

          {/* Floating Controls */}
          <div className="absolute space-y-2 top-4 right-4">
            <Card className="bg-content1/95 backdrop-blur-sm">
              <CardBody className="p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <div>
                    <p className="text-xs text-content3-foreground">Coverage</p>
                    <p className="text-sm font-semibold">89 km²</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-content1/95 backdrop-blur-sm">
              <CardBody className="p-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-content3-foreground">Live Data</p>
                    <p className="text-sm font-semibold">23 Sensors</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Bottom Status Bar */}
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="bg-content1/95 backdrop-blur-sm">
              <CardBody className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm">System Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm">Last update: 30s ago</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="success" variant="flat">
                      {realtimeStats.activeUploads} Active
                    </Chip>
                    <Chip size="sm" color="warning" variant="flat">
                      {realtimeStats.pendingReviews} Pending
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMapDashboard;