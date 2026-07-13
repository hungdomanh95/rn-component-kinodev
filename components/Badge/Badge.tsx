import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../../theme';

export interface BadgeProps {
  count: number;
  style?: StyleProp<ViewStyle>;
}

const Badge: React.FC<BadgeProps> = ({ count, style }) => {
  return (
    <View
      style={[
        styles.base,
        count > 10 ? styles.wide : styles.circle,
        style,
      ]}
    >
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    height: 15,
    borderRadius: 50,
    backgroundColor: 'red',
    top: -3,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  circle: {
    width: 15,
  },
  wide: {
    right: -5,
    paddingHorizontal: 3,
  },
  text: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default Badge;
