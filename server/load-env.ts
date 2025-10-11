
import dotenv from 'dotenv';
import path from 'path';

export function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env');
    dotenv.config({ path: envPath });
}
