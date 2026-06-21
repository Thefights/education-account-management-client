# Instruction cho dev/AI khi làm việc với source

## Quy tắc bắt buộc trước khi thực thi prompt

Trước khi xử lý bất kỳ yêu cầu nào trong dự án này, dev/AI phải đọc file `instruction.md` này trước. Sau đó phải tham khảo pattern hiện có trong folder:

`src/pages/productManagementPage`

Folder `ProductManagementPage` là mẫu chuẩn hiện tại cho cách tổ chức page, chia section, gọi API, dùng translation, dùng enum, render table, render form, filter, pagination và xử lý submit.

Không được tự tạo style hoặc kiến trúc mới nếu source đã có pattern tương ứng. Ưu tiên dùng lại component/hook/helper hiện có.

## Ngôn ngữ và format chung

- Toàn bộ code mới phải nhất quán với style source hiện tại.
- Component React dùng function component.
- Import alias ưu tiên dùng `@/...` thay vì relative path dài.
- Tên file component dùng `PascalCase.jsx`.
- Tên custom hook dùng `useSomething.js` hoặc `useSomething.jsx`.
- Tên biến state rõ nghĩa, tránh viết tắt khó hiểu.
- Không hard-code text hiển thị trực tiếp nếu text đó là UI/user-facing. Phải đưa vào locale và gọi qua `useTranslation`.
- Không gọi API trực tiếp bằng `axios` trong page/component nếu đã có hook chuẩn.
- Không trộn quá nhiều trách nhiệm vào một file page. Page chính chỉ nên orchestration state/API và truyền props xuống section.

## Cấu trúc page chuẩn

Khi tạo page quản lý mới, tham khảo `src/pages/productManagementPage`.

Cấu trúc khuyến nghị:

```txt
src/pages/exampleManagementPage/
  ExampleManagementPage.jsx
  components/
    ExampleManagementFilterSection.jsx
    ExampleManagementTableSection.jsx
    ExampleManagementFormSection.jsx
```

Vai trò từng file:

- `ExampleManagementPage.jsx`: giữ state chính, filter, sort, pagination, selected row, selected ids, open dialog, gọi `useFetch`, gọi `useAxiosSubmit`, xử lý refetch.
- `ExampleManagementFilterSection.jsx`: render các field filter, dùng `useForm` và `useFieldRenderer`, chỉ gọi `setFilters` khi người dùng bấm filter/reset.
- `ExampleManagementTableSection.jsx`: định nghĩa columns/fields của table bằng `useMemo`, render `GenericTable`, action buttons, batch actions.
- `ExampleManagementFormSection.jsx`: định nghĩa create/update fields, initial values, submit handler, render `GenericFormDialog`.

Không nhồi filter/table/form vào page chính nếu page có nhiều UI section.

## Cách dùng `useTranslation`

Luôn dùng:

```js
const { t } = useTranslation();
```

Text hiển thị phải dùng key locale:

```js
t("staff.field.name")
t("button.create")
t("text.all")
```

Khi cần truyền biến:

```js
t("staff.confirm.activate_selected_description", {
  number: selectedIds.length,
})
```

Không viết trực tiếp các chuỗi như `"Create"`, `"Delete user?"`, `"Staff Management"` trong UI production. Chỉ được hard-code tạm trong file demo/test như `TestTable.jsx` khi mục đích là kiểm thử giao diện.

Khi thêm text mới:

- Thêm key vào đúng namespace locale.
- Giữ tên key theo domain, ví dụ `staff.field.email`, `staff.title.staff_management`.
- Không dùng key quá chung nếu text chỉ thuộc một domain cụ thể.

## Cách dùng `useEnum`

Khi cần option cho select/filter/status, ưu tiên lấy từ `useEnum`:

```js
const _enum = useEnum();
```

Ví dụ:

```js
_enum.roleOptions
_enum.genderOptions
_enum.staffStatusOptions
_enum.bankCodeOptions
```

Nếu cần loại bỏ option không phù hợp, dùng `useMemo`:

