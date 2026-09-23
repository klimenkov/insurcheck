import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FSA_COORDINATES } from '../data/fsaCoordinates.js';

export function InteractiveMap({ territories, selectedTier, searchQuery, onSelectFsa }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Colors matching app risk levels (INS-35)
  const getTierColor = (tier) => {
    switch (tier) {
      case 'Extreme':
        return '#f43f5e'; // rose-500
      case 'High':
        return '#f59e0b'; // amber-500
      case 'Moderate':
        return '#06b6d4'; // cyan-500
      case 'Low':
        return '#10b981'; // emerald-500
      default:
        return '#94a3b8'; // slate-400
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [43.78, -79.48],
        zoom: 9,
        minZoom: 6,
        maxZoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      // CartoDB Dark Matter tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map instance across renders or cleanup if unmounted
    };
  }, []);

  // Update Zone Markers / Heat Layer when territories or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    const filtered = territories.filter((item) => {
      const matchesTier = selectedTier === 'All' || item.tier === selectedTier;
      const q = (searchQuery || '').trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.fsa.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        (item.label && item.label.toLowerCase().includes(q));
      return matchesTier && matchesSearch;
    });

    filtered.forEach((item) => {
      const coords = FSA_COORDINATES[item.fsa];
      if (!coords) return;

      const color = getTierColor(item.tier);
      const isExtreme = item.tier === 'Extreme';

      // Outer heat glow circle
      const heatRadius = isExtreme ? 26 : item.tier === 'High' ? 22 : 18;
      const outerCircle = L.circleMarker(coords, {
        radius: heatRadius,
        fillColor: color,
        fillOpacity: 0.25,
        color: color,
        weight: 1,
        opacity: 0.4
      });

      // Core zone marker
      const coreCircle = L.circleMarker(coords, {
        radius: isExtreme ? 13 : item.tier === 'High' ? 11 : 9,
        fillColor: color,
        fillOpacity: 0.85,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9
      });

      // Rich Tooltip
      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 180px; color: #f8fafc;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 14px; font-weight: 900; letter-spacing: 1px; color: #fff;">${item.fsa}</span>
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 6px; background: ${color}25; color: ${color}; border: 1px solid ${color}50;">
              ${item.tier} Risk
            </span>
          </div>
          <div style="font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px;">${item.city}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${item.label || ''}</div>
          <div style="border-top: 1px solid #334155; padding-top: 6px; display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-size: 11px; color: #94a3b8;">Est. Rate:</span>
            <span style="font-size: 14px; font-weight: 900; color: #fff;">$${item.estimated_monthly}<span style="font-size: 10px; font-weight: normal; color: #94a3b8;">/mo</span></span>
          </div>
          <div style="font-size: 10px; color: ${color}; font-weight: 700; margin-top: 2px;">
            ${item.variance_percent >= 0 ? '+' : ''}${item.variance_percent}% vs ON Neutral
          </div>
        </div>
      `;

      coreCircle.bindPopup(popupContent, {
        className: 'insurcheck-map-popup',
        closeButton: false
      });

      coreCircle.on('click', () => {
        if (onSelectFsa) onSelectFsa(item);
      });

      layerGroupRef.current.addLayer(outerCircle);
      layerGroupRef.current.addLayer(coreCircle);
    });
  }, [territories, selectedTier, searchQuery, onSelectFsa]);

  const handleJumpToRegion = (coords, zoom) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Map Jumper Bar */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl max-w-[calc(100%-2rem)]">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-center px-2">Jump to:</span>
        <button
          type="button"
          onClick={() => handleJumpToRegion([43.73, -79.73], 11)}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
        >
          Peel / Brampton
        </button>
        <button
          type="button"
          onClick={() => handleJumpToRegion([43.72, -79.38], 11)}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
        >
          Toronto / GTA
        </button>
        <button
          type="button"
          onClick={() => handleJumpToRegion([45.42, -75.70], 11)}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
        >
          Ottawa
        </button>
        <button
          type="button"
          onClick={() => handleJumpToRegion([43.45, -80.49], 11)}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
        >
          Kitchener-Waterloo
        </button>
        <button
          type="button"
          onClick={() => handleJumpToRegion([44.5, -79.5], 7)}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
        >
          All Ontario
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-[400] bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 shadow-xl pointer-events-auto text-xs space-y-1.5">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
          Territorial Heat Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
          <span className="text-slate-300 font-medium">Extreme Risk (&gt;1.30x)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
          <span className="text-slate-300 font-medium">High Risk (1.11 - 1.30x)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50"></span>
          <span className="text-slate-300 font-medium">Moderate (0.90 - 1.10x)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          <span className="text-slate-300 font-medium">Low Risk (&lt;0.90x)</span>
        </div>
      </div>

      {/* Actual Map Container */}
      <div ref={mapContainerRef} className="w-full h-[540px] sm:h-[620px] bg-slate-950 z-0" />
    </div>
  );
}
