import {
  MediaType,
  openPicker,
} from "@baronha/react-native-multiple-image-picker";
import Icon from "assets/icons";
import { useAppDispatch } from "hooks/redux";
import { Required } from "../Required";
import React, { useEffect } from "react";
import { StyleProp, TouchableWithoutFeedback, ViewStyle } from "react-native";
import { DocumentPickerOptions, DocumentPickerResponse, pick, types } from "react-native-document-picker";
import * as RnImgResize from 'react-native-image-resizer';
import { removeLoading, setLoading } from "stores/slices/LoadingSlice";
import { color } from "theme";
import { resizeImage } from "utils/resizeImage";
import * as S from "./FilePicker.styled";
import { viewFile } from "./viewFile";
import { launchCamera } from "react-native-image-picker";
type MultiFileProps = {
  type: "single" | "multi" | "single-img" | "single-file";
  styleContainer?: StyleProp<ViewStyle>;
  title?:string
  response?: RnImgResize.Response | undefined | any;
  setResponse?: (value: (RnImgResize.Response | undefined)[] | DocumentPickerResponse[], id:string) => void
  // setResponse?: React.Dispatch<React.SetStateAction<RnImgResize.Response | undefined>>
  removeImage?: (key: string, idx: number) => void;
  id:string
  required?:boolean
  typePicker?: "camera" | "all"
}


const MultiFile: React.FC<MultiFileProps> = (props) => {

  const dispatch = useAppDispatch();

  const {type,title, response, setResponse ,removeImage, required, typePicker} = props

  useEffect(() => {
    // FastImage.clearMemoryCache();
    // FastImage.clearDiskCache();
  },[])
  // console.log('response: MultiFile', response);

  const handleImagePick = async () => {
    try {
      dispatch(setLoading())
      const response = await openPicker({
        mediaType: "image" as MediaType,
      });
      console.log("Image picker response: ", response, response.length);

      const resizedImages = await Promise.all(response.map(async (image) => {
        const resizedImage = await resizeImage({
          path: image.path,
          maxWidth: image.width,
          maxHeight: image.height,
        });
        return resizedImage;
      }));
        console.log('resizedImages: ', resizedImages);

      setResponse?.(resizedImages, props.id)
    } catch (error) {
      console.log("Error: Image picker", error);
    }finally{
      dispatch(removeLoading())
    }
  };

    const handleCameraPick = async () => {
    try {
      dispatch(setLoading());
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 1,
        saveToPhotos: false,
      });

      if (result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        console.log("Camera response: ", image);

        const resizedImage = await resizeImage({
          path: image.uri || '',
          maxWidth: image.width || 800,
          maxHeight: image.height || 800,
        });

        setResponse?.([resizedImage], props.id);
      }
    } catch (error) {
      console.log("Error: Camera", error);
    } finally {
      dispatch(removeLoading());
    }
  };

  const onPickerPDF = async () => {
    try {
      dispatch(setLoading())
      const config: DocumentPickerOptions = {
        allowMultiSelection: true,
        type: [types.pdf],
        mode: 'open',
        copyTo: 'documentDirectory'
      };
      const response = await pick(config);

      console.log("File PDF picker response: ", response);
      setResponse?.(response, props.id)
    } catch (error) {
      console.log("Error: PDF picker", error);
    }finally{
      dispatch(removeLoading())
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
    <S.Container>
      <S.Title>
        {title} {required && <Required />}
      </S.Title>
      <S.Content>
        {response?.length > 0 ?
          <>
            {response.map((item:any,idx:number) => {
              return  <S.ItemUpload style={{ backgroundColor: color.lightGray }} key={idx}>
              <S.ButtonRemove onPress={() => removeImage?.(item.documentType, idx)}>
                <Icon name="x" color={color.darkGray} size={15} />
              </S.ButtonRemove>

              <TouchableWithoutFeedback onPress={() => handleOpenFile(item.id ? "link" : "local", item?.path)}>
                {(item?.path?.split(/[#?]/)[0]?.split(".")?.pop()?.trim() === "pdf" || item.type === "application/pdf") ?
                  <S.ViewPDF>
                    <Icon name="pdf" color={color.white} size={40} />
                  </S.ViewPDF>
                :
                  <S.ViewImage key={item?.path} source={{ uri: item?.path}}  />
                }
              </TouchableWithoutFeedback>
              {item.type === "application/pdf" &&
                <S.NameFile numberOfLines={1} ellipsizeMode="middle">{item.name}</S.NameFile>
              }
            </S.ItemUpload>
            })}
          </>
          :
            <S.ItemUpload style={{ backgroundColor: color.lightGray }}>
              <Icon name="image-outline" color={color.darkGray} size={30} />
            </S.ItemUpload>
      }
      </S.Content>

      <S.Upload>
        {typePicker === 'camera' ?
          <S.ButtonUpload onPress={handleCameraPick}>
            <Icon name="camera" color={"#1A67BB"} size={20} />
            <S.TitleButton style={{color:"#1A67BB"}}>Chụp Ảnh</S.TitleButton>
          </S.ButtonUpload>
        :
        <>
          <S.ButtonUpload onPress={handleImagePick}>
            <Icon name="images" color={"#1A67BB"} size={20} />
            <S.TitleButton style={{color:"#1A67BB"}}>Chọn Ảnh</S.TitleButton>
          </S.ButtonUpload>

          <S.LineVertical />

          <S.ButtonUpload onPress={onPickerPDF} >
            <Icon name="attachment" color={color.secondary} size={20} />
            <S.TitleButton style={{color:color.secondary}}>Đính kèm PDF</S.TitleButton>
          </S.ButtonUpload>
        </>
      }
      </S.Upload>
    </S.Container>
  );
};

export default MultiFile;
