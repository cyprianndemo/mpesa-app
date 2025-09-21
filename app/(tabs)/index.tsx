import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Eye, EyeOff, Send, Download, Receipt, Smartphone, Banknote } from 'lucide-react-native';
import { useAuth } from '../../providers/AuthProvider';
import { getBalance, getRecentTransactions } from '../../services/mpesaService';
import type { Transaction } from '../../services/mpesaService';
import { BalanceCard } from '../../components/BalanceCard';
import { QuickActionCard } from '../../components/QuickActionCard';
import { TransactionItem } from '../../components/TransactionItem';

export default function HomeScreen() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<string>('0.00');
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        getBalance(),
        getRecentTransactions(5)
      ]);
      
      setBalance(balanceData.balance);
      setRecentTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const quickActions = [
    {
      icon: Send,
      title: 'Send Money',
      subtitle: 'Transfer funds',
      color: '#00A86B',
      route: '/send'
    },
    {
      icon: Download,
      title: 'Withdraw',
      subtitle: 'Cash from agent',
      color: '#1E88E5',
      route: '/withdraw'
    },
    {
      icon: Receipt,
      title: 'Pay Bills',
      subtitle: 'Utility payments',
      color: '#FF6B35',
      route: '/bills'
    },
    {
      icon: Smartphone,
      title: 'Buy Airtime',
      subtitle: 'Top up credit',
      color: '#9C27B0',
      route: '/airtime'
    }
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'User'}</Text>
        <Text style={styles.phoneNumber}>{user?.phoneNumber}</Text>
      </View>

      <BalanceCard
        balance={balance}
        isVisible={isBalanceVisible}
        onToggleVisibility={() => setIsBalanceVisible(!isBalanceVisible)}
        loading={loading}
      />

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </View>
      </View>

      <View style={styles.recentTransactions}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction, index) => (
            <TransactionItem key={index} transaction={transaction} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Banknote size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No recent transactions</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#00A86B',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#E5F7F0',
    fontWeight: '500',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recentTransactions: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
});