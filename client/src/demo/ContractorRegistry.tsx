import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { contractorData, sizes, equipmentTypes, operationTypes, Contractor } from './ContractorRegistryData';
import './ContractorRegistry.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface FilterState {
  keyword: string;
  registrationNumber: string;
  companyName: string;
  city: string;
  size: string;
  equipment: string;
  operation: string;
}

// ==================== REUSABLE COMPONENTS ====================

// FormInput Component for text inputs
interface FormInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder: string;
}

const FormInput: React.FC<FormInputProps> = ({ id, name, value, onChange, label, placeholder }) => {
  return (
    <div>
      <label htmlFor={id} className="block font-medium mb-1">{label}</label>
      <input 
        type="text" 
        id={id} 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>
  );
};

// FormSelect Component for select dropdowns
interface FormSelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label: string;
  options: string[];
}

const FormSelect: React.FC<FormSelectProps> = ({ id, name, value, onChange, label, options }) => {
  return (
    <div>
      <label htmlFor={id} className="block font-medium mb-1">{label}</label>
      <select 
        id={id} 
        name={name} 
        value={value} 
        onChange={onChange} 
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="">Select...</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};

// SortableTableHeader Component
interface SortableTableHeaderProps {
  field: keyof Contractor;
  label: string;
  currentSortField: keyof Contractor;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof Contractor) => void;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({ 
  field,
  label, 
  currentSortField, 
  sortDirection,
  onSort 
}) => {
  const renderSortIndicator = () => {
    if (currentSortField !== field) return null;
    return sortDirection === "asc" ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />;
  };

  return (
    <th className="px-4 py-3 cursor-pointer" onClick={() => onSort(field)}>
      {label} {renderSortIndicator()}
    </th>
  );
};

// ContractorMap Component
interface ContractorMapProps {
  filteredData: Contractor[];
  selectedContractor: Contractor | null;
  onContractorSelect: (contractor: Contractor) => void;
}

const ContractorMap: React.FC<ContractorMapProps> = ({ 
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
        const marker = L.marker([contractor.lat, contractor.lon])
          .bindPopup(`
            <strong>${contractor.companyName}</strong><br>
            ${contractor.city}, ${contractor.province}<br>
            ${contractor.address || ''}
          `);
        
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
      {selectedContractor && (
        <div className="mt-4">
          <h3 className="font-bold">{selectedContractor.companyName}</h3>
          <p>{selectedContractor.city}, {selectedContractor.province}</p>
          {selectedContractor.address && <p>{selectedContractor.address}</p>}
        </div>
      )}
    </div>
  );
};

// SearchForm Component
interface SearchFormProps {
  filters: FilterState;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSearch: () => void;
  handleClear: () => void;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  filters,
  handleChange,
  handleSearch,
  handleClear,
  showAdvanced,
  setShowAdvanced
}) => {
  return (
    <div className="search-container lg:col-span-2">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Basic Search */}
        <div className="mb-4">
          <label htmlFor="searchKeyword" className="block text-lg font-medium mb-2">Search by keywords</label>
          <div className="flex">
            <input 
              type="text" 
              id="searchKeyword" 
              name="keyword" 
              value={filters.keyword} 
              onChange={handleChange} 
              placeholder="Enter search terms" 
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleSearch} 
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Search className="w-5 h-5" />
              <span className="sr-only">Search</span>
            </button>
          </div>
        </div>
        
        {/* Advanced Search Toggle */}
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)} 
          className="text-blue-600 font-medium focus:outline-none mb-4"
        >
          {showAdvanced ? "Hide advanced search" : "Advanced search"}
          {showAdvanced ? <ChevronUp className="inline ml-1 w-4 h-4" /> : <ChevronDown className="inline ml-1 w-4 h-4" />}
        </button>
        
        {/* Advanced Search Form */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <FormInput 
              id="registrationNumber"
              name="registrationNumber"
              value={filters.registrationNumber}
              onChange={handleChange}
              label="Registration number"
              placeholder="e.g. BC-0914356"
            />
            
            <FormInput 
              id="companyName"
              name="companyName"
              value={filters.companyName}
              onChange={handleChange}
              label="Contractor name"
              placeholder="Enter company name"
            />
            
            <FormInput 
              id="city"
              name="city"
              value={filters.city}
              onChange={handleChange}
              label="City"
              placeholder="Enter city"
            />
            
            <FormSelect
              id="size"
              name="size"
              value={filters.size}
              onChange={handleChange}
              label="Size"
              options={sizes}
            />
            
            <FormSelect
              id="equipment"
              name="equipment"
              value={filters.equipment}
              onChange={handleChange}
              label="Equipment"
              options={equipmentTypes}
            />
            
            <FormSelect
              id="operation"
              name="operation"
              value={filters.operation}
              onChange={handleChange}
              label="Operation Type"
              options={operationTypes}
            />
          </div>
        )}
        
        {/* Search Actions */}
        {showAdvanced && (
          <div className="flex gap-2">
            <button 
              onClick={handleSearch} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
            <button 
              onClick={handleClear} 
              className="text-gray-600 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ResultsTable Component
interface ResultsTableProps {
  filteredData: Contractor[];
  sortField: keyof Contractor;
  sortDirection: "asc" | "desc";
  handleSort: (field: keyof Contractor) => void;
  handleCityClick: (contractor: Contractor) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  filteredData,
  sortField,
  sortDirection,
  handleSort,
  handleCityClick
}) => {
  return (
    <div className="results-container">
      <h2 className="text-xl font-bold p-4 border-b">Search Results ({filteredData.length} contractors found)</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <SortableTableHeader 
                field="registrationNumber"
                label="Registration Number"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader 
                field="companyName"
                label="Contractor Name"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader 
                field="city"
                label="City"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <th className="px-4 py-3">Equipment</th>
              <th className="px-4 py-3">Operations</th>
              <SortableTableHeader 
                field="size"
                label="Size"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <th className="px-4 py-3">Website</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-center text-gray-500">No results found</td>
              </tr>
            ) : (
              filteredData.map(contractor => (
                <tr key={contractor.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{contractor.registrationNumber}</td>
                  <td className="px-4 py-3 font-medium">{contractor.companyName}</td>
                  <td className="px-4 py-3">
                    {contractor.city ? (
                      <button 
                        onClick={() => handleCityClick(contractor)}
                        className="text-blue-600 hover:underline cursor-pointer"
                        title="Click to view on map"
                      >
                        {contractor.city}
                      </button>
                    ) : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {contractor.equipment.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {contractor.equipment.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {contractor.operations.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {contractor.operations.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : "N/A"}
                  </td>
                  <td className="px-4 py-3">{contractor.size}</td>
                  <td className="px-4 py-3">
                    {contractor.website ? (
                      <a href={contractor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                        Visit <ExternalLink className="ml-1 w-4 h-4" />
                      </a>
                    ) : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const ContractorRegistry: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    keyword: "",
    registrationNumber: "",
    companyName: "",
    city: "",
    size: "",
    equipment: "",
    operation: ""
  });
  const [filteredData, setFilteredData] = useState<Contractor[]>(contractorData);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [sortField, setSortField] = useState<keyof Contractor>("companyName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    let results = contractorData.filter(contractor => {
      // Basic keyword search across multiple fields
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const matchesKeyword = 
          contractor.companyName.toLowerCase().includes(keyword) ||
          contractor.city.toLowerCase().includes(keyword) ||
          contractor.registrationNumber.toLowerCase().includes(keyword) ||
          contractor.equipment.some(e => e.toLowerCase().includes(keyword)) ||
          contractor.operations.some(o => o.toLowerCase().includes(keyword));
          
        if (!matchesKeyword) return false;
      }
      
      // Specific field filters
      if (filters.registrationNumber && !contractor.registrationNumber.includes(filters.registrationNumber)) {
        return false;
      }
      
      if (filters.companyName && !contractor.companyName.toLowerCase().includes(filters.companyName.toLowerCase())) {
        return false;
      }
      
      if (filters.city && !contractor.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }
      
      if (filters.size && contractor.size !== filters.size) {
        return false;
      }
      
      if (filters.equipment && !contractor.equipment.some(e => e.toLowerCase().includes(filters.equipment.toLowerCase()))) {
        return false;
      }
      
      if (filters.operation && !contractor.operations.some(o => o.toLowerCase().includes(filters.operation.toLowerCase()))) {
        return false;
      }
      
      return true;
    });
    
    // Sort the results
    results.sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
    
    setFilteredData(results);
    setShowResults(true);
  };

  const handleSort = (field: keyof Contractor) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    if (showResults) {
      handleSearch();
    }
  }, [sortField, sortDirection]);

  const handleClear = () => {
    setFilters({
      keyword: "",
      registrationNumber: "",
      companyName: "",
      city: "",
      size: "",
      equipment: "",
      operation: ""
    });
    setShowResults(false);
    setSelectedContractor(null);
  };

  const handleCityClick = (contractor: Contractor) => {
    setSelectedContractor(contractor);
  };

  return (
    <div className="contractor-registry-container">
      <h1 className="title">Logging Contractor Registry Search</h1>
      
      {/* Search and Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Search Form */}
        <SearchForm 
          filters={filters}
          handleChange={handleChange}
          handleSearch={handleSearch}
          handleClear={handleClear}
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
        />
    
        {/* Map Section */}
        <ContractorMap 
          filteredData={filteredData}
          selectedContractor={selectedContractor}
          onContractorSelect={setSelectedContractor}
        />
      </div>
      
      {/* Results Section */}
      {showResults && (
        <ResultsTable 
          filteredData={filteredData}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          handleCityClick={handleCityClick}
        />
      )}
    </div>
  );
};

export default ContractorRegistry;