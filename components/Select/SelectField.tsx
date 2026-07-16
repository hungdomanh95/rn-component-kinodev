import { useField } from "formik";
import React, { useCallback } from "react";
import Select, { SelectOption, SelectProps } from "./Select";

interface SelectFieldProps extends Omit<SelectProps, "value" | "onBlur" | "error" | "touched"> {
  /** Field name for Formik */
  name: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ name, onValueChange, ...props }) => {
  const [, meta, helpers] = useField(name);

  // Select là React.memo — cần onValueChange/onBlur ổn định (không tạo arrow function mới
  // mỗi render) để memo thật sự có tác dụng khi field khác trong cùng Formik form thay đổi.
  const handleValueChange = useCallback(
    (value: string | number | (string | number)[], option?: SelectOption | SelectOption[]) => {
      helpers.setValue(value);
      onValueChange?.(value, option);
    },
    [helpers.setValue, onValueChange]
  );

  const handleBlur = useCallback(() => {
    helpers.setTouched(true);
  }, [helpers.setTouched]);

  return (
    <Select
      {...props}
      value={meta.value}
      onValueChange={handleValueChange}
      onBlur={handleBlur}
      error={meta.error}
      touched={meta.touched}
    />
  );
};

export type { SelectOption };
export default SelectField;
