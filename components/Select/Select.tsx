import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Animated, Dimensions, Easing, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform,
  StyleProp, StyleSheet, Text, TextInput, TextStyle,
  TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle,
} from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, sizes } from "../../theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MODAL_SAFE_TOP = Platform.OS === 'ios' ? 54 : 30;
const MAX_KB_TRANSLATE = SCREEN_HEIGHT - SCREEN_HEIGHT * 0.45 - MODAL_SAFE_TOP;
// maxHeight tĩnh: đảm bảo modal không che search bar ngay cả khi keyboard mở
// SCREEN_HEIGHT - 350 ≈ SCREEN_HEIGHT - typical_kbHeight(291) - SAFE_TOP(54)
const MODAL_MAX_HEIGHT = Math.max(SCREEN_HEIGHT - 350, SCREEN_HEIGHT * 0.5);

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  data?: any;
  /** Optional group label. Consecutive options sharing the same group are rendered under one
   * filled section header band. Options without a group render as before. */
  group?: string;
}

type DisplayRow =
  | { kind: "header"; key: string; label: string }
  | { kind: "option"; key: string; option: SelectOption };

const GROUP_HEADER_HEIGHT = sizes.selectItemHeight;

const buildDisplayRows = (options: SelectOption[]): DisplayRow[] => {
  const rows: DisplayRow[] = [];
  let lastGroup: string | undefined;
  options.forEach((option, index) => {
    if (option.group && option.group !== lastGroup) {
      rows.push({ kind: "header", key: `header-${option.group}-${index}`, label: option.group });
    }
    lastGroup = option.group;
    rows.push({ kind: "option", key: String(option.value), option });
  });
  return rows;
};

export interface SelectProps {
  label?: string;
  isRequired?: boolean;
  disabled?: boolean;
  noError?: boolean;
  placeholder?: string;
  options: SelectOption[];
  searchable?: boolean;
  searchPlaceholder?: string;
  multiple?: boolean;
  showClearButton?: boolean;
  modalTitle?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  emptyText?: string;
  loading?: boolean;
  onOpen?: () => void;
  value?: string | number | (string | number)[];
  onValueChange?: (value: string | number | (string | number)[], option?: SelectOption | SelectOption[]) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  testID?: string;
}

