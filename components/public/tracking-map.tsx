"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";

type MapPoint = {
  lat: number;
  lng: number;
  label: string;
};

type TrackingMapProps = {
  origin?: MapPoint | null;
  destination?: MapPoint | null;
  latest?: MapPoint | null;
  waktuBerangkat?: number | null;
  durasiEstimasiMs?: number | null;
  heightClassName?: string;
  zoom?: number;
  scrollWheelZoom?: boolean;
};

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Blue marker for origin
const originIcon = L.divIcon({
  className: "shipin-origin-pin",
  html: `<span style="display:inline-flex;height:16px;width:16px;border-radius:9999px;background:#3b82f6;border:3px solid #dbeafe;box-shadow:0 0 0 4px rgba(59,130,246,0.25);"></span>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Green marker for destination
const destinationIcon = L.divIcon({
  className: "shipin-destination-pin",
  html: `<span style="display:inline-flex;height:16px;width:16px;border-radius:9999px;background:#22c55e;border:3px solid #bbf7d0;box-shadow:0 0 0 4px rgba(34,197,94,0.25);"></span>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Orange marker for current package position (animated)
const latestIcon = L.divIcon({
  className: "shipin-latest-pin",
  html: `<span style="display:inline-flex;height:18px;width:18px;border-radius:9999px;background:#f97316;border:3px solid #fed7aa;box-shadow:0 0 0 5px rgba(249,115,22,0.3);"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

export function TrackingMap({
  origin,
  destination,
  latest = null,
  waktuBerangkat,
  durasiEstimasiMs,
  heightClassName = "h-[170px]",
  zoom = 11,
  scrollWheelZoom = true
}: TrackingMapProps) {
  // Animated marker position
  const [animatedPos, setAnimatedPos] = useState<MapPoint | null>(null);

  // Calculate current position based on progress
  const computedCurrent = useMemo<MapPoint | null>(() => {
    if (!origin || !destination || !waktuBerangkat || !durasiEstimasiMs) return null;
    const progress = (Date.now() - waktuBerangkat) / durasiEstimasiMs;
    const clamped = Math.min(progress, 1);
    return {
      lat: origin.lat + (destination.lat - origin.lat) * clamped,
      lng: origin.lng + (destination.lng - origin.lng) * clamped,
      label: "Paket dalam perjalanan"
    };
  }, [origin, destination, waktuBerangkat, durasiEstimasiMs]);

  // Update position every 5 seconds
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (computedCurrent) {
      setAnimatedPos(computedCurrent);
    }

    // Update every 5 seconds
    intervalRef.current = setInterval(() => {
      if (!origin || !destination || !waktuBerangkat || !durasiEstimasiMs) return;
      const progress = (Date.now() - waktuBerangkat) / durasiEstimasiMs;
      const clamped = Math.min(progress, 1);
      setAnimatedPos({
        lat: origin.lat + (destination.lat - origin.lat) * clamped,
        lng: origin.lng + (destination.lng - origin.lng) * clamped,
        label: "Paket dalam perjalanan"
      });
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [computedCurrent, origin, destination, waktuBerangkat, durasiEstimasiMs]);

  // Center of the map
  const center = useMemo<[number, number]>(() => {
    if (animatedPos) return [animatedPos.lat, animatedPos.lng];
    if (latest) return [latest.lat, latest.lng];
    if (origin) return [origin.lat, origin.lng];
    if (destination) return [destination.lat, destination.lng];
    // Default to Indonesia center
    return [-2.5, 118];
  }, [animatedPos, latest, origin, destination]);

  // Polyline: from origin to current position (dashed) + from origin to destination (dashed dashed)
  const routePoints = useMemo<[number, number][]>(() => {
    const points: [number, number][] = [];
    if (origin) points.push([origin.lat, origin.lng]);
    if (animatedPos) points.push([animatedPos.lat, animatedPos.lng]);
    if (destination) points.push([destination.lat, destination.lng]);
    return points;
  }, [origin, animatedPos, destination]);

  useEffect(() => {
    L.Marker.prototype.options.icon = markerIcon;
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={scrollWheelZoom}
      className={`${heightClassName} w-full`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {origin ? (
        <Marker position={[origin.lat, origin.lng]} icon={originIcon} />
      ) : null}

      {destination ? (
        <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
      ) : null}

      {animatedPos ? (
        <Marker position={[animatedPos.lat, animatedPos.lng]} icon={latestIcon} />
      ) : latest ? (
        <Marker position={[latest.lat, latest.lng]} icon={latestIcon} />
      ) : null}

      {routePoints.length > 1 ? (
        <Polyline
          positions={routePoints}
          pathOptions={{ color: "#f97316", weight: 4, opacity: 0.7, dashArray: "12 8" }}
        />
      ) : null}
    </MapContainer>
  );
}
