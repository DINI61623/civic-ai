import 'server-only';
import { Db, MongoClient } from 'mongodb';

const databaseName = process.env.MONGODB_DB || 'civic_ai';

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

export async function getDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured. Add it to .env.local.');
  const clientPromise = globalForMongo.mongoClientPromise ?? new MongoClient(uri).connect();
  if (process.env.NODE_ENV !== 'production') globalForMongo.mongoClientPromise = clientPromise;
  return (await clientPromise).db(databaseName);
}
