import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const SharingScreen = () => {
  const [rides, setRides] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const unsubscribe = firestore.collection('rides')
        .where('userId', '==', user.uid)
        .onSnapshot(snapshot => {
          const ridesList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRides(ridesList);
        });

      return () => unsubscribe();
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.destination}</Text>
              <Text variant="bodySmall">{new Date(item.date.seconds * 1000).toDateString()}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
});

export default SharingScreen;
