import React from 'react';
import { Tabs } from 'expo-router';
import { Search, Stethoscope, FlaskConical, Grid3X3, Settings } from 'lucide-react-native';
import { brand } from '../../src/theme/colors';
import { AppHeader } from '../../src/components/AppHeader';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: brand.lightSage,
        tabBarInactiveTintColor: brand.whiteSubtle,
        tabBarStyle: { backgroundColor: brand.darkGreen, borderTopColor: 'rgba(255,255,255,0.1)' },
        // Custom header — see src/components/AppHeader.tsx. The default
        // react-navigation header was applying a margin to its left
        // container that we couldn't override cleanly via
        // headerLeftContainerStyle on web.
        header: ({ options }) => <AppHeader title={options.title} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="diseases"
        options={{
          title: 'Diseases',
          tabBarIcon: ({ color, size }) => <Stethoscope color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profiles"
        options={{
          title: 'Profiles',
          tabBarIcon: ({ color, size }) => <FlaskConical color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="matrix"
        options={{
          title: 'Matrix',
          tabBarIcon: ({ color, size }) => <Grid3X3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