```js
const roleOptions = useMemo(
  () => _enum.roleOptions.filter((opt) => opt.value !== EnumConfig.Role.Patient),
  [_enum.roleOptions],
);
```

Không tự tạo lại enum option trong component nếu `useEnum` đã có.

Khi thêm enum mới:

- Thêm constant vào `EnumConfig`.
- Thêm label vào locale.
- Thêm option mapping vào `useEnum`.
- Nếu enum dùng để render màu/status, thêm helper style ở config tương ứng.

## Cách gọi API

### Fetch data

Dùng `useFetch` cho GET/list/detail:

```js
const getStaffs = useFetch(
  ApiUrls.STAFF.MANAGEMENT.INDEX,
  { sort: `${sort.key} ${sort.direction}`, ...filters, page, pageSize },
  [sort, filters, page, pageSize],
);
```

Quy ước:

- URL lấy từ `ApiUrls`.
- Params truyền object rõ ràng.
- Dependencies phải đúng các state ảnh hưởng đến request.
- Không tự gọi `axiosConfig.get` trực tiếp trong page nếu `useFetch` đáp ứng được.
- Khi mutation thành công, gọi `fetch()` của hook list để refetch.

### Submit/mutation

Dùng `useAxiosSubmit` cho POST/PUT/PATCH/DELETE:

```js
const createStaff = useAxiosSubmit({
  url: ApiUrls.STAFF.MANAGEMENT.CREATE,
  method: "POST",
});
```

Khi submit form:

```js
const response = await onCreateSubmit({ overrideData: values });
if (response) {
  closeDialog();
  refetch();
}
```

Khi endpoint phụ thuộc vào row/status:

```js
const updateStaffStatus = useAxiosSubmit({ method: "PUT" });

await updateStaffStatus.submit({
  overrideUrl,
  overrideParam: { ids: selectedIds },
});
```

Không hard-code URL trong component. Nếu thiếu endpoint, thêm vào `ApiUrls`.

## Quy tắc dữ liệu tính toán và fallback

Nếu một giá trị đã có nguồn tính toán rõ ràng từ server hoặc từ state/client contract, phải dùng trực tiếp giá trị đó. Không tự tính lại, không tạo fallback âm thầm, và không dùng giá trị suy đoán để thay thế khi dữ liệu thiếu.

Ví dụ server đã trả:

```cs
TotalCount
TotalPage
Collection
```

Thì UI pagination phải nhận và dùng đúng:

```jsx
totalCount={data.totalCount}
totalPage={data.totalPage}
```

Không làm fallback kiểu:

```js
const totalPage = data.totalPage || Math.ceil(totalCount / pageSize);
```

Lý do: fallback âm thầm làm che lỗi contract/API, khiến UI vẫn chạy nhưng hiển thị sai dữ liệu. Nếu thiếu dữ liệu bắt buộc, phải sửa contract, sửa caller, hoặc fail rõ ràng để phát hiện lỗi sớm.

Chỉ được tính ở client khi giá trị đó thực sự thuộc trách nhiệm client/local state, ví dụ dữ liệu mock trong file demo/test hoặc danh sách local chưa gọi API. Khi chuyển sang API thật, các giá trị như filter/search/sort/pagination tổng nên theo contract server nếu server đã hỗ trợ.

## Pattern state cho page management

Page chính nên có các state cơ bản:

```js
const [filters, setFilters] = useState(initialFilters);
const [sort, setSort] = useState({ key: "id", direction: "desc" });
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const [openCreate, setOpenCreate] = useState(false);
const [openUpdate, setOpenUpdate] = useState(false);
const [selectedRow, setSelectedRow] = useState({});
const [selectedIds, setSelectedIds] = useState([]);
```

Nếu table data thay đổi sau fetch, phải dọn `selectedIds` không còn tồn tại trong page hiện tại:

```js
useEffect(() => {
  const currentIds = new Set(
    (data?.collection || []).map((item) => String(item?.id)).filter(Boolean),
  );
  setSelectedIds((prev) => prev.filter((id) => currentIds.has(String(id))));
}, [data?.collection]);
```

