import { GeoCache } from "../service/GeoCache";

async function main() {
    const dbPath = "server/data/Forestry Contractor Database.csv";
    const geoCache = new GeoCache(dbPath);
    
    try {
        await geoCache.initialize();
        console.log("Geocaching complete!");
    } catch (error) {
        console.error("Failed to run geocaching:", error);
        process.exit(1);
    }
}

main().catch(console.error);
