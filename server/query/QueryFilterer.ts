import { InsightError, Rooms, Contractor } from "../controller/IInsightFacade";

export default class QueryFilterer {
	private readonly filteredContractors: (Contractor | Rooms)[];

	constructor(contractors: Contractor[], query: unknown) {
		this.filteredContractors = this.applyFilter(contractors, query);
	}

	public getFilteredContractors(): Contractor[] {
		return this.filteredContractors;
	}

	private applyFilter(contractors: Contractor[], condition: any): Contractor[] {
		if (!condition || Object.keys(condition).length === 0) {
			return contractors;
		}

		const key = Object.keys(condition)[0];
		const subquery = condition[key];

		switch (key) {
			case "GT":
				return this.filterByComparison(contractors, subquery, (a, b) => a > b);
			case "LT":
				return this.filterByComparison(contractors, subquery, (a, b) => a < b);
			case "EQ":
				return this.filterByComparison(contractors, subquery, (a, b) => a === b);
			case "IS":
				return this.filterByString(contractors, subquery);
			case "AND":
				return this.applyLogicalOperator(contractors, subquery, "AND");
			case "OR":
				return this.applyLogicalOperator(contractors, subquery, "OR");
			case "NOT":
				return this.applyNegation(contractors, subquery);
			default:
				throw new InsightError(`Invalid filter key: ${key}`);
		}
	}

	private filterByComparison(
		contractors: Contractor[],
		subquery: any,
		comparator: (a: number, b: number) => boolean
	): Contractor[] {
		const field = Object.keys(subquery)[0];
		const fieldName = field.split("_")[1];
		const value = subquery[field];

		if (typeof value !== "number") {
			throw new InsightError(`Field "${field}" must be a number for MCOMP filter.`);
		}

		return contractors.filter((contractor) => {
			if (typeof contractor[fieldName as keyof Contractor] !== "number") {
				throw new InsightError(`Field "${fieldName}" is not a number!`);
			}
			return comparator(contractor[fieldName as keyof Contractor], value);
		});
	}

	private filterByString(contractors: Contractor[], subquery: any): Contractor[] {
		const field = Object.keys(subquery)[0];
		const fieldName = field.split("_")[1];
		const value = subquery[field];

		if (typeof value !== "string") {
			throw new InsightError(`Field "${field}" must be a string for IS filter.`);
		}

		return contractors.filter((contractor) => {
			if (typeof contractor[fieldName as keyof Contractor] !== "string") {
				throw new InsightError(`Field "${fieldName}" is not a string.`);
			}
			const contractorValue: string = contractor[fieldName as keyof Contractor];
			if (!value.includes("*")) {
				return contractorValue === value;
			} else if (value.startsWith("*") && value.endsWith("*")) {
				const searchString = value.slice(1, -1);
				return contractorValue.includes(searchString);
			} else if (value.startsWith("*")) {
				const searchString = value.slice(1);
				return contractorValue.endsWith(searchString);
			} else if (value.endsWith("*")) {
				const searchString = value.slice(0, -1);
				return contractorValue.startsWith(searchString);
			}

			throw new InsightError(`The IS logic of ${value} failed!`);
		});
	}

	private applyLogicalOperator(
		contractors: Contractor[],
		subqueries: any[],
		operator: "AND" | "OR"
	): Contractor[] {
		if (!Array.isArray(subqueries) || subqueries.length === 0) {
			throw new InsightError(`"${operator}" operator requires a non-empty array.`);
		}

		if (operator === "AND") {
			let filteredContractors = contractors;
			for (const subquery of subqueries) {
				filteredContractors = this.applyFilter(filteredContractors, subquery);
			}
			return filteredContractors;
		} else if (operator === "OR") {
			const results = subqueries.map((subquery) => this.applyFilter(contractors, subquery));
			return Array.from(new Set(results.flat()));
		} else {
			throw new InsightError("Unexpected operator!");
		}
	}

	private applyNegation(contractors: Contractor[], subquery: any): (Contractor | Rooms)[] {
		const filteredContractors = this.applyFilter(contractors, subquery);
		return contractors.filter((contractor) => !filteredContractors.includes(contractor));
	}
}
