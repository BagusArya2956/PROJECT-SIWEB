"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, Polyline, TileLayer } from "react-leaflet";

type MapPoint = {
  lat: number;
  lng: number;
  label: string;
};

type TrackingMapProps = {
  latest: MapPoint;
  origin?: MapPoint | null;
  destination?: MapPoint | null;
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

const latestIcon = L.divIcon({
  className: "shipin-latest-pin",
  html: `<span style="display:inline-flex;height:14px;width:14px;border-radius:9999px;background:#1e8f4c;border:2px solid #d8f7df;box-shadow:0 0 0 4px rgba(30,143,76,0.25);"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export function TrackingMap({
  latest,
  origin,
  destination,
  heightClassName = "h-[170px]",
  zoom = 11,
  scrollWheelZoom = true
}: TrackingMapProps) {
  const center = useMemo<[number, number]>(() => [latest.lat, latest.lng], [latest.lat, latest.lng]);
  const linePoints = useMemo<[number, number][]>(() => {
    const points: [number, number][] = [];
    if (origin) points.push([origin.lat, origin.lng]);
    points.push([latest.lat, latest.lng]);
    if (destination) points.push([destination.lat, destination.lng]);
    return points;
  }, [destination, latest.lat, latest.lng, origin]);

  useEffect(() => {
    // Prevent default icon path issues in bundled environments.
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
        <Marker position={[origin.lat, origin.lng]}>
          <Popup>Asal: {origin.label}</Popup>
        </Marker>
      ) : null}

      {destination ? (
        <Marker position={[destination.lat, destination.lng]}>
          <Popup>Tujuan: {destination.label}</Popup>
        </Marker>
      ) : null}

      <Marker position={[latest.lat, latest.lng]} icon={latestIcon}>
        <Popup>Lokasi terbaru: {latest.label}</Popup>
      </Marker>

      {linePoints.length > 1 ? (
        <Polyline positions={linePoints} pathOptions={{ color: "#1f8d4b", weight: 4, opacity: 0.75 }} />
      ) : null}
    </MapContainer>
  );
}
