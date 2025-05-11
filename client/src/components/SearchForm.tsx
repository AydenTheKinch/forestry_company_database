import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { sizes, equipmentTypes, operationTypes } from '../containers/ContractorRegistryData';
import { FormInput } from "./SearchForm.FormInput"
import { FormSelect } from './SearchForm.FormSelect';
import React from 'react';

interface FilterState {
    keyword: string;
    registrationNumber: string;
    companyName: string;
    city: string;
    size: string;
    equipment: string;
    operation: string;
  }

interface SearchFormProps {
    filters: FilterState;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleSearch: () => void;
    handleClear: () => void;
    showAdvanced: boolean;
    setShowAdvanced: (show: boolean) => void;
  }
  
export const SearchForm: React.FC<SearchFormProps> = ({
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