import { FilterState } from '../containers/ContractorRegistry';

export const searchContractors = async (filters: FilterState, sortField: string, sortDirection: string) => {
    const query = {
        companyName: filters.companyName,
        city: filters.city,
        region: filters.region,
        operations: filters.operations,
        equipment: filters.equipment,
        models: filters.keyword, // Using keyword as models search
        sortField,
        sortDirection
    };

    const response = await fetch('http://localhost:4321/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query)
    });

    if (!response.ok) {
        throw new Error('Search failed');
    }

    const data = await response.json();
    return data.result;
};
