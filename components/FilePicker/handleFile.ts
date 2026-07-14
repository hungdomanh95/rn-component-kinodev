import { ToastController } from "controller";
import { DocumentPickerResponse } from "react-native-document-picker";
import ReactNativeBlobUtil from "react-native-blob-util";
import FileViewer from "react-native-file-viewer";
import * as RnImgResize from "react-native-image-resizer";

export type ResponsePickerType = (RnImgResize.Response | undefined)[] | DocumentPickerResponse[];

export const convertData = (value: ResponsePickerType, id: string) => {
  return (value as any[]).reduce((acc: any[], item: any) => {
    return [
      ...acc,
      {
        path: item?.fileCopyUri ?? item?.uri ?? item?.path,
        documentType: id,
        name: item?.name,
        type: item?.type || "image/jpeg",
      },
    ];
  }, []);
};

export const transferFile = async (path: string) => {
  const ext = path?.split(/[#?]/)[0]?.split(".")?.pop()?.trim();
  let result: any;
  await ReactNativeBlobUtil.config({ fileCache: true, appendExt: ext })
    .fetch("GET", path)
    .then((res) => {
      result = res.data;
    })
    .catch((err) => {
      console.log("err: transferFile", err);
      ToastController.error("Lỗi chuyển đổi file");
    });
  return result;
};

export const viewFile = async (
  fileType: "local" | "link",
  filePath: string,
  onRemoveLoading: () => void
) => {
  try {
    const pathToOpen = fileType === "link" ? await transferFile(filePath) : filePath;
    await FileViewer.open(pathToOpen);
  } catch (error) {
    console.log("err: viewFile", error);
    ToastController.error("Lỗi mở file");
  } finally {
    onRemoveLoading();
  }
};
