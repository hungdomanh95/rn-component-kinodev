import { useField } from 'formik';
import React, { useCallback } from 'react';
import Radio, { RadioProps } from './Radio';

interface RadioFieldProps extends Omit<RadioProps, 'value' | 'onChange' | 'error' | 'touched'> {
  /** Field name for Formik */
  name: string;
}

const RadioField: React.FC<RadioFieldProps> = ({ name, testID, ...props }) => {
  const [, meta, helpers] = useField(name);

  // Radio là React.memo — cần onChange ổn định (không tạo arrow function mới mỗi render)
  // để memo thật sự có tác dụng khi field khác trong cùng Formik form thay đổi.
  const handleChange = useCallback(
    (val: string | number | boolean) => {
      helpers.setValue(val);
      helpers.setTouched(true, false);
    },
    [helpers.setValue, helpers.setTouched]
  );

  return (
    <Radio
      {...props}
      testID={testID ?? name}
      value={meta.value}
      onChange={handleChange}
      error={meta.error}
      touched={meta.touched}
    />
  );
};

export default RadioField;
