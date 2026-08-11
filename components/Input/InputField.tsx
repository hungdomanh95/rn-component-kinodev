import { useField } from "formik";
import React, { useCallback, useEffect } from "react";
import Input, { InputProps } from "./Input";

interface InputFieldProps extends Omit<InputProps, "value" | "onChangeText" | "onBlur" | "error" | "touched"> {
  /** Field name for Formik */
  name: string;
  /** Default value (will be set on mount if field is empty) */
  defaultValue?: string;
}

const InputField: React.FC<InputFieldProps> = ({ name, defaultValue, testID, ...props }) => {
  const [, meta, helpers] = useField(name);

  useEffect(() => {
    if (defaultValue !== undefined && !meta.value) {
      helpers.setValue(defaultValue);
    }
  }, []);

  // Input là React.memo — cần onBlur ổn định (không tạo arrow function mới mỗi render)
  // để memo thật sự có tác dụng khi field khác trong cùng Formik form thay đổi.
  const handleBlur = useCallback(() => {
    helpers.setTouched(true);
  }, [helpers.setTouched]);

  return (
    <Input
      {...props}
      testID={testID ?? name}
      value={meta.value || ""}
      onChangeText={helpers.setValue}
      onBlur={handleBlur}
      error={meta.error}
      touched={meta.touched}
    />
  );
};

export default InputField;
