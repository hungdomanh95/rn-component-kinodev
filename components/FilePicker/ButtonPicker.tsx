import Icon from "assets/icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "../Typography";

type ButtonPickerProps = {
  disabled?: boolean;
  onPress?: () => void;
  icon?: string;
  text: string;
  color?: string;
};

const ButtonPicker: React.FC<ButtonPickerProps> = ({ disabled, onPress, icon, text, color }) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.buttonUpload, disabled && { opacity: 0.5 }]}
      onPress={onPress}
    >
      <Icon name={String(icon)} color={color} size={20} />
      <Text style={[styles.titleButton, { color }]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonUpload: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 48,
  },
  titleButton: {
    fontSize: 12,
    marginLeft: 5,
    fontWeight: "700",
  },
});

export default ButtonPicker;