const Select: React.FC<SelectProps> = (props) => {
  const {
    label, isRequired, disabled, noError,
    placeholder = "Chọn...", options: optionsProp,
    searchable = false, searchPlaceholder = "Tìm kiếm...",
    multiple = false, showClearButton = false,
    modalTitle, style, labelStyle, inputStyle,
    leftIcon, emptyText = "Không có dữ liệu",
    loading = false, onOpen,
    value, onValueChange, onBlur, error, touched, testID,
  } = props;

  // `options = []` mặc định khi destructure chỉ bắt được `undefined`, không bắt `null`.
  // Nhiều nơi truyền thẳng kết quả 1 hook/async config (vd useDataAppConfig) mà giá trị
  // ban đầu là `null` trước khi load xong — nếu không chuẩn hoá ở đây, buildDisplayRows
  // bên dưới sẽ crash ngay lần render đầu (options.forEach của null).
  const options = optionsProp ?? [];

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const isKeyboardVisibleRef = useRef(false);
  const isModalVisibleRef = useRef(false);
  const targetKbHeightRef = useRef(0);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const keyboardTranslateY = useRef(new Animated.Value(0)).current;
  // Fallback khi Animated.parallel(...).start(callback) không được gọi (đã verify thật: mở 1 Select
  // khác NGAY khi Select này đang chạy animation đóng có thể khiến callback không bao giờ chạy,
  // modal kẹt lại vĩnh viễn dù data phía dưới vẫn lưu đúng — xem closeModal bên dưới).
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasClosedRef = useRef(true);

  useEffect(() => {
    isModalVisibleRef.current = isModalVisible;
    if (!isModalVisible) {
      targetKbHeightRef.current = 0;
    }
  }, [isModalVisible]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        if (!isModalVisibleRef.current) return;
        const kbHeight = e.endCoordinates.height;
        if (targetKbHeightRef.current === kbHeight) return;
        targetKbHeightRef.current = kbHeight;
        isKeyboardVisibleRef.current = true;
        if (Platform.OS === 'android') {
          Animated.timing(keyboardTranslateY, {
            toValue: -Math.min(kbHeight, MAX_KB_TRANSLATE),
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        if (!isModalVisibleRef.current) return;
        if (targetKbHeightRef.current === 0) return;
        targetKbHeightRef.current = 0;
        isKeyboardVisibleRef.current = false;
        if (Platform.OS === 'android') {
          Animated.timing(keyboardTranslateY, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
        }
      }
    );
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  useEffect(() => {
    if (isModalVisible) {
      overlayOpacity.setValue(0);
      contentTranslateY.setValue(SCREEN_HEIGHT);
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(contentTranslateY, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [isModalVisible]);

  const labelColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.blackGray, colors.secondary],
  });

  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) return options;
    const lower = searchText.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lower));
  }, [options, searchText]);

  const displayRows: DisplayRow[] = useMemo(() => buildDisplayRows(filteredOptions), [filteredOptions]);

  const rowHeights: number[] = useMemo(
    () => displayRows.map((row: DisplayRow) =>
      row.kind === "header" ? GROUP_HEADER_HEIGHT : sizes.selectItemHeight
    ),
    [displayRows]
  );

  const rowOffsets: number[] = useMemo(() => {
    const offsets: number[] = [];
    let acc = 0;
    rowHeights.forEach((h: number) => { offsets.push(acc); acc += h; });
    return offsets;
  }, [rowHeights]);

  useEffect(() => {
    if (!isModalVisible || !value || !flatListRef.current) return;
    const timer = setTimeout(() => {
      const selectedValue = multiple ? (Array.isArray(value) ? value[0] : value) : value;
      const index = displayRows.findIndex((row) => row.kind === "option" && row.option.value === selectedValue);
      if (index > 2) flatListRef.current?.scrollToIndex({ animated: false, index: index - 2 });
    }, 100);
    return () => clearTimeout(timer);
  }, [isModalVisible]);

  const selectedOptions = useMemo((): SelectOption[] => {
    if (!value) return [];
    if (multiple) {
      const values = Array.isArray(value) ? value : [value];
      return options.filter((opt) => values.includes(opt.value));
    }
    const found = options.find((opt) => opt.value === value);
    return found ? [found] : [];
  }, [value, options, multiple]);

  const displayText = useMemo((): string => {
    if (selectedOptions.length === 0) return "";
    if (multiple) return selectedOptions.map((opt) => opt.label).join(", ");
    return selectedOptions[0]?.label || "";
  }, [selectedOptions, multiple]);

  const openModal = useCallback(() => {
    if (disabled) return;
    hasClosedRef.current = false;
    // Huỷ fallback timer còn sót từ lần đóng trước (nếu mở lại trong lúc timer đó vẫn đang chờ) —
    // không huỷ sẽ khiến timer cũ tự đóng nhầm modal vừa mở lại sau khi nó bắn.
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    Keyboard.dismiss();
    setIsFocused(true);
    setIsModalVisible(true);
    setSearchText("");
    onOpen?.();
  }, [disabled, onOpen]);

  const closeModal = useCallback(() => {
    Keyboard.dismiss();
    keyboardTranslateY.setValue(0);
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    const finishClose = () => {
      if (hasClosedRef.current) return;
      hasClosedRef.current = true;
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setIsModalVisible(false);
      setIsFocused(false);
      onBlur?.();
    };

    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(contentTranslateY, { toValue: SCREEN_HEIGHT, duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(finishClose);

    // An toàn: nếu callback trên không chạy (animation bị interrupt bởi 1 Select khác mở lên
    // ngay lập tức), ép đóng sau khi animation lẽ ra đã xong — chờ lâu hơn duration thật (200ms)
    // để không cắt animation bình thường giữa chừng.
    closeTimerRef.current = setTimeout(finishClose, 300);
  }, [onBlur]);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const handleOverlayPress = useCallback(() => {
    if (isKeyboardVisibleRef.current) Keyboard.dismiss();
    else closeModal();
  }, [closeModal]);

  const handleClear = useCallback(() => {
    onValueChange?.(multiple ? [] as any : "");
  }, [onValueChange, multiple]);

  const isOptionSelected = useCallback((option: SelectOption): boolean => {
    if (multiple) {
      const values = Array.isArray(value) ? value : [];
      return values.includes(option.value);
    }
    return value === option.value;
  }, [value, multiple]);

  const handleSelect = useCallback((option: SelectOption) => {
    if (option.disabled) return;
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.includes(option.value);
      const newValues: (string | number)[] = isSelected
        ? currentValues.filter((v) => v !== option.value)
        : [...currentValues, option.value];
      onValueChange?.(newValues, options.filter((opt) => newValues.includes(opt.value)));
    } else {
      onValueChange?.(option.value, option);
      closeModal();
    }
  }, [value, multiple, options, onValueChange, closeModal]);

  const hasError = touched && !!error;
  const hasValue = multiple ? Array.isArray(value) && value.length > 0 : !!value;

  const renderRow = useCallback(
    ({ item }: { item: DisplayRow }) => {
      if (item.kind === "header") {
        return (
          <View style={styles.groupHeader}>
            <View style={styles.groupHeaderAccent} />
            <Text style={styles.groupHeaderText}>{item.label}</Text>
          </View>
        );
      }

      const option = item.option;
      const selected = isOptionSelected(option);
      return (
        <TouchableOpacity
          style={[styles.optionItem, selected && styles.optionItemSelected, option.disabled && styles.optionItemDisabled]}
          onPress={() => handleSelect(option)}
          disabled={option.disabled}
          activeOpacity={0.6}
        >
          {multiple && (
            <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
              {selected && <IconMaterial name="check" size={14} color={colors.white} />}
            </View>
          )}
          <Text style={[styles.optionLabel, selected && styles.optionLabelSelected, option.disabled && styles.optionLabelDisabled]} numberOfLines={2}>
            {option.label}
          </Text>
          {!multiple && selected && <IconMaterial name="check" size={sizes.iconLg} color={colors.secondary} />}
        </TouchableOpacity>
      );
    },
    [isOptionSelected, handleSelect, multiple]
  );

  return (
    <View style={[styles.container, style, disabled && styles.disabled]}>
      {label && (
        <Animated.Text style={[styles.label, { color: labelColor }, labelStyle]}>
          {label}{isRequired && <Text style={styles.required}> *</Text>}
        </Animated.Text>
      )}

      <TouchableOpacity
        testID={testID}
        style={[styles.selectBox, { borderColor: isFocused ? colors.secondary : colors.darkGray }, hasError && styles.selectBoxError]}
        onPress={openModal}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <Text style={[styles.selectText, !hasValue && styles.placeholder, inputStyle]} numberOfLines={1}>
          {hasValue ? displayText : placeholder}
        </Text>
        {showClearButton && hasValue && !disabled && (
          <TouchableOpacity style={styles.iconButton} onPress={handleClear}>
            <View style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </View>
          </TouchableOpacity>
        )}
        <IconMaterial name="chevron-down" size={sizes.iconLg} color={disabled ? colors.gray : colors.blackGray} />
      </TouchableOpacity>

      {!noError && hasError && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={isModalVisible} transparent animationType="none" onRequestClose={closeModal} statusBarTranslucent>
        <KeyboardAvoidingView
          behavior="padding"
          enabled={Platform.OS === 'ios'}
          style={styles.modalContainer}
        >
          <TouchableWithoutFeedback onPress={handleOverlayPress}>
            <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]} />
          </TouchableWithoutFeedback>
          <Animated.View style={[
            styles.modalContent,
            { maxHeight: MODAL_MAX_HEIGHT },
            { transform: [{ translateY: Animated.add(contentTranslateY, keyboardTranslateY) }] },
          ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle || label || "Chọn"}</Text>
              <TouchableOpacity
                testID={testID ? `${testID}-close` : undefined}
                onPress={closeModal}
                style={styles.closeButton}
              >
                <IconMaterial name="close" size={sizes.iconLg} color={colors.blackGray} />
              </TouchableOpacity>
            </View>

            {searchable && (
              <View style={styles.searchContainer}>
                <IconMaterial name="magnify" size={sizes.iconSm} color={colors.gray} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={colors.gray}
                  value={searchText}
                  onChangeText={setSearchText}
                  autoCorrect={false}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchText("")}>
                    <IconMaterial name="close-circle" size={sizes.iconSm} color={colors.gray} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <FlatList
              ref={flatListRef}
              data={displayRows}
              keyExtractor={(item) => item.key}
              renderItem={renderRow}
              style={styles.optionsList}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="none"
              windowSize={5}
              maxToRenderPerBatch={10}
              removeClippedSubviews={true}
              getItemLayout={(_, index) => ({ length: rowHeights[index], offset: rowOffsets[index], index })}
              onScrollToIndexFailed={() => {}}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <IconMaterial name={loading ? "loading" : "inbox"} size={48} color={colors.gray} />
                  <Text style={styles.emptyText}>{loading ? "Đang tải..." : emptyText}</Text>
                </View>
              }
            />

            {multiple && (
              <TouchableOpacity style={styles.doneButton} onPress={closeModal}>
                <Text style={styles.doneButtonText}>
                  Xong {selectedOptions.length > 0 && `(${selectedOptions.length})`}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: sizes.spacing },
  disabled: { opacity: 0.5 },
  label: { fontSize: sizes.fontSize.label, fontWeight: "700", marginBottom: 5 },
  required: { color: colors.red },
  selectBox: {
    height: sizes.inputHeight,
    borderWidth: 1,
    borderRadius: sizes.borderRadius,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: sizes.inputPadding,
  },
  selectBoxError: { borderColor: colors.red },
  selectText: { flex: 1, fontSize: sizes.fontSize.input, color: colors.black },
  placeholder: { color: colors.gray },
  leftIcon: { marginRight: 8 },
  iconButton: { padding: 4, marginRight: 4 },
  clearButton: {
    width: sizes.clearButtonSize,
    height: sizes.clearButtonSize,
    borderRadius: sizes.clearButtonSize / 2,
    backgroundColor: colors.darkGray,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: { color: colors.white, fontSize: sizes.fontSize.small, fontWeight: "bold" },
  errorText: { fontSize: sizes.fontSize.error, color: colors.red, marginTop: 4 },
  modalContainer: { flex: 1, justifyContent: "flex-end" },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: sizes.borderRadiusLg,
    borderTopRightRadius: sizes.borderRadiusLg,
    minHeight: SCREEN_HEIGHT * 0.45,
    maxHeight: MODAL_MAX_HEIGHT,
    paddingBottom: sizes.padding,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sizes.padding,
    paddingVertical: sizes.spacing,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: { fontSize: sizes.fontSize.title, fontWeight: "600", color: colors.black },
  closeButton: { padding: 4 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: sizes.padding,
    marginTop: sizes.spacing,
    marginBottom: 8,
    paddingHorizontal: sizes.inputPadding,
    height: sizes.searchInputHeight,
    backgroundColor: colors.lightGray,
    borderRadius: sizes.borderRadius,
  },
  searchInput: { flex: 1, fontSize: sizes.fontSize.input, color: colors.black, marginLeft: 8, paddingVertical: 0 },
  optionsList: { flexGrow: 0 },
  groupHeader: {
    height: GROUP_HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: sizes.padding,
  },
  groupHeaderAccent: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: colors.secondary,
    marginRight: 8,
  },
  groupHeaderText: {
    fontSize: sizes.fontSize.label,
    fontWeight: "700",
    color: colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: sizes.padding,
    height: sizes.selectItemHeight - 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  optionItemSelected: { backgroundColor: "#FFF3E0" },
  optionItemDisabled: { opacity: 0.5 },
  optionLabel: { flex: 1, fontSize: sizes.fontSize.option, color: colors.black },
  optionLabelSelected: { color: colors.secondary, fontWeight: "500" },
  optionLabelDisabled: { color: colors.gray },
  checkbox: {
    width: sizes.checkboxSize,
    height: sizes.checkboxSize,
    borderWidth: 2,
    borderColor: colors.darkGray,
    borderRadius: 4,
    marginRight: sizes.inputPadding,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: sizes.fontSize.input, color: colors.gray, marginTop: 8 },
  doneButton: {
    marginHorizontal: sizes.padding,
    marginTop: sizes.spacing,
    height: sizes.buttonHeight,
    backgroundColor: colors.secondary,
    borderRadius: sizes.borderRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: { fontSize: sizes.fontSize.title, fontWeight: "600", color: colors.white },
});

export default React.memo(Select);
