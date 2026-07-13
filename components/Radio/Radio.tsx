import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors, sizes } from '../../theme';

export interface RadioOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

export interface RadioProps {
  data: RadioOption[];
  value?: string | number | boolean;
  onChange?: (value: string | number | boolean) => void;
  label?: string;
  isRequired?: boolean;
  direction?: 'row' | 'column';
  disabled?: boolean;
  noError?: boolean;
  error?: string;
  touched?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accentColor?: string;
}

const Radio: React.FC<RadioProps> = ({ data, value, onChange, label, isRequired, direction = 'column', disabled, noError, error, touched, style, labelStyle, accentColor }) => {
  const hasError = touched && !!error;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}{isRequired && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={[styles.optionsWrapper, direction === 'row' && styles.optionsRow]}>
        {data.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;
          return (
            <TouchableOpacity
              key={String(option.value)}
              style={[styles.option, direction === 'row' && styles.optionRow, isDisabled && styles.disabled]}
              onPress={() => !isDisabled && onChange?.(option.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, isSelected && (accentColor ? { borderColor: accentColor } : styles.radioSelected), hasError && styles.radioError]}>
                {isSelected && <View style={[styles.radioDot, accentColor ? { backgroundColor: accentColor } : undefined]} />}
              </View>
              <Text style={[styles.optionLabel, isDisabled && styles.optionLabelDisabled]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {!noError && hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: sizes.spacing },
  label: { fontSize: sizes.fontSize.label, fontWeight: '700', color: colors.blackGray, marginBottom: 8 },
  required: { color: colors.red },
  optionsWrapper: { flexDirection: 'column', gap: 10 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  option: { flexDirection: 'row', alignItems: 'center' },
  optionRow: { marginRight: 0 },
  disabled: { opacity: 0.5 },
  radio: {
    width: sizes.radioSize,
    height: sizes.radioSize,
    borderRadius: sizes.radioSize / 2,
    borderWidth: 2,
    borderColor: colors.darkGray,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  radioSelected: { borderColor: colors.secondary },
  radioError: { borderColor: colors.red },
  radioDot: {
    width: sizes.radioSize / 2,
    height: sizes.radioSize / 2,
    borderRadius: sizes.radioSize / 4,
    backgroundColor: colors.secondary,
  },
  optionLabel: { fontSize: sizes.fontSize.input, color: colors.blackGray, marginLeft: 10 },
  optionLabelDisabled: { color: colors.gray },
  errorText: { color: colors.red, fontSize: sizes.fontSize.error, marginTop: 4 },
});

export default React.memo(Radio);
