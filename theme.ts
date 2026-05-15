import { Dimensions } from "react-native";

const { width, height } = Dimensions.get('window');

// Theme constants
export const colors = {
  primary: "#174471",
  secondary: "#F58220",
  black: "#000000",
  white: "#ffffff",
  gray: "#9F9E9A",
  red: "#EE0000",
  darkGray: '#B6BEC5',
  blackGray: '#454749',
  lightGray: '#f5f5f5',
};

export const sizes = {
  // Heights
  inputHeight: 44,
  buttonHeight: 44,
  searchInputHeight: 40,
  selectItemHeight: 50,

  // Border radii
  borderRadius: 8,
  borderRadiusLg: 16,

  // Spacing
  spacing: 12,          // default marginBottom between components
  padding: 16,          // horizontal padding for content areas (modal, section)
  inputPadding: 12,     // horizontal padding inside field (input, select, toggle)

  // Control sizes
  checkboxSize: 22,     // checkbox & multi-select checkbox
  radioSize: 20,        // radio outer circle
  clearButtonSize: 15,  // clear (✕) button circle

  // Icon sizes
  iconSm: 18,
  iconMd: 22,
  iconLg: 24,

  // Font sizes
  fontSize: {
    small: 10,    // badge / clear button text
    error: 12,
    label: 13,
    input: 14,
    button: 15,
    option: 15,
    title: 16,    // modal title, section header
  },
  // Screen dimensions
  screenWidth: width,
  screenHeight: height,
};
