import React from 'react';
import { StyleProp, StyleSheet, Text as RNText, TextProps, TextStyle } from 'react-native';
import { colors, sizes } from '../../theme';

export interface TextProps2 extends TextProps {
  style?: StyleProp<TextStyle>;
}

const Text: React.FC<TextProps2> = ({ style, ...props }: TextProps2) => {
  return <RNText style={[styles.text, style]} {...props} />;
};

const styles = StyleSheet.create({
  text: {
    fontSize: sizes.fontSize.input,
    color: colors.black,
  },
});

export default Text;
