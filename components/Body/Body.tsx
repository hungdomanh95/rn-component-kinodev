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
}

const Body: React.FC<BodyProps> = ({ children, style }: BodyProps) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[{ flex: 1 }, style]}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Body;
