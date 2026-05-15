import { View, SafeAreaView } from "react-native";
import React from "react";
import PickerSingleFile, { PickerSingleFileProps } from "./PickerSingleFile";
import PickerMultiFile, { PickerMultiFileProps } from "./PickerMultiFile";

type FilePickerProps = {
  type: "single" | "multiple";
} & (
  | ({ type: "single" } & PickerSingleFileProps)
  | ({ type: "multiple" } & PickerMultiFileProps)
);

const FilePicker: React.FC<FilePickerProps> = (props) => {
  const { type, ...fileProps } = props;
  if (type === "single") {
    const singleFileProps = fileProps as PickerSingleFileProps;
    return <PickerSingleFile {...singleFileProps} />;
  } else {
    const multisFileProps = fileProps as PickerMultiFileProps;
    return <PickerMultiFile {...multisFileProps} />;
  }
};

export default FilePicker;
