import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { TextInput, Button, Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const DEFAULT_IMAGE = 'https://plus.unsplash.com/premium_photo-1683800241997-a387bacbf06b?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const MessageScreen = ({ route, navigation }) => {
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [userPhoto, setUserPhoto] = useState(DEFAULT_IMAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (route.params && route.params.userId) {
      setUserId(route.params.userId);
      fetchUserPhoto(route.params.userId);
    } else {
      Alert.alert('Error', 'No user ID provided');
      navigation.goBack();
    }
  }, [route.params]);

  const fetchUserPhoto = async (userId) => {
    try {
      const userDoc = await firestore.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        setUserPhoto(userData.photoURL || DEFAULT_IMAGE);
      }
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user photo');
      setLoading(false);
    }
  };

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
      {loading ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <>
          <View style={styles.userInfo}>
            <Avatar.Image size={80} source={{ uri: userPhoto }} />
            <Text style={styles.userId}>Message User: {userId}</Text>
          </View>
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
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userId: {
    marginTop: 8,
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessageScreen;
