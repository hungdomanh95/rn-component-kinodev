import { useField } from 'formik';
import React, { useCallback } from 'react';
import Checkbox, { CheckboxProps } from './Checkbox';

interface CheckboxFieldProps extends Omit<CheckboxProps, 'value' | 'onChange' | 'error' | 'touched'> {
  /** Field name for Formik */
  name: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ name, ...props }) => {
  const [, meta, helpers] = useField(name);

  // Checkbox là React.memo — cần onChange ổn định (không tạo arrow function mới mỗi render)
  // để memo thật sự có tác dụng khi field khác trong cùng Formik form thay đổi.
  const handleChange = useCallback(
    (val: boolean) => {
      helpers.setValue(val);
      helpers.setTouched(true);
    },
    [helpers.setValue, helpers.setTouched]
  );

  return (
    <Checkbox
      {...props}
      value={!!meta.value}
      onChange={handleChange}
      error={meta.error}
      touched={meta.touched}
    />
  );
};

export default CheckboxField;
