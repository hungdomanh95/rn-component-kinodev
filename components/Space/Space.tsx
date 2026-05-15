import React from 'react';
import { View } from 'react-native';

export interface SpaceProps {
  /** Size preset or custom number (px) */
  size?: 'small' | 'middle' | 'large' | number;
  /** Direction */
  direction?: 'vertical' | 'horizontal';
}

const SIZE_MAP = {
  small: 8,
  middle: 12,
  large: 24,
} as const;

const Space: React.FC<SpaceProps> = ({
  size = 'middle',
  direction = 'vertical',
}) => {
  const px =
    typeof size === 'number'
      ? size
      : SIZE_MAP[size as keyof typeof SIZE_MAP];

  return (
    <View
      style={
        direction === 'horizontal'
          ? { width: px }
          : { height: px }
      }
    />
  );
};

export default Space;
