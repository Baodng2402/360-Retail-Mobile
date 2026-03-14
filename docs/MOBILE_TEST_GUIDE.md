# 📱 360 Retail Mobile — Hướng Dẫn Kiểm Thử & Tổng Quan Tính Năng

> **Chuẩn bị:** 3 tài khoản test — `StoreOwner`, `Manager`, `Staff`
>
> **Backend:** Đảm bảo đang chạy tại `EXPO_PUBLIC_API_URL`

---

## 🏗️ Kiến Trúc App

```
App.tsx
├── AuthNavigator (chưa đăng nhập)
│   ├── Introduction
│   ├── Login
│   ├── Signup
│   ├── OTP (xác thực email)
│   ├── ForgotPassword ← MỚI
│   └── ResetPassword  ← MỚI
│
├── MainNavigator (đã đăng nhập — 5 tabs)
│   ├── 🏠 Tổng quan (HomeScreen)
│   ├── 🛒 Bán hàng (POS → Checkout)
│   ├── 📦 Đơn hàng (OrdersScreen)
│   ├── ➕ Thêm (MoreNavigator) ← MỚI
│   │   ├── MoreMenu (lọc theo role)
│   │   ├── Chấm công (UI skeleton)
│   │   ├── Công việc của tôi
│   │   ├── Quản lý Nhân sự → Chi tiết NV
│   │   ├── Quản lý Cửa hàng
│   │   ├── Sản phẩm (placeholder)
│   │   ├── Kho hàng (placeholder)
│   │   ├── Khách hàng
│   │   ├── CRM & Loyalty
│   │   ├── Báo cáo
│   │   ├── Cài đặt
│   │   └── Gói dịch vụ (chỉ Owner)
│   │
│   └── 👤 Hồ sơ (ProfileStack)
│
└── UpgradeDialog (toàn cục — tự hiện khi 403)
```

---

## 🔐 Phân Quyền Theo Role

| Tính năng         | StoreOwner  |   Manager   |      Staff       |
| ----------------- | :---------: | :---------: | :--------------: |
| Dashboard         |     ✅      |     ✅      |        ✅        |
| POS / Bán hàng    |     ✅      |     ✅      |        ✅        |
| Đơn hàng          |     ✅      |     ✅      |        ✅        |
| Chấm công         |     ✅      |     ✅      |        ✅        |
| Công việc của tôi |     ✅      |     ✅      |        ✅        |
| Khách hàng        |     ✅      |     ✅      |  ✅ (không xóa)  |
| CRM & Loyalty     |     ✅      |     ✅      |        ✅        |
| Cài đặt           | ✅ (3 tabs) | ✅ (3 tabs) | ✅ (chỉ Bảo mật) |
| Quản lý Nhân sự   |     ✅      |     ✅      |        ❌        |
| Quản lý Cửa hàng  |     ✅      |     ✅      |        ❌        |
| Sản phẩm          |     ✅      |     ✅      |        ❌        |
| Kho hàng          |     ✅      |     ✅      |        ❌        |
| Báo cáo           |     ✅      |     ✅      |        ❌        |
| Gói dịch vụ       |     ✅      |     ❌      |        ❌        |

---

## ✅ Checklist Kiểm Thử

### 1️⃣ Auth

- [ ] Đăng nhập email + password → vào Dashboard
- [ ] Đăng nhập sai → Toast lỗi
- [ ] Đăng ký → OTP Screen → nhập mã → về Login
- [ ] **Quên mật khẩu** → nhập email → gửi OTP → nhập OTP + MK mới → thành công
- [ ] Google Sign-In (cần dev build `npx expo run:android`)

### 2️⃣ Dashboard

- [ ] Hiện thống kê: doanh thu, đơn hàng, biểu đồ
- [ ] Chuyển store (StoreSwitcher) → data refresh
- [ ] Trial banner hiện nếu đang dùng thử
- [ ] Kéo refresh → data reload

### 3️⃣ POS (Bán hàng)

- [ ] Hiện lưới sản phẩm với ảnh, tên, giá
- [ ] Nhấn SP → thêm vào giỏ
- [ ] Checkout → xác nhận → tạo đơn thành công

### 4️⃣ Đơn hàng

- [ ] Danh sách đơn hàng hiện đúng
- [ ] Kéo refresh → reload

### 5️⃣ Chấm công

- [ ] UI hiển thị: ngày hiện tại, 2 nút Check-in/Check-out
- [ ] Summary: giờ làm hôm nay + ngày công tháng
- [ ] Placeholder "Tính năng đang phát triển" ở phần lịch sử

### 6️⃣ Công việc của tôi

- [ ] Danh sách tasks với badge priority (Thấp/TB/Cao)
- [ ] Filter: Tất cả / Chờ / Đang làm / Xong
- [ ] Quick action: Pending → "Bắt đầu" → InProgress
- [ ] Quick action: InProgress → "Hoàn thành" → Completed
- [ ] Deadline quá hạn: chữ đỏ "Quá hạn X ngày"
- [ ] Không có task → "Chưa có công việc nào"

### 7️⃣ Quản lý Nhân sự (Owner/Manager)

- [ ] Danh sách NV: avatar, tên, vị trí, email, trạng thái
- [ ] Tìm kiếm theo tên/email → filter realtime
- [ ] Nhấn ➕ → nhập email → "Mời" → Toast thành công
- [ ] Nhấn NV → Chi tiết → đầy đủ info
- [ ] Sửa: nhấn ✏️ → edit mode → sửa tên/vị trí/lương → Lưu
- [ ] Toggle: "Ngưng hoạt động" / "Kích hoạt lại"

### 8️⃣ Quản lý Cửa hàng (Owner/Manager)

