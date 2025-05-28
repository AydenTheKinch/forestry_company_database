import React, { useState, useEffect, useRef } from 'react';
import { Contractor } from '../types/ContractorRegistryData';
import { SearchForm } from '../components/SearchForm';
import { ContractorMap } from '../components/Map'; 
import { ResultsTable } from '../components/ResultsTable';
import { searchContractors } from '../services/ContractorAPI';
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
  const [filteredData, setFilteredData] = useState<Contractor[]>([]);
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

  const handleSearch = async () => {
    try {
      const results = await searchContractors(filters, sortField, sortDirection);
      setFilteredData(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleSort = (field: keyof Contractor) => {
    const newDirection = field === sortField 
      ? sortDirection === "asc" ? "desc" : "asc"
      : "asc";
    
    setSortField(field);
    setSortDirection(newDirection);

    // Sort the current filtered data
    const sortedData = [...filteredData].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (Array.isArray(aVal) && Array.isArray(bVal)) {
        return newDirection === "asc" 
          ? aVal.join().localeCompare(bVal.join())
          : bVal.join().localeCompare(aVal.join());
      }
      
      return newDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    setFilteredData(sortedData);
  };

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
          Contractors will also be shown on the interactive map if their addresses are included, allowing you to see their locations across the province.
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

      <div className="bg-white p-6 rounded-lg shadow-sm mt-12 text-left max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-3">Join the Registry</h2>
        <p className="text-gray-600 mb-4 text-left">
          Are you a forest management contractor operating in British Columbia? Get listed in our registry!
          Email us at <a href="mailto:forestry.registry@ubc.ca" className="text-blue-600 hover:text-blue-800 underline">
          forestry.registry@ubc.ca</a> with your company information to be added to the database.
        </p>
      </div>
    </div>
  );
};

export default ContractorRegistry;