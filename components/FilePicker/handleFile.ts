import { ToastController } from "controller";
import type { Response as ResizeResponse } from "@bam.tech/react-native-image-resizer";
import type { DocumentPickerResponse } from "@react-native-documents/picker";
import { viewDocument } from "@react-native-documents/viewer";
import ReactNativeBlobUtil from "react-native-blob-util";

export type ResponsePickerType = (ResizeResponse | undefined)[] | DocumentPickerResponse[];

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

// openQueue serializes viewer presentations (a second present while one is
// still animating in fails silently on iOS), and withTimeout keeps the UI from
// hanging forever if the native side never settles the promise.
let openQueue: Promise<void> = Promise.resolve();

const OPEN_FILE_TIMEOUT_MS = 8000;

const withTimeout = <T,>(promise: Promise<T>, ms: number, message: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

export const viewFile = async (
  fileType: "local" | "link",
  filePath: string,
  onRemoveLoading: () => void
) => {
  const previousOpen = openQueue;
  let releaseQueue: () => void = () => {};
  openQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve;
  });

  await previousOpen;

  try {
    const pathToOpen = fileType === "link" ? await transferFile(filePath) : filePath;
    // viewDocument needs a uri; transferFile and local copies may be bare paths.
    const uri = pathToOpen?.includes("://") ? pathToOpen : `file://${pathToOpen}`;
    await withTimeout(viewDocument({ uri }), OPEN_FILE_TIMEOUT_MS, "Mở file quá thời gian chờ");
  } catch (error) {
    console.log("err: viewFile", error);
    ToastController.error("Lỗi mở file");
  } finally {
    releaseQueue();
    onRemoveLoading();
  }
};
