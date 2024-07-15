import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Badge } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const CustomTabBar = ({ navigation }) => {
  const [ridesMessages, setRidesMessages] = useState(0);
  const [airbnbMessages, setAirbnbMessages] = useState(0);
  const [itemsMessages, setItemsMessages] = useState(0);
  const [experiencesMessages, setExperiencesMessages] = useState(0);
  const [selectedTab, setSelectedTab] = useState('Rides');

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

  const handleTabPress = (label) => {
    setSelectedTab(label);
    switch (label) {
      case 'Rides':
        navigation.navigate('RidesScreen');
        break;
      case 'Airbnbs':
        navigation.navigate('AirbnbScreen');
        break;
      case 'Items':
        navigation.navigate('ItemShareScreen');
        break;
      case 'Experiences':
        navigation.navigate('ExperienceShare');
        break;
      default:
        break;
    }
  };

  const getTabStyle = (label) => {
    return selectedTab === label ? styles.selectedTab : styles.tab;
  };

  const getIconColor = (label) => {
    return selectedTab === label ? '#6200ea' : '#000';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handleTabPress('Rides')} style={getTabStyle('Rides')}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="car" size={24} color={getIconColor('Rides')} style={styles.icon} />
          {ridesMessages > 0 && <Badge style={styles.badge}>{ridesMessages}</Badge>}
        </View>
        <Text style={[styles.label, selectedTab === 'Rides' && styles.selectedLabel]}>Rides</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleTabPress('Airbnbs')} style={getTabStyle('Airbnbs')}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="home" size={24} color={getIconColor('Airbnbs')} style={styles.icon} />
          {airbnbMessages > 0 && <Badge style={styles.badge}>{airbnbMessages}</Badge>}
        </View>
        <Text style={[styles.label, selectedTab === 'Airbnbs' && styles.selectedLabel]}>Airbnbs</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleTabPress('Items')} style={getTabStyle('Items')}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="gift" size={24} color={getIconColor('Items')} style={styles.icon} />
          {itemsMessages > 0 && <Badge style={styles.badge}>{itemsMessages}</Badge>}
        </View>
        <Text style={[styles.label, selectedTab === 'Items' && styles.selectedLabel]}>Items</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleTabPress('Experiences')} style={getTabStyle('Experiences')}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="run" size={24} color={getIconColor('Experiences')} style={styles.icon} />
          {experiencesMessages > 0 && <Badge style={styles.badge}>{experiencesMessages}</Badge>}
        </View>
        <Text style={[styles.label, selectedTab === 'Experiences' && styles.selectedLabel]}>Experiences</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    backgroundColor: '#ffffff',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 10,
    flex: 1,
  },
  selectedTab: {
    alignItems: 'center',
    paddingVertical: 10,
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
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
    fontSize: 10,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
  },
  selectedLabel: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: '#6200ea',
  },
});

export default CustomTabBar;
