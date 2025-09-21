import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { User, Phone } from 'lucide-react-native';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
}

interface ContactPickerProps {
  onSelectContact: (contact: Contact) => void;
}

export function ContactPicker({ onSelectContact }: ContactPickerProps) {
  const [contacts] = useState<Contact[]>([
    { id: '1', name: 'John Doe', phoneNumber: '0712345678' },
    { id: '2', name: 'Jane Smith', phoneNumber: '0723456789' },
    { id: '3', name: 'Bob Johnson', phoneNumber: '0734567890' },
    { id: '4', name: 'Alice Brown', phoneNumber: '0745678901' },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Contact</Text>
      <ScrollView style={styles.contactsList}>
        {contacts.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={styles.contactItem}
            onPress={() => onSelectContact(contact)}
          >
            <View style={styles.avatar}>
              <User size={20} color="#00A86B" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <View style={styles.phoneRow}>
                <Phone size={14} color="#6B7280" />
                <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5F7F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
});