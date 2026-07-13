import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export interface RowProps {
  children: React.ReactNode;
  /** justify-content: center */
  justCenter?: boolean;
  /** align-items: center */
  alignCenter?: boolean;
  /** Gap between items (px) */
  gap?: number;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
}

const Row: React.FC<RowProps> = ({
  children,
  justCenter,
  alignCenter,
  gap,
  style,
}) => {
  return (
    <View
      style={[
        styles.row,
        justCenter && styles.justCenter,
        alignCenter && styles.alignCenter,
        gap !== undefined && { gap },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  justCenter: {
    justifyContent: 'center',
  },
  alignCenter: {
    alignItems: 'center',
  },
});

export default Row;
