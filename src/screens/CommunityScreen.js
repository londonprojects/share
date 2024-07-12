import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Avatar, Text, Card } from 'react-native-paper';
import { firestore } from '../services/firebase';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1716671827397-8948fb218779?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const CommunityScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await firestore.collection('users').get();
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const renderUser = ({ item }) => {
    const avatarUrl = item.photoURL ? item.photoURL : `https://avatars.dicebear.com/api/initials/${item.displayName || 'Anonymous'}.png`;

    return (
      <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.id })}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Avatar.Image source={{ uri: avatarUrl }} size={50} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.displayName || 'Anonymous'}</Text>
              <Text style={styles.userEmail}>{item.email || 'No email provided'}</Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={renderUser}
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
  card: {
    marginVertical: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#757575',
  },
});

export default CommunityScreen;
