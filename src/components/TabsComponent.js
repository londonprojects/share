import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Badge } from 'react-native-paper';

const CustomTabBar = ({ navigation, activeTab, setActiveTab }) => {
  console.log('CustomTabBar rendered. Props:', { navigation, activeTab, setActiveTab: typeof setActiveTab });

  const tabs = [
    { name: 'RidesScreen', label: 'Rides', icon: 'car' },
    { name: 'AirbnbScreen', label: 'Airbnbs', icon: 'home' },
    { name: 'ItemShareScreen', label: 'Items', icon: 'gift' },
    { name: 'ExperienceShareScreen', label: 'Experiences', icon: 'ticket' },
  ];

  const handleTabPress = (index) => {
    console.log('Tab pressed:', index);
    if (typeof setActiveTab === 'function') {
      setActiveTab(index);
    } else {
      console.error('setActiveTab is not a function:', setActiveTab);
    }
    navigation.navigate(tabs[index].name);
  };

  const getTabStyle = (index) => {
    return activeTab === index ? styles.selectedTab : styles.tab;
  };

  const getIconColor = (index) => {
    return activeTab === index ? '#6200ea' : '#000';
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.name}
          onPress={() => handleTabPress(index)}
          style={getTabStyle(index)}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={tab.icon}
              size={24}
              color={getIconColor(index)}
              style={styles.icon}
            />
          </View>
          <Text style={[styles.label, activeTab === index && styles.selectedLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // marginTop: 10,
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
    textDecorationLine: 'no-underline',
    color: '#6200ea',
  },
});

export default CustomTabBar;
