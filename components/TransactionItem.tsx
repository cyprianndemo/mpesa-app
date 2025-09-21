import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, Receipt, Smartphone, Banknote } from 'lucide-react-native';

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'bills' | 'airtime' | 'withdraw';
  amount: number;
  phoneNumber?: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionItemProps {
  transaction: Transaction;
  showDate?: boolean;
}

export function TransactionItem({ transaction, showDate = false }: TransactionItemProps) {
  const getIcon = () => {
    switch (transaction.type) {
      case 'sent':
        return <ArrowUpRight size={20} color="#EF4444" />;
      case 'received':
        return <ArrowDownLeft size={20} color="#00A86B" />;
      case 'bills':
        return <Receipt size={20} color="#1E88E5" />;
      case 'airtime':
        return <Smartphone size={20} color="#9C27B0" />;
      default:
        return <Banknote size={20} color="#6B7280" />;
    }
  };

  const getAmountColor = () => {
    if (transaction.status === 'failed') return '#EF4444';
    return transaction.type === 'received' ? '#00A86B' : '#1F2937';
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return '#00A86B';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      
      <View style={styles.details}>
        <Text style={styles.description}>{transaction.description}</Text>
        {transaction.phoneNumber && (
          <Text style={styles.phoneNumber}>{transaction.phoneNumber}</Text>
        )}
        {showDate && (
          <Text style={styles.timestamp}>
            {new Date(transaction.timestamp).toLocaleDateString()}
          </Text>
        )}
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
        </Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: getAmountColor() }]}>
          {transaction.type === 'received' ? '+' : '-'}KSH {transaction.amount.toFixed(2)}
        </Text>
        {!showDate && (
          <Text style={styles.time}>
            {new Date(transaction.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 20,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});