import { ToastController } from 'controller';
import React, { useState } from 'react';
import { Platform } from 'react-native';
import * as RnImagePicker from "react-native-image-picker";
import { PERMISSIONS } from 'react-native-permissions';
import { checkAndRequestPermission } from 'utils/newPermission';
import { resizeImage } from 'utils/resizeImage';
import * as RnImgResize from 'react-native-image-resizer';
import { useAppDispatch } from 'hooks/redux';
import { removeLoading, setLoading } from 'stores/slices/LoadingSlice';
import { pickSingle, types } from "react-native-document-picker";
const MSG = {
  camera_unavailable : "Không tìm thấy máy ảnh/ thư viện trên thiết bị!",
  permission : "Thiết bị không có quyền truy xuất máy ảnh/ thư viện!",
  others : "Lỗi không xác định!",
}
type SetResponseFunction = React.Dispatch<React.SetStateAction<RnImgResize.Response | undefined>> | undefined | ((value: RnImgResize.Response | undefined) => void);
const useFilePicker = (setResponse: SetResponseFunction) => {

  const dispatch = useAppDispatch();

  const launchCamera = async () => {
    try {
      const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA
      const resultCheck = await checkAndRequestPermission(permission, 'Camera')
      if(!resultCheck) return
        dispatch(setLoading())
        const response = await RnImagePicker.launchCamera({
          mediaType: "photo",
          cameraType: "back",
          quality: Platform.OS === 'ios' ? 0.6 : 1
        });
        const imgResize: RnImgResize.Response | undefined = await resizeImage(
          {
            path: String(response?.assets?.[0].uri),
            maxWidth: Number(response?.assets?.[0].width),
            maxHeight: Number(response?.assets?.[0].height)
          }
        )
        console.log('imgResize: launchCamera', imgResize);
        // setResponse?.(imgResize);
        // if(response.errorCode) {
        //   ToastController.error(MSG[response.errorCode])
        //   return
        // }
    } catch (error) {
      console.log("Error: PDF picker", error);
    }finally {
      dispatch(removeLoading())
    }

  }

  const launchImageLibrary = async () => {
    try {
      const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY  : Number(Platform?.Version) > 31
      ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      const resultCheck = await checkAndRequestPermission(permission, 'Library')

      if(!resultCheck) return

      dispatch(setLoading())
      const response = await RnImagePicker.launchImageLibrary({
        mediaType: "photo",
        quality: Platform.OS === 'ios' ? 0.6 : 1,
      });
      console.log('response: launchImageLibrary', response);
      const imgResize = await resizeImage(
        {
          path: String(response?.assets?.[0].uri),
          maxWidth: Number(response?.assets?.[0].width),
          maxHeight: Number(response?.assets?.[0].height)
        }
      )
      console.log('imgResize: launchImageLibrary', imgResize);
      setResponse?.(imgResize);
    } catch (error) {
      console.log("Error: PDF picker", error);
    }finally {
      dispatch(removeLoading())
    }


  }

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


  const onPress = async (type:string) => {
    try {
      if (type === "camera") {
        await launchCamera();
        return;
      }else if(type === "library"){
        await launchImageLibrary();
        return
      }else if(type === "pdf"){
        await onPickerPDF();
        return
      }
      return;
    } catch (friendlyError) {
      const message = "Lỗi không xác định!"
      ToastController.error(message)
    }
  };

  return {
    onPress,
  }
}

export default useFilePicker