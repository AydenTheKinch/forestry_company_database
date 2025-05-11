import { Contractor } from "../controller/IDatabaseFacade.ts";  
import XLSX from 'xlsx';
import config from '../config/config.ts';  

export default class DataProcessor {
	private filepath: string;
	private contractors: Contractor[];

	constructor() {
		this.filepath = config.paths.database;
		this.contractors = this.processData(this.filepath);
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

			for(let row of data) {
				const newContractor: Contractor = {
					companyName: row['Field Name'],
					city: row['City'],
					province: row['Province'],
					postal_code: row['Postal code'],
					size: row['Size'],
					operations: [
						...this.processOperations(row['Type of operations 1']),
						...this.processOperations(row['Type of operations 2'])
					],
					status: row['Status'],
					founded: row['Founded'],
					capacity: row['Capacity'],
					address: row['Address'],
					phone: row['Phone'],
					website: row['Website'],
					lat: row['lat'],
					lon: row['lon']
				};
				fileContents.push(newContractor);
			}
		} catch {
			throw new Error("Failed to load database.");
		}

		return fileContents;
	}

	public getContractors() {
		return this.contractors;
	}
}

// Test processing
const processor = new DataProcessor();
console.log(processor.getContractors());

