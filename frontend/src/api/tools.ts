import client from './client';
import type { Tool } from '@/types/api';

export async function fetchTools(): Promise<Tool[]> {
  const { data } = await client.GET('/api/tools/');
  return data || [];
}
