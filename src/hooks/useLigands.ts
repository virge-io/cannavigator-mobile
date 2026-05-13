import { useInfiniteQuery, useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchLigands, fetchLigandProfile } from '../api/ligands';

const PAGE_SIZE = 50;

export function useLigands(params?: { type?: string; q?: string }) {
  return useInfiniteQuery({
    queryKey: ['ligands', params?.type ?? 'all', params?.q ?? ''],
    queryFn: ({ pageParam }) =>
      fetchLigands({
        type: params?.type,
        q: params?.q,
        skip: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.has_more ? last.skip + last.limit : undefined),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useLigandProfile(slug: string) {
  return useQuery({
    queryKey: ['ligand-profile', slug],
    queryFn: () => fetchLigandProfile(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
