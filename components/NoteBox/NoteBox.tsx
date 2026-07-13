import React from "react";
import { StyleSheet, Text, View } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, sizes } from "../../theme";

type NoteBoxProps = {
  children: React.ReactNode;
  title?: string;
};

const NoteBox: React.FC<NoteBoxProps> = ({ children, title = "Lưu ý:" }) => (
  <View style={styles.box}>
    <View style={styles.header}>
      <IconMaterial name="information" size={16} color={colors.secondary} />
      <Text style={styles.title}>{title}</Text>
    </View>
    {children}
  </View>
);

export default NoteBox;

export const noteBoxStyles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: colors.blackGray,
    lineHeight: 20,
  },
  highlight: {
    fontWeight: "700",
    color: colors.primary,
  },
});

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#FFF8F0",
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
    borderRadius: sizes.borderRadius,
    padding: 12,
    marginBottom: sizes.spacing,
    gap: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.secondary,
  },
});
