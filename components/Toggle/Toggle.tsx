import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors, sizes } from '../../theme';

const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 26;
const THUMB_SIZE = 20;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - 4; // 4 = 2px padding each side

export interface ToggleProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

const Toggle: React.FC<ToggleProps> = ({ value = false, onChange, label, description, disabled, style, testID, accessibilityLabel }: ToggleProps) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.darkGray, colors.secondary],
  });

  const thumbX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, THUMB_TRAVEL + 2],
  });

  const handlePress = () => {
    if (!disabled) onChange?.(!value);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style, disabled && styles.disabled]}
      activeOpacity={0.8}
      onPress={handlePress}
      testID={testID}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked: value, disabled }}
    >
      {(label || description) && (
        <View style={styles.labelWrapper}>
          {label && <Text style={styles.label}>{label}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      )}
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX: thumbX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sizes.spacing,
    minHeight: sizes.inputHeight,
    borderColor: colors.darkGray,
    borderRadius: sizes.borderRadius,
    paddingHorizontal: sizes.inputPadding,
    backgroundColor: colors.white,
  },
  disabled: { opacity: 0.5 },
  labelWrapper: { flex: 1, marginRight: 8 },
  label: { fontSize: sizes.fontSize.input, color: colors.blackGray, fontWeight: '500' },
  description: { fontSize: sizes.fontSize.error, color: colors.gray, marginTop: 2 },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default Toggle;
