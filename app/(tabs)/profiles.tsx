import React, { useState, useMemo } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import { Box, Text, HStack, Button, ButtonText } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { SearchBar } from '../../src/components/SearchBar';
import { LigandCard } from '../../src/components/LigandCard';
import { LoadingState } from '../../src/components/LoadingState';
import { ErrorState } from '../../src/components/ErrorState';
import { useLigands } from '../../src/hooks/useLigands';

const TYPE_FILTERS = ['All', 'Phytocannabinoid', 'Terpene'] as const;

export default function ProfilesScreen() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const router = useRouter();
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLigands();

  const allLigands = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const filtered = useMemo(() => {
    return allLigands.filter((l) => {
      if (typeFilter !== 'All' && !l.type.toLowerCase().includes(typeFilter.toLowerCase()))
        return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          l.display_name.toLowerCase().includes(q) ||
          l.slug.toLowerCase().includes(q) ||
          (l.synonyms ?? []).some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allLigands, query, typeFilter]);

  return (
    <Box flex={1} bg="$backgroundLight50">
      <Box p="$4" pb="$2">
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search profiles..." />
        <HStack gap="$2" mt="$2">
          {TYPE_FILTERS.map((t) => (
            <Button
              key={t}
              size="xs"
              variant={typeFilter === t ? 'solid' : 'outline'}
              action={typeFilter === t ? 'primary' : 'secondary'}
              onPress={() => setTypeFilter(t)}
              borderRadius="$full"
            >
              <ButtonText>{t}</ButtonText>
            </Button>
          ))}
        </HStack>
      </Box>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message="Failed to load profiles" onRetry={refetch} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <LigandCard ligand={item} onPress={() => router.push(`/profiles/${item.slug}`)} />
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
              No profiles found
            </Text>
          }
        />
      )}
    </Box>
  );
}
