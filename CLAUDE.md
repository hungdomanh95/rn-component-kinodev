# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What This Is

`rn-component-kinodev` is the primary UI component library for the mcrm-mobile-app project. It is consumed directly by Metro — no build step, no npm publish. All components are imported via the `rn-component-kinodev` path alias configured in the main project's `tsconfig.json`.

There are no standalone commands in this library. Development, testing, and linting are run from the main project root (`../`):

```bash
yarn start          # Metro bundler
yarn ios / yarn android
yarn lint
yarn test
tsc --noEmit        # Type check (run from main project root)
```

---

## Architecture

### Export System

Everything is re-exported from `index.ts`. When adding a new component, export it from `index.ts`.

### Theme (`theme.ts`)

Single source of truth for all colors and sizes. Always use `colors.*` and `sizes.*` from this file — never hardcode values.

Key values:
- Primary: `#174471`, Secondary: `#F58220`, Error: `#EE0000`
- `inputHeight: 44`, `buttonHeight: 44`, `borderRadius: 8`, `spacing: 12`, `padding: 16`

### Component Pattern: Base + Field

Every form input has two variants:

| Variant | When to use |
|---------|-------------|
| **Base** (`Input`, `Select`, etc.) | Controlled component — pass `value`, `onChangeText`, `error`, `touched` manually |
| **Field** (`InputField`, `SelectField`, etc.) | Inside a Formik form — auto-wires via `useField(name)`. Requires Formik context. |

**Rule:** Use `*Field` when the parent has a Formik context and the field is submitted data. Use the base component for display-only fields, local UI state, or outside Formik.

### Component Reference

| Component | Files | Notes |
|-----------|-------|-------|
| `Input` / `InputField` | `Input/` | Supports money formatting, number-only, icons, show/hide password, animated label |
| `Select` / `SelectField` | `Select/` | Modal dropdown, optional search, multi-select, keyboard-aware positioning |
| `DatePicker` / `DatePickerField` | `DatePicker/` | Modal date picker |
| `RangePicker` | `DateRangePicker/` | From/to date or month range picker, quick-filter tabs (Hôm nay/Tuần này/Tháng này/Năm này), `defaultValue` for pre-fill |
| `Checkbox` / `CheckboxField` | `Checkbox/` | Single checkbox with label/description |
| `Toggle` / `ToggleField` | `Toggle/` | iOS-style switch |
| `Radio` / `RadioField` | `Radio/` | Radio group, supports row/column layout |
| `Button` | `Button/` | Variants: primary (filled), outline, text |
| `Card` | `Card/` | Container with optional `onPress` |
| `Modal` / `GlobalModal` | `Modal/` | Modal with overlay. `GlobalModal` enables imperative usage via `ModalManager` |
| `Body` | `Body/` | Full-height wrapper, dismisses keyboard on touch |
| `ScrollBody` | `ScrollBody/` | Scrollable body wrapper, supports `refreshControl`, `scrollRef`, `style`, `contentContainerStyle` |
| `Footer` | `Footer/` | Bottom container |
| `Row` | `Row/` | Horizontal layout utility |
| `Space` | `Space/` | Spacing utility |
| `Typography` | `Typography/` | `Title`, `Label`, `Text` variants |
| `NoteBox` | `NoteBox/` | Info box with icon and title |
| `Tooltip` | `Tooltip/` | Tap `children` to show a positioned note bubble (arrow + auto-flip above/below) via `tooltipText` |

---

## Adding a New Component

