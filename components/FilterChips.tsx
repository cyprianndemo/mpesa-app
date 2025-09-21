import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';

interface Filter {
  key: string;
  label: string;
}

interface FilterChipsProps {
  filters: Filter[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterChips({ filters, activeFilter, onFilterChange }: FilterChipsProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.chip,
              activeFilter === filter.key && styles.activeChip
            ]}
            onPress={() => onFilterChange(filter.key)}
          >
            <Text style={[
              styles.chipText,
              activeFilter === filter.key && styles.activeChipText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeChip: {
    backgroundColor: '#00A86B',
    borderColor: '#00A86B',
  },
  chipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeChipText: {
    color: 'white',
  },
});