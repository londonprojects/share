import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomTabBar = ({ state, navigation, activeTab, setActiveTab }) => {
  if (!state || !state.routes) {
    return null; // or return a placeholder component
  }

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const label = route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          if (!isFocused) {
            setActiveTab(index);
            navigation.navigate(route.name);
          }
        };

        const getIconName = () => {
          switch (route.name) {
            case 'Home':
              return 'home';
            case 'Rides':
              return 'car';
            case 'Airbnb':
              return 'home-city';
            case 'Items':
              return 'gift';
            case 'Experiences':
              return 'ticket';
            default:
              return 'circle';
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={`${label} tab`}
            testID={`${label}-tab`}
            onPress={onPress}
            style={isFocused ? styles.selectedTab : styles.tab}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={getIconName()}
                size={24}
                color={isFocused ? '#6200ea' : '#000'}
                style={styles.icon}
              />
            </View>
            <Text style={[styles.label, isFocused && styles.selectedLabel]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
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
