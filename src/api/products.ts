import apiClient from './client';
import { Product } from '../types/product';
import { Paginated } from '../types/api';

export async function fetchProducts(params?: {
  skip?: number;
  limit?: number;
}): Promise<Paginated<Product>> {
  const { data } = await apiClient.get<Paginated<Product>>('/products', {
    params: {
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 50,
    },
  });
  return data;
}
