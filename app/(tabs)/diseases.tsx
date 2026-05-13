import React, { useState } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import { Box, Text } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { SearchBar } from '../../src/components/SearchBar';
import { DiseaseCard } from '../../src/components/DiseaseCard';
import { LoadingState } from '../../src/components/LoadingState';
import { ErrorState } from '../../src/components/ErrorState';
import { useDiseases } from '../../src/hooks/useDiseases';

export default function DiseasesScreen() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiseases(query || undefined);

  const diseases = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <Box flex={1} bg="$backgroundLight50">
      <Box p="$4" pb="$2">
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search diseases..." />
      </Box>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message="Failed to load diseases" onRetry={refetch} />
      ) : (
        <FlatList
          data={diseases}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <DiseaseCard disease={item} onPress={() => router.push(`/diseases/${item.slug}`)} />
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <Box py="$4" alignItems="center">
                <ActivityIndicator />
              </Box>
            ) : null
          }
          ListEmptyComponent={
            <Text color="$textLight400" textAlign="center" mt="$8">
              No diseases found
            </Text>
          }
        />
      )}
    </Box>
  );
}