1. Create `components/NewComponent/NewComponent.tsx` (and `NewComponentField.tsx` if it's a form input)
2. Create `components/NewComponent/index.ts` re-exporting both
3. Add `export * from './components/NewComponent';` to `index.ts`
4. Use `colors` and `sizes` from `../../theme` — never hardcode

## Known Issues & Fixes

### `Input` / `InputField` multiline + `ScrollBody` — scroll bị capped

**Triệu chứng:** Field `multiline` ở cuối màn hình bị keyboard che sau khi focus. `scrollTo` được gọi đúng giá trị nhưng ScrollView không scroll tới vì content không đủ cao.

**Root cause:** `ScrollBody` tính `delta` dựa trên `measureInWindow`, nhưng `max scroll = content height - visible height`. Khi field multiline nằm gần cuối content, `max scroll < delta` → bị capped.

**Fix đã áp dụng (ScrollBody.tsx):** Khi `keyboardWillShow`, set `paddingBottom = keyboardHeight` vào `contentContainerStyle` ngay lập tức. Điều này tăng content height đúng bằng keyboard height, đảm bảo mọi field đều scrollable lên trên keyboard. Reset về 0 khi `keyboardWillHide`.

**Lưu ý:** Không dùng `KeyboardAvoidingView` — đã thử và conflict với custom scroll logic của `ScrollBody`.

**Bug liên quan — clamp scroll bị lệch khi keyboard ẩn:** Nếu `setKeyboardPadding(0)` được gọi ngay lập tức trong `keyboardWillHide`, iOS UIScrollView sẽ clamp scroll offset về `max_scroll = new_content_height - visible_height` trong khi scroll animation đang chạy → scroll dừng sai chỗ. Fix: dùng `setTimeout(350ms)` để xóa padding sau khi animation hoàn thành. Cancel timer này trong `keyboardWillShow` để tránh race condition khi user focus field mới liên tiếp.

### `ScrollBody` khi ẩn bàn phím — pin field vừa nhập lên mép trên (không restore vị trí cũ)

**Bối cảnh:** Bản đầu tiên khi `keyboardWillHide` sẽ cuộn về đúng offset trước lúc focus. Với field nằm ở cuối content thì ổn, nhưng với field ở giữa form thì tệ — cuộn về vị trí cũ nghĩa là field vừa nhập (và các field kế tiếp) bị che lại, user phải tự cuộn xuống lần nữa để tiếp tục điền.

**Fix hiện tại:** Khi `keyboardWillShow`, lưu lại content-offset (không phải window-offset, vì window-offset đổi theo mỗi lần cuộn) của field đang focus vào `focusedFieldContentYRef`. Khi `keyboardWillHide`, thay vì restore, cuộn tới vị trí `focusedFieldContentYRef - TOP_INSET` — tức ghim field vừa nhập lên sát mép trên, lộ ra nội dung phía sau nó. Kết quả tự nhiên đúng cho cả 2 trường hợp: field giữa form (lộ field kế tiếp, khỏi cuộn tay) lẫn field cuối cùng (lộ nút submit bên dưới).

**Bug liên quan — clamp tính sai vì còn tính cả phần đệm bàn phím:** Giới hạn `maxScroll` phải dùng chiều cao content THẬT (không tính `paddingBottom` bù bàn phím vừa thêm ở `keyboardWillShow`), vì phần đệm đó chỉ mất đi sau 350ms nữa (xem bug phía trên). Nếu tính `maxScroll` dựa trên content đang còn đệm (to hơn thật), có thể cuộn tới vị trí mà 350ms sau khi đệm biến mất sẽ bị ScrollView tự động kẹp lại về giới hạn mới → tạo thêm 1 cú giật ngay sau cú cuộn chủ đích, nhìn như "cuộn 2 nhịp". Fix: trừ `keyboardPaddingRef.current` (giá trị đệm hiện tại, đọc qua ref chứ không phải state để tránh stale closure trong listener) ra khỏi `contentHeightRef.current` trước khi tính `maxScroll`.

---

## Modal System

`GlobalModal` + `ModalManager` enable imperative modal usage without React context:
```typescript
ModalManager.show({ title: '...', content: <View /> });
ModalManager.hide();
```
Mount `<GlobalModal />` once at the root of the app for this to work.
