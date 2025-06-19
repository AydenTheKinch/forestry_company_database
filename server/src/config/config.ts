export const config = {
    port: process.env.PORT || 10000,
    nodeEnv: process.env.NODE_ENV || 'development',
    paths: {
        database: process.env.DATABASE_PATH || '../data/TestSubset.xlsx',
        backup: process.env.BACKUP_PATH || '../data/backup'
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
