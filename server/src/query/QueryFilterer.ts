import { Contractor } from "../controller/DatabaseFacade";

export class QueryFilterer {
    private readonly filteredContractors: Contractor[];

    constructor(contractors: Contractor[], query: any) {
        this.filteredContractors = this.applyFilters(contractors, query);
    }

    public getFilteredContractors(): Contractor[] {
        return this.filteredContractors;
    }

    private applyFilters(contractors: Contractor[], query: any): Contractor[] {
        return contractors.filter(contractor => {
            // Handle keyword search
            if (query.keyword) {
                const keyword = query.keyword.toLowerCase();
                const matchesKeyword = 
                    contractor.companyName.toLowerCase().includes(keyword) ||
                    contractor.city.toLowerCase().includes(keyword) ||
                    contractor.region.toLowerCase().includes(keyword) ||
                    contractor.operations.some(o => o.toLowerCase().includes(keyword)) ||
                    contractor.equipment.some(e => e.toLowerCase().includes(keyword)) ||
                    contractor.models.some(m => m.toLowerCase().includes(keyword));
                
                if (!matchesKeyword) return false;
            }

            // Handle specific field filters
            if (query.companyName && !contractor.companyName.toLowerCase().includes(query.companyName.toLowerCase())) {
                return false;
            }

            if (query.city && !contractor.city.toLowerCase().includes(query.city.toLowerCase())) {
                return false;
            }

            if (query.region && !contractor.region.toLowerCase().includes(query.region.toLowerCase())) {
                return false;
            }

            if (query.operations && !contractor.operations.some(o => o.toLowerCase().includes(query.operations.toLowerCase()))) {
                return false;
            }

            if (query.equipment && !contractor.equipment.some(e => e.toLowerCase().includes(query.equipment.toLowerCase()))) {
                return false;
            }

            return true;
        });
    }
}
