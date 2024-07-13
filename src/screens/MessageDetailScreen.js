// src/screens/MessageDetailScreen.js

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Card } from 'react-native-paper';

const MessageDetailScreen = ({ route }) => {
  const { message } = route.params;

  return (
    <View style={styles.container}>
      <Card>
        <Card.Title title="Message Details" />
        <Card.Content>
          <Text style={styles.label}>From: {message.senderId}</Text>
          <Text style={styles.label}>To: {message.receiverId}</Text>
          <Text style={styles.label}>Message: {message.message}</Text>
          <Text style={styles.label}>Timestamp: {message.timestamp.toDate().toString()}</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  label: {
    marginVertical: 8,
    fontSize: 16,
  },
});

export default MessageDetailScreen;
