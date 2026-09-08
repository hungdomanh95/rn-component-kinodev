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

// FileViewer.open()'s promise chỉ resolve khi native báo đã present xong màn preview (event
// RNFileViewerDidOpen). Bug đã gặp thật (2026-09-08, điều tra kỹ bằng cách đo thời gian/kích thước
// file/số lần gọi qua nhiều vòng test — không phụ thuộc file nào, không phải do gọi chồng lệnh, không
// phải do timing render): gốc rễ thật sự nằm ở `RNFileViewerManager.m` (native iOS của chính
// react-native-file-viewer) dùng `UIApplication.keyWindow` — API đã bị Apple deprecated từ iOS 13, có
// thể trả về nil/tham chiếu cũ đúng lúc đang có transition khác, khiến `presentViewController` present
// thất bại âm thầm, không bao giờ gọi completion. Đã patch native (patches/react-native-file-viewer+
// 2.1.5.patch) đổi sang tìm qua `UIWindowScene` đang active. `withTimeout`/`openQueue` dưới đây giữ lại
// làm lưới an toàn thứ 2 (không kẹt UI vô thời hạn + không gọi chồng lệnh) phòng khi vẫn còn sót
// trường hợp lạ khác.
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
    await withTimeout(FileViewer.open(pathToOpen), OPEN_FILE_TIMEOUT_MS, "Mở file quá thời gian chờ");
  } catch (error) {
    console.log("err: viewFile", error);
    ToastController.error("Lỗi mở file");
  } finally {
    releaseQueue();
    onRemoveLoading();
  }
};
