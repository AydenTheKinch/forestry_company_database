import QueryValidator from "../query/QueryValidator";
import QueryRenderer from "./QueryRenderer";
import QueryOrderer from "./QueryOrderer";
//import QueryAggregator from "./QueryAggregator";
import {
	Datasets,
	InsightError,
	InsightResult,
	ResultTooLargeError,
	Rooms,
	Section,
} from "../controller/IInsightFacade";
import QueryFilterer from "./QueryFilterer";
import QueryAggregator from "./QueryAggregator";

export default class QueryEngine {
	private readonly jsonQuery: any;
	private readonly sections: (Section | Rooms)[];
	private readonly datasetId: string | null = null;
	private readonly datasetType: string | null = null;
	private validator: QueryValidator;
	private maxResults: number = 5000;
	private applyKeys: Set<string> | null = new Set<string>([]);

	constructor(query: unknown, datasets: Datasets[]) {
		this.validator = new QueryValidator(query);
		if (!this.validator.validateQuery()) throw new InsightError("Query is not valid!");
		this.jsonQuery = this.validator.getQuery();
		this.datasetId = this.validator.getDatasetId();
		this.datasetType = this.validator.getDatasetKind();
		this.applyKeys = this.validator.getApplyKeys();
		if (!this.datasetId) throw new InsightError("Query does not contain a valid ID!");
		if (!this.checkIDs(datasets, this.datasetId)) throw new InsightError("Datasets does not contain datasetId");
		this.sections = this.getSections(this.datasetId, datasets);
	}

	private checkIDs(datasets: Datasets[], id: string): boolean {
		for (const dataset of datasets) {
			if (dataset.insightDataset.id === id) return true;
		}
		return false;
	}

	private getSections(id: string | null, datasets: Datasets[]): (Section | Rooms)[] {
		for (const dataset of datasets) {
			if (dataset.insightDataset.id === id) {
				return dataset.data;
			}
		}
		return [];
	}

	public returnSections(): InsightResult[] {
		// Step 1: Filter Sections
		const filteredSections = this.filterSections(this.sections);

		// Step 2: Apply Transformations (Grouping + Aggregation)
		let transformedSections = filteredSections;
		if (this.jsonQuery.TRANSFORMATIONS) {
			const aggregator = new QueryAggregator(filteredSections, this.jsonQuery.TRANSFORMATIONS);
			transformedSections = aggregator.getAggregateResults();
		}

		// Step 3: Sort the Results (Only if ORDER exists)
		let orderedSections = transformedSections;
		if (this.jsonQuery.OPTIONS.ORDER) {
			const orderer = new QueryOrderer(this.jsonQuery, transformedSections, this.applyKeys);
			orderedSections = orderer.sortSections(this.jsonQuery.OPTIONS.ORDER);
		}

		// Step 4: Render Final Output
		const renderer = new QueryRenderer(this.jsonQuery, orderedSections);
		const output = renderer.getOutput();

		// Step 5: Check Result Limit
		if (output.length > this.maxResults) {
			throw new ResultTooLargeError("Result is greater than 5000");
		} else {
			return output;
		}
	}

	public filterSections(sections: (Section | Rooms)[]): (Section | Rooms)[] {
		if (!this.jsonQuery || typeof this.jsonQuery !== "object") {
			throw new InsightError("Invalid query structure");
		}
		const filterer = new QueryFilterer(sections, this.jsonQuery.WHERE);
		return filterer.getFilteredSections();
	}
}
