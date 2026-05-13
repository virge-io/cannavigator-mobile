import React, { useMemo, useState } from 'react';
import { Linking, ScrollView } from 'react-native';
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  Badge,
  BadgeText,
} from '@gluestack-ui/themed';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useDiseaseDetail } from '../../src/hooks/useDiseases';
import { TargetBadge } from '../../src/components/TargetBadge';
import { EffectChip } from '../../src/components/EffectChip';
import { LoadingState } from '../../src/components/LoadingState';
import { ErrorState } from '../../src/components/ErrorState';
import { brand, colors } from '../../src/theme/colors';
import { PaperRef } from '../../src/types/disease';

function getPaperUrl(paper: PaperRef): string | null {
  if (paper.doi) return `https://doi.org/${paper.doi}`;
  if (paper.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`;
  return null;
}

function prettyEnum(v: string | null | undefined): string | null {
  if (!v) return null;
  if (v === 'rct') return 'RCT';
  return v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const PAPER_PAGE_SIZE = 10;

export default function DiseaseDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { data: disease, isLoading, isError, refetch } = useDiseaseDetail(slug);
  const [paperLimit, setPaperLimit] = useState(PAPER_PAGE_SIZE);

  const uniquePapers = useMemo<PaperRef[]>(() => {
    if (!disease) return [];
    const map = new Map<string, PaperRef>();
    disease.conclusions.forEach((c) => map.set(c.paper.id, c.paper));
    disease.ligands.forEach((l) => l.papers.forEach((p) => map.set(p.id, p)));
    disease.targets.forEach((t) => t.papers.forEach((p) => map.set(p.id, p)));
    return Array.from(map.values()).sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  }, [disease]);

  if (isLoading) return <LoadingState />;
  if (isError || !disease) return <ErrorState message="Failed to load disease" onRetry={refetch} />;

  const synonyms = disease.synonyms ?? [];
  const hasContent =
    disease.targets.length > 0 ||
    disease.ligands.length > 0 ||
    disease.desired_effects.length > 0 ||
    uniquePapers.length > 0 ||
    !!disease.literature_text;

  const visiblePapers = uniquePapers.slice(0, paperLimit);
  const hiddenPaperCount = uniquePapers.length - visiblePapers.length;

  return (
    <>
      <Stack.Screen options={{ title: disease.display_name }} />
      <Box flex={1} bg={colors.cream}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <VStack gap="$4">
            {/* Header */}
            <Box>
              <Heading size="xl" color="$textDark900">
                {disease.display_name}
              </Heading>

              {(disease.primary_cluster || disease.secondary_cluster || disease.paper_count > 0) ? (
                <HStack gap="$1" mt="$2" flexWrap="wrap">
                  {disease.primary_cluster ? (
                    <Badge action="success" size="sm" borderRadius="$full">
                      <BadgeText>{disease.primary_cluster}</BadgeText>
                    </Badge>
                  ) : null}
                  {disease.secondary_cluster ? (
                    <Badge action="info" size="sm" borderRadius="$full">
                      <BadgeText>{disease.secondary_cluster}</BadgeText>
                    </Badge>
                  ) : null}
                  {disease.paper_count > 0 ? (
                    <Badge action="muted" size="sm" borderRadius="$full">
                      <BadgeText>{disease.paper_count} papers</BadgeText>
                    </Badge>
                  ) : null}
                </HStack>
              ) : null}

              {disease.tagline ? (
                <Text fontSize="$sm" color={brand.darkGreen} mt="$2" fontWeight="$medium">
                  {disease.tagline}
                </Text>
              ) : null}
              {disease.short_description ? (
                <Text fontSize="$sm" color="$textDark600" mt="$2" lineHeight="$lg">
                  {disease.short_description}
                </Text>
              ) : null}
              {synonyms.length > 0 ? (
                <Box mt="$3">
                  <Text fontSize="$2xs" color="$textLight400" mb="$1">
                    Also known as
                  </Text>
                  <Text fontSize="$xs" color="$textLight500">
                    {synonyms.join(' · ')}
                  </Text>
                </Box>
              ) : null}
              {disease.source_url ? (
                <Text fontSize="$xs" color={brand.sage} mt="$2">
                  {disease.source_url}
                </Text>
              ) : null}
            </Box>

            {/* Targets */}
            {disease.targets.length > 0 ? (
              <Box
                bg="$white"
                p="$4"
                borderRadius="$lg"
                borderWidth={1}
                borderColor="$borderLight200"
              >
                <Heading size="sm" color="$textDark700" mb="$3">
                  Targets ({disease.targets.length})
                </Heading>
                {disease.targets
                  .slice()
                  .sort((a, b) => b.total_mentions - a.total_mentions)
                  .map((dt) => (
                    <HStack
                      key={dt.target.id}
                      justifyContent="space-between"
                      alignItems="center"
                      py="$2"
                      borderBottomWidth={1}
                      borderBottomColor="$borderLight100"
                    >
                      <HStack alignItems="center" gap="$2" flex={1}>
                        <TargetBadge name={dt.target.display_name} type={dt.target.type} />
                      </HStack>
                      <Text fontSize="$xs" color="$textLight400">
                        {dt.paper_count} paper{dt.paper_count === 1 ? '' : 's'}
                      </Text>
                    </HStack>
                  ))}
              </Box>
            ) : null}

            {/* Ligands */}
            {disease.ligands.length > 0 ? (
              <Box
                bg="$white"
                p="$4"
                borderRadius="$lg"
                borderWidth={1}
                borderColor="$borderLight200"
              >
                <Heading size="sm" color="$textDark700" mb="$3">
                  Cannabis Compounds ({disease.ligands.length})
                </Heading>
                {disease.ligands
                  .slice()
                  .sort((a, b) => b.total_mentions - a.total_mentions)
                  .map((dl) => (
                    <Pressable
                      key={dl.ligand.id}
                      onPress={() => router.push(`/profiles/${dl.ligand.slug}`)}
                      py="$2"
                      borderBottomWidth={1}
                      borderBottomColor="$borderLight100"
                    >
                      <HStack justifyContent="space-between" alignItems="center">
                        <VStack flex={1}>
                          <Text fontWeight="$medium" color={brand.sage} fontSize="$sm">
                            {dl.ligand.display_name}
                          </Text>
                          {dl.ligand.chemical_family ? (
                            <Text fontSize="$2xs" color="$textLight500">
                              {dl.ligand.chemical_family}
                            </Text>
                          ) : null}
                        </VStack>
                        <Text fontSize="$xs" color="$textLight400">
                          {dl.paper_count} paper{dl.paper_count === 1 ? '' : 's'}
                        </Text>
                      </HStack>
                    </Pressable>
                  ))}
              </Box>
            ) : null}

            {/* Desired Effects */}
            {disease.desired_effects.length > 0 ? (
              <Box
                bg="$white"
                p="$4"
                borderRadius="$lg"
                borderWidth={1}
                borderColor="$borderLight200"
              >
                <Heading size="sm" color="$textDark700" mb="$3">
                  Desired Effects ({disease.desired_effects.length})
                </Heading>
                {disease.desired_effects.map((de) => (
                  <Box
                    key={`${de.target.id}-${de.desired_effect}`}
                    py="$2"
                    borderBottomWidth={1}
                    borderBottomColor="$borderLight100"
                  >
                    <HStack alignItems="center" gap="$2" flexWrap="wrap">
                      <Text fontSize="$sm" fontWeight="$medium" color="$textDark800">
                        {de.target.display_name}
                      </Text>
                      <EffectChip effect={de.desired_effect} confidence={de.confidence} />
                      {de.is_override ? (
                        <Text fontSize="$2xs" color="$warning600" fontWeight="$bold">
                          OVERRIDE
                        </Text>
                      ) : null}
                    </HStack>
                    {de.evidence ? (
                      <Text fontSize="$xs" color="$textLight500" mt="$1" numberOfLines={3}>
                        {de.evidence}
                      </Text>
                    ) : null}
                  </Box>
                ))}
              </Box>
            ) : null}

            {/* Evidence Papers */}
            {uniquePapers.length > 0 ? (
              <Box
                bg="$white"
                p="$4"
                borderRadius="$lg"
                borderWidth={1}
                borderColor="$borderLight200"
              >
                <HStack alignItems="baseline" justifyContent="space-between" mb="$3">
                  <Heading size="sm" color="$textDark700">
                    Evidence Papers
                  </Heading>
                  <Text fontSize="$2xs" color="$textLight500">
                    {disease.paper_count} mention this condition
                  </Text>
                </HStack>
                {visiblePapers.map((p) => {
                  const url = getPaperUrl(p);
                  const pubType = prettyEnum(p.publication_type);
                  const evidence = prettyEnum(p.evidence_level);
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => {
                        if (url) Linking.openURL(url);
                      }}
                      disabled={!url}
                      py="$2"
                      borderBottomWidth={1}
                      borderBottomColor="$borderLight100"
                    >
                      <Text
                        fontSize="$sm"
                        fontWeight="$medium"
                        color={url ? '$primary700' : '$textDark700'}
                        numberOfLines={2}
                      >
                        {p.title}
                      </Text>
                      {p.journal || p.year ? (
                        <Text fontSize="$2xs" color="$textLight500" mt="$1">
                          {[p.journal, p.year].filter(Boolean).join(' · ')}
                        </Text>
                      ) : null}
                      {pubType || evidence ? (
                        <HStack gap="$1" mt="$1" flexWrap="wrap">
                          {pubType ? (
                            <Badge action="muted" size="sm" borderRadius="$full">
                              <BadgeText fontSize="$2xs">{pubType}</BadgeText>
                            </Badge>
                          ) : null}
                          {evidence ? (
                            <Badge
                              action={evidence === 'RCT' ? 'success' : 'info'}
                              size="sm"
                              borderRadius="$full"
                            >
                              <BadgeText fontSize="$2xs">{evidence}</BadgeText>
                            </Badge>
                          ) : null}
                        </HStack>
                      ) : null}
                    </Pressable>
                  );
                })}
                {hiddenPaperCount > 0 ? (
                  <Pressable
                    onPress={() => setPaperLimit((l) => l + PAPER_PAGE_SIZE)}
                    py="$3"
                    alignItems="center"
                  >
                    <Text fontSize="$sm" color="$primary600" fontWeight="$medium">
                      Show {Math.min(PAPER_PAGE_SIZE, hiddenPaperCount)} more
                    </Text>
                  </Pressable>
                ) : null}
              </Box>
            ) : null}

            {/* Literature */}
            {disease.literature_text ? (
              <Box
                bg="$white"
                p="$4"
                borderRadius="$lg"
                borderWidth={1}
                borderColor="$borderLight200"
              >
                <Heading size="sm" color="$textDark700" mb="$3">
                  Literature
                </Heading>
                <Text fontSize="$sm" color="$textDark600" lineHeight="$lg">
                  {disease.literature_text}
                </Text>
              </Box>
            ) : null}

            {/* Empty state — when no pharmacology data has been compiled yet */}
            {!hasContent ? (
              <Box
                bg="$white"
                p="$5"
                borderRadius="$lg"
                borderWidth={1}
                borderColor="$borderLight200"
                alignItems="center"
              >
                <Text fontSize="$2xl" mb="$2">
                  📚
                </Text>
                <Heading size="sm" color="$textDark700" mb="$1" textAlign="center">
                  No pharmacology data yet
                </Heading>
                <Text fontSize="$sm" color="$textLight500" textAlign="center" lineHeight="$lg">
                  Targets, cannabis compounds, and desired effects for this condition haven&apos;t
                  been compiled in the database yet. Check back later as the literature corpus
                  grows.
                </Text>
              </Box>
            ) : null}
          </VStack>
        </ScrollView>
      </Box>
    </>
  );
}
