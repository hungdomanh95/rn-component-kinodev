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
  // Soft tint of `secondary`, used for selected/active row backgrounds
  // (e.g. Select's selected option row). Kept as its own field (not derived
  // at runtime) so host apps can override it via `configureTheme` too.
  secondarySoft: '#FFF3E0',
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

/**
 * Every component in this library imports `colors`/`sizes` directly from
 * this module (no ThemeProvider) — they all share the exact same object
 * instances above. `configureTheme` mutates those instances in place
 * (`Object.assign`, not reassignment) so every already-imported component
 * picks up the new values, AS LONG AS this is called before any component
 * module is first evaluated (their `StyleSheet.create(...)` calls read
 * `colors`/`sizes` once, at import time, and bake the resolved values into
 * the style object — mutating afterwards has no effect on already-created
 * StyleSheet objects). Call this once, at the very top of the app's entry
 * file (`index.js`), before importing the root `App` component.
 */
export function configureTheme(overrides: {
  colors?: Partial<typeof colors>;
  sizes?: Partial<Omit<typeof sizes, 'fontSize'>> & {
    fontSize?: Partial<typeof sizes.fontSize>;
  };
}) {
  if (overrides.colors) {
    Object.assign(colors, overrides.colors);
  }
  if (overrides.sizes) {
    const {fontSize, ...rest} = overrides.sizes;
    Object.assign(sizes, rest);
    if (fontSize) {
      Object.assign(sizes.fontSize, fontSize);
    }
  }
}
