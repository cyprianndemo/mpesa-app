import * as SecureStore from 'expo-secure-store';

interface SendMoneyRequest {
  phoneNumber: string;
  amount: number;
}

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'bills' | 'airtime' | 'withdraw';
  amount: number;
  phoneNumber?: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

const API_BASE_URL = 'http://localhost:3000/api';

async function getAuthHeaders() {
  const token = await SecureStore.getItemAsync('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function getBalance(): Promise<{ balance: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/mpesa/balance`, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to fetch balance');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Balance fetch error:', error);
    // Return mock data for development
    return { balance: '1,234.56' };
  }
}

export async function sendMoney(request: SendMoneyRequest): Promise<{ success: boolean; message: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/mpesa/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Send money error:', error);
    // Return mock success for development
    return { success: true, message: 'Transaction initiated successfully' };
  }
}

export async function getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/mpesa/transactions/recent?limit=${limit}`, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Recent transactions error:', error);
    // Return mock data for development
    return [
      {
        id: '1',
        type: 'sent',
        amount: 500.00,
        phoneNumber: '0712345678',
        description: 'Money sent to John Doe',
        timestamp: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: '2',
        type: 'received',
        amount: 1000.00,
        phoneNumber: '0723456789',
        description: 'Money received from Jane Smith',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'completed'
      }
    ];
  }
}

export async function getTransactionHistory(): Promise<Transaction[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/mpesa/transactions`, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to fetch transaction history');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Transaction history error:', error);
    // Return mock data for development
    return [
      {
        id: '1',
        type: 'sent',
        amount: 500.00,
        phoneNumber: '0712345678',
        description: 'Money sent to John Doe',
        timestamp: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: '2',
        type: 'received',
        amount: 1000.00,
        phoneNumber: '0723456789',
        description: 'Money received from Jane Smith',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'completed'
      },
      {
        id: '3',
        type: 'bills',
        amount: 2500.00,
        description: 'KPLC - Electricity Bill',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed'
      },
      {
        id: '4',
        type: 'airtime',
        amount: 100.00,
        phoneNumber: '0712345678',
        description: 'Airtime purchase',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: 'completed'
      }
    ];
  }
}