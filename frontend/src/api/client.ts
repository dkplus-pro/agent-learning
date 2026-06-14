import createClient from 'openapi-fetch';
import type { paths } from '@/types/api';

// In development, use the backend URL directly
// In production, use the relative path
const baseUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000'
  : '';

const client = createClient<paths>({
  baseUrl,
});

export default client;
