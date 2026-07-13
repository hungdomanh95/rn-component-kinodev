import { useField } from "formik";
import React from "react";
import Select, { SelectOption, SelectProps } from "./Select";

interface SelectFieldProps extends Omit<SelectProps, "value" | "onBlur" | "error" | "touched"> {
  /** Field name for Formik */
  name: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ name, onValueChange, ...props }) => {
  const [, meta, helpers] = useField(name);

  return (
    <Select
      {...props}
      value={meta.value}
      onValueChange={(value, option) => {
        helpers.setValue(value);
        onValueChange?.(value, option);
      }}
      onBlur={() => helpers.setTouched(true)}
      error={meta.error}
      touched={meta.touched}
    />
  );
};

export type { SelectOption };
export default SelectField;
