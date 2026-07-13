import { ToastController } from "controller";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Image, ImageStyle, Platform, StyleProp } from "react-native";
import * as RnImagePicker from "react-native-image-picker";
import RnPermission from "react-native-permissions";
import { color } from "theme";
import { validateSize } from "utils/validateSize";
import FriendlyError from "utils/error";
import Permission from "utils/permission";
import * as S from './ImagePicker.styled';
import Icon from "assets/icons";

enum Wording {
  Unknown = "Lỗi không xác định!",
  UnableToExtractImage = "Lỗi thể trích xuất hình ảnh! Thử lại.",
}

export type ImagePickerProps = React.PropsWithChildren<{
  type: "camera" | "library" | "both";
  title?: string;
  hasPreview?: boolean;
  defaultData?: RnImagePicker.ImagePickerResponse;
  isLoading?: boolean;
  onChange?: (response: RnImagePicker.ImagePickerResponse) => any;
  contentSize?: string | number;
  contentFontSize?: string | number;
  stypePreviewImage?: StyleProp<ImageStyle>;
  small?: boolean;
  disabled?: boolean;
}>;

export type ImagePickerRef = {
  appendToFormData: (
    formData: FormData,
    name: string,
    opts?: { targetResponse?: RnImagePicker.ImagePickerResponse }
  ) => void;
  setResponse: React.Dispatch<RnImagePicker.ImagePickerResponse>;
  response: RnImagePicker.ImagePickerResponse | null;
};

const ImagePicker = forwardRef<ImagePickerRef, ImagePickerProps>((props, ref) => {
  const [response, setResponse] = useState<RnImagePicker.ImagePickerResponse | null>(
    props?.defaultData ?? null
  );

  const requestPermission = async (pickerType: "camera" | "library") => {
    const permissionList = Platform.OS === "ios"
      ? pickerType === "camera"
        ? [RnPermission.PERMISSIONS.IOS.CAMERA]
        : [RnPermission.PERMISSIONS.IOS.PHOTO_LIBRARY]
      : pickerType === "camera"
        ? [RnPermission.PERMISSIONS.ANDROID.CAMERA]
        : [
            Number(`${Platform?.Version}`) > 31
              ? RnPermission.PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
              : RnPermission.PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          ];
    await Permission.requestMultiple(permissionList);
  };

  const launchCamera = async () => {
    await requestPermission("camera");
    console.log('[ImagePicker] launchCamera: calling RnImagePicker.launchCamera');
    const response = await RnImagePicker.launchCamera({
      mediaType: "photo",
      cameraType: "back",
      quality: 0.6,
      maxWidth: 1920,
      maxHeight: 1920,
    });
    console.log('[ImagePicker] launchCamera response:', JSON.stringify({
      didCancel: response?.didCancel,
      errorCode: response?.errorCode,
      errorMessage: response?.errorMessage,
      assetCount: response?.assets?.length,
      asset0: response?.assets?.[0] ? {
        uri: response.assets[0].uri,
        fileName: response.assets[0].fileName,
        fileSize: response.assets[0].fileSize,
        type: response.assets[0].type,
      } : undefined,
    }));

    if (response.didCancel || response.errorCode) return;

    const resultValidateSize = await validateSize(Number(response?.assets?.[0]?.fileSize));
    console.log('[ImagePicker] validateSize result:', resultValidateSize);
    if (resultValidateSize) return;

    console.log('[ImagePicker] calling onChange');
    props?.onChange?.(response);
    console.log('[ImagePicker] calling setResponse');
    setResponse(response);
    console.log('[ImagePicker] setResponse done');
  };

  const launchImageLibrary = async () => {
    await requestPermission("library");
    const response = await RnImagePicker.launchImageLibrary({
      mediaType: "photo",
      quality: 0.6,
      maxWidth: 1920,
      maxHeight: 1920,
    });

    if (response.didCancel || response.errorCode) return;

    const resultValidateSize = await validateSize(Number(response?.assets?.[0]?.fileSize));
    if (resultValidateSize) return;

    console.log('response: launchImageLibrary', response);
    props?.onChange?.(response);
    setResponse(response);
  };

  const onPress = async (type: string) => {
    try {
      if (type === "camera") {
        await launchCamera();
        return;
      }
      await launchImageLibrary();
    } catch (friendlyError) {
      const message = (friendlyError as FriendlyError)?.friendlyMessage ?? Wording.Unknown;
      ToastController.error(message);
    }
  };

  const appendToFormData = (formData: FormData, name: string, opts?: { targetResponse?: RnImagePicker.ImagePickerResponse }) => {
    const nextResponse = opts?.targetResponse ?? response;
    const nextUri = nextResponse?.assets?.[0]?.uri!;
    try {
      formData.append(name, {
        uri: Platform.OS === "android" ? nextUri : nextUri.replace("file://", ""),
        name: nextResponse?.assets?.[0]?.fileName,
        type: nextResponse?.assets?.[0]?.type,
      } as any);
    } catch (error) {
      console.log("appendToFormData-error:", nextResponse, (error as Error)?.message);
      ToastController.error(Wording.UnableToExtractImage);
    }
  };

  useImperativeHandle(ref, () => ({ appendToFormData, setResponse, response }));

  return (
    <S.Container onPress={() => onPress(props.type)} disabled={props?.isLoading || props?.disabled}>
      {response?.assets?.[0]?.uri ? (
        <Image
          source={{ uri: response.assets[0].uri }}
          resizeMode='contain'
          style={{ position: 'absolute', flex: 1, top: 0, right: 0, left: 0, bottom: 0 }}
        />
      ) : (
        <>
          <Icon name={props.type === 'camera' ? "camera" : "upload"} color={color.primary} size={props.small ? 20 : 40} />
          {!props.small && <S.Title>{props.title ?? 'ImagePicker'}</S.Title>}
        </>
      )}
    </S.Container>
  );
});

ImagePicker.defaultProps = {
  type: "library" as ImagePickerProps["type"],
};

export default ImagePicker;
