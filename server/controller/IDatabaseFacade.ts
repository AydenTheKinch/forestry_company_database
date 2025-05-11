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

// export class DatabaseError extends Error {
// 	constructor(message?: string) {
// 		super(message);
// 		Error.captureStackTrace(this, InsightError);
// 	}
// }

// export class NotFoundError extends Error {
// 	constructor(message?: string) {
// 		super(message);
// 		Error.captureStackTrace(this, NotFoundError);
// 	}
// }

// export class ResultTooLargeError extends Error {
// 	constructor(message?: string) {
// 		super(message);
// 		Error.captureStackTrace(this, ResultTooLargeError);
// 	}
// }

export interface IDatabaseFacade {
    performQuery(query: unknown): Promise<DatabaseResult[]>;
}
