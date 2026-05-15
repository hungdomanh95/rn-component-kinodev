import FileViewer from "react-native-file-viewer";
import ReactNativeBlobUtil from "react-native-blob-util";
import ApplicationService from "services/application.service";
import { ToastController } from "controller";

export const transferFile = async (path: string) => {
  const ext = path?.split(/[#?]/)[0]?.split(".")?.pop()?.trim();

  let result: any;

   await ReactNativeBlobUtil.config({ fileCache: true, appendExt: ext })
    .fetch("GET", path)
    .then((res: any) => {
      result = res.data
    })
    .catch((err: unknown) => {
      console.log("err: transferFile", err);
      ToastController.error("Lỗi chuyển đổi file");
    });
  return result;
};

export const viewFile = async ( type: "local" | "link",  path: string, handleRemoveLoading: () => void ) => {
  console.log("-------------- viewFile ----------------", type, path);
  if (type === "link") {
    const result = await transferFile(path);
    await FileViewer.open(result)
      .catch((err: unknown) => {
        console.log("err: FileViewer", err);
        ToastController.error("Lỗi mở file");
      })
      .finally(() => {
        handleRemoveLoading();
      });
  } else {
    await FileViewer.open(path)
      .catch((err: unknown) => {
        console.log("err: FileViewer local", err);
        ToastController.error("Lỗi mở file");
      })
      .finally(() => {
        handleRemoveLoading();
      });
  }
};
