import createClient from 'openapi-fetch';
import type { paths } from '@/types/api';

// In development, use the backend URL directly
// In production, use the relative path
const baseUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000'
  : '';

/** API 客户端实例 —— 基于 openapi-fetch 封装，自动处理开发/生产环境 baseUrl */
const client = createClient<paths>({
  baseUrl,
});

export default client;
