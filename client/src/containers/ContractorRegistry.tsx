import React, { useState, useEffect } from 'react';
import { contractorData, Contractor } from './ContractorRegistryData';
import { SearchForm } from '../components/SearchForm';
import { ContractorMap } from '../components/Map'; 
import { ResultsTable } from '../components/ResultsTable';
import './ContractorRegistry.css';

export interface FilterState {
  keyword: string;
  registrationNumber: string;
  companyName: string;
  city: string;
  size: string;
  equipment: string;
  operation: string;
}

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