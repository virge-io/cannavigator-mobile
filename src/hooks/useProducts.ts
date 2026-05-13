import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchProducts } from '../api/products';

const PAGE_SIZE = 50;

export function useProducts() {
  return useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam }) => fetchProducts({ skip: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.has_more ? last.skip + last.limit : undefined),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
