import { Contractor } from "../types/ContractorRegistryData";
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

//Fix for Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],    // Width: 25px, Height: 41px
  iconAnchor: [12, 41],  // Anchor point is bottom middle of pin
  popupAnchor: [0, -15]  
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ContractorMapProps {
    filteredData: Contractor[];
    selectedContractor: Contractor | null;
    onContractorSelect: (contractor: Contractor) => void;
  }
  
export const ContractorMap: React.FC<ContractorMapProps> = ({ 
    filteredData, 
    selectedContractor, 
    onContractorSelect 
  }) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    
    // Initialize map
    useEffect(() => {
      if (mapContainerRef.current && !mapRef.current) {
        // Initialize map centered on British Columbia
        mapRef.current = L.map(mapContainerRef.current).setView([54.5, -125], 5);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);
        
        // Create a layer group for markers
        markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
      }
      
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }, []);
  
    // Update markers when filtered data changes
    useEffect(() => {
      if (!mapRef.current || !markersLayerRef.current) return;
      
      // Clear existing markers
      markersLayerRef.current.clearLayers();
      
      // Add markers for filtered contractors with valid coordinates
      filteredData.forEach(contractor => {
        // Check if contractor has valid coordinates
        if (contractor.lat && contractor.lon && contractor.lat !== 0 && contractor.lon !== 0) {
          // Build popup content
          let popupContent = `
            <strong>${contractor.companyName}</strong><br>
            ${contractor.city}, ${contractor.province}<br>
          `;
          if (contractor.phone) {
            popupContent += `Phone: <a href="tel:${contractor.phone}" target="_blank" rel="noopener noreferrer">${contractor.phone}</a><br>`;
          }

          const marker = L.marker([contractor.lat, contractor.lon])
            .bindPopup(popupContent, {
              offset: [0, -20],
              closeButton: false
            });
          
          marker.on('click', () => {
            onContractorSelect(contractor);
          });
          
          markersLayerRef.current!.addLayer(marker);
        }
      });
    }, [filteredData, onContractorSelect]);
  
    // Focus map on selected contractor
    useEffect(() => {
      if (!mapRef.current || !selectedContractor) return;
      
      if (selectedContractor.lat && selectedContractor.lon && 
          selectedContractor.lat !== 0 && selectedContractor.lon !== 0) {
        // Zoom to the selected contractor
        mapRef.current.setView([selectedContractor.lat, selectedContractor.lon], 10);
        
        // Find and open the popup for this contractor
        markersLayerRef.current?.eachLayer(layer => {
          if (layer instanceof L.Marker) {
            const markerLatLng = layer.getLatLng();
            if (markerLatLng.lat === selectedContractor.lat && 
                markerLatLng.lng === selectedContractor.lon) {
              layer.openPopup();
            }
          }
        });
      }
    }, [selectedContractor]);
  
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Map of Contractors</h2>
        <div 
          ref={mapContainerRef} 
          className="rounded-lg h-[400px]"
        >
          {/* Leaflet map will be rendered here */}
        </div>
      </div>
    );
  };