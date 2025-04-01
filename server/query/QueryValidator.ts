import { InsightError } from "../controller/IInsightFacade";

export default class QueryValidator {
	private readonly jsonQuery: object;
	private datasetId: string | null = null; // Store dataset ID
	private datasetKind: string | null = null;

	private validRoomFieldsMCOMP = new Set<string>(["lat", "lon", "seats"]);
	private validRoomFieldsSCOMP = new Set<string>([
		"fullname",
		"shortname",
		"number",
		"name",
		"address",
		"type",
		"furniture",
		"href",
	]);
	private validRoomFields = new Set([...this.validRoomFieldsMCOMP, ...this.validRoomFieldsSCOMP]);

	private validSectionFieldsMCOMP = new Set<string>(["avg", "pass", "fail", "audit", "year"]);
	private validSectionFieldsSCOMP = new Set<string>(["dept", "id", "instructor", "title", "uuid"]);
	private validSectionFields = new Set([...this.validSectionFieldsMCOMP, ...this.validSectionFieldsSCOMP]);

	private validApplyTokens = new Set(["MAX", "MIN", "AVG", "COUNT", "SUM"]);

	private applyKeys = new Set<string>([]);
	private validGroupKeys: string[] = [""];
	private groupExists: boolean = false;

	constructor(query: unknown) {
		this.jsonQuery = this.parseQuery(query);
	}

	private getValidFields(fieldType: "MCOMP" | "SCOMP" | "ANY"): Set<string> {
		if (this.datasetKind === "sections") {
			if (fieldType === "MCOMP") return this.validSectionFieldsMCOMP;
			if (fieldType === "SCOMP") return this.validSectionFieldsSCOMP;
			if (fieldType === "ANY") return this.validSectionFields;
		} else if (this.datasetKind === "rooms") {
			if (fieldType === "MCOMP") return this.validRoomFieldsMCOMP;
			if (fieldType === "SCOMP") return this.validRoomFieldsSCOMP;
			if (fieldType === "ANY") return this.validRoomFields;
		}
		throw new InsightError("QueryValidator cannot determine dataset type.");
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

		if (keys.includes("WHERE")) {
			if (!this.validateBody(query.WHERE)) return false;
		} else {
			return false;
		}

		if (keys.includes("TRANSFORMATIONS")) {
			if (!this.validateTransformations(query.TRANSFORMATIONS)) return false;
		}

		if (keys.includes("OPTIONS")) {
			if (!this.validateOptions(query.OPTIONS)) return false;
		} else {
			return false;
		}

		return true;
	}

