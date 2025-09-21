import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Download } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { generateQRSession } from '../../services/qrService';

export default function ReceiveScreen() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [qrData, setQrData] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    generateQR();
  }, [amount]);

  const generateQR = async () => {
    try {
      const session = await generateQRSession({
        phoneNumber: user?.phoneNumber || '',
        amount: amount ? parseFloat(amount) : undefined,
        type: 'receive'
      });

      const qrPayload = {
        sessionId: session.id,
        phoneNumber: user?.phoneNumber,
        amount: amount ? parseFloat(amount) : undefined,
        timestamp: Date.now(),
        type: 'receive'
      };

      setQrData(JSON.stringify(qrPayload));
      setSessionId(session.id);
    } catch (error) {
      console.error('Failed to generate QR:', error);
    }
  };

  const shareQR = async () => {
    try {
      await Share.share({
        message: `Send money to ${user?.phoneNumber} using this QR code or session ID: ${sessionId}`,
        title: 'Receive Money - M-Pesa QR'
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Receive Money</Text>
        <Text style={styles.subtitle}>Generate QR code for payments</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.amountContainer}>
          <Text style={styles.label}>Amount (Optional)</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <Text style={styles.currency}>KSH</Text>
        </View>

        <View style={styles.qrContainer}>
          {qrData ? (
            <QRCode
              value={qrData}
              size={200}
              backgroundColor="white"
              color="#00A86B"
            />
          ) : (
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrPlaceholderText}>Generating QR...</Text>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>How to use:</Text>
          <Text style={styles.infoText}>
            1. Share this QR code with the sender{'\n'}
            2. They scan it using the app{'\n'}
            3. Confirm transaction details{'\n'}
            4. Receive instant payment
          </Text>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={shareQR}>
          <Download size={20} color="white" />
          <Text style={styles.shareButtonText}>Share QR Code</Text>
        </TouchableOpacity>

        <View style={styles.sessionInfo}>
          <Text style={styles.sessionText}>Session ID: {sessionId}</Text>
          <Text style={styles.phoneText}>Phone: {user?.phoneNumber}</Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  amountContainer: {
    width: '100%',
    marginBottom: 30,
    position: 'relative',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    paddingRight: 60,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlign: 'center',
  },
  currency: {
    position: 'absolute',
    right: 16,
    top: 45,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 16,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholderText: {
    color: '#6B7280',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  shareButton: {
    backgroundColor: '#00A86B',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionInfo: {
    alignItems: 'center',
  },
  sessionText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});