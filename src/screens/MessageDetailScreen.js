import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { TextInput, Button, Text, Avatar, ActivityIndicator, IconButton, Divider, List } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const DEFAULT_IMAGE = 'https://plus.unsplash.com/premium_photo-1683800241997-a387bacbf06b?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const MessageDetailScreen = ({ route, navigation }) => {
  const { message } = route.params;
  const [thread, setThread] = useState([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchThread = async () => {
      try {
        const threadSnapshot = await firestore.collection('messages').where('threadId', '==', message.threadId).get();
        const threadMessages = threadSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (isMounted) {
          setThread(threadMessages.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds));
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          Alert.alert('Error', error.message);
        }
      }
    };

    fetchThread();

    return () => {
      isMounted = false;
    };
  }, [message.threadId]);

  const handleSendReply = async () => {
    if (!reply.trim()) {
      Alert.alert('Error', 'Reply cannot be empty');
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        const replyData = {
          threadId: message.threadId,
          senderId: user.uid,
          receiverId: message.senderId === user.uid ? message.receiverId : message.senderId,
          message: reply,
          timestamp: new Date(),
        };

        await firestore.collection('messages').add(replyData);
        setReply('');
        setThread([replyData, ...thread]);
      } else {
        Alert.alert('Error', 'User not logged in');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteThread = async () => {
    try {
      const threadSnapshot = await firestore.collection('messages').where('threadId', '==', message.threadId).get();
      const batch = firestore.batch();
      threadSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <List.Item
        title={item.message}
        description={`${item.senderId === auth.currentUser?.uid ? 'You' : item.sender?.name || 'Unknown'} | ${new Date(item.timestamp.seconds * 1000).toLocaleString()}`}
        left={() => (
          <Avatar.Image
            size={40}
            source={{ uri: item.senderId === auth.currentUser?.uid ? auth.currentUser.photoURL : item.sender?.photoURL || DEFAULT_IMAGE }}
          />
        )}
      />
      <Divider />
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <>
          <FlatList
            data={thread}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
          <View style={styles.replyContainer}>
            <TextInput
              label="Reply"
              mode="outlined"
              style={styles.input}
              value={reply}
              onChangeText={setReply}
            />
            <Button mode="contained" onPress={handleSendReply} style={styles.button}>
              Send
            </Button>
          </View>
          <IconButton
            icon="delete"
            size={30}
            onPress={handleDeleteThread}
            style={styles.deleteButton}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 16,
  },
  listItem: {
    backgroundColor: 'white',
    marginVertical: 4,
    borderRadius: 10,
    padding: 10,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
  button: {
    paddingVertical: 8,
  },
  deleteButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
});

export default MessageDetailScreen;
