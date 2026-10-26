import { createContext, useCallback, useContext } from 'react';
import { View } from 'react-native';

type FieldRegistry = {
  register: (name: string, view: View | null) => void;
};

// ScrollBody cung cấp registry này để biết view của từng *Field theo tên, nhờ đó
// cuộn tới field lỗi đầu tiên khi submit Formik thất bại.
export const FieldRegistryContext = createContext<FieldRegistry | null>(null);

/** Trả về callback ref gắn vào view gốc của field. Ngoài ScrollBody thì không làm gì. */
export const useFieldRegistration = (name: string) => {
  const registry = useContext(FieldRegistryContext);
  return useCallback((view: View | null) => registry?.register(name, view), [registry, name]);
};
