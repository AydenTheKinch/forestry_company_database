import { Rooms, Section, InsightResult } from "../controller/IInsightFacade";

export default class QueryRenderer {
	private jsonQuery: any;
	private options: any;
	private readonly orderedSections: (Section | Rooms)[];

	constructor(query: any, sections: (Section | Rooms)[]) {
		this.jsonQuery = query;
		this.options = this.jsonQuery.OPTIONS;
		this.orderedSections = sections;
	}

	public getOutput(): InsightResult[] {
		const output: InsightResult[] = [];

		this.orderedSections.forEach((section) => {
			const sectionOutput: any = {};

			this.options.COLUMNS.forEach((column: string) => {
				// If APPLY key is used, take as-is; otherwise, remove prefix
				const field = column.includes("_") ? column.split("_")[1] : column;
				sectionOutput[column] = section[field as keyof (Section | Rooms)];
			});

			output.push(sectionOutput);
		});

		return output;
	}
}
