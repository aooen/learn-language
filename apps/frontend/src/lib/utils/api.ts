import { hcWithType } from 'backend/hc';

export const client = hcWithType(import.meta.env.VITE_API_URL);
