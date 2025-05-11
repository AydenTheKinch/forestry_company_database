import XLSX from 'xlsx';
import axios from 'axios';
import { config } from '../config/config';

// Interfaces
interface GeocodedData extends Record<string, any> {
  lat?: number;
  lon?: number;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  [key: string]: any;
}

// Helper functions
function buildSearchQuery(rowData: Record<string, any>): string | null {
  const parts = [rowData['Address'], rowData['City'], rowData['Province']]
    .filter(part => part)
    .join(', ');
  
  return parts ? parts + (rowData['Postal code'] ? ` ${rowData['Postal code']}` : '') : null;
}

async function fetchGeocodingData(searchQuery: string): Promise<NominatimResponse | null> {
  const response = await axios.get<NominatimResponse[]>('https://nominatim.openstreetmap.org/search', {
    params: {
      q: searchQuery,
      format: 'json',
      limit: 1
    },
    headers: {
      'User-Agent': config.api.userAgent
    }
  });
  
  await new Promise(resolve => setTimeout(resolve, config.api.nominatimDelay));
  return response.data?.[0] || null;
}

function validateRow(row: Record<string, any>, rowIndex: number): boolean {
  if (!row['Address'] || row['Address'].trim() === '') {
    console.log(`Skipping row ${rowIndex}: No address provided`);
    return false;
  }
  return true;
}

function validateExcelData(data: Record<string, any>[]): string[] {
  const firstRow = data[0];
  return ['Address', 'City', 'Province'].filter(col => !(col in firstRow));
}

// Main functions
async function geocodeAddress(rowData: Record<string, any>): Promise<GeocodedData> {
  try {
    if (rowData.lat && rowData.lon) {
      return rowData;
    }

    const searchQuery = buildSearchQuery(rowData);
    if (!searchQuery) {
      return rowData;
    }

    try {
      const result = await fetchGeocodingData(searchQuery);
      if (result) {
        return {
          ...rowData,
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon)
        };
      }
      console.log(`No results found for search query: ${searchQuery}`);
    } catch (error) {
      console.error(`Error geocoding address query "${searchQuery}":`, 
        error instanceof Error ? error.message : String(error));
    }
    return rowData;
  } catch (error) {
    console.error(`Geocoding error:`, error instanceof Error ? error.message : String(error));
    return rowData;
  }
}

async function processExcelFile(filePath: string): Promise<string> {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    if (!data?.length) {
      console.log('No data found in the Excel file.');
      return filePath;
    }

    // Validate data
    const missingColumns = validateExcelData(data);
    if (missingColumns.length > 0) {
      console.warn(`Warning: Missing columns: ${missingColumns.join(', ')}`);
    }

    // Process rows
    const geocodedData: GeocodedData[] = [];
    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        console.log(`Processing row ${i+1}/${data.length}: ${row[`Field Name`] || 'Unknown'}`);
        
        if (!validateRow(row, i+1)) {
          geocodedData.push(row);
          continue;
        }

        const geocodedRow = await geocodeAddress(row);
        geocodedData.push(geocodedRow);
      } catch (error) {
        console.error(`Error processing row ${i+1}:`, error instanceof Error ? error.message : String(error));
        geocodedData.push(data[i]);
      }
    }

    // Save results
    workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(geocodedData);
    XLSX.writeFile(workbook, filePath);
    return filePath;
  } catch (error) {
    console.error('Error processing Excel file:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Main function to run the geocoding process
 * @param inputFilePath Path to the input Excel file
 * @returns Path to the output file or null if an error occurred
 */
async function runGeocoding(inputFilePath: string): Promise<string | null> {
  try {
    console.log('Starting geocoding process...');
    console.log('Note: This process will take at least 1 second per row due to API rate limiting');
    
    const startTime = Date.now();
    const outputFilePath = await processExcelFile(inputFilePath);
    const endTime = Date.now();
    
    const totalTimeSeconds = Math.round((endTime - startTime) / 1000);
    const totalTimeMinutes = Math.floor(totalTimeSeconds / 60);
    const remainingSeconds = totalTimeSeconds % 60;
    
    console.log(`Geocoding complete in ${totalTimeMinutes > 0 ? `${totalTimeMinutes} minutes and ` : ''}${remainingSeconds} seconds`);
    console.log(`Results saved to: ${outputFilePath}`);
    return outputFilePath;
  } catch (error) {
    console.error('Geocoding failed:', error instanceof Error ? error.message : String(error));
    console.error('Please check your input file and try again.');
    return null;
  }
}

// Export functions for potential module usage
export { geocodeAddress, processExcelFile, runGeocoding };

runGeocoding("../data/Forestry Contractor Database.xlsx");