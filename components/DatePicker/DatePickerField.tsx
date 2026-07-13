import { useField } from 'formik';
import React from 'react';
import DatePicker, { DatePickerProps } from './DatePicker';

interface DatePickerFieldProps extends Omit<DatePickerProps, 'value' | 'onChange' | 'error' | 'touched'> {
  /** Field name for Formik — stores ISO string */
  name: string;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ name, ...props }) => {
  const [, meta, helpers] = useField(name);

  const value = meta.value ? new Date(meta.value) : undefined;

  return (
    <DatePicker
      {...props}
      value={value}
      onChange={(date) => {
        helpers.setValue(date.toISOString());
        helpers.setTouched(true);
      }}
      error={meta.error}
      touched={meta.touched}
    />
  );
};

export default DatePickerField;
