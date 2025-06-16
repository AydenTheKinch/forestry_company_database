import { QueryFilterer } from "./QueryFilterer.js";
import { Contractor } from "../controller/DatabaseFacade.js";

export interface ContractorQuery {
	companyName: string;
	city: string;
	region: string;
	operations: string;
	equipment: string;
	models: string;
} 

const requiredFields: (keyof ContractorQuery)[] = [
	'companyName',
	'city',
	'region',
	'operations',
	'equipment',
	'models'
];

export class QueryEngine {
    private readonly validatedquery: ContractorQuery;
    private readonly contractors: Contractor[];

    constructor(query: any, contractors: Contractor[]) {
        this.validatedquery = this.validateQuery(query);
        this.contractors = contractors;
    }

    public returnContractors(): Contractor[] {
        const filteredContractors = this.filterContractors();
        return filteredContractors;
    }

    private validateQuery(query: any): ContractorQuery {
        if (!query || typeof query !== 'object') {
            throw new Error("Query must be an object");
        }

        for (const field of requiredFields) {
            if (!(field in query) || typeof query[field] !== 'string') {
                throw new Error(`Missing or invalid ${field} field`);
            }
        }

        return {
            companyName: query.companyName,
            city: query.city,
            region: query.region,
            operations: query.operations,
            equipment: query.equipment,
            models: query.models
        };
    }

    private filterContractors(): Contractor[] {
        const filterer = new QueryFilterer(this.contractors, this.validatedquery);
        return filterer.getFilteredContractors();
    }
}
