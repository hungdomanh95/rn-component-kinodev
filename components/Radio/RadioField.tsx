import { useField } from 'formik';
import React from 'react';
import Radio, { RadioProps } from './Radio';

interface RadioFieldProps extends Omit<RadioProps, 'value' | 'onChange' | 'error' | 'touched'> {
  /** Field name for Formik */
  name: string;
}

const RadioField: React.FC<RadioFieldProps> = ({ name, ...props }: RadioFieldProps) => {
  const [, meta, helpers] = useField(name);

  return (
    <Radio
      {...props}
      value={meta.value}
      onChange={(val: string | number | boolean) => {
        helpers.setValue(val);
        helpers.setTouched(true, false);
      }}
      error={meta.error}
      touched={meta.touched}
    />
  );
};

export default RadioField;
