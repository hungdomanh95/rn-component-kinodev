import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";
import { colors, sizes } from "../../theme";

export interface ErrorTextProps {
  children?: React.ReactNode;
  style?: TextStyle;
}

const ErrorText: React.FC<ErrorTextProps> = ({ children, style }) => (
  <Text style={[styles.text, style]}>{children}</Text>
);

export default ErrorText;

const styles = StyleSheet.create({
  text: {
    color: colors.red,
    fontSize: sizes.fontSize.label,
    fontWeight: "500",
    marginTop: 10,
  },
});
