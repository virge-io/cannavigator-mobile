import React, { useState, useMemo } from 'react';
import { FlatList, LayoutAnimation, Platform, UIManager } from 'react-native';
import {
  Box,
  Text,
  Heading,
  Divider,
  Pressable,
  HStack,
  VStack,
  Badge,
  BadgeText,
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { useQueries } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronUp,
  Moon,
  Brain,
  Sparkles,
  Leaf,
  Bandage,
  Flame,
  type LucideIcon,
} from 'lucide-react-native';
import { SearchBar } from '../../src/components/SearchBar';
import { DiseaseCard } from '../../src/components/DiseaseCard';
import { LigandCard } from '../../src/components/LigandCard';
import { LoadingState } from '../../src/components/LoadingState';
import { EffectChip } from '../../src/components/EffectChip';
import { useDiseases } from '../../src/hooks/useDiseases';
import { useLigands } from '../../src/hooks/useLigands';
import { useProducts } from '../../src/hooks/useProducts';
import { fetchDiseaseDetail } from '../../src/api/diseases';
import { DiseaseProfile, DiseaseLigandMention, DesiredEffect, PaperConclusion } from '../../src/types/disease';
import { topics } from '../../src/theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface QuickTopic {
  label: string;
  icon: LucideIcon;
  color: string;
  diseaseSlugs: string[];
  description: string;
  advice: string;
}

const QUICK_TOPICS: QuickTopic[] = [
  {
    label: 'Sleep',
    icon: Moon,
    color: topics.sleep,
    diseaseSlugs: ['insomnia_sleep'],
    description: 'Trouble falling or staying asleep',
    advice:
      'CBD and THC interact with CB1 and TRPV1 receptors involved in sleep regulation. CBD may reduce anxiety-related insomnia, while low-dose THC can shorten sleep onset. Myrcene and Linalool are terpenes with sedative properties.',
  },
  {
    label: 'Anxiety',
    icon: Brain,
    color: topics.anxiety,
    diseaseSlugs: ['anxiety', 'ptsd_stress'],
    description: 'Stress, worry, and anxious feelings',
    advice:
      'CBD is the most studied cannabinoid for anxiety, acting on 5-HT1a serotonin receptors. CBDA shows emerging anxiolytic potential. Linalool (lavender terpene) and Limonene may provide synergistic calming effects. THC at low doses can help but may worsen anxiety at higher doses.',
  },
  {
    label: 'Euphoria',
    icon: Sparkles,
    color: topics.euphoria,
    diseaseSlugs: ['depression'],
    description: 'Mood lift and positive feelings',
    advice:
      'THC activates CB1 receptors in the reward pathway, producing euphoric effects. CBG and CBC show antidepressant potential via 5-HT1a receptor modulation. Limonene (citrus terpene) is associated with mood elevation. Beta-Caryophyllene activates CB2 receptors and may reduce stress.',
  },
  {
    label: 'Relaxation',
    icon: Leaf,
    color: topics.relaxation,
    diseaseSlugs: ['fibromyalgia'],
    description: 'Physical and mental relaxation',
    advice:
      'THC and CBD work on CB1/CB2 receptors to relieve tension. Myrcene is the most common cannabis terpene with muscle-relaxant and sedative properties. Linalool adds anxiolytic support, helping the body unwind alongside the mind.',
  },
  {
    label: 'Pain',
    icon: Bandage,
    color: topics.pain,
    diseaseSlugs: ['pain_general', 'chronic_pain', 'neuropathic_pain'],
    description: 'Acute, chronic, or neuropathic pain',
    advice:
      'THC and CBD modulate pain through CB1, CB2, and TRPV1 receptors. CBD is non-intoxicating and has the strongest evidence for chronic and inflammatory pain. CBC and CBG show emerging activity in animal models. Beta-Caryophyllene activates CB2 receptors directly, providing peripheral analgesia without psychoactivity.',
  },
  {
    label: 'Inflammation',
    icon: Flame,
    color: topics.inflammation,
    diseaseSlugs: ['inflammation', 'inflammatory_pain'],
    description: 'Anti-inflammatory pathways',
    advice:
      'CB2 receptor activation is the primary anti-inflammatory pathway in cannabis pharmacology. CBD inhibits the FAAH enzyme, raising endocannabinoid tone. Beta-Caryophyllene is a selective CB2 agonist found in cannabis terpenes — strong anti-inflammatory effects without intoxication. CBG and THCV also show anti-inflammatory potential.',
  },
];

