import { useField } from 'formik';
import React from 'react';
import Toggle, { ToggleProps } from './Toggle';

interface ToggleFieldProps extends Omit<ToggleProps, 'value' | 'onChange'> {
  /** Field name for Formik */
  name: string;
}

const ToggleField: React.FC<ToggleFieldProps> = ({ name, testID, ...props }) => {
  const [, meta, helpers] = useField(name);

  return (
    <Toggle
      {...props}
      testID={testID ?? name}
      value={!!meta.value}
      onChange={(val) => helpers.setValue(val)}
    />
  );
};

export default ToggleField;
