import { contractorData, Contractor } from '../demo/ContractorRegistryData';
import axios from 'axios';

async function geocodeAddress(contractor: Contractor): Promise<Contractor> {
    // If we have a complete address, use it
    let searchQuery = contractor.address;
    
    // If address is empty, construct from city, province, country
    if (!searchQuery) {
      const parts = [contractor.city, contractor.province, contractor.country]
        .filter(part => part) // Remove empty strings
        .join(', ');
      
      if (parts) {
        searchQuery = parts;
      } else {
        // If we don't have enough location data, return the contractor unchanged
        console.log(`Not enough location data for ${contractor.companyName}`);
        return contractor;
      }
    }
    
    try {
      // Make sure to add your application name/email for Nominatim usage policy
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchQuery,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'YourAppName contact@yourdomain.com' // Required by Nominatim
        }
      });
      
      // Wait between requests to comply with Nominatim usage policy (1 second)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          ...contractor,
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon)
        };
      } else {
        console.log(`No results found for ${contractor.companyName}`);
        return contractor;
      }
    } catch (error) {
      console.error(`Error geocoding ${contractor.companyName}:`, error);
      return contractor;
    }
  }
  
  // Function to geocode all contractors
  async function geocodeAllContractors(contractors: Contractor[]): Promise<Contractor[]> {
    const geocodedContractors: Contractor[] = [];
    
    for (const contractor of contractors) {
      const geocodedContractor = await geocodeAddress(contractor);
      geocodedContractors.push(geocodedContractor);
    }
    
    return geocodedContractors;
  }
