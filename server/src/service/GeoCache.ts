import XLSX from 'xlsx';
import axios from 'axios';
import { config } from '../config/config';

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

export class GeoCache {
    private inputFilePath: string;
    private geocodedData: GeocodedData[] | null = null;

    constructor(inputFilePath: string) {
        this.inputFilePath = inputFilePath;
    }

    public async initialize(): Promise<void> {
        try {
            await this.runGeocoding();
        } catch (error) {
            console.error('Failed to initialize GeoCache:', error);
            throw error;
        }
    }

    public getGeocodedData(): GeocodedData[] {
        if (!this.geocodedData) {
            throw new Error('GeoCache not initialized');
        }
        return this.geocodedData;
    }

    private buildSearchQuery(rowData: Record<string, any>): string | null {
        return rowData['Address'];
    }

    private async fetchGeocodingData(searchQuery: string): Promise<NominatimResponse | null> {
        const response = await axios.get<NominatimResponse[]>('https://nominatim.openstreetmap.org/search', {
            params: {
                q: searchQuery,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': `ForestryDatabase aydenkinchla@gmail.com`
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        return response.data?.[0] || null;
    }

    private validateRow(row: Record<string, any>, rowIndex: number): boolean {
        if (!row['Address'] || row['Address'].trim() === '') {
            console.log(`Skipping row ${rowIndex}: No address provided`);
            return false;
        }
        return true;
    }

    private validateExcelData(data: Record<string, any>[]): string[] {
        const firstRow = data[0];
        return ['Address', 'City', 'Province'].filter(col => !(col in firstRow));
    }

    private async geocodeAddress(rowData: Record<string, any>): Promise<GeocodedData> {
        try {
            if (rowData.lat && rowData.lon) {
                return rowData;
            }

            const searchQuery = this.buildSearchQuery(rowData);
            if (!searchQuery) {
                return rowData;
            }

            try {
                const result = await this.fetchGeocodingData(searchQuery);
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

    private async processExcelFile(): Promise<GeocodedData[]> {
        const workbook = XLSX.readFile(this.inputFilePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        if (!data?.length) {
            throw new Error('No data found in the Excel file.');
        }

        // Validate data
        const missingColumns = this.validateExcelData(data);
        if (missingColumns.length > 0) {
            console.warn(`Warning: Missing columns: ${missingColumns.join(', ')}`);
        }

        // Process rows
        const geocodedData: GeocodedData[] = [];
        for (let i = 0; i < data.length; i++) {
            try {
                const row = data[i];
                console.log(`Processing row ${i+1}/${data.length}: ${row[`Field Name`] || 'Unknown'}`);
                
                if (!this.validateRow(row, i+1)) {
                    geocodedData.push(row);
                    continue;
                }

                const geocodedRow = await this.geocodeAddress(row);
                geocodedData.push(geocodedRow);
            } catch (error) {
                console.error(`Error processing row ${i+1}:`, error instanceof Error ? error.message : String(error));
                geocodedData.push(data[i]);
            }
        }

        return geocodedData;
    }

    private saveToFile(data: GeocodedData[]): void {
        const workbook = XLSX.readFile(this.inputFilePath);
        const sheetName = workbook.SheetNames[0];
        workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(data);
        XLSX.writeFile(workbook, this.inputFilePath);
        console.log(`Data saved to: ${this.inputFilePath}`);
    }

    private async runGeocoding(): Promise<void> {
        try {
            console.log('Starting geocoding process...');
            const startTime = Date.now();
            
            this.geocodedData = await this.processExcelFile();
            this.saveToFile(this.geocodedData); // Save to file after processing
            
            const endTime = Date.now();
            const totalTimeSeconds = Math.round((endTime - startTime) / 1000);
            console.log(`Geocoding complete in ${Math.floor(totalTimeSeconds / 60)}m ${totalTimeSeconds % 60}s`);
        } catch (error) {
            console.error('Geocoding failed:', error);
            throw error;
        }
    }
}