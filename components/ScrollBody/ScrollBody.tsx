import React, { useRef, useEffect, useCallback, useState } from 'react';
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

type ScrollBodyProps = {
  children: React.ReactNode;
  scrollRef?: React.MutableRefObject<any> | ((ref: any) => void);
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

const KEYBOARD_GAP = 50;

const ScrollBody: React.FC<ScrollBodyProps> = ({
  children,
  scrollRef,
  style,
  contentContainerStyle,
}: ScrollBodyProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const preKeyboardOffsetRef = useRef(0);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paddingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredRef = useRef(false);
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (frames: { endCoordinates: { screenY: number; height: number; width: number } }) => {
        preKeyboardOffsetRef.current = scrollOffsetRef.current;
        restoredRef.current = false;

        // Cancel any pending padding removal, then add bottom padding equal
        // to keyboard height so content is always tall enough to scroll any
        // field above the keyboard.
        if (paddingTimerRef.current) clearTimeout(paddingTimerRef.current);
        setKeyboardPadding(frames.endCoordinates.height);

        const doScroll = (delay: number) => {
          if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = setTimeout(() => {
            const input = TextInput.State.currentlyFocusedInput?.();
            if (!input) return;

            input.measureInWindow((_x: number, y: number, _w: number, h: number) => {
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
        if (!restoredRef.current) {
          restoredRef.current = true;
          scrollViewRef.current?.scrollTo({ y: preKeyboardOffsetRef.current, animated: true });
        }
        // Remove padding only after scroll animation completes. Removing it
        // immediately while scroll is in progress causes iOS to clamp the
        // scroll offset to the new max_scroll (content shrinks mid-animation).
        if (paddingTimerRef.current) clearTimeout(paddingTimerRef.current);
        paddingTimerRef.current = setTimeout(() => setKeyboardPadding(0), 350);
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

  const handleDismissPress = useCallback(() => {
    Keyboard.dismiss();
    if (restoredRef.current) return;
    restoredRef.current = true;
    scrollViewRef.current?.scrollTo({ y: preKeyboardOffsetRef.current, animated: true });
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
    >
      <TouchableWithoutFeedback onPress={handleDismissPress} accessible={false}>
        <View>
          {children}
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

export default ScrollBody;
