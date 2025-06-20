import { Contractor } from "../controller/DatabaseFacade.js";  
import XLSX from 'xlsx';
import { config } from '../config/config.js';
import fs from 'fs';

export class DataProcessor {
	private filepath: string;
	private contractors: Contractor[] | null;

	constructor(filepath: string) {
		this.filepath = filepath;
		this.contractors = null;
	}

	private processOperations(operation: string): string[] {
		if (!operation) return [];
		return operation.split(',').map(op => op.trim());
	}

	private processData(): Contractor[] {
		const filePath = this.filepath;
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
		fs.writeFileSync(config.paths.json, jsonData);
	}

	public getContractors() {
		if (!this.contractors) {
			this.contractors = this.processData();
		}
		return this.contractors;
	}
}

// Test processing
// const processor = new DataProcessor("../data/The 22 1.xlsx");
// console.log(processor.getContractors());

