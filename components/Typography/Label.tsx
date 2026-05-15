import React from 'react';
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { colors, sizes } from '../../theme';

export interface LabelProps extends TextProps {
  style?: StyleProp<TextStyle>;
}

const Label: React.FC<LabelProps> = ({ style, ...props }: LabelProps) => {
  return <Text style={[styles.label, style]} {...props} />;
};

const styles = StyleSheet.create({
  label: {
    fontSize: sizes.fontSize.title,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: sizes.spacing,
    marginTop: sizes.spacing,
  },
});

export default Label;
