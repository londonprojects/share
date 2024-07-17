import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, List, Divider, ActivityIndicator } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const notificationsSnapshot = await firestore
            .collection('notifications')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

          const notificationsList = notificationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setNotifications(notificationsList);
        } catch (error) {
          console.error('Error fetching notifications:', error);
          Alert.alert('Error', 'Failed to fetch notifications.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNotifications();
  }, []);

  const renderNotificationItem = ({ item }) => (
    <List.Item
      title={item.message}
      description={new Date(item.createdAt.seconds * 1000).toLocaleString()}
      left={props => <List.Icon {...props} icon="bell" />}
    />
  );

  if (loading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotificationItem}
        ItemSeparatorComponent={() => <Divider />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationsScreen;
