import React, { useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, LayersControl, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, LatLngBoundsExpression } from 'leaflet';

// ======================= THE CRITICAL FIX IS HERE =======================
// HELPER 1 (REWRITTEN): This component's ONLY job is to update the map's view
// when the `bounds` prop changes. This fixes the race condition.
const MapViewController: React.FC<{ bounds: LatLngBoundsExpression }> = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    // This effect runs every time the `bounds` prop is updated (i.e., after a new search).
    // It tells the map to fit its view to the new geographical area.
    // The check prevents errors if the bounds are not yet available.
    if (bounds && Object.keys(bounds).length > 0) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]); // The effect depends on `bounds` and the map instance.

  return null;
};
// =========================================================================


// HELPER 2: This component's ONLY job is to report map movements up to the parent. (Unchanged)
const MapMoveReporter: React.FC<{ onViewChange: (center: LatLngExpression, zoom: number) => void }> = ({ onViewChange }) => {
  const map = useMapEvents({
    moveend: () => onViewChange(map.getCenter(), map.getZoom()),
    zoomend: () => onViewChange(map.getCenter(), map.getZoom()),
  });
  return null;
};


// Main component props interface
interface InteractiveMapProps {
  bounds: LatLngBoundsExpression;
  instanceId: string;
  date: Date;
  center: LatLngExpression;
  zoom: number;
  onViewChange: (center: LatLngExpression, zoom: number) => void;
}


// This function creates a time range for the WMS request. (Unchanged)
const getWmsTimeRange = (endDate: Date): string => {
  const startDate = "2015-01-01";
  const formatAsDateString = (d: Date) => d.toISOString().split('T')[0];
  const formattedEndDate = formatAsDateString(endDate);
  return `${startDate}/${formattedEndDate}`;
};


// The main InteractiveMap component
const InteractiveMap: React.FC<InteractiveMapProps> = ({ bounds, instanceId, date, center, zoom, onViewChange }) => {
  const wmsUrl = `https://services.sentinel-hub.com/ogc/wms/${instanceId}`;
  const wmsTime = getWmsTimeRange(date);

  return (
    <div className="w-full h-full rounded-lg shadow-xl overflow-hidden border-2 border-gray-700">
      <MapContainer
        key={wmsTime}
        bounds={bounds} // Set initial bounds on creation
        style={{ height: '100%', width: '100%', backgroundColor: '#1f2937' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Natural Color">
            <WMSTileLayer
              url={wmsUrl}
              params={{ layers: '1_TRUE_COLOR', format: 'image/png', transparent: true, TIME: wmsTime }}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Vegetation Health (NDVI)">
            <WMSTileLayer
              url={wmsUrl}
              params={{ layers: 'NDVI', format: 'image/png', transparent: true, TIME: wmsTime }}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Water Bodies (NDWI)">
            <WMSTileLayer
              url={wmsUrl}
              params={{ layers: 'NDWI', format: 'image/png', transparent: true, TIME: wmsTime }}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Wildfire (False Color)">
            <WMSTileLayer
              url={wmsUrl}
              params={{ layers: 'WILDFIRE', format: 'image/png', transparent: true, TIME: wmsTime }}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Air Pollution (NO₂)">
            <WMSTileLayer
              url={wmsUrl}
              params={{ layers: 'POLLUTION', format: 'image/png', transparent: true, TIME: wmsTime }}
            />
          </LayersControl.BaseLayer>
          {/* ... other WMSTileLayer components ... */}
           <LayersControl.BaseLayer name="Street Map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        {/* UPDATED: Pass the `bounds` prop to the new controller, not center/zoom */}
        <MapViewController bounds={bounds} />
        <MapMoveReporter onViewChange={onViewChange} />
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;