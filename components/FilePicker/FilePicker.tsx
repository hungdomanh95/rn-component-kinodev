import { MediaType, openPicker } from "@baronha/react-native-multiple-image-picker";
import Icon from "assets/icons";
import React, { Fragment, useCallback, useState } from "react";
import {
  LayoutChangeEvent,
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
import { colors, sizes } from "../../theme";
import { Row } from "../Row";
import { Space } from "../Space";
import { Text } from "../Typography";
import ButtonContainer from "./ButtonContainer";
import { convertData, ResponsePickerType, viewFile } from "./handleFile";
import { handlePermission } from "./permission";
import { resizeImage } from "./resizeImage";
import { styles } from "./style";

export type { ResponsePickerType };

// resizeImage's maxWidth/maxHeight are a bounding box, not a forced size —
// react-native-image-resizer keeps aspect ratio and never upscales, so
// capping both at this value shrinks large camera-roll photos (often
// 3000-4000px) while leaving already-small images untouched.
const MAX_UPLOAD_DIMENSION = 1600;

export type ButtonType = "multi" | "single";

export type FilePickerProps = {
  styleContainer?: StyleProp<ViewStyle>;
  title?: string;
  response?: RnImgResize.Response | undefined | any;
  setResponse?: (value: ResponsePickerType, id?: string) => void;
  removeImage?: (key: string, idx: number) => void;
  /**
   * Optional per-item guard controlling whether the remove ("x") button is shown.
   * Undefined (default) preserves old behavior: every item is removable.
   * Return `false` for an item to hide its remove button (e.g. a file the
   * system generated that the user must not be able to delete).
   */
  canRemoveItem?: (item: any) => boolean;
  required?: boolean;
  id?: string;
  limit?: number;
  type?: ButtonType;
  typePicker?: "camera" | "images" | "files" | "library";
  setLoading?: () => void;
  removeLoading?: () => void;
  /**
   * Optional content rendered right after the title/count row, inside the
   * component's own bordered container (e.g. an upload-status badge). Lets
   * a host app attach status UI without it floating outside the card.
   */
  statusBadge?: React.ReactNode;
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
    canRemoveItem,
    statusBadge,
  } = props;

  const currentCount = response.filter((item: any) => item.documentType === id).length;
  const remainingSlots = Math.max(0, limit - currentCount);
  const isDisabled = currentCount >= limit;

  // Measured off the outer container (styles.container), not the item row itself:
  // the outer box's width is fixed by its parent chain's padding and never changes
  // based on what's rendered inside, so this can't feed back into itself. The item
  // row's own width, by contrast, shrinks/grows with its children - measuring that
  // instead caused an infinite resize loop.
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const itemSize = containerWidth
    ? (containerWidth - 2 * sizes.spacing - 2 /* own borderWidth */ - 2 * sizes.spacing) / 3
    : undefined;

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setContainerWidth((prev) => (prev !== width ? width : prev));
  };

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
        maxSelectedAssets: type === "single" ? 1 : remainingSlots,
      });

      const resizedImages = await Promise.all(
        responsePick.map(async (image: any) => {
          return resizeImage({ path: image.path, maxWidth: MAX_UPLOAD_DIMENSION, maxHeight: MAX_UPLOAD_DIMENSION });
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
      // react-native-document-picker's pick() has no max-selection option
      // (unlike openPicker's maxSelectedAssets for images), so cap the
      // result to the remaining slots after the fact instead.
      const limitedPick = type === "single" ? responsePick.slice(0, 1) : responsePick.slice(0, remainingSlots);
      const payload = convertData(limitedPick, String(id));
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
        maxWidth: MAX_UPLOAD_DIMENSION,
        maxHeight: MAX_UPLOAD_DIMENSION,
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
        <View style={[styles.container, props.styleContainer]} onLayout={handleContainerLayout}>
          <Row style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
            <Row style={{ alignItems: "center", flexShrink: 1, flexWrap: "wrap" }}>
              <Text style={{ fontWeight: "700", fontSize: 13, color: colors.primary }}>
                {title ?? "Upload"}
                {required && <Text style={{ color: colors.red }}> *</Text>}
              </Text>
              <Text style={styles.textCount}>
                {` ( ${response.filter((item: any) => item.documentType === id)?.length} / ${limit} )`}
              </Text>
            </Row>
            {statusBadge}
          </Row>
          <View style={styles.content}>
            {response.filter((item: any) => item.documentType === id)?.length > 0 ? (
              <>
                {response
                  .filter((item: any) => item.documentType === id)
                  .map((item: any, idx: number) => (
                    <View style={[styles.itemUpload, itemSize ? { width: itemSize, height: itemSize } : null]} key={idx}>
                      {(!canRemoveItem || canRemoveItem(item)) && (
                        <TouchableOpacity style={styles.buttonRemove} onPress={() => removeImage(item.documentType, idx)}>
                          <Icon name="x" color={colors.darkGray} size={15} />
                        </TouchableOpacity>
                      )}
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
              <View style={[styles.itemUpload, itemSize ? { width: itemSize, height: itemSize } : null]}>
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
                      {(!canRemoveItem || canRemoveItem(item)) && (
                        <TouchableOpacity style={styles.buttonRemove} onPress={() => removeImage(item.documentType, 0)}>
                          <Icon name="x" color={colors.darkGray} size={15} />
                        </TouchableOpacity>
                      )}
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
