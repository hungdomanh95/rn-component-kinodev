import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, sizes } from "../../theme";

const formatMoney = (value: string): string => {
  if (!value) return "";
  const numericValue = String(value).replace(/\D/g, "");
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatNumber = (value: string): string => {
  if (!value) return "";
  return String(value).replace(/[^0-9]/g, "");
};

export interface InputProps extends TextInputProps {
  label?: string;
  isRequired?: boolean;
  disabled?: boolean;
  noError?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  typeValue?: "money" | "number";
  showClearButton?: boolean;
  autoFocus?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  suffix?: string;
  hint?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  accentColor?: string;
}

const Input: React.FC<InputProps> = (props) => {
  const {
    label, isRequired, disabled, noError, style, labelStyle, inputStyle,
    placeholder, multiline, numberOfLines = 1, typeValue, showClearButton = true,
    secureTextEntry, autoFocus, leftIcon, rightIcon, suffix, hint,
    value = "", onChangeText, onBlur, error, touched, accentColor, ...inputProps
  } = props;

  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (autoFocus) {
      const timer = requestAnimationFrame(() => { inputRef.current?.focus(); });
      return () => cancelAnimationFrame(timer);
    }
  }, [autoFocus]);

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const labelColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.blackGray, accentColor ?? colors.secondary],
  });

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => { setIsFocused(false); onBlur?.(); }, [onBlur]);

  const handleChange = useCallback((text: string) => {
    if (typeValue === "money" || typeValue === "number") {
      onChangeText?.(text.replace(/\D/g, ""));
    } else {
      onChangeText?.(text);
    }
  }, [typeValue, onChangeText]);

  const displayValue = useMemo((): string => {
    switch (typeValue) {
      case "money": return formatMoney(value);
      case "number": return formatNumber(value);
      default: return value;
    }
  }, [value, typeValue]);

  const hasError = touched && !!error;
  const inputHeight = multiline ? sizes.inputHeight * numberOfLines : sizes.inputHeight;
  const hasValue = !!value && value.length > 0;

  return (
    <View style={[styles.container, style, disabled && styles.disabled]}>
      {label && (
        <View style={styles.labelRow}>
          <Animated.Text style={[styles.label, { color: labelColor }, labelStyle]}>
            {label}
            {isRequired && <Text style={styles.required}> *</Text>}
          </Animated.Text>
          {hint && <Text style={styles.hint}>{hint}</Text>}
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          { borderColor: isFocused ? (accentColor ?? colors.secondary) : colors.darkGray, height: inputHeight, alignItems: multiline ? "flex-start" : "center" },
          hasError && styles.inputError,
        ]}
        pointerEvents={disabled ? "none" : "auto"}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          {...inputProps}
          ref={inputRef}
          style={[styles.input, multiline && { textAlignVertical: "top", paddingTop: sizes.inputPadding }, inputStyle]}
          value={displayValue}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || `Nhập ${label || ""}`}
          placeholderTextColor={colors.gray}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={typeValue === "money" ? "numeric" : typeValue === "number" ? "number-pad" : inputProps.keyboardType}
        />

        {suffix && <Text style={styles.suffix}>{suffix}</Text>}

        {showClearButton && hasValue && !disabled && (
          <TouchableOpacity
            style={[styles.iconButton, multiline && styles.iconButtonMultiline]}
            onPress={() => onChangeText?.("")}
          >
            <View style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </View>
          </TouchableOpacity>
        )}

        {secureTextEntry && (
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <IconMaterial
              name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
              size={sizes.iconMd}
              color={colors.gray}
            />
          </TouchableOpacity>
        )}

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {!noError && hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: sizes.spacing,
  },
  disabled: {
    opacity: 0.5,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  label: {
    fontSize: sizes.fontSize.label,
    fontWeight: "700",
  },
  hint: {
    fontSize: sizes.fontSize.error,
    color: colors.gray,
  },
  required: {
    color: colors.red,
  },
  inputContainer: {
    height: sizes.inputHeight,
    borderWidth: 1,
    borderRadius: sizes.borderRadius,
    paddingHorizontal: sizes.inputPadding,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
  },
  inputError: {
    borderColor: colors.red,
  },
  input: {
    flex: 1,
    fontSize: sizes.fontSize.input,
    color: colors.black,
    height: "100%",
  },
  errorText: {
    color: colors.red,
    fontSize: sizes.fontSize.error,
    marginTop: 4,
  },
  iconButton: {
    paddingLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonMultiline: {
    alignSelf: "flex-start",
    paddingTop: sizes.inputPadding,
  },
  clearButton: {
    width: sizes.clearButtonSize,
    height: sizes.clearButtonSize,
    borderRadius: sizes.clearButtonSize / 2,
    backgroundColor: colors.gray,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    color: colors.white,
    fontSize: sizes.fontSize.small,
    fontWeight: "bold",
  },
  leftIcon: {
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIcon: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  suffix: {
    fontSize: sizes.fontSize.input,
    color: colors.gray,
    marginLeft: 4,
  },
});

export default React.memo(Input);
