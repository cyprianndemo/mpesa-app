import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Camera, Users, Scan } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { QRScanner } from '../../components/QRScanner';
import { ContactPicker } from '../../components/ContactPicker';
import { AmountInput } from '../../components/AmountInput';
import { sendMoney } from '../../services/mpesaService';

export default function SendScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'phone' | 'qr' | 'contacts'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendMoney = async () => {
    if (!phoneNumber || !amount) {
      Alert.alert('Error', 'Please enter phone number and amount');
      return;
    }

    if (parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const result = await sendMoney({
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        amount: parseFloat(amount)
      });

      if (result.success) {
        Alert.alert(
          'Transaction Initiated',
          'Please complete the payment on your phone',
          [
            {
              text: 'OK',
              onPress: () => {
                setPhoneNumber('');
                setAmount('');
                router.push('/history');
              }
            }
          ]
        );
      } else {
        Alert.alert('Transaction Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      if (qrData.phoneNumber) {
        setPhoneNumber(qrData.phoneNumber);
        setAmount(qrData.amount || '');
        setShowQRScanner(false);
        setActiveTab('phone');
      }
    } catch (error) {
      Alert.alert('Invalid QR Code', 'Please scan a valid payment QR code');
    }
  };

  if (showQRScanner) {
    return (
      <QRScanner
        onScan={handleQRScan}
        onClose={() => setShowQRScanner(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Send Money</Text>
        <Text style={styles.subtitle}>Transfer funds to M-Pesa users</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'phone' && styles.activeTab]}
          onPress={() => setActiveTab('phone')}
        >
          <Text style={[styles.tabText, activeTab === 'phone' && styles.activeTabText]}>
            Phone Number
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'qr' && styles.activeTab]}
          onPress={() => {
            setActiveTab('qr');
            setShowQRScanner(true);
          }}
        >
          <Scan size={20} color={activeTab === 'qr' ? '#00A86B' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'qr' && styles.activeTabText]}>
            Scan QR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
          onPress={() => setActiveTab('contacts')}
        >
          <Users size={20} color={activeTab === 'contacts' ? '#00A86B' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'contacts' && styles.activeTabText]}>
            Contacts
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {activeTab === 'phone' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="0712345678"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={12}
              />
            </View>

            <AmountInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
            />

            <TouchableOpacity
              style={[styles.sendButton, loading && styles.disabledButton]}
              onPress={handleSendMoney}
              disabled={loading}
            >
              <Text style={styles.sendButtonText}>
                {loading ? 'Processing...' : 'Send Money'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'contacts' && (
          <ContactPicker
            onSelectContact={(contact) => {
              setPhoneNumber(contact.phoneNumber);
              setActiveTab('phone');
            }}
          />
        )}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#00A86B',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#00A86B',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    backgroundColor: '#00A86B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});