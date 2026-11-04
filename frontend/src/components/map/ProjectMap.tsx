'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getProjectImage } from '../../utils/projectImages';

// Custom colored SVG pin markers for risk levels
const createCustomIcon = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" stroke="#ffffff" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const icons: Record<string, L.DivIcon> = {
  Low: createCustomIcon('#10B981'),
  Medium: createCustomIcon('#F59E0B'),
  High: createCustomIcon('#F97316'),
  Critical: createCustomIcon('#EF4444')
};

interface ProjectMapProps {
  projects: any[];
}

export default function ProjectMap({ projects }: ProjectMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      // Default to Center of India
      const map = L.map(mapRef.current).setView([22.5937, 78.9629], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for all projects
    projects.forEach((p) => {
      if (!p.latitude || !p.longitude) return;

      const icon = icons[p.riskLevel] || icons['Low'];
      const marker = L.marker([p.latitude, p.longitude], { icon }).addTo(map);

      const imageUrl = getProjectImage(p);

      const popupContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; width: 240px; color: #0f172a; padding: 2px;">
          <div style="position: relative; height: 120px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: #0f172a;">
            <img src="${imageUrl}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.src='https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80'" />
            <div style="position: absolute; bottom: 6px; left: 6px; background: rgba(15,23,42,0.85); color: #ffffff; padding: 3px 8px; border-radius: 5px; font-size: 10px; font-weight: bold; backdrop-filter: blur(4px);">
              📍 ${p.district}, ${p.state}
            </div>
            <div style="position: absolute; top: 6px; right: 6px; background: ${
              p.riskLevel === 'Critical' ? '#ef4444' : p.riskLevel === 'High' ? '#f97316' : '#10b981'
            }; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold;">
              ${p.riskLevel} (${p.riskScore}/100)
            </div>
          </div>
          
          <div style="font-family: monospace; font-size: 9px; font-weight: bold; color: #64748b; margin-bottom: 2px;">
            ${p.projectId} • ${p.sector}
          </div>
          <h4 style="font-weight: bold; font-size: 12px; margin: 0 0 4px 0; color: #0f172a; line-height: 1.3;">${p.name}</h4>
          
          <div style="background: #f8fafc; border-radius: 6px; padding: 6px 8px; margin: 6px 0; border: 1px solid #e2e8f0; line-height: 1.6;">
            <div><strong>Approved:</strong> ₹${Number(p.approvedCost).toLocaleString('en-IN')} Cr</div>
            <div><strong>Actual Progress:</strong> <span style="color: #2563eb; font-weight: bold;">${p.actualProgress}%</span> (Target: ${p.plannedProgress}%)</div>
            <div><strong>Agency:</strong> ${p.implementingAgency}</div>
          </div>

          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <a href="/monitoring" style="flex: 1; text-align: center; background: #0f172a; color: #ffffff; text-decoration: none; padding: 6px 8px; border-radius: 6px; font-weight: 600; font-size: 10px;">Monitor Live ⏱️</a>
            <a href="/projects/${p.projectId}" style="flex: 1; text-align: center; background: #2563eb; color: #ffffff; text-decoration: none; padding: 6px 8px; border-radius: 6px; font-weight: 600; font-size: 10px;">360 Dossier &rarr;</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });
  }, [projects]);

  return (
    <div
      ref={mapRef}
      className="h-[600px] w-full rounded-2xl overflow-hidden border border-gov-border dark:border-gov-darkBorder shadow-sm relative z-0"
    />
  );
}
