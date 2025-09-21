import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function AmountInput({ value, onChangeText, placeholder = '0.00' }: AmountInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Amount</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.currency}>KSH</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  currency: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    padding: 16,
    color: '#1F2937',
  },
});