import React from 'react';
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { colors, sizes } from '../../theme';

export interface TitleProps extends TextProps {
  style?: StyleProp<TextStyle>;
}

const Title: React.FC<TitleProps> = ({ style, ...props }) => {
  return <Text style={[styles.title, style]} {...props} />;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: sizes.spacing,
  },
});

export default Title;
