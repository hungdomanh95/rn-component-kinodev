import React from 'react';
import {
  Keyboard,
  StyleProp,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

export interface BodyProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Dismiss keyboard on background tap. Default true. Set false for screens
   * with a scrollable child (FlatList/ScrollView) — the TouchableWithoutFeedback
   * responder otherwise races with the scroll gesture and causes intermittent
   * (works-sometimes) scrolling. */
  dismissKeyboardOnTouch?: boolean;
}

const Body: React.FC<BodyProps> = ({ children, style, dismissKeyboardOnTouch = true }) => {
  if (!dismissKeyboardOnTouch) {
    return <View style={[{ flex: 1 }, style]}>{children}</View>;
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[{ flex: 1 }, style]}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Body;
