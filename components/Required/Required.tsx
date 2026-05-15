import React from "react";
import { Text, StyleSheet } from "react-native";
import { colors, sizes } from "../../theme";

const Required: React.FC = () => (
  <Text style={styles.text}>*</Text>
);

export default Required;

const styles = StyleSheet.create({
  text: {
    color: colors.red,
    fontSize: sizes.fontSize.label,
  },
});
