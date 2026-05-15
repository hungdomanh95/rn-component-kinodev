import { useField } from "formik";
import React, { useEffect } from "react";
import Input, { InputProps } from "./Input";

interface InputFieldProps extends Omit<InputProps, "value" | "onChangeText" | "onBlur" | "error" | "touched"> {
  /** Field name for Formik */
  name: string;
  /** Default value (will be set on mount if field is empty) */
  defaultValue?: string;
}

const InputField: React.FC<InputFieldProps> = ({ name, defaultValue, ...props }: InputFieldProps) => {
  const [, meta, helpers] = useField(name);

  useEffect(() => {
    if (defaultValue !== undefined && !meta.value) {
      helpers.setValue(defaultValue);
    }
  }, []);

  return (
    <Input
      {...props}
      value={meta.value || ""}
      onChangeText={helpers.setValue}
      onBlur={() => helpers.setTouched(true)}
      error={meta.error}
      touched={meta.touched}
    />
  );
};

export default InputField;
