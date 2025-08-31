"use client";

import { useState, useEffect, useRef } from "react";
import { Input, RadioGroup, Radio, Select, SelectItem, Button } from "@heroui/react";

declare global {
  interface Window {
    L: any;
  }
}

export default function LocationPicker({
  lat,
  lng,
  setLat,
  setLng,
  intensity,
  setIntensity,
}: {
  lat: number | null;
  lng: number | null;
  setLat: (lat: number | null) => void;
  setLng: (lng: number | null) => void;
  intensity?: string;
  setIntensity?: (intensity:  'low' | 'medium' | 'high' | null) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please enter coordinates manually.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  useEffect(() => {
    // Load Leaflet CSS and JS
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      // Check if Leaflet is already loaded
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

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    
    // Use current location if available, otherwise default to Mumbai
    const defaultLat = lat || 19.076;
    const defaultLng = lng || 72.8777;
    
    // Initialize map
    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 12);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add marker if lat/lng exist
    if (lat && lng) {
      const marker = L.marker([lat, lng]).addTo(map);
      markerRef.current = marker;
    }

    // Handle map clicks
    map.on('click', (e: any) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      
      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      
      // Add new marker
      const newMarker = L.marker([clickLat, clickLng]).addTo(map);
      markerRef.current = newMarker;
      
      // Update parent state
      setLat(clickLat);
      setLng(clickLng);
    });

    mapInstanceRef.current = map;

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isLoaded]);

  // Update map when lat/lng props change from input
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    if (lat && lng) {
      // Update map center
      map.setView([lat, lng], map.getZoom());
      
      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      
      // Add new marker
      const marker = L.marker([lat, lng]).addTo(map);
      markerRef.current = marker;
    }
  }, [lat, lng, isLoaded]);

  const handleLatChange = (value: string) => {
    // Allow empty string for clearing
    if (value === "") {
      setLat(null);
      return;
    }
    
    const newLat = parseFloat(value);
    if (!isNaN(newLat)) {
      // Round to 8 decimal places to prevent floating point issues
      setLat(Math.round(newLat * 100000000) / 100000000);
    }
  };

  const handleLngChange = (value: string) => {
    // Allow empty string for clearing
    if (value === "") {
      setLng(null);
      return;
    }
    
    const newLng = parseFloat(value);
    if (!isNaN(newLng)) {
      // Round to 8 decimal places to prevent floating point issues
      setLng(Math.round(newLng * 100000000) / 100000000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Intensity Selection */}
      {setIntensity && (
        <div>
          <label className="block mb-2 text-sm font-medium text-foreground">
            Mangrove Health/Density
          </label>
          <RadioGroup
            value={intensity}
            onValueChange={(value) => setIntensity(value as 'low' | 'medium' | 'high')}
            orientation="horizontal"
            className="gap-4"
          >
            <Radio value="low" description="Sparse, unhealthy">
              Low
            </Radio>
            <Radio value="medium" description="Moderate coverage">
              Medium  
            </Radio>
            <Radio value="high" description="Dense, healthy">
              High
            </Radio>
          </RadioGroup>
        </div>
      )}

      {/* Location Controls */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            required
            type="number"
            label="Latitude"
            placeholder="Enter latitude"
            value={lat !== null ? lat.toFixed(8).replace(/\.?0+$/, '') : ""}
            onChange={(e) => handleLatChange(e.target.value)}
            step="any"
          />
        </div>
        <div className="flex-1">
          <Input
            required
            type="number"
            label="Longitude"
            placeholder="Enter longitude"
            value={lng !== null ? lng.toFixed(8).replace(/\.?0+$/, '') : ""}
            onChange={(e) => handleLngChange(e.target.value)}
            step="any"
          />
        </div>
        <Button
          color="primary"
          variant="bordered"
          isLoading={isLocating}
          onPress={getCurrentLocation}
          className="h-14"
        >
          📍 Current
        </Button>
      </div>

      {/* Map picker */}
      <div className="w-full h-64 overflow-hidden rounded-lg bg-content2">
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ minHeight: '256px' }}
        />
        {!isLoaded && (
          <div className="flex items-center justify-center w-full h-64 bg-content2">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 border-2 rounded-full border-primary border-t-transparent animate-spin"></div>
              <p className="text-sm text-content3-foreground">Loading map...</p>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-content3-foreground">
        Click on the map to set location, use "Current" button for GPS location, or enter coordinates manually.
      </p>
    </div>
  );
}