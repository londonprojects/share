import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { firestore } from '../services/firebase';

const ItemShareScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsSnapshot = await firestore.collection('items').orderBy('dateListed', 'desc').get();
        const itemsList = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(itemsList);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Shared Items</Text>
      {items.map(item => (
        <Card key={item.id} style={styles.card}>
          <Card.Content>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemPrice}>${item.price}</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => navigation.navigate('ItemDetails', { itemId: item.id })}>
              View Details
            </Button>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#757575',
  },
  itemPrice: {
    fontSize: 16,
    color: '#00bcd4',
    marginTop: 8,
  },
});

export default ItemShareScreen;
