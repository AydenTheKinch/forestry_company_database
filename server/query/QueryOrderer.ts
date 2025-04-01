import { Rooms, Section } from "../controller/IInsightFacade";

export default class QueryOrderer {
	private readonly jsonQuery: any;
	private readonly numFields = new Set(["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats", "maxSeats"]);
	private readonly stringFields = new Set([
		"fullname",
		"shortname",
		"number",
		"name",
		"address",
		"type",
		"furniture",
		"href",
	]);
	private readonly applyKeys: Set<string> | null;
	private sections: (Section | Rooms)[];

	constructor(query: unknown, sections: (Section | Rooms)[], applyKeys: Set<string> | null) {
		this.sections = sections;
		this.jsonQuery = query;
		this.applyKeys = applyKeys;
	}

	public sortSections(order: string | { dir: "UP" | "DOWN"; keys: string[] }): (Section | Rooms)[] {
		if (typeof order === "string") {
			return this.sortBySingleKey(order, this.sections, "UP");
		} else {
			return this.sortByMultipleKeys(order.keys, this.sections, order.dir);
		}
	}

	private extractField(orderKey: string): string {
		// If the key is from APPLY, return as-is
		if (this.applyKeys?.has(orderKey)) return orderKey;
		// Otherwise, remove dataset prefix
		return orderKey.includes("_") ? orderKey.split("_")[1] : orderKey;
	}

	private sortBySingleKey(
		orderKey: string,
		sections: (Section | Rooms)[],
		direction: "UP" | "DOWN"
	): (Section | Rooms)[] {
		const field = this.extractField(orderKey);
		const factor = direction === "UP" ? 1 : -1;

		sections.sort((a: Section | Rooms, b: Section | Rooms) => {
			const valueA = a[field as keyof (Section | Rooms)];
			const valueB = b[field as keyof (Section | Rooms)];

			if (this.numFields.has(field) || this.applyKeys?.has(field)) {
				return ((valueA as number) - (valueB as number)) * factor;
			} else if (this.stringFields.has(field)) {
				return (valueA < valueB ? -1 : valueA > valueB ? 1 : 0) * factor;
			}
			return 0;
		});
		return sections;
	}

	private sortByMultipleKeys(
		keys: string[],
		sections: (Section | Rooms)[],
		direction: "UP" | "DOWN"
	): (Section | Rooms)[] {
		const factor = direction === "UP" ? 1 : -1;

		sections.sort((a: Section | Rooms, b: Section | Rooms) => {
			for (const key of keys) {
				const field = this.extractField(key);
				const valueA = a[field as keyof (Section | Rooms)];
				const valueB = b[field as keyof (Section | Rooms)];

				let comparison = 0;
				if (this.numFields.has(field) || this.applyKeys?.has(field)) {
					comparison = (valueA as number) - (valueB as number);
				} else if (this.stringFields.has(field)) {
					comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
				}

				if (comparison !== 0) {
					return comparison * factor;
				}
			}
			return 0;
		});
		return sections;
	}
}
