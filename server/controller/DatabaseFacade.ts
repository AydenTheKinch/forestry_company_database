import {
	Contractor,
	IDatabaseFacade,
	DatabaseResult
} from "./IDatabaseFacade";
//import JSZip from "jszip";
import DataProcessor from "../database/DataProcessor";
import QueryEngine from "../query/QueryEngine";
import config from '../config/config';

export default class DatabaseFacade implements IDatabaseFacade {
	private dataProcessor: DataProcessor;

	constructor() {
		this.dataProcessor = new DataProcessor();
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
	public async performQuery(query: unknown): Promise<DatabaseResult[]> {
		const contractors = await this.loadDataset();
		const engine = new QueryEngine(query, contractors);
		return engine.returnContractors();
	}
}
