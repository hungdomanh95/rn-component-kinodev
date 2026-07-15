# rn-component-kinodev

Thư viện component UI dùng chung cho các app React Native của MAFC. Ship raw TypeScript, không cần build step — Metro của app host transform trực tiếp.

## Cài đặt

```bash
yarn add github:hungdomanh95/rn-component-kinodev#v1.0.0
```

Yêu cầu app host đã có sẵn: `react`, `react-native`, `styled-components`. Các dependency khác (formik, dayjs, react-native-vector-icons, react-native-calendars, các picker/file lib...) được khai báo trong `dependencies` của package này và sẽ tự cài theo.

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
| `Modal` / `GlobalModal` | Modal có overlay. `GlobalModal` dùng theo kiểu imperative qua `ModalManager` |
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
