
import dotenv from 'dotenv';
import path from 'path';

// Determine the correct path to the .env file based on the environment
const envFile = process.env.NODE_ENV === 'production' ? '.env' : 'dev.env';
const envPath = path.resolve(process.cwd(), envFile);

dotenv.config({ path: envPath });
