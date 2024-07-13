import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Tabs, TabScreen } from 'react-native-paper-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Badge } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const CustomTabBar = ({ navigation }) => {
  const [ridesMessages, setRidesMessages] = useState(0);
  const [airbnbMessages, setAirbnbMessages] = useState(0);
  const [itemsMessages, setItemsMessages] = useState(0);
  const [experiencesMessages, setExperiencesMessages] = useState(0);

  useEffect(() => {
    const fetchMessages = async () => {
      const user = auth.currentUser;
      if (user) {
        const messagesSnapshot = await firestore.collection('messages').where('receiverId', '==', user.uid).get();
        const messages = messagesSnapshot.docs.map(doc => doc.data());

        const ridesCount = messages.filter(msg => msg.category === 'Rides').length;
        const airbnbCount = messages.filter(msg => msg.category === 'Airbnbs').length;
        const itemsCount = messages.filter(msg => msg.category === 'Items').length;
        const experiencesCount = messages.filter(msg => msg.category === 'Experiences').length;

        setRidesMessages(ridesCount);
        setAirbnbMessages(airbnbCount);
        setItemsMessages(itemsCount);
        setExperiencesMessages(experiencesCount);
      }
    };

    fetchMessages();
  }, []);

  return (
    <View style={styles.container}>
      <Tabs>
        <TabScreen label="Rides" onPress={() => navigation.navigate('RidesScreen')}>
          <View style={styles.tabContent}>
            <View style={styles.iconContainer}>
              <Icon name="car" size={24} color="#000" style={styles.icon} />
              {ridesMessages > 0 && <Badge style={styles.badge}>{ridesMessages}</Badge>}
            </View>
            <Text style={styles.label}>Rides</Text>
          </View>
        </TabScreen>
        <TabScreen label="Airbnbs" onPress={() => navigation.navigate('AirbnbScreen')}>
          <View style={styles.tabContent}>
            <View style={styles.iconContainer}>
              <Icon name="home" size={24} color="#000" style={styles.icon} />
              {airbnbMessages > 0 && <Badge style={styles.badge}>{airbnbMessages}</Badge>}
            </View>
            <Text style={styles.label}>Airbnbs</Text>
          </View>
        </TabScreen>
        <TabScreen label="Items" onPress={() => navigation.navigate('ItemShareScreen')}>
          <View style={styles.tabContent}>
            <View style={styles.iconContainer}>
              <Icon name="gift" size={24} color="#000" style={styles.icon} />
              {itemsMessages > 0 && <Badge style={styles.badge}>{itemsMessages}</Badge>}
            </View>
            <Text style={styles.label}>Items</Text>
          </View>
        </TabScreen>
        <TabScreen label="Experiences" onPress={() => navigation.navigate('ExperienceShare')}>
          <View style={styles.tabContent}>
            <View style={styles.iconContainer}>
              <Icon name="run" size={24} color="#000" style={styles.icon} />
              {experiencesMessages > 0 && <Badge style={styles.badge}>{experiencesMessages}</Badge>}
            </View>
            <Text style={styles.label}>Experiences</Text>
          </View>
        </TabScreen>
      </Tabs>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  tabContent: {
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  icon: {
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: 'red',
    color: 'white',
  },
  label: {
    fontSize: 10,
  },
});

export default CustomTabBar;
