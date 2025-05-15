import { FilterState } from '../containers/ContractorRegistry';

export const searchContractors = async (filters: FilterState, sortField: string, sortDirection: string) => {
    // Convert frontend filters to backend query format
    const query = {
        WHERE: buildWhereClause(filters),
        OPTIONS: {
            SORT: {
                dir: sortDirection.toUpperCase(),
                keys: [sortField]
            }
        }
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

function buildWhereClause(filters: FilterState) {
    const conditions = [];

    if (filters.keyword) {
        conditions.push({
            OR: [
                { IS: { companyName: `*${filters.keyword}*` } },
                { IS: { city: `*${filters.keyword}*` } },
                { IS: { operations: `*${filters.keyword}*` } }
            ]
        });
    }

    if (filters.companyName) {
        conditions.push({ IS: { companyName: `*${filters.companyName}*` } });
    }

    if (filters.city) {
        conditions.push({ IS: { city: `*${filters.city}*` } });
    }

    // if (filters.size) {
    //     conditions.push({ IS: { size: filters.size } });
    // }

    // if (filters.operation) {
    //     conditions.push({ IS: { operations: `*${filters.operation}*` } });
    // }

    return conditions.length > 1 ? { AND: conditions } : conditions[0] || {};
}