## Pattern filter section

Filter section dùng:

- `useForm(filters)`
- `useFieldRenderer(...)`
- `FilterButton`
- `ResetFilterButton`

Với các trang quản trị/management, luôn chỉ có 1 thanh search text chung. Thanh search này dùng để tìm trên các property dạng text đang được hiển thị lên giao diện/table. Không tạo nhiều ô search riêng cho từng text field như email, full name, phone number, description, object, IP address... trừ khi user hoặc thiết kế yêu cầu rõ ràng.

Không update `filters` sau mỗi lần gõ nếu pattern page đang dùng button filter. Chỉ gọi:

```js
onFilterClick={() => setFilters(values)}
```

Reset:

```js
reset({});
setFilters({});
```

Các filter field nên chia row bằng grid/section nếu nhiều field, tương tự `StaffManagementFilterSection`.

## Pattern table section

Table section dùng `GenericTable`.

Fields phải được memo:

```js
const fields = useMemo(() => [...], [t, dependencies]);
```

Mỗi column nên có:

- `key`
- `title`
- `width`
- `sortable` nếu backend/frontend hỗ trợ sort
- `render` nếu cần format/null fallback/status

Với dữ liệu có thể rỗng, dùng:

```js
renderEmptyFallback(value)
```

Với enum label:

```js
getEnumLabelByValue(_enum.staffStatusOptions, value)
```

Action row dùng `ActionMenu`. Batch action nguy hiểm dùng `ConfirmationButton`.

Không viết table HTML riêng nếu `GenericTable` đáp ứng được.

## Pattern form section

Form section dùng `GenericFormDialog`.

Tách `createInitialValues`, `createFields`, `updateFields` bằng `useMemo`.

Field title phải dùng `t(...)`.

Validation dùng helper trong `validateUtil`:

```js
validate: [maxLen(50)]
```

Select option:

- Nếu enum: dùng `_enum`.
- Nếu data từ store/API: map về `{ value, label }`.
- Luôn filter option không hợp lệ:

```js
.filter((o) => o.value != null)
```

Submit handler phải:

- Gọi submit hook qua prop.
- Đóng dialog khi thành công.
- Refetch list khi thành công.
- Không tự xử lý toast nếu `axiosConfig/useAxiosSubmit` đã xử lý.

## Generic components phải ưu tiên dùng

Ưu tiên dùng các component hiện có:

- `GenericTable`
- `GenericTablePagination`
- `GenericFormDialog`
- `GenericTabs`
- `SearchBar`
- `ActionMenu`
- `ConfirmationButton`
- `FilterButton`
- `ResetFilterButton`
- `EmptyPage`, `EmptyRow`, `EmptyBox`

Không tạo component mới nếu component generic hiện có đã giải quyết được bài toán.

Nếu generic component thiếu khả năng, cân nhắc mở rộng component generic theo hướng backward-compatible thay vì copy/paste component mới.

## Quy tắc custom hook

Custom hook phải đặt trong `src/hooks`.

Tên hook bắt đầu bằng `use`.

Hook chỉ xử lý logic/state/effect, không render UI.

Hook dùng API phải ưu tiên đi qua `axiosConfig`, trừ khi có lý do kỹ thuật rõ ràng.

Hook thường dùng phải có comment đầu file mô tả mục đích.

Ví dụ:

```js
/**
 * Hook dùng để fetch dữ liệu GET theo url/params/dependencies.
 * Trả về loading, error, data, setData và hàm fetch để refetch thủ công.
 */
```

## Comment bắt buộc ở file quan trọng

Các file sau khi tạo mới hoặc chỉnh lớn phải có comment ở đầu file mô tả file dùng để làm gì:

- Custom hook trong `src/hooks`
- Generic component trong `src/components/generals`
- Generic dialog trong `src/components/dialogs/commons`
- Generic table trong `src/components/tables`
- Field renderer trong `src/components/fieldRenderers`
- Config quan trọng trong `src/configs`
- Provider/context
- Helper utility quan trọng trong `src/utils`
- Page lớn hoặc page management

