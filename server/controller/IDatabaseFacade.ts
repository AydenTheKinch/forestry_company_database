export interface Contractor {
    companyName: string;
    city: string;
    province: string;
    postal_code: string;
    size: string;
    operations: string[];
    status: string;
    founded: string;
    capacity: string;
    address: string;
    phone: string;
    website: string;
    lat: number;
    lon: number;
}

export type DatabaseResult = Record<string, string | number>;

export interface IDatabaseFacade {
    performQuery(query: unknown): Promise<DatabaseResult[]>;
}

// Make sure Contractor is explicitly exported
export type { Contractor };
