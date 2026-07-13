import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, sizes } from '../../theme';

export interface CheckboxProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  noError?: boolean;
  error?: string;
  touched?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Checkbox: React.FC<CheckboxProps> = ({ value = false, onChange, label, description, disabled, noError, error, touched, style }) => {
  const hasError = touched && !!error;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.row, disabled && styles.disabled]}
        onPress={() => !disabled && onChange?.(!value)}
        activeOpacity={0.7}
      >
        <View style={[styles.box, value && styles.boxChecked, hasError && styles.boxError]}>
          {value && <IconMaterial name="check" size={14} color={colors.white} />}
        </View>
        {(label || description) && (
          <View style={styles.labelWrapper}>
            {label && <Text style={styles.label}>{label}</Text>}
            {description && <Text style={styles.description}>{description}</Text>}
          </View>
        )}
      </TouchableOpacity>
      {!noError && hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: sizes.spacing },
  disabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  box: {
    width: sizes.checkboxSize,
    height: sizes.checkboxSize,
    borderWidth: 2,
    borderColor: colors.darkGray,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  boxChecked: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  boxError: { borderColor: colors.red },
  labelWrapper: { flex: 1, marginLeft: 10 },
  label: { fontSize: sizes.fontSize.input, color: colors.blackGray, fontWeight: '500' },
  description: { fontSize: sizes.fontSize.error, color: colors.gray, marginTop: 2 },
  errorText: { color: colors.red, fontSize: sizes.fontSize.error, marginTop: 4, marginLeft: sizes.checkboxSize + 10 },
});

export default Checkbox;
