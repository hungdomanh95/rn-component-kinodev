import { MediaType, openPicker } from "@baronha/react-native-multiple-image-picker";
import Icon from "assets/icons";
import React, { Fragment, useCallback } from "react";
import {
  Platform,
  StyleProp,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { DocumentPickerOptions, pick, types } from "react-native-document-picker";
import FastImage from "react-native-fast-image";
import * as RnImagePicker from "react-native-image-picker";
import * as RnImgResize from "react-native-image-resizer";
import { colors } from "../../theme";
import { Row } from "../Row";
import { Space } from "../Space";
import { Text } from "../Typography";
import ButtonContainer from "./ButtonContainer";
import { convertData, ResponsePickerType, viewFile } from "./handleFile";
import { handlePermission } from "./permission";
import { resizeImage } from "./resizeImage";
import { styles } from "./style";

export type { ResponsePickerType };

export type ButtonType = "multi" | "single";

export type FilePickerProps = {
  styleContainer?: StyleProp<ViewStyle>;
  title?: string;
  response?: RnImgResize.Response | undefined | any;
  setResponse?: (value: ResponsePickerType, id?: string) => void;
  removeImage?: (key: string, idx: number) => void;
  required?: boolean;
  id?: string;
  limit?: number;
  type?: ButtonType;
  typePicker?: "camera" | "images" | "files" | "library";
  setLoading?: () => void;
  removeLoading?: () => void;
};

const FilePicker: React.FC<FilePickerProps> = (props) => {
  const {
    title,
    response = [],
    setResponse,
    required,
    id,
    typePicker = "library",
    limit = 100,
    type = "multi",
    setLoading,
    removeLoading,
  } = props;

  const isDisabled = response.filter((item: any) => item.documentType === id).length >= limit;

  const removeImage = useCallback(
    (key: string, idx?: number) => {
      const imagesWithoutKey = response.filter((item: any) => item.documentType !== key);
      if (idx || idx === 0) {
        const imagesKey = response.filter((item: any) => item.documentType === key);
        setResponse?.([...imagesWithoutKey, ...imagesKey.slice(0, idx), ...imagesKey.slice(idx + 1)]);
      } else {
        setResponse?.(imagesWithoutKey);
      }
    },
    [response]
  );

  const handleOpenFile = (fileType: "local" | "link", path: string) => {
    setLoading?.();
    viewFile(fileType, path, () => removeLoading?.());
  };

  const handlePicker = async (pickType: "images" | "pdf" | "camera") => {
    const permissionType = pickType === "camera" ? "camera" : "library";
    const isGranted = await handlePermission(permissionType);
    if (!isGranted) return;

    const actionMap = {
      images: handleImagePick,
      pdf: onPickerPDF,
      camera: launchCamera,
    };
    setLoading?.();
    return actionMap[pickType]?.();
  };

  const handleImagePick = async () => {
    try {
      const responsePick = await openPicker({
        mediaType: "image" as MediaType,
        maxSelectedAssets: type === "single" ? 1 : limit,
      });

      const resizedImages = await Promise.all(
        responsePick.map(async (image: any) => {
          return resizeImage({ path: image.path, maxWidth: image.width, maxHeight: image.height });
        })
      );
      const validImages = resizedImages.filter(Boolean);
      if (validImages.length === 0) return;
      const payload = convertData(validImages, String(id));
      setResponse?.([...response, ...payload]);
    } catch (error) {
      console.log("Error: Image picker", error);
    } finally {
      removeLoading?.();
    }
  };

  const onPickerPDF = async () => {
    try {
      const config: DocumentPickerOptions = {
        allowMultiSelection: true,
        type: [types.pdf],
        mode: "open",
        copyTo: "documentDirectory",
      };
      const responsePick = await pick(config);
      const payload = convertData(responsePick, String(id));
      setResponse?.([...response, ...payload]);
    } catch (error) {
      console.log("Error: PDF picker", error);
    } finally {
      removeLoading?.();
    }
  };

  const launchCamera = async () => {
    try {
      const resultCamera = await RnImagePicker.launchCamera({
        mediaType: "photo",
        cameraType: "back",
        quality: Platform.OS === "ios" ? 0.6 : 1,
      });
      if (resultCamera.didCancel || !resultCamera.assets?.[0]?.uri) return;

      const imgResize = await resizeImage({
        path: resultCamera.assets[0].uri,
        maxWidth: Number(resultCamera.assets[0].width),
        maxHeight: Number(resultCamera.assets[0].height),
      });
      if (!imgResize) return;

      const payload = convertData([imgResize], String(id));
      setResponse?.([...response, ...payload]);
    } catch (error) {
      console.log("Error: Camera picker", error);
    } finally {
      removeLoading?.();
    }
  };

  switch (type) {
    case "multi":
      return (
        <View style={[styles.container, props.styleContainer]}>
          <Row style={{ justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "700", fontSize: 13, color: colors.primary }}>
              {title ?? "Upload"}
              {required && <Text style={{ color: colors.red }}> *</Text>}
            </Text>
            <Text style={styles.textCount}>
              {`( ${response.filter((item: any) => item.documentType === id)?.length} / ${limit} )`}
            </Text>
          </Row>
          <View style={styles.content}>
            {response.filter((item: any) => item.documentType === id)?.length > 0 ? (
              <>
                {response
                  .filter((item: any) => item.documentType === id)
                  .map((item: any, idx: number) => (
                    <View style={styles.itemUpload} key={idx}>
                      <TouchableOpacity style={styles.buttonRemove} onPress={() => removeImage(item.documentType, idx)}>
                        <Icon name="x" color={colors.darkGray} size={15} />
                      </TouchableOpacity>
                      <TouchableWithoutFeedback
                        onPress={() => handleOpenFile(item?.path?.includes("http") ? "link" : "local", item?.path)}
                      >
                        {item?.path?.split(/[#?]/)[0]?.split(".")?.pop()?.trim() === "pdf" || item.type === "application/pdf" ? (
                          <View style={styles.viewPDF}>
                            <Icon name="pdf" color={colors.white} size={40} />
                          </View>
                        ) : (
                          <FastImage style={styles.viewIMAGE} key={item?.path} source={{ uri: item?.path }} />
                        )}
                      </TouchableWithoutFeedback>
                      {item.type === "application/pdf" && (
                        <Text style={styles.nameFile} numberOfLines={1} ellipsizeMode="middle">
                          {item.name}
                        </Text>
                      )}
                    </View>
                  ))}
              </>
            ) : (
              <View style={styles.itemUpload}>
                <Icon name="image-outline" color={colors.darkGray} size={30} />
              </View>
            )}
          </View>
          <ButtonContainer typePicker={typePicker} disabled={isDisabled} handlePicker={handlePicker} />
        </View>
      );

    case "single":
      return (
        <View style={[styles.containerSingle, props.styleContainer]}>
          <Text style={{ fontWeight: "700", fontSize: 13, color: colors.primary }}>
            {title ?? "Upload"}
            {required && <Text style={{ color: colors.red }}> *</Text>}
          </Text>
          <Space size="small" />
          <View style={styles.itemUpload}>
            {response.filter((item: any) => item.documentType === id)?.length > 0 ? (
              <>
                {response
                  .filter((item: any) => item.documentType === id)
                  .map((item: any, idx: number) => (
                    <Fragment key={idx}>
                      <TouchableOpacity style={styles.buttonRemove} onPress={() => removeImage(item.documentType, 0)}>
                        <Icon name="x" color={colors.darkGray} size={15} />
                      </TouchableOpacity>
                      <TouchableWithoutFeedback
                        onPress={() => handleOpenFile(item?.path?.includes("http") ? "link" : "local", item?.path)}
                      >
                        <FastImage
                          style={styles.viewIMAGE}
                          source={{ uri: item?.path, priority: FastImage.priority.high }}
                        />
                      </TouchableWithoutFeedback>
                    </Fragment>
                  ))}
              </>
            ) : (
              <ButtonContainer type={type} typePicker={typePicker} disabled={isDisabled} handlePicker={handlePicker} />
            )}
          </View>
        </View>
      );

    default:
      return null;
  }
};

export default FilePicker;
