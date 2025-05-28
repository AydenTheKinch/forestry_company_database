export interface Contractor {
    id: number;
    companyName: string;
    operations: string[];
    equipment: string[];
    models: string[];
    city: string;
    region: string;
    province: string;
    website: string;
    phone: string;
    address: string;
    lat: number;
    lon: number;
}

export const operationTypes: string[] = ["Thinning", "Fuel treatment", "Final harvesting"];
export const equipmentTypes: string[] = ["Harvester", "Forwarder", "Feller buncher", "Truck", "Loader", "Excavator"];
