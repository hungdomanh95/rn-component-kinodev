import { FormikContext, getIn } from 'formik';
import React, { useRef, useEffect, useCallback, useContext, useMemo, useState } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { FieldRegistryContext } from './fieldRegistry';

type ScrollBodyProps = {
  children: React.ReactNode;
  scrollRef?: React.MutableRefObject<any> | ((ref: any) => void);
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement;
};

const KEYBOARD_GAP = 50;
const TOP_INSET = 16;

const ScrollBody: React.FC<ScrollBodyProps> = ({
  children,
  scrollRef,
  style,
  contentContainerStyle,
  refreshControl,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const containerWindowYRef = useRef(0);
  const contentHeightRef = useRef(0);
  const layoutHeightRef = useRef(0);
  const focusedFieldContentYRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paddingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardPaddingRef = useRef(0);
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  const applyKeyboardPadding = (value: number) => {
    keyboardPaddingRef.current = value;
    setKeyboardPadding(value);
  };

  const fieldsRef = useRef(new Map<string, View>());
  const fieldRegistry = useMemo(() => ({
    register: (name: string, view: View | null) => {
      if (view) fieldsRef.current.set(name, view);
      else fieldsRef.current.delete(name);
    },
  }), []);

  // Dùng useContext thay vì useFormikContext: ScrollBody cũng dùng ngoài Formik, khi đó
  // context là undefined, còn useFormikContext sẽ log warning.
  const formik = useContext(FormikContext);
  const submitCount = formik?.submitCount ?? 0;
  const isSubmitting = formik?.isSubmitting ?? false;

  // Formik validate xong mới hạ isSubmitting về false, nên lúc này errors đã là kết quả
  // của lần submit vừa rồi.
  useEffect(() => {
    if (!formik || submitCount === 0 || isSubmitting) return;
    const erroredViews = [...fieldsRef.current]
      .filter(([name]) => getIn(formik.errors, name))
      .map(([, view]) => view);
    if (erroredViews.length === 0) return;

    let pending = erroredViews.length;
    let firstY = Infinity;
    erroredViews.forEach((view) => {
      view.measureInWindow((_x: number, y: number) => {
        firstY = Math.min(firstY, scrollOffsetRef.current + (y - containerWindowYRef.current));
        pending -= 1;
        if (pending > 0) return;
        const realContentHeight = contentHeightRef.current - keyboardPaddingRef.current;
        const maxScroll = Math.max(0, realContentHeight - layoutHeightRef.current);
        scrollViewRef.current?.scrollTo({ y: Math.max(0, Math.min(firstY - TOP_INSET, maxScroll)), animated: true });
      });
    });
  }, [submitCount, isSubmitting]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (frames) => {
        // Cancel any pending padding removal, then add bottom padding equal
        // to keyboard height so content is always tall enough to scroll any
        // field above the keyboard.
        if (paddingTimerRef.current) clearTimeout(paddingTimerRef.current);
        applyKeyboardPadding(frames.endCoordinates.height);

        const doScroll = (delay: number) => {
          if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = setTimeout(() => {
            const input = TextInput.State.currentlyFocusedInput?.();
            if (!input) return;

            input.measureInWindow((_x: number, y: number, _w: number, h: number) => {
              // Lưu content-offset (không phải window-offset) của field đang
              // focus để dùng lúc ẩn bàn phím — window-offset đổi theo mỗi lần
              // cuộn nên không dùng trực tiếp được.
              focusedFieldContentYRef.current = scrollOffsetRef.current + (y - containerWindowYRef.current);

              const keyboardTop = frames.endCoordinates.screenY;
              const gap = keyboardTop - (y + h);
              if (gap >= KEYBOARD_GAP) return;

              const delta = KEYBOARD_GAP - gap;
              scrollViewRef.current?.scrollTo({ y: scrollOffsetRef.current + delta, animated: true });
            });
          }, delay);
        };

        doScroll(Platform.OS === 'android' ? 100 : 350);
      },
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        // Không cuộn về đúng vị trí trước khi focus — với field không nằm ở
        // cuối content, làm vậy sẽ che luôn field kế tiếp, buộc user phải tự
        // cuộn lại. Thay vào đó, ghim field vừa nhập lên sát mép trên, lộ ra
        // phần nội dung phía sau nó. Giới hạn bằng max-scroll thật (KHÔNG tính
        // phần đệm bù bàn phím — đệm chỉ mất đi sau 350ms nữa, nếu tính cả vào
        // sẽ bị ScrollView tự kẹp lại ngay khi đệm biến mất, tạo giật 2 nhịp).
        if (focusedFieldContentYRef.current != null) {
          const realContentHeight = contentHeightRef.current - keyboardPaddingRef.current;
          const maxScroll = Math.max(0, realContentHeight - layoutHeightRef.current);
          const target = Math.min(focusedFieldContentYRef.current - TOP_INSET, maxScroll);
          scrollViewRef.current?.scrollTo({ y: Math.max(0, target), animated: true });
          focusedFieldContentYRef.current = null;
        }

        // Remove padding only after scroll animation completes. Removing it
        // immediately while scroll is in progress causes iOS to clamp the
        // scroll offset to the new max_scroll (content shrinks mid-animation).
        if (paddingTimerRef.current) clearTimeout(paddingTimerRef.current);
        paddingTimerRef.current = setTimeout(() => applyKeyboardPadding(0), 350);
      },
    );

    return () => {
      showSub.remove();
      hideSub.remove();
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      if (paddingTimerRef.current) clearTimeout(paddingTimerRef.current);
    };
  }, []);

  const handleScrollRef = useCallback(
    (node: any) => {
      (scrollViewRef as React.MutableRefObject<any>).current = node;
      if (!scrollRef) return;
      if (typeof scrollRef === 'function') scrollRef(node);
      else scrollRef.current = node;
    },
    [scrollRef],
  );

  const handleScroll = useCallback((e: any) => {
    scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
  }, []);

  const handleLayout = useCallback((e: any) => {
    layoutHeightRef.current = e.nativeEvent.layout.height;
    (scrollViewRef.current as any)?.measureInWindow((_x: number, y: number) => {
      containerWindowYRef.current = y;
    });
  }, []);

  const handleContentSizeChange = useCallback((_w: number, h: number) => {
    contentHeightRef.current = h;
  }, []);

  const handleDismissPress = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  return (
    <ScrollView
      ref={handleScrollRef}
      style={[{ flex: 1 }, style]}
      contentContainerStyle={[contentContainerStyle, keyboardPadding > 0 && { paddingBottom: keyboardPadding }]}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentInsetAdjustmentBehavior="never"
      onScroll={handleScroll}
      scrollEventThrottle={16}
      onLayout={handleLayout}
      onContentSizeChange={handleContentSizeChange}
      refreshControl={refreshControl}
    >
      <TouchableWithoutFeedback onPress={handleDismissPress} accessible={false}>
        <View>
          <FieldRegistryContext.Provider value={fieldRegistry}>
            {children}
          </FieldRegistryContext.Provider>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

export default ScrollBody;
