import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput } from 'react-native';
import { Text, Button, List, Avatar } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const MessengerScreen = ({ route }) => {
  const { userId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [recipient, setRecipient] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDoc = await firestore.collection('users').doc(userId).get();
      if (userDoc.exists) {
        setRecipient(userDoc.data());
      }

      const currentUser = auth.currentUser;
      setCurrentUser(currentUser);

      if (currentUser) {
        const chatId = [currentUser.uid, userId].sort().join('_');
        const messagesRef = firestore.collection('chats').doc(chatId).collection('messages').orderBy('timestamp');
        messagesRef.onSnapshot(snapshot => {
          const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMessages(messages);
        });
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const chatId = [currentUser.uid, userId].sort().join('_');
      const messagesRef = firestore.collection('chats').doc(chatId).collection('messages');
      await messagesRef.add({
        senderId: currentUser.uid,
        recipientId: userId,
        message: newMessage,
        timestamp: new Date(),
      });
      setNewMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={item.senderId === currentUser.uid ? styles.myMessage : styles.theirMessage}>
            <Text>{item.message}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
          style={styles.textInput}
        />
        <Button onPress={handleSendMessage}>Send</Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  textInput: {
    flex: 1,
    marginRight: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
});

export default MessengerScreen;
