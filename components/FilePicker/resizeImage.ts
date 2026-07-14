import ImageResizer from "react-native-image-resizer";

type ResizeImageProps = {
  path: string;
  maxWidth: number;
  maxHeight: number;
  compressFormat?: "JPEG" | "PNG";
  quality?: number;
};

export const resizeImage = async (props: ResizeImageProps) => {
  const { path, maxWidth, maxHeight, compressFormat, quality } = props;
  try {
    const result = await ImageResizer.createResizedImage(
      path,
      maxWidth,
      maxHeight,
      compressFormat ?? "JPEG",
      quality ?? 80,
      0,
      undefined,
      false
    );
    return result;
  } catch (error) {
    console.log("error: resizeImage", error);
  }
};
