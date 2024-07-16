import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, List, Avatar, ActivityIndicator, Searchbar, Divider, IconButton } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const DEFAULT_IMAGE = 'https://plus.unsplash.com/premium_photo-1683800241997-a387bacbf06b?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const MessagesListScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
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

          const allMessages = [...sentMessages, ...receivedMessages];

          const userIds = Array.from(new Set(allMessages.map(msg => [msg.senderId, msg.receiverId]).flat()));
          const usersSnapshot = await firestore.collection('users').where('uid', 'in', userIds).get();

          const users = usersSnapshot.docs.reduce((acc, doc) => {
            acc[doc.data().uid] = doc.data();
            return acc;
          }, {});

          const messagesWithUserInfo = allMessages.map(msg => ({
            ...msg,
            sender: users[msg.senderId] || {},
            receiver: users[msg.receiverId] || {},
          }));

          const sortedMessages = messagesWithUserInfo.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

          setMessages(sortedMessages);
          setFilteredMessages(sortedMessages);
        } catch (error) {
          console.error('Error fetching messages or users:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMessages();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = messages.filter(msg =>
        msg.message.toLowerCase().includes(query.toLowerCase()) ||
        msg.sender?.name?.toLowerCase().includes(query.toLowerCase()) ||
        msg.receiver?.name?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages);
    }
  };

  const handleDeleteThread = async (threadId) => {
    try {
      const threadSnapshot = await firestore.collection('messages').where('threadId', '==', threadId).get();
      const batch = firestore.batch();
      threadSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      setMessages(messages.filter(msg => msg.threadId !== threadId));
      setFilteredMessages(filteredMessages.filter(msg => msg.threadId !== threadId));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('MessageDetail', { message: item })}
    >
      <List.Item
        title={item.message}
        description={`From: ${item.senderId === auth.currentUser?.uid ? 'You' : item.sender?.name || 'Unknown'} | To: ${item.receiver?.name || 'Unknown'} | ${new Date(item.timestamp.seconds * 1000).toLocaleString()}`}
        left={() => (
          <Avatar.Image
            size={40}
            source={{ uri: item.senderId === auth.currentUser?.uid ? auth.currentUser.photoURL : item.sender?.photoURL || DEFAULT_IMAGE }}
          />
        )}
        right={() => (
          <IconButton
            icon="delete"
            onPress={() => handleDeleteThread(item.threadId)}
          />
        )}
        style={styles.listItem}
      />
      <Divider />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search messages"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredMessages}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
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
  searchbar: {
    margin: 16,
    borderRadius: 30,
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
});

export default MessagesListScreen;
