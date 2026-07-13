import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, sizes } from '../../theme';

export interface ButtonProps {
  text: string;
  onPress: () => void;
  /** primary: filled | outline: bordered | text: no background */
  type?: 'primary' | 'outline' | 'text';
  disabled?: boolean;
  loading?: boolean;
  /** Custom background/text color (overrides type color) */
  color?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
  text,
  onPress,
  type = 'primary',
  disabled,
  loading,
  color,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const isPrimary = type === 'primary';
  const isOutline = type === 'outline';

  const bgColor = isPrimary ? (color ?? colors.secondary) : 'transparent';
  const borderColor = isOutline ? (color ?? colors.secondary) : 'transparent';
  const textColor = isPrimary ? colors.white : color ?? colors.secondary;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: bgColor, borderColor, borderWidth: isOutline ? 1 : 0 },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.text, { color: textColor }, textStyle]}>{text}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: sizes.buttonHeight,
    borderRadius: sizes.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: sizes.padding,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: sizes.fontSize.button,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;
