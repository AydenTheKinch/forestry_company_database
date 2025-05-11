import { InsightError } from "../controller/IDatabaseFacade";

export default class QueryValidator {
	private readonly jsonQuery: object;
	private datasetId: string | null = null; // Store dataset ID

	constructor(query: unknown) {
		this.jsonQuery = this.parseQuery(query);
	}

	private parseQuery(query: unknown): object {
		if (typeof query === "object" && query !== null) {
			try {
				JSON.stringify(query); // Ensure it's JSON-safe
				return query;
			} catch (e) {
				throw new Error(`Object is not JSON-safe: ${e}`);
			}
		}

		throw new InsightError("Cannot parse query! Expected a valid JSON object.");
	}

	public validateQuery(): boolean {
		const query: any = this.jsonQuery;
		const keys: string[] = Object.keys(query);

		if (keys.includes("WHERE") && keys.includes("OPTIONS")) {
			if (!this.validateBody(query.WHERE)) return false;
			if (!this.validateOptions(query.OPTIONS)) return false;
		} else {
			return false;
		}

		return true;
	}

	private validateOptions(subquery: any): boolean {
		const keys = Object.keys(subquery);

		if (keys.includes("COLUMNS")) {
			if (!this.handleCOLUMNS(subquery.COLUMNS)) throw new InsightError("Columns are invalid!");
		} else {
			throw new InsightError("Missing columns component!");
		}

		return true;
	}

	private validateBody(subquery: any): boolean {
		const validKeys = new Set(["GT", "LT", "EQ", "IS", "NOT", "AND", "OR"]);
		const keys = Object.keys(subquery);
		if (keys.length === 0) {
			return true;
		}

		for (const key of keys) {
			if (!validKeys.has(key)) {
				return false;
			}
			if (key === "GT" || key === "LT" || key === "EQ") {
				return this.handleMCOMP(subquery[key]);
			} else if (key === "IS") {
				return this.handleSCOMP(subquery[key]);
			} else if (key === "NOT") {
				return this.handleNEG(subquery[key]);
			} else if (key === "AND" || key === "OR") {
				return this.handleLOGIC(subquery[key]);
			}
		}

		return false;
	}

	private validateKeyAndField(subquery: any, validFields: Set<string>): boolean {
		const keys = Object.keys(subquery);
		if (keys.length === 0) return false;

		return keys.every((key) => {
			if (key.includes(" ")) return false;
			const parts = key.split("_");
			if (parts.length !== 2) return false;

			if (!this.datasetId) {
				this.datasetId = parts[0];
			} else if (this.datasetId !== parts[0]) {
				return false;
			}

			if (!validFields.has(parts[1])) {
				return false;
			}

			return typeof subquery[key] === "string" || typeof subquery[key] === "number";
		});
	}

	private handleMCOMP(subquery: any): boolean {
		const validFields = new Set(["avg", "pass", "fail", "audit", "year"]);
		return this.validateKeyAndField(subquery, validFields);
	}

	private handleSCOMP(subquery: any): boolean {
		const validFields = new Set(["dept", "id", "instructor", "title", "uuid"]);
		return this.validateKeyAndField(subquery, validFields);
	}

	private handleLOGIC(subqueries: any): boolean {
		if (!Array.isArray(subqueries) || subqueries.length < 2) {
			return false; // Ensure subqueries is a non-empty array
		}
		return subqueries.every((sub) => this.validateBody(sub));
	}

	private handleNEG(subquery: any): boolean {
		return this.validateBody(subquery);
	}

	private validateField(subquery: unknown, validFields: Set<string>): boolean {
		if (!Array.isArray(subquery) || subquery.length < 1) {
			throw new InsightError("Need to specify at least one column in query!");
		}

		for (const key of subquery) {
			if (typeof key !== "string") {
				return false;
			}

			const parts = key.split("_");

			if (parts.length !== 2) {
				return false;
			}

			if (!this.datasetId) {
				this.datasetId = parts[0];
			} else if (this.datasetId !== parts[0]) {
				return false;
			}

			if (!validFields.has(parts[1])) {
				return false;
			}
		}

		return true;
	}

	private handleORDER(field: any, columns: string[]): boolean {
		const validFields = new Set(["avg", "pass", "fail", "audit", "year", "dept", "id", "instructor", "title", "uuid"]);
		// Single field check, reuse validateField method
		if (!columns.includes(field)) return false;
		return typeof field === "string" && this.validateField([field], validFields);
	}

	private handleCOLUMNS(subquery: any): boolean {
		const validFields = new Set(["avg", "pass", "fail", "audit", "year", "dept", "id", "instructor", "title", "uuid"]);
		return this.validateField(subquery, validFields);
	}

	public getQuery(): object {
		return this.jsonQuery;
	}

	public getDatasetId(): string | null {
		return this.datasetId;
	}
}