import apiClient from './client';
import { Disease, DiseaseProfile } from '../types/disease';
import { Paginated } from '../types/api';

export async function fetchDiseases(params?: {
  q?: string;
  skip?: number;
  limit?: number;
}): Promise<Paginated<Disease>> {
  const { data } = await apiClient.get<Paginated<Disease>>('/diseases', {
    params: {
      q: params?.q || undefined,
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 50,
    },
  });
  return data;
}

export async function fetchDiseaseDetail(slug: string): Promise<DiseaseProfile> {
  const { data } = await apiClient.get<DiseaseProfile>(`/diseases/${slug}`);
  return data;
}
