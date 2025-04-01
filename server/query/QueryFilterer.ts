import { InsightError, Rooms, Section } from "../controller/IInsightFacade";

export default class QueryFilterer {
	private readonly filteredSections: (Section | Rooms)[];

	constructor(sections: (Section | Rooms)[], query: unknown) {
		this.filteredSections = this.applyFilter(sections, query);
	}

	public getFilteredSections(): (Section | Rooms)[] {
		return this.filteredSections;
	}

	private applyFilter(sections: (Section | Rooms)[], condition: any): (Section | Rooms)[] {
		if (!condition || Object.keys(condition).length === 0) {
			return sections;
		}

		const key = Object.keys(condition)[0];
		const subquery = condition[key];

		switch (key) {
			case "GT":
				return this.filterByComparison(sections, subquery, (a, b) => a > b);
			case "LT":
				return this.filterByComparison(sections, subquery, (a, b) => a < b);
			case "EQ":
				return this.filterByComparison(sections, subquery, (a, b) => a === b);
			case "IS":
				return this.filterByString(sections, subquery);
			case "AND":
				return this.applyLogicalOperator(sections, subquery, "AND");
			case "OR":
				return this.applyLogicalOperator(sections, subquery, "OR");
			case "NOT":
				return this.applyNegation(sections, subquery);
			default:
				throw new InsightError(`Invalid filter key: ${key}`);
		}
	}

	private filterByComparison(
		sections: (Section | Rooms)[],
		subquery: any,
		comparator: (a: number, b: number) => boolean
	): (Section | Rooms)[] {
		const field = Object.keys(subquery)[0];
		const fieldName = field.split("_")[1];
		const value = subquery[field];

		if (typeof value !== "number") {
			throw new InsightError(`Field "${field}" must be a number for MCOMP filter.`);
		}

		return sections.filter((section) => {
			if (typeof section[fieldName as keyof (Section | Rooms)] !== "number") {
				throw new InsightError(`Field "${fieldName}" is not a number!`);
			}
			return comparator(section[fieldName as keyof (Section | Rooms)], value);
		});
	}

	private filterByString(sections: (Section | Rooms)[], subquery: any): (Section | Rooms)[] {
		const field = Object.keys(subquery)[0];
		const fieldName = field.split("_")[1];
		const value = subquery[field];

		if (typeof value !== "string") {
			throw new InsightError(`Field "${field}" must be a string for IS filter.`);
		}

		return sections.filter((section) => {
			if (typeof section[fieldName as keyof (Section | Rooms)] !== "string") {
				throw new InsightError(`Field "${fieldName}" is not a string.`);
			}
			const sectionValue: string = section[fieldName as keyof (Section | Rooms)];
			if (!value.includes("*")) {
				return sectionValue === value;
			} else if (value.startsWith("*") && value.endsWith("*")) {
				const searchString = value.slice(1, -1);
				return sectionValue.includes(searchString);
			} else if (value.startsWith("*")) {
				const searchString = value.slice(1);
				return sectionValue.endsWith(searchString);
			} else if (value.endsWith("*")) {
				const searchString = value.slice(0, -1);
				return sectionValue.startsWith(searchString);
			}

			throw new InsightError(`The IS logic of ${value} failed!`);
		});
	}

	private applyLogicalOperator(
		sections: (Section | Rooms)[],
		subqueries: any[],
		operator: "AND" | "OR"
	): (Section | Rooms)[] {
		if (!Array.isArray(subqueries) || subqueries.length === 0) {
			throw new InsightError(`"${operator}" operator requires a non-empty array.`);
		}

		if (operator === "AND") {
			let filteredSections = sections;
			for (const subquery of subqueries) {
				filteredSections = this.applyFilter(filteredSections, subquery);
			}
			return filteredSections;
		} else if (operator === "OR") {
			const results = subqueries.map((subquery) => this.applyFilter(sections, subquery));
			return Array.from(new Set(results.flat()));
		} else {
			throw new InsightError("Unexpected operator!");
		}
	}

	private applyNegation(sections: (Section | Rooms)[], subquery: any): (Section | Rooms)[] {
		const filteredSections = this.applyFilter(sections, subquery);
		return sections.filter((section) => !filteredSections.includes(section));
	}
}
