import * as SecureStore from 'expo-secure-store';

interface QRSessionRequest {
  phoneNumber: string;
  amount?: number;
  type: 'send' | 'receive';
}

interface QRSession {
  id: string;
  phoneNumber: string;
  amount?: number;
  type: 'send' | 'receive';
  timestamp: number;
  expiresAt: number;
}

const API_BASE_URL = 'http://localhost:3000/api';

async function getAuthHeaders() {
  const token = await SecureStore.getItemAsync('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function generateQRSession(request: QRSessionRequest): Promise<QRSession> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/qr/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate QR session');
    }
    
    return await response.json();
  } catch (error) {
    console.error('QR generation error:', error);
    // Return mock session for development
    return {
      id: Math.random().toString(36).substr(2, 9),
      phoneNumber: request.phoneNumber,
      amount: request.amount,
      type: request.type,
      timestamp: Date.now(),
      expiresAt: Date.now() + 300000, // 5 minutes
    };
  }
}

export async function validateQRSession(sessionId: string): Promise<{ valid: boolean; session?: QRSession }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/qr/validate/${sessionId}`, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to validate QR session');
    }
    
    return await response.json();
  } catch (error) {
    console.error('QR validation error:', error);
    return { valid: false };
  }
}