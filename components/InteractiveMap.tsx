// FILE: components/InteractiveMap.tsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, LayersControl, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, LatLngBoundsExpression } from 'leaflet';

// HELPER 1: This component updates the map's view when the `bounds` prop changes.
const MapViewController: React.FC<{ bounds: LatLngBoundsExpression }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && Object.keys(bounds).length > 0) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]); 
  return null;
};

// HELPER 2: This component reports map movements up to the parent.
const MapMoveReporter: React.FC<{ onViewChange: (center: LatLngExpression, zoom: number) => void }> = ({ onViewChange }) => {
  useMapEvents({
    moveend: (e) => onViewChange(e.target.getCenter(), e.target.getZoom()),
    zoomend: (e) => onViewChange(e.target.getCenter(), e.target.getZoom()),
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

// This function creates a time range for the WMS request.
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
    // The "Digital Bezel" container
    <div className="w-full h-full bg-black/50 rounded-lg shadow-xl overflow-hidden ring-1 ring-inset ring-white/10">
      <MapContainer
        key={wmsTime}
        bounds={bounds}
        style={{ height: '100%', width: '100%', backgroundColor: '#1f2937' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Natural Color">
            <WMSTileLayer url={wmsUrl} params={{ layers: '1_TRUE_COLOR', format: 'image/png', transparent: true, TIME: wmsTime }} />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Vegetation (NDVI)">
            <WMSTileLayer url={wmsUrl} params={{ layers: 'NDVI', format: 'image/png', transparent: true, TIME: wmsTime }} />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Water (NDWI)">
            <WMSTileLayer url={wmsUrl} params={{ layers: 'NDWI', format: 'image/png', transparent: true, TIME: wmsTime }} />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Wildfire (False Color)">
            <WMSTileLayer url={wmsUrl} params={{ layers: 'WILDFIRE', format: 'image/png', transparent: true, TIME: wmsTime }} />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Pollution (NO₂)">
            <WMSTileLayer url={wmsUrl} params={{ layers: 'POLLUTION', format: 'image/png', transparent: true, TIME: wmsTime }} />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Street Map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>' />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        <MapViewController bounds={bounds} />
        <MapMoveReporter onViewChange={onViewChange} />
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;