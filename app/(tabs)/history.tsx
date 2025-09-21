import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Filter } from 'lucide-react-native';
import { getTransactionHistory } from '@/services/mpesaService';
import { TransactionItem } from '@/components/TransactionItem';
import { FilterChips } from '@/components/FilterChips';

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'sent', label: 'Sent' },
    { key: 'received', label: 'Received' },
    { key: 'bills', label: 'Bills' },
    { key: 'airtime', label: 'Airtime' }
  ];

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactionHistory();
      setTransactions(data);
      applyFilter(data, activeFilter);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (data: any[], filter: string) => {
    let filtered = data;
    
    if (filter !== 'all') {
      filtered = data.filter(transaction => 
        transaction.type.toLowerCase() === filter
      );
    }
    
    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    applyFilter(transactions, filter);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.subtitle}>Your M-Pesa activity</Text>
      </View>

      <FilterChips
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      <ScrollView
        style={styles.transactionsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction, index) => (
            <TransactionItem key={index} transaction={transaction} showDate />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Filter size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>
              {activeFilter === 'all' 
                ? 'Start sending or receiving money to see your history'
                : `No ${activeFilter} transactions yet`
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5F7F0',
  },
  transactionsList: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 20,
  },
});