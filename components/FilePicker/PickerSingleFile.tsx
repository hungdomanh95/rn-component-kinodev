import { View, SafeAreaView } from "react-native";
import React from "react";
import styled from "styled-components/native";
import Icon from "assets/icons";
import { color, size } from "theme";
import useFilePicker from "./useFilePicker";
import * as RnImgResize from "react-native-image-resizer";
export type PickerSingleFileProps = {
  format: "pdf" | "library" | "camera";
  response: RnImgResize.Response | undefined | any;
  setResponse?: React.Dispatch<
    React.SetStateAction<RnImgResize.Response | undefined>
  >;
};

const renderIcon = (format: "pdf" | "library" | "camera") => {
  switch (format) {
    case "library":
      return (
        <>
          <Icon name={"upload"} color={color.secondary} size={35} />
          <Title>Upload</Title>
        </>
      );
    case "camera":
      return (
        <>
          <Icon name={"camera"} color={color.secondary} size={35} />
          <Title>Camera</Title>
        </>
      );
    case "pdf":
      return (
        <>
          <Icon name={"attachment"} color={color.secondary} size={35} />
          <Title>PDF</Title>
        </>
      );
    default:
      return null;
  }
};

const PickerSingleFile: React.FC<PickerSingleFileProps> = (props) => {
  const { format, setResponse, response } = props;

  const pickerHook = useFilePicker(setResponse);

  return (
    <TouchPicker onPress={() => pickerHook.onPress(format)}>
      {response?.uri! ? (
        <ImageView source={{ uri: response?.uri }} resizeMode="contain" />
      ) : (
        <>{renderIcon(format)}</>
      )}
    </TouchPicker>
  );
};

export default PickerSingleFile;

const TouchPicker = styled.TouchableOpacity`
  height: 100%;
  justify-content: center;
  align-items: center;
`;
export const Title = styled.Text`
  color: ${color.secondary};
  font-weight: 700;
`;

const ImageView = styled.Image`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
`;