Comment phải ngắn, rõ, bằng tiếng Anh.

Ví dụ:

```js
/**
 * Generic table component shared by management pages.
 * Receives field config to render columns, sorting, selection, and empty state.
 */
```

Không comment kiểu hiển nhiên như “import thư viện” hoặc “set biến”.

## Chia folder theo section

Nếu page có nhiều hơn một nhóm UI hoặc có nhiều trách nhiệm, phải chia `sections` (đặt trong thư mục `components/`).

Nên chia theo chức năng:

- `FilterSection`
- `TableSection`
- `FormSection`
- `DetailSection`
- `SummarySection`
- `ToolbarSection`

Page chính không nên dài quá mức chỉ vì chứa JSX của mọi section.

## Redux/store

Nếu dữ liệu danh mục dùng lại nhiều nơi, ưu tiên dùng store qua `useReduxStore` theo pattern hiện có trong source.

Ví dụ:

```js
const specialtyStore = useReduxStore({
  selector: (state) => state.management.specialties,
  setStore: setSpecialtiesStore,
});
```

Không fetch lặp lại cùng một danh mục ở nhiều component con nếu đã có store dùng chung.

## Locale

Locale đặt theo domain.

Ví dụ:

```txt
src/locales/vi/staff/staff.json
```

Không đưa mọi text vào file general nếu text thuộc domain cụ thể.

Key nên phản ánh vị trí hoặc ý nghĩa:

```json
{
  "staff": {
    "title": {},
    "field": {},
    "placeholder": {},
    "button": {},
    "confirm": {}
  }
}
```

## Validation

Ưu tiên dùng helper trong `src/utils/validateUtil`.

Không viết validation inline dài trong component nếu có thể tái sử dụng.

Validation field phải đi cùng field config:

```js
{
  key: "email",
  title: t("staff.field.email"),
  type: "email",
  validate: [maxLen(100)],
}
```

## Xử lý dữ liệu trước khi update

Nếu backend trả `"N/A"` hoặc `null`, cần normalize trước khi đưa vào form:

```js
const processedRow = { ...row };
Object.keys(processedRow).forEach((key) => {
  if (processedRow[key] == null || processedRow[key] === "N/A") {
    processedRow[key] = "";
  }
});
```

Khi update submit, cũng cần xử lý lại nếu form còn `"N/A"`.

## Quy tắc khi thêm file mới

Trước khi thêm file mới, kiểm tra:

- Có component/hook/helper tương tự chưa?
- Có pattern trong `ProductManagementPage` áp dụng được không?
- File nên nằm ở page section, component generic, hook, config hay utils?
- Text đã có locale chưa?
- API endpoint đã có trong `ApiUrls` chưa?
- Enum đã có trong `EnumConfig/useEnum` chưa?

## Quy tắc khi sửa file hiện có

- Không refactor lan rộng nếu prompt chỉ yêu cầu sửa hẹp.
- Không xóa hoặc đổi behavior không liên quan.
- Không revert thay đổi của người khác nếu không được yêu cầu.
- Nếu thấy file có dirty changes không liên quan, giữ nguyên và chỉ sửa phần cần thiết.
- Sau khi sửa, chạy build/lint/test phù hợp nếu có thể.

## Checklist trước khi hoàn thành task

Trước khi báo hoàn thành, kiểm tra:

- Đã đọc `instruction.md`.
- Đã tham khảo `ProductManagementPage` nếu task liên quan page/form/table/API.
- Không gọi API sai pattern.
- Không hard-code UI text production.
- Đã dùng `useTranslation` đúng cách.
- Đã dùng `useEnum` nếu liên quan enum/options.
- Đã chia section nếu page đủ lớn.
- File quan trọng/custom hook/generic component có comment đầu file nếu tạo mới hoặc chỉnh lớn.
- Build/lint/test đã chạy nếu hợp lý.
- Báo rõ nếu chưa chạy được build/lint/test.

