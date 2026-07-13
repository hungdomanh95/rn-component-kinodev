import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, sizes } from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  /** If provided, card becomes pressable */
  onPress?: () => void;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
}

const Card: React.FC<CardProps> = ({ children, onPress, style }) => {
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: sizes.borderRadius,
    padding: 12,
    borderColor: '#e1e8ee',
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
    marginBottom: sizes.spacing,
  },
});

export default Card;
