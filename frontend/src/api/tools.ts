import client from './client';
import type { Tool } from '@/types/api';

/** 获取所有可用工具列表 */
export async function fetchTools(): Promise<Tool[]> {
  const { data } = await client.GET('/api/tools/');
  return (data as Tool[]) || [];
}
