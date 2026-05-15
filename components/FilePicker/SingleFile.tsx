import {
  MediaType,
  openPicker,
} from "@baronha/react-native-multiple-image-picker";
import Icon from "assets/icons";
import { Required } from "../Required";
import React, { useEffect } from "react";
import { LayoutAnimation, StyleProp, TouchableWithoutFeedback, ViewStyle } from "react-native";
import { pickSingle, types } from "react-native-document-picker";
import * as RnImgResize from 'react-native-image-resizer';
import ApplicationService from "services/application.service";
import { color } from "theme";
import { resizeImage } from 'utils/resizeImage';
import * as S from "./FilePicker.styled";
import FileViewer from "react-native-file-viewer";
import ReactNativeBlobUtil from "react-native-blob-util"
import { viewFile } from "./viewFile";
import { useAppDispatch } from "hooks/redux";
import { removeLoading, setLoading } from "stores/slices/LoadingSlice";
import FastImage from "react-native-fast-image";
const layoutEffect = () => {
  LayoutAnimation.configureNext({
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
  });
};
type SingleFileProps = {
  type: "single" | "multi" | "single-img" | "single-file";
  styleContainer?: StyleProp<ViewStyle>;
  title?:string
  response?: RnImgResize.Response | undefined | any;
  setResponse?: (value: RnImgResize.Response | undefined , id:string) => void
  // setResponse?: React.Dispatch<React.SetStateAction<RnImgResize.Response | undefined>>
  removeImage?: (key: string, idx: number) => void;
  id:string
  required?:boolean
  testID?: string;
  accessibilityLabel?: string;
};

const SingleFile: React.FC<SingleFileProps> = (props: SingleFileProps) => {

  const dispatch = useAppDispatch();

  const {type,title, response, setResponse ,removeImage, required, testID, accessibilityLabel} = props
  console.log('SingleFile: ---------------', response);

  useEffect(() => {
    // FastImage.clearMemoryCache();
    // FastImage.clearDiskCache();
  },[])

  const handleImagePick = async () => {
    try {
      dispatch(setLoading())
      const response = await openPicker({
        mediaType: "image" as MediaType,
        singleSelectedMode: true,
      } as any);
      const selectedImage = response as any;
      console.log("Image picker response: ", response);

      const imgResize = await resizeImage(
        {
          path: String(selectedImage?.path),
          maxWidth: Number(selectedImage?.width),
          maxHeight: Number(selectedImage?.height)
        }
      )

      console.log('imgResize: ', imgResize);
      setResponse?.(imgResize, props.id)
      layoutEffect();
    } catch (error) {
      console.log("Error: Image picker", error);
    }finally {
      dispatch(removeLoading())
    }
  };

  const onPickerPDF = async () => {
    try {
      dispatch(setLoading())
      const config = {
        allowMultiSelection: true,
        type: [types.pdf],
      };
      const response = await pickSingle(config);
      console.log("File PDF picker response: ", response);
    } catch (error) {
      console.log("Error: PDF picker", error);
    }finally {
      dispatch(removeLoading())
    }
  };

  const renderButton = () => {
    switch (type) {
      case "single-img":
        return (
          <S.ButtonUpload
            onPress={handleImagePick}
            testID={testID ? `${testID}-image` : undefined}
            accessibilityRole="button"
            accessibilityLabel="Chọn ảnh"
          >
            <Icon name="images" color={"#1A67BB"} size={15} />
            <S.TitleButton style={{ color: "#1A67BB" }}>Ảnh</S.TitleButton>
          </S.ButtonUpload>
        );
      case "single-file":
        return (
          <S.ButtonUpload
            onPress={onPickerPDF}
            testID={testID ? `${testID}-pdf` : undefined}
            accessibilityRole="button"
            accessibilityLabel="Chọn PDF"
          >
            <Icon name="attachment" color={color.secondary} size={15} />
            <S.TitleButton style={{ color: color.secondary }}>
              PDF
            </S.TitleButton>
          </S.ButtonUpload>
        );
      default:
        return (
          <>
            <S.ButtonUpload
              onPress={handleImagePick}
              testID={testID ? `${testID}-image` : undefined}
              accessibilityRole="button"
              accessibilityLabel="Chọn ảnh"
            >
              <Icon name="images" color={"#1A67BB"} size={15} />
              <S.TitleButton style={{ color: "#1A67BB" }}>Ảnh</S.TitleButton>
            </S.ButtonUpload>
            <S.LineHorizontal />
            <S.ButtonUpload
              onPress={onPickerPDF}
              testID={testID ? `${testID}-pdf` : undefined}
              accessibilityRole="button"
              accessibilityLabel="Chọn PDF"
            >
              <Icon name="attachment" color={color.secondary} size={15} />
              <S.TitleButton style={{ color: color.secondary }}>
                PDF
              </S.TitleButton>
            </S.ButtonUpload>
          </>
        );
    }
  };

  const handleRemoveLoading = () => {
    dispatch(removeLoading())
  }

  const handleOpenFile = (type: "local" | "link", path: string) => {
    dispatch(setLoading())
    viewFile(type, path, handleRemoveLoading)
  }

  return (
    <S.ContainerSingle testID={testID} accessibilityLabel={accessibilityLabel ?? title}>
      <S.Title style={{ fontSize: 12, color: color.blackGray }}>
        {title} {required && <Required />}
      </S.Title>
      <S.ContentSingle style={{ backgroundColor: color.lightGray }}>
        {response && response?.path?.length > 0 ? (
          <>
            <S.ButtonRemove
              onPress={()=>removeImage?.(response.documentType, 0)}
              testID={testID ? `${testID}-remove` : undefined}
              accessibilityRole="button"
              accessibilityLabel="Xóa file"
            >
              <Icon name="x" color={color.darkGray} size={15} />
            </S.ButtonRemove>
            <TouchableWithoutFeedback onPress={() => handleOpenFile(response.id ? "link" : "local", response?.path)}>
              <S.ViewImage
                testID={testID ? `${testID}-preview` : undefined}
                source={{
                  uri: response?.path,
                  priority: FastImage.priority.high
                }}
              />
            </TouchableWithoutFeedback>
          </>
        ) : (
          <>{renderButton()}</>
        )}
      </S.ContentSingle>
    </S.ContainerSingle>
  );
}

export default SingleFile;
