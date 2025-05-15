//import { Contractor } from "../controller/IDatabaseFacade";  
import XLSX from 'xlsx';
//import config from '../config/config';
import fs from 'fs';

export interface Contractor {
    id: number;
    companyName: string;
    operations: string[];
    equipment: string[];
    models: string[];
    city: string;
    region: string;
    website: string;
    phone: string;
    address: string;
	province: string;
    lat: number;
    lon: number;
}

export default class DataProcessor {
	private filepath: string;
	private contractors: Contractor[];

	constructor() {
		this.filepath = "../data/The 22 1.xlsx";
		this.contractors = this.processData(this.filepath);
		this.saveToJson(); 
	}

	private processOperations(operation: string): string[] {
		if (!operation) return [];
		return operation.split(',').map(op => op.trim());
	}

	private processData(filePath: string): Contractor[] {
		let fileContents: Contractor[] = [];

		try {
			const workbook = XLSX.readFile(filePath);
			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName];
			const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
		
			if (!data?.length) {
				console.log('No data found in the Excel file.');
				return fileContents;
			}

			let id = 1;
			for(let row of data) {
				// Skip rows without a company name
				if (!row['Contractors name']) continue;

				const newContractor: Contractor = {
					id: id++,
					companyName: row['Contractors name'],
					operations: this.processOperations(row['Type of operations']),
					equipment: this.processOperations(row['Equipment']),
					models: this.processOperations(row['Models']),
					city: row['City'] || '',
					region: row['Region'] || '',
					website: row['Website'] || '',
					phone: row['Telephone'] || '',
					address: row['Address'] || '',
					province: 'BC',
					lat: row['lat'] || 0,
					lon: row['lon'] || 0
				};
				fileContents.push(newContractor);
			}
		} catch (error) {
			console.error('Error processing data:', error);
			throw new Error("Failed to load database.");
		}

		return fileContents;
	}

	private saveToJson(): void {
		const jsonData = JSON.stringify(this.contractors, null, 2);
		fs.writeFileSync('../data/contractors.json', jsonData);
	}

	public getContractors() {
		return this.contractors;
	}
}

// Test processing
const processor = new DataProcessor();
console.log(processor.getContractors());