	private validateBody(subquery: any): boolean {
		const validKeys = new Set(["GT", "LT", "EQ", "IS", "NOT", "AND", "OR"]);
		const keys = Object.keys(subquery);
		if (keys.length === 0) {
			return true;
		}

		// Process each key in the subquery
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

	private validateTransformations(transformation: any): boolean {
		const { GROUP, APPLY } = transformation;
		//handle apply first to add applykey to valid fields
		return this.handleAPPLY(APPLY) && this.handleGROUP(GROUP);
	}

	private validateOptions(subquery: any): boolean {
		const keys = Object.keys(subquery);

		if (keys.includes("COLUMNS")) {
			if (!this.handleCOLUMNS(subquery.COLUMNS)) throw new InsightError("Columns are invalid!");
		} else {
			throw new InsightError("Missing columns component!");
		}
		if (keys.includes("ORDER")) {
			if (!this.handleORDER(subquery.ORDER, subquery.COLUMNS)) return false;
		}

		return true;
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

	private splitAndValidateKey(key: any, validFields: Set<string>): boolean {
		const parts = key.split("_");

		if (parts.length !== 2) {
			return false;
		}

		if (!this.datasetId) {
			this.datasetId = parts[0];
		} else if (this.datasetId !== parts[0]) {
			return false;
		}

		return validFields.has(parts[1]);
	}

	private validateField(subquery: unknown, validFields: Set<string>): boolean {
		if (!Array.isArray(subquery) || subquery.length < 1) {
			throw new InsightError("Need to specify at least one column in query!");
		}

		for (const key of subquery) {
			if (!this.splitAndValidateKey(key, validFields)) throw new InsightError("Key was not validated.");
		}

		return true;
	}

	private handleMCOMP(subquery: any): boolean {
		if (this.datasetKind === null) {
			this.setDatasetKind(subquery);
		}

		const validFields = this.getValidFields("MCOMP");

		return this.validateKeyAndField(subquery, validFields);
	}

	private handleSCOMP(subquery: any): boolean {
		if (this.datasetKind === null) {
			this.setDatasetKind(subquery);
		}

		const validFields = this.getValidFields("SCOMP");

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

	private handleORDER(order: any, columns: string[]): boolean {
		if (typeof order === "string") {
			// Ensure ORDER is in COLUMNS (already valid)
			if (!columns.includes(order)) {
				throw new InsightError(`ORDER key '${order}' must be present in COLUMNS.`);
			}
			return true;
		}

		if (typeof order === "object" && order !== null) {
			const { dir, keys } = order;

			if (dir !== "UP" && dir !== "DOWN") {
				throw new InsightError("ORDER direction must be 'UP' or 'DOWN'.");
			}

			if (!Array.isArray(keys) || keys.length === 0) {
				throw new InsightError("ORDER keys must be a non-empty array.");
			}

			// Ensure ORDER is in COLUMNS (already valid)
			for (const key of keys) {
				if (!columns.includes(key)) {
					throw new InsightError(`ORDER key '${key}' must be present in COLUMNS.`);
				}
			}

			return true;
		}

		throw new InsightError("ORDER must be a string or an object.");
	}

	private handleAPPLY(apply: any): boolean {
		if (!Array.isArray(apply)) {
			throw new InsightError("APPLY must be an array.");
		}

		for (const rule of apply) {
			const ruleKeys = Object.keys(rule);
			if (ruleKeys.length !== 1) {
				throw new InsightError("Each APPLY rule must have exactly one apply key.");
			}

			const applyKey = ruleKeys[0];
			if (applyKey.includes("_") || this.applyKeys.has(applyKey)) {
				throw new InsightError(`Invalid or duplicate apply key: '${applyKey}'.`);
			}
			this.applyKeys.add(applyKey);

			const applyRule = rule[applyKey];

			const applyTokens = Object.keys(applyRule);
			if (applyTokens.length !== 1) {
				throw new InsightError("Each APPLY rule must have exactly one aggregation function.");
			}

			const applyToken = applyTokens[0];
			if (!this.validApplyTokens.has(applyToken)) {
				throw new InsightError(`Invalid APPLYTOKEN '${applyToken}'.`);
			}

			if (this.datasetKind === null) {
				this.setDatasetKind(Object.values(applyRule));
			}

			const validFields = this.getValidFields("ANY");

			// Use validateField to check APPLY field
			if (!this.validateField(Object.values(applyRule), validFields)) {
				throw new InsightError(`Invalid APPLY key: '${Object.values(applyRule)[0]}'.`);
			}
		}

		return true;
	}

	private handleGROUP(group: any): boolean {
		if (!Array.isArray(group) || group.length === 0) {
			throw new InsightError("GROUP must be a non-empty array.");
		}

		// Reuse validateField to check all GROUP keys
		const validFields = this.getValidFields("ANY");

		if (!this.validateField(group, validFields)) {
			throw new InsightError("Invalid field(s) in GROUP.");
		}

		this.validGroupKeys = group;
		this.groupExists = true;

		return true;
	}

	private handleCOLUMNS(subquery: any): boolean {
		if (this.datasetKind === null) {
			this.setDatasetKind(subquery);
		}

		const validFields = this.getValidFields("ANY");

		// Check each field in the subquery
		for (const key of subquery) {
			if (key.includes("_")) {
				if (!this.splitAndValidateKey(key, validFields)) throw new InsightError("Key was not validated.");

				if (this.groupExists && !this.validGroupKeys.includes(key)) {
					throw new InsightError("Group keys exist but valid column is not in group or applykey");
				}
			} else {
				if (!this.applyKeys.has(key)) {
					throw new InsightError(`Invalid applyKey: '${key}'`);
				}
			}
		}

		return true;
	}

	private setDatasetKind(subquery: any): void {
		if (
			!subquery ||
			(Array.isArray(subquery) && subquery.length === 0) ||
			(typeof subquery === "object" && Object.keys(subquery).length === 0)
		) {
			throw new InsightError("Cannot set Dataset: subquery is empty");
		}

		const firstField = Array.isArray(subquery) ? subquery[0] : Object.keys(subquery)[0] || "";

		const parts = firstField.split("_");
		if (parts.length !== 2) {
			throw new InsightError(`Invalid field format: ${firstField}`);
		}

		const field = parts[1]; // Extracts "avg" from "sections_avg"

		if (this.validSectionFields.has(field)) {
			this.datasetKind = "sections";
		} else if (this.validRoomFields.has(field)) {
			this.datasetKind = "rooms";
		} else {
			throw new InsightError(`${firstField} is not in any valid dataset type`);
		}
	}

	public getQuery(): object {
		return this.jsonQuery;
	}

	public getDatasetId(): string | null {
		return this.datasetId;
	}

	public getDatasetKind(): string | null {
		return this.datasetKind;
	}

	public getApplyKeys(): Set<string> | null {
		return this.applyKeys;
	}
}
