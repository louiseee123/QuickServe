
import dotenv from 'dotenv';
import path from 'path';

export function loadEnv() {
    const envFile = process.env.NODE_ENV === 'production' ? '.env' : 'dev.env';
    const envPath = path.resolve(process.cwd(), envFile);
    dotenv.config({ path: envPath });
}
