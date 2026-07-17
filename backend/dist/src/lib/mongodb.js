"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
require("server-only");
const mongodb_1 = require("mongodb");
const databaseName = process.env.MONGODB_DB || 'civic_ai';
const globalForMongo = globalThis;
async function getDatabase() {
    const uri = process.env.MONGODB_URI;
    if (!uri)
        throw new Error('MONGODB_URI is not configured. Add it to .env.local.');
    const clientPromise = globalForMongo.mongoClientPromise ?? new mongodb_1.MongoClient(uri).connect();
    if (process.env.NODE_ENV !== 'production')
        globalForMongo.mongoClientPromise = clientPromise;
    return (await clientPromise).db(databaseName);
}
