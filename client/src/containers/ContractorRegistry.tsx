import React, { useState, useEffect, useRef } from 'react';
import { contractorData, Contractor } from './ContractorRegistryData';
import { SearchForm } from '../components/SearchForm';
import { ContractorMap } from '../components/Map'; 
import { ResultsTable } from '../components/ResultsTable';
import './ContractorRegistry.css';

export interface FilterState {
  keyword: string;
  companyName: string;
  operations: string;
  equipment: string;
  city: string;
  region: string;
}

const ContractorRegistry: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    keyword: "",
    companyName: "",
    operations: "",
    equipment: "",
    city: "",
    region: ""
  });
  const [filteredData, setFilteredData] = useState<Contractor[]>(contractorData);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [sortField, setSortField] = useState<keyof Contractor>("companyName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  
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
          contractor.region.toLowerCase().includes(keyword) ||
          contractor.operations.some(o => o.toLowerCase().includes(keyword)) ||
          contractor.equipment.some(e => e.toLowerCase().includes(keyword));
          contractor.models.some(m => m.toLowerCase().includes(keyword));
          
        if (!matchesKeyword) return false;
      }
      
      // Specific field filters      
      if (filters.companyName && !contractor.companyName.toLowerCase().includes(filters.companyName.toLowerCase())) {
        return false;
      }
      
      if (filters.city && !contractor.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      if (filters.region && !contractor.region.toLowerCase().includes(filters.region.toLowerCase())) {
        return false;
      }
      
      if (filters.operations && !contractor.operations.some(o => o.toLowerCase().includes(filters.operations.toLowerCase()))) {
        return false;
      }

      if (filters.equipment && !contractor.equipment.some(e => e.toLowerCase().includes(filters.equipment.toLowerCase()))) {
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
      companyName: "",
      operations: "",
      equipment: "",
      city: "",
      region: ""
    });
    setShowResults(false);
    setSelectedContractor(null);
  };

  const handleCityClick = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="contractor-registry-container">
      <div className="w-full mb-6">
        <img 
          src="/thumbnail_IMG_1043.jpg" 
          alt="Forest Banner" 
          className="w-full h-48 object-cover rounded-lg shadow-md"
        />
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <img src="/ubc-logo-2018-crest-blue-rgb72.jpg" alt="UBC Logo" className="w-16 h-auto" />
        <h1 className="title text-2xl font-bold">Thinning Contractor Registry</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8 text-left max-w-4xl">
        <h2 className="text-xl font-semibold mb-3">About the Registry</h2>
        <p className="text-gray-600 mb-4 text-left">
          The UBC Thinning Contractor Registry is a comprehensive database of forest management contractors 
          operating in British Columbia. You can use the search tools to find specific contractors using general
          keywords or make more specific queries under the "advanced search" tab. 
        </p>
        <p className="text-gray-600 text-left">
          Contractors will also be shown on the interactive map if there addresses are included, allowing you to see their locations across the province.
        </p>
      </div>

      {/* Search and Map Section */}
      <div ref={mapSectionRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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