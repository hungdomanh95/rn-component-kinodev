import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, Modal as RNModal, NativeSyntheticEvent, NativeScrollEvent, Platform, ScrollView, StyleProp, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const KEYBOARD_GAP = 40;

import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, sizes } from '../../theme';
import Button from '../Button/Button';

type ModalType = 'info' | 'success' | 'warning' | 'error';

const TYPE_CONFIG: Record<ModalType, { icon: string; color: string }> = {
  info:    { icon: 'information',  color: colors.primary },
  success: { icon: 'check-circle', color: '#4CAF50' },
  warning: { icon: 'alert',        color: colors.secondary },
  error:   { icon: 'alert-circle', color: colors.red },
};

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  type?: ModalType;
  children?: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  footer?: React.ReactNode;
  scrollable?: boolean;
  maxHeight?: number | `${number}%`;
  disableBackdropClose?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Modal: React.FC<ModalProps> = ({
  visible, onClose, title, type, children,
  onConfirm, onCancel, showCancel = true,
  confirmText = 'Xác nhận', cancelText = 'Huỷ',
  footer, scrollable = false, maxHeight = SCREEN_HEIGHT * 0.80,
  disableBackdropClose, style,
}) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const pendingScrollRef = useRef<(() => void) | null>(null);

  const updateScrollOffset = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
  };

  useEffect(() => {
    if (!scrollable || !visible) return;

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (frames) => {
        const keyboardTop = frames.endCoordinates.screenY;
        const keyboardHeight = frames.endCoordinates.height;

        pendingScrollRef.current = () => {
          const input = TextInput.State.currentlyFocusedInput?.();
          if (!input) return;
          input.measureInWindow((_x: number, y: number, _w: number, h: number) => {
            const gap = keyboardTop - (y + h);
            if (gap >= KEYBOARD_GAP) return;
            scrollRef.current?.scrollTo({ y: scrollOffsetRef.current + (KEYBOARD_GAP - gap), animated: true });
          });
        };

        setSpacerHeight(keyboardHeight + KEYBOARD_GAP);
      },
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        pendingScrollRef.current = null;
        setSpacerHeight(0);
      },
    );

    return () => { showSub.remove(); hideSub.remove(); };
  }, [scrollable, visible]);

  const handleCancel = () => { onCancel?.(); onClose(); };

  const handleConfirm = async () => {
    if (!onConfirm) return;
    const result = onConfirm();
    if (result instanceof Promise) {
      setConfirmLoading(true);
      try { await result; onClose(); } finally { setConfirmLoading(false); }
    } else {
      onClose();
    }
  };

  const typeConfig = type ? TYPE_CONFIG[type] : null;

  const renderFooter = () => {
    if (footer !== undefined) return <View style={styles.footer}>{footer}</View>;
    if (!onConfirm) return null;
    return (
      <View style={styles.footer}>
        {showCancel && (
          <Button text={cancelText} type="outline" onPress={handleCancel}
            disabled={confirmLoading} style={styles.footerBtn} />
        )}
        <Button text={confirmText} onPress={handleConfirm}
          loading={confirmLoading}
          color={type === 'error' ? colors.red : undefined}
          style={styles.footerBtn} />
      </View>
    );
  };

  const contentNode = children ? (
    scrollable
      ? (
        <ScrollView
          ref={scrollRef}
          style={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={updateScrollOffset}
          scrollEventThrottle={16}
          onScrollEndDrag={updateScrollOffset}
          onMomentumScrollEnd={updateScrollOffset}
        >
          <View style={styles.scrollInner}>
            {children}
            <View
              style={{ height: spacerHeight }}
              onLayout={() => {
                if (pendingScrollRef.current) {
                  pendingScrollRef.current();
                  pendingScrollRef.current = null;
                }
              }}
            />
          </View>
        </ScrollView>
      )
      : <View style={styles.content}>{children}</View>
  ) : null;

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={(!disableBackdropClose && !confirmLoading) ? onClose : undefined}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.wrapper} pointerEvents="box-none">
        <View style={[styles.container, { maxHeight }, style]}>
          <View style={styles.header}>
            {typeConfig && (
              <IconMaterial name={typeConfig.icon} size={sizes.iconMd} color={typeConfig.color} style={styles.typeIcon} />
            )}
            <Text style={styles.title}>{title ?? 'Thông báo'}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <IconMaterial name="close" size={sizes.iconMd} color={colors.blackGray} />
            </TouchableOpacity>
          </View>

          {contentNode}

          {renderFooter()}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  wrapper: { flex: 1, justifyContent: 'center', paddingHorizontal: sizes.padding * 1.5 } as any,
  container: { backgroundColor: colors.white, borderRadius: sizes.borderRadius, overflow: 'hidden' },
  scrollContent: { flexShrink: 1 },
  scrollInner: { padding: sizes.padding },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.padding,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  typeIcon: { marginRight: 8 },
  title: { fontSize: sizes.fontSize.title, fontWeight: '700', color: colors.black, flex: 1 },
  content: { padding: sizes.padding },
  footer: {
    flexDirection: 'row',
    gap: sizes.spacing,
    padding: sizes.padding,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  footerBtn: { flex: 1 },
});

export default Modal;
