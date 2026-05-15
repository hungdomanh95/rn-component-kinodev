import { useField } from 'formik';
import React from 'react';
import Toggle, { ToggleProps } from './Toggle';

interface ToggleFieldProps extends Omit<ToggleProps, 'value' | 'onChange'> {
  /** Field name for Formik */
  name: string;
}

const ToggleField: React.FC<ToggleFieldProps> = ({ name, ...props }: ToggleFieldProps) => {
  const [, meta, helpers] = useField(name);

  return (
    <Toggle
      {...props}
      value={!!meta.value}
      onChange={(val: boolean) => helpers.setValue(val)}
    />
  );
};

export default ToggleField;
