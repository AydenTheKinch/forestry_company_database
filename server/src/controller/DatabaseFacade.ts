import { DataProcessor } from "../service/DataProcessor";
import { GeoCache } from "../service/GeoCache";
import { QueryEngine } from "../query/QueryEngine";

export class DatabaseFacade {
	private dataProcessor: DataProcessor;
	private geocache: GeoCache;
	private isInitialized: boolean = false;
	private readonly dbPath: string = "./src/data/The 22 1.xlsx";

	constructor() {
		this.geocache = new GeoCache(this.dbPath);
		this.dataProcessor = new DataProcessor(this.dbPath);
	}

	public async initialize(): Promise<void> {
		if (!this.isInitialized) {
			try {
				await this.geocache.initialize();
				await this.dataProcessor.getContractors();
				this.isInitialized = true;
			} catch (error) {
				console.error("DatabaseFacade::initialize - Failed to initialize services:", error);
				throw error;
			}
		}
	}

	/**
	 * Loads contractor dataset from memory/database
	 */
	public async loadDataset(): Promise<Contractor[]> {
		return await this.dataProcessor.getContractors();
	}

	/**
	 * Performs query on contractor data
	 */
	public async performQuery(query: unknown): Promise<Contractor[]> {
		if (!this.isInitialized) {
			await this.initialize();
		}
		const contractors = await this.dataProcessor.getContractors();
		const engine = new QueryEngine(query, contractors);
		return engine.returnContractors();
	}
}

export interface Contractor {
    id: number;
    companyName: string;
    operations: string[];
    equipment: string[];
    models: string[];
    city: string;
    region: string;
    province: string;
    website: string;
    phone: string;
    address: string;
    lat: number;
    lon: number;
}
