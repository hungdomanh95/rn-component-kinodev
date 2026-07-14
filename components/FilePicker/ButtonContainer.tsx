import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../theme";
import ButtonPicker from "./ButtonPicker";

type TypePicker = "camera" | "library" | "images" | "files";
type ButtonType = "multi" | "single";

type ButtonContainerProps = {
  typePicker?: TypePicker;
  disabled?: boolean;
  type?: ButtonType;
  handlePicker: (type: "images" | "pdf" | "camera") => Promise<void>;
};

const ButtonContainer: React.FC<ButtonContainerProps> = ({
  typePicker,
  disabled,
  handlePicker,
  type = "multi",
}) => {
  const renderButton = () => {
    switch (typePicker) {
      case "library":
        return (
          <>
            <ButtonPicker disabled={disabled} onPress={() => handlePicker("images")} text="Chọn Ảnh" icon={"images"} color={"#1A67BB"} />
            <View style={styles.lineVertical} />
            <ButtonPicker disabled={disabled} onPress={() => handlePicker("pdf")} text="Đính kèm PDF" icon={"attachment"} color={colors.secondary} />
          </>
        );
      case "camera":
        return (
          <ButtonPicker disabled={disabled} onPress={() => handlePicker("camera")} text={type === "single" ? "Chụp" : "Chụp Ảnh"} icon={"camera"} color={colors.secondary} />
        );
      case "images":
        return (
          <ButtonPicker disabled={disabled} onPress={() => handlePicker("images")} text={type === "single" ? "Ảnh" : "Chọn Ảnh"} icon={"images"} color={"#1A67BB"} />
        );
      case "files":
        return (
          <ButtonPicker disabled={disabled} onPress={() => handlePicker("pdf")} text={type === "single" ? "PDF" : "Đính kèm PDF"} icon={"attachment"} color={colors.secondary} />
        );
      default:
        return (
          <ButtonPicker disabled={disabled} onPress={() => handlePicker("images")} text={type === "single" ? "Ảnh" : "Chọn Ảnh"} icon={"images"} color={"#1A67BB"} />
        );
    }
  };

  switch (type) {
    case "multi":
      return <View style={styles.containerUpload}>{renderButton()}</View>;
    case "single":
      return <>{renderButton()}</>;
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  lineVertical: {
    width: 1,
    height: "60%",
    backgroundColor: "rgba(24, 68, 120, 0.5)",
  },
  containerUpload: {
    borderTopWidth: 1,
    borderTopColor: "rgba(24, 68, 120, 0.5)",
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ButtonContainer;
