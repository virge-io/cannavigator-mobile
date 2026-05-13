import { useInfiniteQuery, useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchDiseases, fetchDiseaseDetail } from '../api/diseases';

const PAGE_SIZE = 50;

export function useDiseases(searchQuery?: string) {
  return useInfiniteQuery({
    queryKey: ['diseases', searchQuery ?? ''],
    queryFn: ({ pageParam }) =>
      fetchDiseases({ q: searchQuery, skip: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.has_more ? last.skip + last.limit : undefined),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useDiseaseDetail(slug: string) {
  return useQuery({
    queryKey: ['disease', slug],
    queryFn: () => fetchDiseaseDetail(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
