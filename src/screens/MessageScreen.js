import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { firestore, auth } from '../services/firebase'; // Ensure you have your firebase configuration file

const MessageScreen = ({ route, navigation }) => {
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (route.params && route.params.userId) {
      setUserId(route.params.userId);
    } else {
      Alert.alert('Error', 'No user ID provided');
      navigation.goBack();
    }
  }, [route.params]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Message cannot be empty');
      return;
    }

    try {
      const user = auth.currentUser;
      if (user && userId) {
        const messageData = {
          senderId: user.uid,
          receiverId: userId,
          message,
          timestamp: new Date(),
        };

        await firestore.collection('messages').add(messageData);
        Alert.alert('Success', 'Message sent successfully');
        setMessage('');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'User not logged in or User ID missing');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {userId ? (
        <>
          <Text>Message User: {userId}</Text>
          <TextInput
            label="Message"
            mode="outlined"
            style={styles.input}
            value={message}
            onChangeText={setMessage}
          />
          <Button mode="contained" onPress={handleSendMessage} style={styles.button}>
            Send
          </Button>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default MessageScreen;
