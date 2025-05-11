import QueryValidator from "./QueryValidator.js";
import QueryRenderer from "./QueryRenderer.js";
import QueryFilterer from "./QueryFilterer.js";
import {
	Contractor,
	DatabaseResult
} from "../controller/IDatabaseFacade.js";

export default class QueryEngine {
	private readonly jsonQuery: any;
	private readonly contractors: Contractor[];
	private validator: QueryValidator;
	private maxResults: number = 5000;

	constructor(query: any, contractors: Contractor[]) {
		this.validator = new QueryValidator(query);
		if (!this.validator.validateQuery()) throw new Error("Query is not valid!");
		this.jsonQuery = this.validator.getQuery();
		this.contractors = contractors;
	}

	public returnContractors(): DatabaseResult[] {
		const filteredSections = this.filterContractors(this.contractors);
		const renderer = new QueryRenderer(this.jsonQuery, filteredSections);
		return renderer.getOutput();
	}

	public filterContractors(contractors: Contractor[]): Contractor[] {
		if (!this.jsonQuery || typeof this.jsonQuery !== "object") {
			throw new Error("Invalid query structure");
		}
		const filterer = new QueryFilterer(contractors, this.jsonQuery.WHERE);
		return filterer.getFilteredContractors();
	}
}
