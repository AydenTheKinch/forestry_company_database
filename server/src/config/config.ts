export const config = {
    port: process.env.PORT || 8000,
    paths: {
        database: process.env.DATABASE_PATH || './src/data/ContractorDatabase.xlsx',
        backup: process.env.BACKUP_PATH || './src/data/backup',
        json: process.env.JSON_PATH || './src/data/contractors.json'
    },
    api: {
        nominatimDelay: parseInt(process.env.NOMINATIM_DELAY || '1000'), // milliseconds between API calls
        userAgent: process.env.USER_AGENT || 'ForestryDatabase aydenkinchla@gmail.com'
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
    }
};

export default config;
