import { useField } from 'formik';
import React, { useCallback, useMemo } from 'react';
import DatePicker, { DatePickerProps } from './DatePicker';

interface DatePickerFieldProps extends Omit<DatePickerProps, 'value' | 'onChange' | 'error' | 'touched'> {
  /** Field name for Formik — stores ISO string */
  name: string;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ name, ...props }) => {
  const [, meta, helpers] = useField(name);

  // DatePicker là React.memo — `new Date(...)` tạo object mới mỗi render dù meta.value
  // (chuỗi ISO) không đổi, làm memo luôn thấy value "khác" và fail. useMemo theo đúng
  // chuỗi ISO để giữ cùng 1 Date reference khi giá trị field không đổi.
  const value = useMemo(() => (meta.value ? new Date(meta.value) : undefined), [meta.value]);

  const handleChange = useCallback(
    (date: Date) => {
      helpers.setValue(date.toISOString());
      helpers.setTouched(true);
    },
    [helpers.setValue, helpers.setTouched]
  );

  return (
    <DatePicker
      {...props}
      value={value}
      onChange={handleChange}
      error={meta.error}
      touched={meta.touched}
    />
  );
};

export default DatePickerField;
