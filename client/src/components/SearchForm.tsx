import { Search } from 'lucide-react';
import { operationTypes, equipmentTypes } from '../types/ContractorRegistryData';
import { FilterState } from '../containers/ContractorRegistry'
import { FormInput } from "./SearchForm.FormInput"
import { FormSelect } from './SearchForm.FormSelect';
import React from 'react';

interface SearchFormProps {
    filters: FilterState;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleSearch: () => void;
    handleClear: () => void;
  }
  
export const SearchForm: React.FC<SearchFormProps> = ({
    filters,
    handleChange,
    handleSearch,
    handleClear,
  }) => {
    return (
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-200">
          <label htmlFor="searchKeyword" className="block text-lg font-semibold mb-3">
            Search by keywords
          </label>
          <div className="flex mb-8">
            <input 
              type="text" 
              id="searchKeyword" 
              name="keyword" 
              value={filters.keyword} 
              onChange={handleChange} 
              placeholder="Enter search terms" 
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md"
            />
            <button 
              onClick={handleSearch} 
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
            >
              <Search className="w-5 h-5" />
              <span className="sr-only">Search</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <FormInput 
              id="companyName"
              name="companyName"
              value={filters.companyName}
              onChange={handleChange}
              label="Contractor Name"
              placeholder="Enter contractor name"
            />
            <FormSelect 
              id="operations"
              name="operations"
              value={filters.operations}
              onChange={handleChange}
              label="Operations"
              options={operationTypes}
            />
            <FormSelect 
              id="equipment"
              name="equipment"
              value={filters.equipment}
              onChange={handleChange}
              label="Equipment"
              options={equipmentTypes}
            />
            <FormInput 
              id="city"
              name="city"
              value={filters.city}
              onChange={handleChange}
              label="City"
              placeholder="Enter city"
            />
            <FormInput 
              id="region"
              name="region"
              value={filters.region}
              onChange={handleChange}
              label="Region"
              placeholder="Enter region"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button 
              onClick={handleSearch} 
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              Search
            </button>
            <button 
              onClick={handleClear} 
              className="text-gray-700 px-6 py-2 rounded-md border border-gray-300 font-semibold hover:bg-gray-100 transition"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    );
  };