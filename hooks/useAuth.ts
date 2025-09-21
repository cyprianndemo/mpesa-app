import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  phoneNumber: string;
  name: string;
  email?: string;
}

// Note: The AuthContext and useAuth hook are defined in providers/AuthProvider.
// This file is responsible only for the stateful implementation used by the provider.

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      // Simulate API call for authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      if (response.ok) {
        const userData = await response.json();
        await SecureStore.setItemAsync('user', JSON.stringify(userData.user));
        await SecureStore.setItemAsync('token', userData.token);
        setUser(userData.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('token');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };
}