import { useField } from 'formik';
import React from 'react';
import Checkbox, { CheckboxProps } from './Checkbox';

interface CheckboxFieldProps extends Omit<CheckboxProps, 'value' | 'onChange' | 'error' | 'touched'> {
  /** Field name for Formik */
  name: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ name, ...props }: CheckboxFieldProps) => {
  const [, meta, helpers] = useField(name);

  return (
    <Checkbox
      {...props}
      value={!!meta.value}
      onChange={(val: boolean) => {
        helpers.setValue(val);
        helpers.setTouched(true);
      }}
      error={meta.error}
      touched={meta.touched}
    />
  );
};

export default CheckboxField;
