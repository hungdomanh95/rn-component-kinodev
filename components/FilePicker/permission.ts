import { ToastController } from "controller";
import { Platform } from "react-native";
import {
  Permission as RNPermission,
  PERMISSIONS,
  RESULTS,
  check,
  openSettings,
  request,
} from "react-native-permissions";

const checkAndRequestPermission = async (permission: RNPermission, permissionName: string) => {
  try {
    const result = await check(permission);
    let granted = false;

    switch (result) {
      case RESULTS.GRANTED:
      case RESULTS.LIMITED:
        granted = true;
        break;

      case RESULTS.DENIED: {
        const requestResult = await request(permission);
        granted = requestResult === RESULTS.GRANTED || requestResult === RESULTS.LIMITED;

        if (requestResult === RESULTS.BLOCKED) {
          ToastController.error(`Quyền truy cập ${permissionName} bị chặn. Vui lòng mở chặn trong phần Cài đặt.`);
          openSettings().catch(() => {});
        }
        break;
      }

      case RESULTS.BLOCKED:
        ToastController.error(`Quyền truy cập ${permissionName} bị chặn. Vui lòng mở chặn trong phần Cài đặt.`);
        openSettings().catch(() => {});
        break;

      default:
        break;
    }

    return granted;
  } catch (error) {
    console.log("error: checkAndRequestPermission", error);
    return false;
  }
};

const permissionHandleMap = {
  camera: {
    permission: Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
    label: "Camera",
  },
  library: {
    permission:
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : Number(`${Platform.Version}`) > 31
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    label: "Thư viện ảnh",
  },
} as const;

export type PermissionType = keyof typeof permissionHandleMap;

export const handlePermission = async (type: PermissionType) => {
  const { permission, label } = permissionHandleMap[type];
  return checkAndRequestPermission(permission, label);
};
