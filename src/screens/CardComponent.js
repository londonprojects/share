import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Card, IconButton, Badge } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const CardComponent = ({ item, navigation }) => {
  const [newMessages, setNewMessages] = useState(false);

  useEffect(() => {
    const checkNewMessages = async () => {
      const userId = auth.currentUser?.uid;
      const messagesSnapshot = await firestore.collection('messages')
        .where('to', '==', userId)
        .where('from', '==', item.userId)
        .where('isRead', '==', false)
        .get();
      if (!messagesSnapshot.empty) {
        setNewMessages(true);
      }
    };

    checkNewMessages();
  }, []);

  const handleBadgePress = () => {
    navigation.navigate('MessagingScreen', { userId: item.userId, userName: item.userName });
  };

  return (
    <Card style={styles.card}>
      <Card.Cover source={{ uri: item.imageUrl || 'default_image_url' }} style={styles.cardImage} />
      <Card.Content>
        <View style={styles.cardHeader}>
          {item.userPhoto && <Image source={{ uri: item.userPhoto }} style={styles.userPhoto} />}
          <View>
            <Text style={styles.cardTitle}>{item.destination}</Text>
            <Text style={styles.userName}>{item.userName}</Text>
          </View>
          {newMessages && (
            <Badge style={styles.badge} size={24} onPress={handleBadgePress}>
              New
            </Badge>
          )}
        </View>
        <Text style={styles.cardDetails}>Price: ${item.price}</Text>
      </Card.Content>
      {item.userId !== auth.currentUser?.uid && (
        <Card.Actions>
          <IconButton icon="message" onPress={() => navigation.navigate('MessagingScreen', { userId: item.userId, userName: item.userName })} />
        </Card.Actions>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  cardImage: {
    height: 200,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    color: '#757575',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDetails: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
  badge: {
    marginLeft: 'auto',
    backgroundColor: 'red',
    color: 'white',
  },
});

export default CardComponent;
