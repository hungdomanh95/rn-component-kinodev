import React from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type IconName = 'calendar' | 'chevron-back' | 'chevron-forward' | 'x';

export type IconProps = {
  name: IconName;
  color?: string;
  size?: number;
};

// Icon nội bộ của thư viện, độc lập với bộ icon riêng của app host —
// chỉ cần đúng các tên icon mà component trong thư viện thực sự dùng tới.
const Icon: React.FC<IconProps> = ({ name, color, size }) => {
  switch (name) {
    case 'calendar':
      return <AntDesign name="calendar" size={size} color={color} />;
    case 'chevron-back':
      return <Ionicons name="chevron-back" size={size} color={color} />;
    case 'chevron-forward':
      return <Ionicons name="chevron-forward" size={size} color={color} />;
    case 'x':
      return <Feather name="x" size={size} color={color} />;
    default:
      return null;
  }
};

export default Icon;
