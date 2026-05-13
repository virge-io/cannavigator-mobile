import apiClient from './client';
import { Ligand } from '../types/disease';
import { LigandProfile } from '../types/ligand';
import { Paginated } from '../types/api';

export async function fetchLigands(params?: {
  type?: string;
  q?: string;
  skip?: number;
  limit?: number;
}): Promise<Paginated<Ligand>> {
  const { data } = await apiClient.get<Paginated<Ligand>>('/ligands', {
    params: {
      type: params?.type || undefined,
      q: params?.q || undefined,
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 50,
    },
  });
  return data;
}

export async function fetchLigandProfile(slug: string): Promise<LigandProfile> {
  const { data } = await apiClient.get<LigandProfile>(`/ligands/${slug}`);
  return data;
}
