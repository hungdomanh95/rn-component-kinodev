# rn-component-kinodev

Thư viện component UI dùng chung cho các app React Native của MAFC. Ship raw TypeScript, không cần build step — Metro của app host transform trực tiếp.

## Cài đặt

```bash
yarn add github:hungdomanh95/rn-component-kinodev#v2.0.0
```

- **v2.x**: React Native ≥ 0.83, React 19, New Architecture. Các thư viện có code native nằm trong `peerDependencies` (autolinking chỉ quét dependency trực tiếp của app), nên app host phải tự cài đúng danh sách `peerDependencies` trong `package.json`. Các thư viện thuần JS (formik, dayjs, react-native-calendars, styled-components) tự cài theo.
- **v1.x** (branch `v1`): dành cho app còn ở RN 0.71 (vd mcrm-mobile-app). Chỉ nhận bản sửa lỗi.

Màu/kích thước mặc định của component đọc từ `theme.ts` của thư viện. Muốn đổi theo app host thì gọi `configureTheme({colors, sizes})` **trước khi** bất kỳ component nào được import (component bake style lúc module load). Lưu ý: Babel hoist mọi `import`, nên phải `require('./App')` sau lời gọi đó thay vì `import App`.

## Sử dụng

```tsx
import { Button, Input, Select, Row, Text } from 'rn-component-kinodev';

<Button text="Lưu" onPress={handleSave} />
```

## Danh sách component

| Component | Ghi chú |
|-----------|---------|
| `Input` / `InputField` | Hỗ trợ format tiền, chỉ nhập số, icon, ẩn/hiện password, animated label |
| `Select` / `SelectField` | Modal dropdown, tìm kiếm, multi-select |
| `DatePicker` / `DatePickerField` | Modal chọn ngày |
| `DateRangePicker` (export tên `RangePicker`) | Chọn khoảng ngày/tháng/năm, dựa trên `react-native-calendars` |
| `Checkbox` / `CheckboxField` | Checkbox đơn |
| `Toggle` / `ToggleField` | Switch kiểu iOS |
| `Radio` / `RadioField` | Radio group |
| `Address` (`AddressFields`) | Cascading Province/District/Ward. Data-driven qua props `provinces`/`loadProvinces`/`loadDistricts`/`loadWards` — app host tự cung cấp nguồn dữ liệu, đã chuẩn hoá theo `AddressItem{id,name,zip_code?}` (nếu backend dùng field tên khác, tự map trước khi return trong loader). Phụ thuộc Formik (`useFormikContext`), không có chế độ controlled value/onChange cho app không dùng Formik |
| `FilePicker` (`MultiFile`, `SingleFile`, `transferFile`, `viewFile`) | **Chưa export ra `index.ts` gốc** — vẫn gắn module nội bộ của mcrm-mobile-app (Redux, ToastController, theme riêng) nên chưa an toàn để dùng ở project khác. Import trực tiếp từ `rn-component-kinodev/components/FilePicker` nếu thực sự cần (chỉ dùng được trong mcrm-mobile-app). Sẽ decouple và export lại ở phiên bản sau |
| `Button` | Variants: primary, outline, text |
| `Card` | Container, hỗ trợ `onPress` |
| `Modal` / `GlobalModal` | Modal có overlay. `GlobalModal` dùng theo kiểu imperative qua `showModal(config)` / `hideModal()` |
| `Body` / `ScrollBody` | Wrapper full-height / có scroll |
| `Footer` | Container dưới cùng |
| `Row` / `Space` | Layout utility |
| `Typography` (`Title`, `Label`, `Text`) | Các biến thể chữ |
| `NoteBox` | Box thông báo có icon |
| `Badge`, `Copy`, `ErrorText`, `Required` | Component phụ trợ nhỏ |

## Theme

`theme.ts` là nguồn duy nhất cho màu sắc và kích thước, export `colors` và `sizes`. Luôn dùng `colors.*`/`sizes.*`, không hardcode giá trị.

## Đóng góp

Xem `CLAUDE.md` để biết pattern Base + Field, cách thêm component mới, và các known issue đã fix.