function prettifySlug(slug: string) {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function QuickTopicCard({
  topic,
  isSelected,
  onPress,
}: {
  topic: QuickTopic;
  isSelected: boolean;
  onPress: () => void;
}) {
  const ChevronIcon = isSelected ? ChevronUp : ChevronDown;
  const TopicIcon = topic.icon;
  return (
    <Pressable
      onPress={onPress}
      bg={isSelected ? topic.color : '$white'}
      p="$3"
      borderRadius="$xl"
      borderWidth={2}
      borderColor={isSelected ? topic.color : '$borderLight200'}
      sx={{
        ':active': { opacity: 0.85 },
        ...(isSelected
          ? {
              shadowColor: topic.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }
          : {
              shadowColor: '$black',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 1,
            }),
      }}
      flex={1}
      minWidth="$40"
    >
      <VStack alignItems="center" gap="$1">
        <Box
          bg={isSelected ? 'rgba(255,255,255,0.25)' : topic.color}
          w="$10"
          h="$10"
          borderRadius="$full"
          alignItems="center"
          justifyContent="center"
        >
          <TopicIcon size={22} color="#FFFFFF" strokeWidth={2.25} />
        </Box>
        <Text fontWeight="$bold" fontSize="$sm" color={isSelected ? '$white' : '$textDark900'}>
          {topic.label}
        </Text>
        <Text
          fontSize="$2xs"
          color={isSelected ? 'rgba(255,255,255,0.8)' : '$textLight500'}
          textAlign="center"
          numberOfLines={1}
        >
          {topic.description}
        </Text>
        <ChevronIcon size={14} color={isSelected ? '#FFFFFF' : topic.color} />
      </VStack>
    </Pressable>
  );
}

interface AggregatedLigand {
  ligand: DiseaseLigandMention['ligand'];
  paper_count: number;
  total_mentions: number;
}

interface AggregatedEffect {
  target: DesiredEffect['target'];
  desired_effect: string;
  confidence: number | null;
  evidence?: string | null;
}

function aggregateLigands(details: DiseaseProfile[]): AggregatedLigand[] {
  const map = new Map<string, AggregatedLigand>();
  details.forEach((d) => {
    d.ligands.forEach((dl) => {
      const existing = map.get(dl.ligand.slug);
      if (existing) {
        existing.paper_count += dl.paper_count;
        existing.total_mentions += dl.total_mentions;
      } else {
        map.set(dl.ligand.slug, {
          ligand: dl.ligand,
          paper_count: dl.paper_count,
          total_mentions: dl.total_mentions,
        });
      }
    });
  });
  return Array.from(map.values()).sort((a, b) => b.total_mentions - a.total_mentions);
}

function aggregateEffects(details: DiseaseProfile[]): AggregatedEffect[] {
  const map = new Map<string, AggregatedEffect>();
  details.forEach((d) => {
    d.desired_effects.forEach((de) => {
      const key = `${de.target.slug}::${de.desired_effect}`;
      const existing = map.get(key);
      const conf = de.confidence ?? 0;
      if (!existing || (existing.confidence ?? 0) < conf) {
        map.set(key, {
          target: de.target,
          desired_effect: de.desired_effect,
          confidence: de.confidence ?? null,
          evidence: de.evidence,
        });
      }
    });
  });
  return Array.from(map.values()).sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
}

function TopicDetailView({ topic }: { topic: QuickTopic }) {
  const router = useRouter();
  const TopicIcon = topic.icon;
  const detailQueries = useQueries({
    queries: topic.diseaseSlugs.map((slug) => ({
      queryKey: ['disease', slug],
      queryFn: () => fetchDiseaseDetail(slug),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const details = useMemo(
    () =>
      detailQueries
        .map((q) => q.data)
        .filter((d): d is DiseaseProfile => !!d),
    [detailQueries],
  );

  const { data: productsData } = useProducts();
  const products = useMemo(
    () => productsData?.pages.flatMap((p) => p.items) ?? [],
    [productsData],
  );

  const topLigands = useMemo(() => aggregateLigands(details).slice(0, 6), [details]);
  const topEffects = useMemo(() => aggregateEffects(details).slice(0, 5), [details]);
  const topConclusions = useMemo<PaperConclusion[]>(
    () =>
      details
        .flatMap((d) => d.conclusions)
        .sort((a, b) => (b.paper.year ?? 0) - (a.paper.year ?? 0))
        .slice(0, 3),
    [details],
  );
  const totalPapers = useMemo(
    () => details.reduce((sum, d) => sum + (d.paper_count ?? 0), 0),
    [details],
  );

  const intro =
    details.find((d) => d.tagline)?.tagline ??
    details.find((d) => d.short_description)?.short_description ??
    topic.advice;

  return (
    <Box px="$4" pb="$6">
      <Box
        borderRadius="$lg"
        overflow="hidden"
        borderWidth={1}
        borderColor="$borderLight200"
        borderTopWidth={4}
        borderTopColor={topic.color}
        mb="$3"
      >
        <Box bg={topic.color} px="$4" py="$3">
          <HStack alignItems="center" justifyContent="space-between" gap="$2">
            <HStack alignItems="center" gap="$2" flex={1}>
              <TopicIcon size={22} color="#FFFFFF" strokeWidth={2.25} />
              <Heading size="md" color="$white">
                {topic.label}
              </Heading>
            </HStack>
            <HStack alignItems="center" gap="$1" opacity={0.85}>
              <ChevronUp size={12} color="#FFFFFF" />
              <Text fontSize="$2xs" color="rgba(255,255,255,0.85)">
                Tap card to close
              </Text>
            </HStack>
          </HStack>
          <Text fontSize="$xs" color="rgba(255,255,255,0.8)" mt="$1">
            {topic.description}
          </Text>
        </Box>
        <Box bg="$white" px="$4" py="$3">
          <Text fontSize="$sm" color="$textDark600" lineHeight="$lg">
            {intro}
          </Text>
        </Box>
      </Box>

      {/* Stats row */}
      {totalPapers > 0 || topLigands.length > 0 || topEffects.length > 0 ? (
        <HStack gap="$2" mb="$3" flexWrap="wrap">
          {totalPapers > 0 ? (
            <Badge action="muted" size="sm" borderRadius="$full">
              <BadgeText>{totalPapers} papers</BadgeText>
            </Badge>
          ) : null}
          {topLigands.length > 0 ? (
            <Badge action="muted" size="sm" borderRadius="$full">
              <BadgeText>{topLigands.length} compounds</BadgeText>
            </Badge>
          ) : null}
          {topEffects.length > 0 ? (
            <Badge action="muted" size="sm" borderRadius="$full">
              <BadgeText>{topEffects.length} effects</BadgeText>
            </Badge>
          ) : null}
        </HStack>
      ) : null}

      {/* Key Compounds */}
      {topLigands.length > 0 ? (
        <Box
          bg="$white"
          p="$4"
          borderRadius="$lg"
          borderWidth={1}
          borderColor="$borderLight200"
          mb="$3"
        >
          <Heading size="sm" color="$textDark700" mb="$2">
            Key Compounds
          </Heading>
          {topLigands.map((al) => (
            <Pressable
              key={al.ligand.id}
              onPress={() => router.push(`/profiles/${al.ligand.slug}`)}
              py="$2"
              borderBottomWidth={1}
              borderBottomColor="$borderLight100"
            >
              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1}>
                  <Text fontWeight="$medium" fontSize="$sm" color="$primary700">
                    {al.ligand.display_name}
                  </Text>
                  {al.ligand.chemical_family ? (
                    <Text fontSize="$2xs" color="$textLight500">
                      {al.ligand.chemical_family}
                    </Text>
                  ) : null}
                </VStack>
                <Badge size="sm" action="info" borderRadius="$full">
                  <BadgeText fontSize="$2xs">{al.paper_count} papers</BadgeText>
                </Badge>
              </HStack>
            </Pressable>
          ))}
        </Box>
      ) : null}

      {/* Active receptor effects */}
      {topEffects.length > 0 ? (
        <Box
          bg="$white"
          p="$4"
          borderRadius="$lg"
          borderWidth={1}
          borderColor="$borderLight200"
          mb="$3"
        >
          <Heading size="sm" color="$textDark700" mb="$2">
            Active Receptor Effects
          </Heading>
          {topEffects.map((ae) => (
            <Box
              key={`${ae.target.slug}-${ae.desired_effect}`}
              py="$2"
              borderBottomWidth={1}
              borderBottomColor="$borderLight100"
            >
              <HStack alignItems="center" gap="$2" flexWrap="wrap">
                <Text fontSize="$sm" fontWeight="$medium" color="$textDark800">
                  {ae.target.display_name}
                </Text>
                <EffectChip effect={ae.desired_effect} confidence={ae.confidence} />
              </HStack>
            </Box>
          ))}
        </Box>
      ) : null}

      {/* Top evidence */}
      {topConclusions.length > 0 ? (
        <Box
          bg="$white"
          p="$4"
          borderRadius="$lg"
          borderWidth={1}
          borderColor="$borderLight200"
          mb="$3"
        >
          <Heading size="sm" color="$textDark700" mb="$2">
            Top Evidence
          </Heading>
          {topConclusions.map((c, idx) => (
            <Box
              key={`${c.paper.id}-${idx}`}
              py="$2"
              borderBottomWidth={1}
              borderBottomColor="$borderLight100"
            >
              <Text fontSize="$sm" color="$textDark700" fontStyle="italic" lineHeight="$lg">
                “{c.evidence_sentence}”
              </Text>
              <Text fontSize="$2xs" color="$textLight500" mt="$1">
                {[c.paper.journal, c.paper.year].filter(Boolean).join(' · ')}
              </Text>
            </Box>
          ))}
        </Box>
      ) : null}

      {/* Suggested strains */}
      <Box
        bg="$white"
        p="$4"
        borderRadius="$lg"
        borderWidth={1}
        borderColor="$borderLight200"
        mb="$3"
      >
        <Heading size="sm" color="$textDark700" mb="$2">
          Suggested Strains
        </Heading>
        {products.length === 0 ? (
          <VStack gap="$1">
            <Text fontSize="$sm" color="$textDark600" lineHeight="$lg">
              Strain recommendations are being curated.
            </Text>
            <Text fontSize="$2xs" color="$textLight500">
              Once cultivars are linked to receptors and conditions in our database, we&apos;ll
              surface the strains best matched to {topic.label.toLowerCase()} here.
            </Text>
          </VStack>
        ) : (
          products.slice(0, 5).map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push(`/profiles/${p.slug}`)}
              py="$2"
              borderBottomWidth={1}
              borderBottomColor="$borderLight100"
            >
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="$medium" fontSize="$sm" color="$primary700">
                  {p.display_name}
                </Text>
                {p.route ? (
                  <Badge size="sm" action="muted" borderRadius="$full">
                    <BadgeText fontSize="$2xs">{p.route}</BadgeText>
                  </Badge>
                ) : null}
              </HStack>
            </Pressable>
          ))
        )}
      </Box>

      {/* Related conditions */}
      <Box bg="$white" p="$4" borderRadius="$lg" borderWidth={1} borderColor="$borderLight200">
        <Heading size="sm" color="$textDark700" mb="$2">
          Related Conditions
        </Heading>
        {topic.diseaseSlugs.map((slug) => {
          const detail = details.find((d) => d.slug === slug);
          const name = detail?.display_name ?? prettifySlug(slug);
          return (
            <Pressable
              key={slug}
              onPress={() => router.push(`/diseases/${slug}`)}
              py="$2"
              borderBottomWidth={1}
              borderBottomColor="$borderLight100"
            >
              <Text fontSize="$sm" color="$primary700" fontWeight="$medium">
                {name}
              </Text>
              <Text fontSize="$2xs" color="$textLight500">
                Tap for full pharmacology details
              </Text>
            </Pressable>
          );
        })}
      </Box>
    </Box>
  );
}

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<QuickTopic | null>(null);
  const router = useRouter();

  const { data: diseasesData, isLoading: diseasesLoading } = useDiseases(query || undefined);
  const { data: ligandsData, isLoading: profilesLoading } = useLigands();

  const allDiseases = useMemo(
    () => diseasesData?.pages.flatMap((p) => p.items) ?? [],
    [diseasesData],
  );
  const allLigands = useMemo(
    () => ligandsData?.pages.flatMap((p) => p.items) ?? [],
    [ligandsData],
  );

  const filteredProfiles = useMemo(() => {
    if (!query) return allLigands.slice(0, 10);
    const q = query.toLowerCase();
    return allLigands.filter(
      (l) =>
        l.display_name.toLowerCase().includes(q) ||
        l.slug.toLowerCase().includes(q) ||
        (l.synonyms ?? []).some((s) => s.toLowerCase().includes(q)),
    );
  }, [allLigands, query]);

  const isLoading = diseasesLoading || profilesLoading;
  const hasQuery = query.length > 0;
  const displayDiseases = hasQuery ? allDiseases.slice(0, 10) : allDiseases.slice(0, 5);

  const handleTopicPress = (topic: QuickTopic) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selectedTopic?.label === topic.label) {
      setSelectedTopic(null);
    } else {
      setSelectedTopic(topic);
      setQuery('');
    }
  };

  return (
    <Box flex={1} bg="$backgroundLight50">
      <Box p="$4" pb="$2">
        <SearchBar
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            if (t.length > 0) setSelectedTopic(null);
          }}
          placeholder="Search diseases or profiles..."
        />
      </Box>

      {isLoading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={[1]}
          renderItem={() => (
            <Box>
              {/* Quick Topics */}
              {!hasQuery ? (
                <Box px="$4" mb="$3">
                  <Heading size="sm" color="$textDark700" mb="$2">
                    Quick Lookup
                  </Heading>
                  <HStack gap="$2" flexWrap="wrap">
                    {QUICK_TOPICS.map((topic) => (
                      <QuickTopicCard
                        key={topic.label}
                        topic={topic}
                        isSelected={selectedTopic?.label === topic.label}
                        onPress={() => handleTopicPress(topic)}
                      />
                    ))}
                  </HStack>
                </Box>
              ) : null}

              {/* Selected topic detail */}
              {selectedTopic && !hasQuery ? <TopicDetailView topic={selectedTopic} /> : null}

              {/* Search results or default lists */}
              {!selectedTopic || hasQuery ? (
                <Box px="$4" pb="$8">
                  <Heading size="sm" color="$textDark700" mb="$2">
                    {hasQuery ? 'Disease Results' : 'Diseases'}
                  </Heading>
                  {displayDiseases.length === 0 ? (
                    <Text color="$textLight400" fontSize="$sm">
                      No diseases found
                    </Text>
                  ) : (
                    displayDiseases.map((d) => (
                      <DiseaseCard
                        key={d.id}
                        disease={d}
                        onPress={() => router.push(`/diseases/${d.slug}`)}
                      />
                    ))
                  )}

                  <Divider my="$4" />

                  <Heading size="sm" color="$textDark700" mb="$2">
                    {hasQuery ? 'Profile Results' : 'Cannabis Profiles'}
                  </Heading>
                  {filteredProfiles.length === 0 ? (
                    <Text color="$textLight400" fontSize="$sm">
                      No profiles found
                    </Text>
                  ) : (
                    filteredProfiles
                      .slice(0, 10)
                      .map((l) => (
                        <LigandCard
                          key={l.slug}
                          ligand={l}
                          onPress={() => router.push(`/profiles/${l.slug}`)}
                        />
                      ))
                  )}
                </Box>
              ) : null}
            </Box>
          )}
          keyExtractor={() => 'content'}
        />
      )}
    </Box>
  );
}
