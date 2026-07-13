import React, { useState } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import RNDatePicker from 'react-native-date-picker';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, sizes } from '../../theme';

const pad = (n: number) => String(n).padStart(2, '0');

const formatDate = (date: Date, mode: DatePickerMode): string => {
  if (mode === 'time') return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const d = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  if (mode === 'datetime') return `${pad(date.getHours())}:${pad(date.getMinutes())} ${d}`;
  return d;
};

type DatePickerMode = 'date' | 'time' | 'datetime';

export interface DatePickerProps {
  label?: string;
  isRequired?: boolean;
  disabled?: boolean;
  noError?: boolean;
  placeholder?: string;
  mode?: DatePickerMode;
  value?: Date;
  onChange?: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  showClearButton?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  error?: string;
  touched?: boolean;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  locale?: string;
}

const DatePicker: React.FC<DatePickerProps> = (props) => {
  const {
    label, isRequired, disabled, noError, placeholder, mode = 'date',
    value, onChange, minimumDate, maximumDate, showClearButton,
    style, labelStyle, error, touched, title,
    confirmText = 'Xác nhận', cancelText = 'Hủy', locale = 'vi',
  } = props;

  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const labelColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.blackGray, colors.secondary],
  });

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (mode === 'time') return 'Chọn giờ';
    if (mode === 'datetime') return 'Chọn ngày giờ';
    return 'Chọn ngày';
  };

  const hasError = touched && !!error;
  const hasValue = !!value;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Animated.Text style={[styles.label, { color: labelColor }, labelStyle]}>
          {label}{isRequired && <Text style={styles.required}> *</Text>}
        </Animated.Text>
      )}

      <TouchableOpacity
        style={[
          styles.field,
          { borderColor: isFocused ? colors.secondary : colors.darkGray },
          hasError && styles.fieldError,
          disabled && styles.disabled,
        ]}
        onPress={() => { if (!disabled) { setIsFocused(true); setOpen(true); } }}
        activeOpacity={0.7}
      >
        <Text style={[styles.valueText, !hasValue && styles.placeholder]} numberOfLines={1}>
          {hasValue ? formatDate(value!, mode) : getPlaceholder()}
        </Text>

        {showClearButton && hasValue && !disabled && (
          <TouchableOpacity style={styles.iconButton} onPress={() => onChange?.(undefined!)}>
            <View style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </View>
          </TouchableOpacity>
        )}

        <IconMaterial
          name={mode === 'time' ? 'clock-outline' : 'calendar-outline'}
          size={sizes.iconSm}
          color={disabled ? colors.gray : colors.blackGray}
        />
      </TouchableOpacity>

      {!noError && hasError && <Text style={styles.errorText}>{error}</Text>}

      <RNDatePicker
        modal
        open={open}
        date={value ?? new Date()}
        mode={mode}
        onConfirm={(date) => { setOpen(false); setIsFocused(false); onChange?.(date); }}
        onCancel={() => { setOpen(false); setIsFocused(false); }}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        title={title ?? label ?? null}
        confirmText={confirmText}
        cancelText={cancelText}
        locale={locale}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: sizes.spacing },
  disabled: { opacity: 0.5 },
  label: { fontSize: sizes.fontSize.label, fontWeight: '700', marginBottom: 5 },
  required: { color: colors.red },
  field: {
    height: sizes.inputHeight,
    borderWidth: 1,
    borderRadius: sizes.borderRadius,
    paddingHorizontal: sizes.inputPadding,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldError: { borderColor: colors.red },
  valueText: { flex: 1, fontSize: sizes.fontSize.input, color: colors.black },
  placeholder: { color: colors.gray },
  iconButton: { padding: 4, marginRight: 4 },
  clearButton: {
    width: sizes.clearButtonSize,
    height: sizes.clearButtonSize,
    borderRadius: sizes.clearButtonSize / 2,
    backgroundColor: colors.darkGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: { color: colors.white, fontSize: sizes.fontSize.small, fontWeight: 'bold' },
  errorText: { color: colors.red, fontSize: sizes.fontSize.error, marginTop: 4 },
});

export default DatePicker;
