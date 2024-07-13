// theme.js
import { DefaultTheme } from 'react-native-paper';

const theme = {
    ...DefaultTheme,
    roundness: 8,
    colors: {
        ...DefaultTheme.colors,
        primary: '#00bcd4',        // Primary color - Bright Cyan
        accent: '#ff4081',         // Accent color - Vivid Pink
        background: '#f8f9fa',     // Very light blue-gray background color
        surface: '#ffffff',        // Surface color for cards and other surfaces
        text: '#37474f',           // Dark Blue-Grey for main text color
        disabled: '#cfd8dc',       // Light Blue-Grey for disabled elements
        placeholder: '#90a4ae',    // Medium Blue-Grey for placeholder text color
        backdrop: '#000000',       // Backdrop color for modals
        notification: '#ff80ab',   // Light Pink for notifications
        error: '#d32f2f',          // Error color - Red
        onPrimary: '#ffffff',      // White text on primary color
        onSurface: '#37474f',      // Dark Blue-Grey text on surface color
        onBackground: '#37474f',   // Dark Blue-Grey text on background color
        onError: '#ffffff',        // White text on error color
    },
    animation: {
        scale: 1.0,
      },                                        
};

export default theme;
