import { Rooms, Section } from "../controller/IInsightFacade";
import Decimal from "decimal.js";

export default class QueryAggregator {
	private readonly aggregateItems: (Section | Rooms)[];

	constructor(filteredItems: (Section | Rooms)[], query: any) {
		this.aggregateItems = this.applyTransformations(filteredItems, query);
	}

	private applyTransformations(items: (Section | Rooms)[], transformations: any): (Section | Rooms)[] {
		if (!transformations) {
			return items;
		}

		const { GROUP, APPLY } = transformations;
		if (!GROUP || !APPLY) {
			throw new Error("Invalid TRANSFORMATIONS format");
		}

		// Extract field names from GROUP
		const groupFields = GROUP.map((g: string) => g.split("_")[1]);

		// Preprocess APPLY rules (extract field names)
		const processedApplyRules = this.preprocessApplyRules(APPLY);

		// Group items based on extracted field names
		const groupedItems = this.groupItems(items, groupFields);

		// Apply aggregation rules
		return this.aggregateGroupedItems(groupedItems, groupFields, processedApplyRules);
	}

	private preprocessApplyRules(applyRules: any[]): any[] {
		return applyRules.map((rule) => {
			const applyKey = Object.keys(rule)[0];
			const operation = rule[applyKey];

			// Extract field name without dataset prefix
			const rawField = Object.values(operation)[0] as string;
			const field = rawField.includes("_") ? rawField.split("_")[1] : rawField;

			return { applyKey, operation: { [Object.keys(operation)[0]]: field } };
		});
	}

	private groupItems(items: (Section | Rooms)[], fields: string[]): Map<string, (Section | Rooms)[]> {
		const groupedResults = new Map<string, (Section | Rooms)[]>();

		for (const item of items) {
			const key = fields.map((field) => String(item[field as keyof (Section | Rooms)])).join("_");

			if (!groupedResults.has(key)) {
				groupedResults.set(key, []);
			}

			groupedResults.get(key)!.push(item);
		}

		return groupedResults;
	}

	private aggregateGroupedItems(
		groupedItems: Map<string, (Section | Rooms)[]>,
		groups: string[],
		applyRules: any[]
	): (Section | Rooms)[] {
		const aggregatedResults: (Section | Rooms)[] = [];

		for (const [, group] of groupedItems.entries()) {
			// Start with a new aggregated entry
			const aggregatedEntry: Partial<Section | Rooms> = {};

			// Retain group key values
			for (const k of groups) {
				aggregatedEntry[k as keyof (Section | Rooms)] = group[0][k as keyof (Section | Rooms)];
			}

			// Apply aggregation rules
			this.applyRules(group, applyRules, aggregatedEntry);

			aggregatedResults.push(aggregatedEntry as Section | Rooms);
		}

		return aggregatedResults;
	}

	private calculateAvg(group: (Section | Rooms)[], field: keyof (Section | Rooms)): number {
		let validCount = 0;
		const total = group.reduce((acc, s) => {
			if (s[field] !== null && s[field] !== undefined && s[field] !== "") {
				validCount++;
				return acc.plus(new Decimal(s[field]));
			}
			return acc;
		}, new Decimal(0));
		if (validCount > 0) {
		}
		const avg = validCount > 0 ? total.toNumber() / validCount : 0;
		return Number(avg.toFixed(2));
	}

	private applyRules(group: (Section | Rooms)[], applyRules: any[], aggregatedEntry: Partial<Section | Rooms>): void {
		for (const { applyKey, operation } of applyRules) {
			const field = Object.values(operation)[0] as keyof (Section | Rooms);

			switch (Object.keys(operation)[0]) {
				case "MAX":
					// @ts-ignore
					aggregatedEntry[applyKey] = Math.max(...group.map((s) => Number(s[field])));
					break;
				case "MIN":
					// @ts-ignore
					aggregatedEntry[applyKey] = Math.min(...group.map((s) => Number(s[field])));
					break;
				case "AVG":
					// @ts-ignore
					aggregatedEntry[applyKey] = this.calculateAvg(group, field);
					break;
				case "SUM":
					const sum = group.reduce(
						(acc, s) =>
							acc.plus(new Decimal(s[field] !== null && s[field] !== undefined && s[field] !== "" ? s[field] : 0)),
						new Decimal(0)
					);
					// @ts-ignore
					aggregatedEntry[applyKey] = parseFloat(sum.toFixed(2));
					break;
				case "COUNT":
					// @ts-ignore
					aggregatedEntry[applyKey] = new Set(group.map((s) => s[field])).size;
					break;
				default:
					throw new Error("Unsupported APPLY operation");
			}
		}
	}

	public getAggregateResults(): (Section | Rooms)[] {
		return this.aggregateItems;
	}
}
