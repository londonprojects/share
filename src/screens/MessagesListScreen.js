// src/screens/MessagesListScreen.js

import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, List, Avatar, ActivityIndicator } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const MessagesListScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const user = auth.currentUser;
      if (user) {
        const sentMessagesSnapshot = await firestore
          .collection('messages')
          .where('senderId', '==', user.uid)
          .get();

        const receivedMessagesSnapshot = await firestore
          .collection('messages')
          .where('receiverId', '==', user.uid)
          .get();

        const sentMessages = sentMessagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const receivedMessages = receivedMessagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMessages([...sentMessages, ...receivedMessages]);
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('MessageDetail', { message: item })}
    >
      <List.Item
        title={item.message}
        description={`From: ${item.senderId === auth.currentUser?.uid ? 'You' : item.senderId} | To: ${item.receiverId}`}
        left={() => <Avatar.Text size={40} label={item.senderId.charAt(0)} />}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessagesListScreen;