- [ ] Danh sách stores: tên, địa chỉ, SĐT, active/inactive
- [ ] Tạo mới: nhấn ➕ → nhập tên (bắt buộc) → Tạo
- [ ] Empty state nếu chưa có store

### 9️⃣ Khách hàng

- [ ] Danh sách KH: tên, SĐT, email, số đơn
- [ ] Tìm kiếm theo tên/SĐT
- [ ] Tạo KH: nhấn ➕ → nhập Họ tên + SĐT → Tạo mới
- [ ] Xóa: icon 🗑️ chỉ hiện cho Owner/Manager
- [ ] Login Staff → KHÔNG thấy icon xóa

### 🔟 CRM & Loyalty

- [ ] 2 cards: Đánh giá TB + Tổng phản hồi
- [ ] Danh sách phản hồi: KH, ⭐ rating, nội dung, nguồn
- [ ] Kéo refresh → reload

### 1️⃣1️⃣ Báo cáo (Owner/Manager)

- [ ] 2 summary cards: Đánh giá TB + Tổng phản hồi
- [ ] Biểu đồ phân bố 1-5⭐ (horizontal bars)

### 1️⃣2️⃣ Cài đặt

- [ ] Staff chỉ thấy tab "Bảo mật"
- [ ] Owner/Manager thấy thêm: "Cửa hàng" + "Thông báo"
- [ ] Đổi MK: nhập MK cũ + MK mới (≥8) + xác nhận → thành công
- [ ] Nhập MK cũ sai → Toast lỗi

### 1️⃣3️⃣ Gói dịch vụ (Chỉ Owner)

- [ ] Card gói hiện tại: tên, status, ngày, còn lại
- [ ] Danh sách plans: tên, giá VND, thời hạn, features, badge HOT
- [ ] Thông báo "truy cập trang web" để mua gói

### 1️⃣4️⃣ Feature Gate (403 Interceptor)

- [ ] TK trial quá hạn → gọi API → Dialog "Thời gian dùng thử đã hết"
- [ ] TK subscription hết hạn → Dialog "Gói dịch vụ đã hết hạn"
- [ ] Nhấn "Để sau" → dialog đóng
- [ ] Nhấn "Nâng cấp ngay" → navigate đến Gói dịch vụ

### 1️⃣5️⃣ Profile

- [ ] Hiện tên, email, avatar
- [ ] Đăng xuất → xóa token → về Login

---

## 🛠️ Files Mới/Sửa Quan Trọng

| File                                            | Vai trò                               |
| ----------------------------------------------- | ------------------------------------- |
| `src/types/index.ts`                            | Tất cả interfaces (400+ dòng)         |
| `src/api/client.ts`                             | Axios + 403 interceptor               |
| `src/api/hr.api.ts`                             | API HR: employees, tasks, timekeeping |
| `src/api/crm.api.ts`                            | API CRM: customers, feedback, loyalty |
| `src/stores/useFeatureGateStore.ts`             | Zustand store cho upgrade dialog      |
| `src/navigation/MoreNavigator.tsx`              | Stack 13 screens quản lý              |
| `src/screens/more/MoreMenuScreen.tsx`           | Menu lọc theo role                    |
| `src/components/subscription/UpgradeDialog.tsx` | Dialog 403 toàn cục                   |
| `src/components/common/PlaceholderScreen.tsx`   | Screen chờ phát triển                 |

---

## 📝 Còn Lại Cần Làm

- [ ] Nâng cấp ProductsScreen (CRUD, categories, variants, upload ảnh)
- [ ] Tạo InventoryScreen (phiếu nhập/xuất kho)
- [ ] Nâng cấp Dashboard (low stock alerts, quick actions)
- [ ] Nâng cấp ProfileScreen (subscription info, tasks, timekeeping)
- [ ] Timekeeping logic (GPS + selfie check-in/out)

Sửa lại: thêm nhân viên , đổi cửa hàng, sửa danh mục (khi bị ẩn, thì bắt nhập lại thông tin và không hiện lại được trên cửa hàng - hết bị ẩn), sử lại UI/UX quản lý nhập kho ( sai tổng số lượng, thiếu biến thể (varient: ví dụ: thêm Áo, thì áo đó biến thể gì size L,M hay gì đó )
. Ở mục thêm sản phẩm lấy từ endpoint product , hiện tại đao tạo bị thiếu thêm những biến thể là mục VariantsJson ở endpoint /sales/Products (POST) đây là mã json ví dụ: [{"sku":"SKU001","size":"M","color":"Red","priceOverride":150000,"stockQuantity":10}]
[
{
"sku": "POLO-M-DEN",
"size": "M",
"color": "Đen",
"priceOverride": 350000,
"stockQuantity": 20
},
{
"sku": "POLO-L-TRANG",
"size": "L",
"color": "Trắng",
"priceOverride": 360000,
"stockQuantity": 15
}
]. Toàn bộ những gì liên quan tới sản phẩm sẽ sử dụng endpoint Products của Sales API. Call api Logout để Logout tài khoản. Đang không chạy được endpoint của mục quên mật khẩu, gửi được mail otp , nhập vô được, nhưng không đổi mk được (Kiểm tra 2 endpoint này
/\*_ Yêu cầu đặt lại mật khẩu — gửi OTP về email _/
forgotPassword: (email: string) =>
apiClient.post<ApiResponse<any>>('/identity/auth/forgot-password', { email }),

/\*_ Đặt lại mật khẩu bằng OTP nhận được _/
resetPassword: (email: string, code: string, newPassword: string) =>
apiClient.post<ApiResponse<any>>('/identity/auth/reset-password', { email, code, newPassword }),
};)
