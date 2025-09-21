import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, RefreshCw } from 'lucide-react-native';

interface BalanceCardProps {
  balance: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
  loading?: boolean;
}

export function BalanceCard({ 
  balance, 
  isVisible, 
  onToggleVisibility, 
  loading = false 
}: BalanceCardProps) {
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>M-Pesa Balance</Text>
        <TouchableOpacity onPress={onToggleVisibility} style={styles.visibilityButton}>
          {isVisible ? (
            <EyeOff size={20} color="#6B7280" />
          ) : (
            <Eye size={20} color="#6B7280" />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.balanceAmount}>
        <Text style={styles.currency}>KSH</Text>
        <Text style={styles.amount}>
          {loading ? (
            <RefreshCw size={24} color="#1F2937" />
          ) : isVisible ? (
            balance
          ) : (
            '••••••'
          )}
        </Text>
      </View>
      
      <Text style={styles.balanceNote}>
        Last updated: {new Date().toLocaleTimeString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: -30,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  visibilityButton: {
    padding: 4,
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currency: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
    marginRight: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
  },
  balanceNote: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});