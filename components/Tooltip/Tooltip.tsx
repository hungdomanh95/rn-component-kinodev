import React, { useRef, useState } from "react";
import {
  Dimensions,
  findNodeHandle,
  LayoutRectangle,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, sizes } from "../../theme";

interface TooltipProps {
  children: React.ReactNode;
  tooltipText: string;
  tooltipWidth?: number;
  tooltipBackground?: string;
  arrowSize?: number;
  borderRadius?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  tooltipText,
  tooltipBackground = '#FEF9F6',
  arrowSize = 8,
  borderRadius = 8,
}) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<LayoutRectangle>({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = useRef<TouchableOpacity>(null);
  const [tooltipHeight, setTooltipHeight] = useState(40);
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const showTooltip = () => {
    const handle = findNodeHandle(buttonRef.current);
    if (handle) {
      UIManager.measureInWindow(handle, (x: number, y: number, width: number, height: number) => {
        setPosition({ x, y, width, height });
        setVisible(true);
      });
    }
  };

  const hideTooltip = () => {
    setVisible(false);
  };

  const { x, y, width, height } = position;
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const padding = sizes.spacing;

  let tooltipX: number;

  tooltipX = x + width / 2 - tooltipWidth / 2;

  if (tooltipX < padding) {
    tooltipX = padding;
  } else if (tooltipX + tooltipWidth > screenWidth - padding) {
    tooltipX = screenWidth - tooltipWidth - padding;
  }

  let tooltipY = y + height + arrowSize;
  let showAbove = false;

  // Kiểm tra nếu không còn đủ chỗ phía dưới → chuyển lên trên
  if (tooltipY + tooltipHeight > screenHeight - padding) {
    tooltipY = y - arrowSize - tooltipHeight;
    showAbove = true;
  }

  // Tính toán vị trí mũi tên
  const arrowX = x + width / 2 - arrowSize;
  const arrowStyle = {
    position: 'absolute' as const,
    top: showAbove ? tooltipY + tooltipHeight : tooltipY - arrowSize,
    left: arrowX,
    width: 0,
    height: 0,
    borderLeftWidth: arrowSize,
    borderRightWidth: arrowSize,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',

    borderTopWidth: showAbove ? arrowSize : 0,
    borderTopColor: showAbove ? tooltipBackground : 'transparent',
    borderBottomWidth: showAbove ? 0 : arrowSize,
    borderBottomColor: showAbove ? 'transparent' : tooltipBackground,
  };

  return (
    <>
      <TouchableOpacity ref={buttonRef} onPress={showTooltip} >
        {children}
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade" onRequestClose={hideTooltip}>
        <Pressable style={styles.overlay} onPress={hideTooltip}>
          <View style={StyleSheet.absoluteFill}>
            <View style={arrowStyle} />
            <View
              onLayout={(e) => {
                setTooltipHeight(e.nativeEvent.layout.height)
                setTooltipWidth(e.nativeEvent.layout.width)
              }}
              style={[
                styles.tooltip,
                {
                  top: tooltipY,
                  left: tooltipX,
                  backgroundColor: tooltipBackground,
                  borderRadius,
                  maxWidth: sizes.screenWidth - 2 * sizes.spacing,
                },
              ]}
            >
              <View style={styles.header}>
                <IconMaterial name="information" size={16} color={colors.secondary} />
                <Text style={styles.headerText}>
                  Lưu ý:
                </Text>
              </View>
              <Text style={styles.text}>{tooltipText}</Text>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tooltip: {
    position: 'absolute',
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerText: {
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 12,
  },
  text: {
    marginTop: sizes.spacing,
    fontSize: 12,
    lineHeight: 20,
  }
});

export default Tooltip;
