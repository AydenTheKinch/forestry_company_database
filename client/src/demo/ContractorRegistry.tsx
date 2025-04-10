import React, { useState, useEffect } from 'react';
import { MapPin, Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { contractorData, sizes, equipmentTypes, operationTypes, Contractor } from './ContractorRegistryData';
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
  };

  const renderSortIndicator = (field: keyof Contractor) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />;
  };

  return (
    <div className="contractor-registry-container">
      <h1 className="title">Logging Contractor Registry Search</h1>
      {/* Search and Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Search Section */}
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
                <div>
                  <label htmlFor="registrationNumber" className="block font-medium mb-1">Registration number</label>
                  <input 
                    type="text" 
                    id="registrationNumber" 
                    name="registrationNumber" 
                    value={filters.registrationNumber} 
                    onChange={handleChange} 
                    placeholder="e.g. BC-0914356" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="companyName" className="block font-medium mb-1">Contractor name</label>
                  <input 
                    type="text" 
                    id="companyName" 
                    name="companyName" 
                    value={filters.companyName} 
                    onChange={handleChange} 
                    placeholder="Enter company name" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block font-medium mb-1">City</label>
                  <input 
                    type="text" 
                    id="city" 
                    name="city" 
                    value={filters.city} 
                    onChange={handleChange} 
                    placeholder="Enter city" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="size" className="block font-medium mb-1">Size</label>
                  <select 
                    id="size" 
                    name="size" 
                    value={filters.size} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select...</option>
                    {sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="equipment" className="block font-medium mb-1">Equipment</label>
                  <select 
                    id="equipment" 
                    name="equipment" 
                    value={filters.equipment} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select...</option>
                    {equipmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="operation" className="block font-medium mb-1">Operation Type</label>
                  <select 
                    id="operation" 
                    name="operation" 
                    value={filters.operation} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select...</option>
                    {operationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
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
    
        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Map of Contractors</h2>
          <div className="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p> Map will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      {showResults && (
        <div className="results-container">
          <h2 className="text-xl font-bold p-4 border-b">Search Results ({filteredData.length} contractors found)</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("registrationNumber")}>
                    Registration Number {renderSortIndicator("registrationNumber")}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("companyName")}>
                    Contractor Name {renderSortIndicator("companyName")}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("city")}>
                    City {renderSortIndicator("city")}
                  </th>
                  <th className="px-4 py-3">Equipment</th>
                  <th className="px-4 py-3">Operations</th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("size")}>
                    Size {renderSortIndicator("size")}
                  </th>
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
                      <td className="px-4 py-3">{contractor.city}</td>
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
      )}
    </div>
  );
};

export default ContractorRegistry;