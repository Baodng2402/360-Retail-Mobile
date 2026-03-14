# 360 Retail Mobile — Quy trình xử lý theo Role

---

## Tóm tắt

Mobile app hiện tại được xây dựng cho **cửa hàng bán lẻ**.
Hỗ trợ **3 roles chính**: **Owner**, **Manager**, **Staff**
**Trial: 7 ngày**, sau đó chuyển sang **Paid Plan** (Basic/Pro)

---

## 1. OWNER (Chủ sở hữu cửa hàng)

### Quyền hạn
- Tạo cửa hàng + quản lý tất cả
- Xem tất cả thống kê, doanh thu, khách hàng
- Quản lý nhân viên (Manager, Staff)
- Quản lý sản phẩm, danh mục, kho
- Xem + tạo đơn hàng
- Tính năng trả lời feedback (Pro plan)
- Tính năng loyalty program (Pro plan)
- Quản lý gói dịch vụ & thanh toán

### Luồng làm việc

#### A. Khởi động (Onboarding)
```
1. Đăng ký tài khoản
   POST /identity/auth/register { email, password, fullName }
   → OTP gửi về email

2. Xác thực email
   POST /identity/auth/verify-email { email, otpCode }
   → Account activated

3. Đăng nhập
   POST /identity/auth/login { email, password }
   → JWT token (claims: store_id=null, status="Registered")

4. Bắt đầu dùng thử (Trial 7 ngày)
   POST /identity/subscription/start-trial { storeName }
   → Trial store được tạo
   → Token refresh với store_id & status="Trial"

5. Xem dashboard (chỉ thống kê cơ bản)
   GET /sales/dashboard/overview
   GET /sales/dashboard/inventory-summary
   (Dashboard đầy đủ cần Basic plan+)
```

#### B. Quản lý sản phẩm & danh mục
```
1. Xem danh mục
   GET /categories

2. Tạo danh mục
   POST /categories { name, description }
   (Cần active subscription)

3. Xem sản phẩm
   GET /products { keyword, categoryId, paging }

4. Tạo sản phẩm
   POST /products (multipart/form-data)
   {
     productName, sku, description,
     price, costPrice,
     stockQuantity, categoryId,
     imageFile, variants (nếu có)
   }
   (Cần Basic+ để có variants)

5. Cập nhật sản phẩm
   PUT /products/{id} (multipart/form-data)

6. Xóa sản phẩm
   DELETE /products/{id}
```

#### C. Quản lý kho & tồn kho
```
1. Xem tóm tắt kho
   GET /sales/dashboard/inventory-summary
   → totalProducts, inStockCount, lowStockCount, outOfStockCount

2. Tạo phiếu nhập/xuất kho
   POST /inventory
   {
     type: "Import" | "Export",
     note: "string?",
     items: [
       { productId, productVariantId?, quantity, note? }
     ]
   }
   → Status: Draft (chưa có hiệu lực)

3. Xem danh sách phiếu
   GET /inventory { type, status, paging }

4. Xác nhận phiếu (cập nhật stock)
   PUT /inventory/{id}/confirm
   → Status: Confirmed (cập nhật stock)

5. Hủy phiếu
   PUT /inventory/{id}/cancel

6. Xóa phiếu (nếu Draft/Cancelled)
   DELETE /inventory/{id}
```

#### D. Quản lý đơn hàng (POS)
```
1. Xem sản phẩm bán hàng
   GET /products (filtered by category, search)

2. Tạo đơn hàng (checkout)
   POST /orders
   {
     paymentMethod: "Cash" | "Card" | "Bank Transfer",
     discountAmount: 0,
     items: [
       { productId, quantity, productVariantId? }
     ]
   }
   → Order created, stock reduced

3. Xem danh sách đơn
   GET /orders { status?, fromDate?, toDate?, paging }

4. Xem chi tiết đơn
   GET /orders/{id}

5. Cập nhật trạng thái đơn
   PUT /orders/{id}/status { status: "Processing"|"Completed"|"Cancelled" }

6. Hủy đơn (khôi phục stock)
   PUT /orders/{id}/cancel
```

#### E. Quản lý khách hàng
```
1. Xem danh sách khách
   GET /customers { paging }

2. Tạo khách hàng
   POST /customers { fullName, phoneNumber, zaloId? }

3. Cập nhật khách
   PUT /customers/{id} { fullName, phoneNumber }

4. Xóa khách
   DELETE /customers/{id}
```

#### F. Dashboard & Thống kê (Basic plan+)
```
1. Tổng quan doanh số
   GET /sales/dashboard/overview { from?, to? }
   → totalRevenue, totalOrders, totalCustomers, revenueGrowth

2. Biểu đồ doanh thu
   GET /sales/dashboard/revenue-chart { groupBy: "day"|"week"|"month" }

3. Top sản phẩm bán chạy
   GET /sales/dashboard/top-products { top: 10 }

4. Phân bố trạng thái đơn
   GET /sales/dashboard/order-status

5. Hoạt động gần đây
   GET /sales/dashboard/recent-activity { limit: 5 }

6. Xuất báo cáo Excel (Pro plan)
   GET /report/sales/export { fromDate?, toDate? }
```

#### G. Quản lý Feedback & Loyalty (Pro plan)
```
1. Xem feedback từ khách
   GET /feedback { fromDate?, toDate?, paging }

2. Tóm tắt feedback
   GET /feedback/summary
   → avgRating, totalCount, distribution (1-5 stars)

3. Tạo rule loyalty
   POST /loyalty-rules
   { name, type, earningRate, minSpend }

4. Xem rule loyalty
   GET /loyalty-rules

5. Xem điểm loyalty khách
   GET /customers/{customerId}/loyalty-summary
   → totalPoints, rank

6. Xem lịch giao dịch điểm
   GET /customers/{customerId}/loyalty-transactions

7. Hoàn tiền điểm cho khách
   POST /customers/{customerId}/redeem { points }
```

#### H. Quản lý nhân viên & phân công
```
1. Xem danh sách nhân viên
   GET /employees { paging }

2. Tạo nhân viên
   POST /employees/invite
   { email, role: "Manager"|"Staff", storeName }
   → Gửi email mời join

3. Xem chi tiết nhân viên
   GET /employees/{id}

4. Cập nhật nhân viên
   PUT /employees/{id}
   { fullName, position, baseSalary }

5. Tạo task/phân công
   POST /tasks (Basic plan+)
   {
     title, description,
     assignedToEmployeeId,
     dueDate, priority
   }

6. Xem danh sách task
   GET /tasks

7. Cập nhật trạng thái task
   PUT /tasks/{id}/status { status: "Pending"|"InProgress"|"Completed" }
```

#### I. Tính năng GPS Check-in/out (Pro plan)
```
1. Check-in
   POST /timekeeping/check-in
   {
     latitude, longitude,
     selfieUrl? (optional)
   }
   → Ghi nhận thời gian check-in, kiểm tra trễ giờ

2. Check-out
   POST /timekeeping/check-out
   { latitude, longitude }

3. Xem lịch check-in hôm nay
   GET /timekeeping/today
   → hasCheckedIn, hasCheckedOut, workHours

4. Xem lịch check-in lịch sử
   GET /timekeeping { paging }

5. Tóm tắt timekeeping tháng
   GET /timekeeping/summary { month?, year? }
```

#### J. Quản lý gói & thanh toán
```
1. Xem gói dịch vụ sẵn có
   GET /subscriptions/plans
   → Danh sách: Trial, Basic, Pro + giá, tính năng

2. Mua gói (chuyển từ Trial → Basic/Pro)
   POST /subscriptions/purchase { planId }
   → Tạo pending payment

3. Khởi tạo thanh toán (VNPay)
   GET /payments/initiate?paymentId=X&provider=vnpay
   → Trả về payment URL hoặc QR code

4. Kiểm tra trạng thái thanh toán
   GET /payments/{paymentId}/status
   → Polling từ frontend khi chờ thanh toán

5. Xem trạng thái subscription hiện tại
   GET /identity/subscription/status
   → status, planName, daysRemaining, expiryDate
```

#### K. Cài đặt & hồ sơ
```
1. Xem hồ sơ cá nhân
   GET /employees/me
   → fullName, email, position, avatar

2. Cập nhật hồ sơ
   PUT /employees/me { fullName, phoneNumber }

3. Upload ảnh đại diện
   POST /employees/me/avatar (multipart/form-data)

4. Đổi mật khẩu
   POST /identity/auth/change-password
   { currentPassword, newPassword }

5. Đăng xuất
   POST /identity/auth/logout
   → Token bị blacklist
```

---

## 2. MANAGER (Quản lý cửa hàng)

### Quyền hạn
- Xem tất cả thống kê (như Owner)
- Quản lý Staff (create, update, không xóa)
- Xem + tạo đơn hàng
- Quản lý sản phẩm (create, update, delete) — **KHÔNG quản lý Owner tài khoản**
- Xem + quản lý kho
- Xem khách hàng + feedback
- Tạo task cho Staff
- **KHÔNG**: quản lý gói, thanh toán, xóa nhân viên Manager

### Luồng làm việc (tương tự Owner, nhưng giới hạn quyền hạn)

#### Điểm khác vs Owner:
```
1. KHÔNG thấy menu "Gói dịch vụ & thanh toán"
   - Không thể nâng cấp gói, mua Premium features

2. KHÔNG thể quản lý Owner & Manager khác
   - Chỉ quản lý Staff
   - Không thể mời Manager mới

3. KHÔNG thể xóa cửa hàng
   - Chỉ Owner mới được

4. Tất cả feature khác giống Owner
   (POS, Inventory, Dashboard, Feedback, Loyalty, Tasks, Check-in)
```

---

## 3. STAFF (Nhân viên bán hàng)

### Quyền hạn
- **Chỉ xem** sản phẩm, danh mục, khách hàng
- Tạo + quản lý **đơn hàng riêng mình** (POS)
- Check-in/out (Pro plan)
- Xem **task được giao** cho mình
- Cập nhật trạng thái **task của mình**
- Xem hồ sơ cá nhân + đổi mật khẩu
- **KHÔNG**: quản lý kho, xem dashboard, quản lý khách, xem feedback

### Luồng làm việc

#### A. Đăng nhập
```
1. Nhân viên được Manager/Owner mời qua email
   Email: "Bạn được mời làm nhân viên tại cửa hàng X"

2. Click link → Đăng ký account
   POST /identity/auth/register { email, password, fullName }

3. Xác thực email
   POST /identity/auth/verify-email { email, otpCode }

4. Đăng nhập
   POST /identity/auth/login
   → JWT: role="Staff", store_id=store_uuid
```

#### B. Bán hàng (POS)
```
1. Xem danh mục sản phẩm
   GET /categories

2. Xem sản phẩm (có thể search, filter)
   GET /products { keyword, categoryId }

3. Thêm vào giỏ hàng (local state)
   - Không có API, quản lý ở frontend
   - Kiểm tra stock: product.stockQuantity > 0

4. Tạo đơn hàng (checkout)
   POST /orders
   {
     paymentMethod: "Cash" | "Card",
     discountAmount: 0,
     items: [{ productId, quantity }]
   }
   → Tự động ghi tên Staff vào employeeId

5. Xem danh sách đơn của mình
   GET /orders { status?, paging }
   → Chỉ thấy order được tạo bởi mình
```

#### C. Quản lý Task
```
1. Xem task được giao cho mình
   GET /tasks/me
   → title, description, dueDate, priority, status

2. Cập nhật trạng thái task
   PUT /tasks/{id}/status
   { status: "InProgress" | "Completed" }
   → Chỉ cập nhật task của mình
```

#### D. Check-in/out (Pro plan)
```
1. Check-in buổi sáng
   POST /timekeeping/check-in
   { latitude, longitude, selfieUrl? }

2. Check-out cuối ngày
   POST /timekeeping/check-out
   { latitude, longitude }

3. Xem lịch check-in hôm nay
   GET /timekeeping/today

4. Xem lịch check-in lịch sử
   GET /timekeeping { paging }
   → Chỉ thấy lịch của mình
```

#### E. Hồ sơ & Cài đặt
```
1. Xem hồ sơ
   GET /employees/me

2. Cập nhật hồ sơ (chỉ thông tin cá nhân)
   PUT /employees/me { fullName, phoneNumber }

3. Upload ảnh
   POST /employees/me/avatar

4. Đổi mật khẩu
   POST /identity/auth/change-password

5. Đăng xuất
   POST /identity/auth/logout
```

---

## 4. ENDPOINTS ĐƯỢC IMPLEMENT TRONG MOBILE

### ✅ Đã implement

| Feature | Endpoints |
|---------|-----------|
| **Auth** | login, register, verify-email, reset-password, change-password, logout |
| **Subscription** | getStatus, startTrial |
| **Dashboard** | overview, revenue-chart, inventory-summary, recent-activity |
| **Orders** | getOrders, createOrder, getOrderById, updateOrderStatus, cancelOrder |
| **Products** | getProducts, getProductById (implicit) |
| **Categories** | getCategories |
| **Inventory** | createInventoryTicket, getInventory, getInventoryDetail, confirmInventory, cancelInventory |
| **HR/Employees** | getEmployees, getMe, updateMe |
| **CRM/Customers** | getCustomers (implicit) |
| **Stores** | getCurrentStore, switchStore, getMyOwnedStores |

### ❌ Chưa implement (thiếu)

| Feature | Missing Endpoints | Roles | Why Missing? |
|---------|-------------------|-------|--------------|
| **Products Management** | POST /products, PUT /products/{id}, DELETE /products/{id} | Owner, Manager | Chưa có màn hình create/edit product |
| **Categories Management** | POST /categories, PUT /categories/{id}, DELETE /categories/{id} | Owner, Manager | Chưa có màn hình quản lý category |
| **Feedback/Reviews** | GET /feedback, GET /feedback/summary, POST /feedback | Owner, Manager | Chưa implement feedback UI |
| **Loyalty** | POST/PUT/DELETE /loyalty-rules, GET /loyalty-*, POST /redeem | Owner, Manager (Pro) | Pro plan feature, chưa UI |
| **Timekeeping** | POST /timekeeping/check-in, POST /timekeeping/check-out, GET /timekeeping | All (Pro) | Pro plan feature, chưa UI |
| **Tasks** | POST/PUT/DELETE /tasks, PUT /tasks/{id}/status, GET /tasks/me | Owner, Manager, Staff | Chưa implement task UI (partial only) |
| **Reporting** | GET /report/sales/export | Owner, Manager (Pro) | Excel export, chưa UI |
| **Payments/Subscription** | POST /subscriptions/purchase, GET /payments/initiate, GET /payments/status | Owner | Chưa implement payment UI |
| **Employee Management** | POST /employees/invite, PUT /employees/{id}, DELETE /employees/{id} | Owner, Manager | Chưa full implement |
| **Customer Management** | POST/PUT/DELETE /customers | All | Customers read-only |

---

## 5. PERMISSION MATRIX

| Feature | Owner | Manager | Staff | Trial | Basic | Pro |
|---------|-------|---------|-------|-------|-------|-----|
| **View Dashboard** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **View Orders** | ✅ | ✅ | ✅* | ✅* | ✅ | ✅ |
| **Create Order** | ✅ | ✅ | ✅* | ✅* | ✅ | ✅ |
| **View Products** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manage Products** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Manage Inventory** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **View Customers** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Manage Customers** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **View Feedback** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Manage Loyalty** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Check-in/out** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Create Tasks** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **View Own Tasks** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Export Reports** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Manage Plans** | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |

**Legend:**
- ✅ = Có quyền truy cập
- ❌ = Không có quyền
- ✅* = Chỉ xem/tạo của mình
- Trial/Basic/Pro = Gói dịch vụ

---

## 6. SUBSCRIPTION STATUS & TRIAL LOGIC

### Trial (7 ngày)
```
Startup flow:
1. Register → Verify Email
2. Login → PotentialOwner
3. Start Trial → Trial store created, status="Trial"
4. Can use: POS, Products, Inventory, Employees (basic)
5. Cannot use: Dashboard (full), Loyalty, Check-in, Reports

On Day 8:
→ Trial expired message
→ Can view but NOT create orders
→ Redirect to subscription page
```

### Basic Plan (paid)
```
After purchase:
→ Status = "Active"
→ Can use: Dashboard, Variants, Tasks, Employees, all CRUD
→ Cannot use: Loyalty, Check-in, Export Reports
```

### Pro Plan (paid)
```
After upgrade from Basic:
→ All Basic features +
→ Loyalty, Check-in, Export Reports, Multi-store management
```

---

## 7. FEATURE GATING

Mobile app được gated bằng:
1. **HTTP 403** từ backend với error code:
   - `TrialExpired`: Dùng thử hết hạn
   - `SubscriptionExpired`: Gói hết hạn
   - `FeatureNotAvailable`: Tính năng không có trong plan

2. **App-side check** trong `useSubscriptionStore`:
   ```typescript
   const canUse = (feature) => {
     // Check dựa trên planName từ API
     return config[planName].features[feature];
   }
   ```

3. **UI Components** sử dụng `<FeatureGate feature="name">`:
   ```tsx
   <FeatureGate feature="dashboard">
     <ModernRevenueChart ... />
   </FeatureGate>
   ```

---

## 8. NEXT STEPS — CÓ NÊN IMPLEMENT THÊM?

### Priority 1 (Core POS features - nên làm)
- [ ] Product Management (Create/Edit/Delete) — Owner, Manager
- [ ] Customer Management (Create/Edit/Delete) — Owner, Manager
- [ ] Basic Employee/Staff Management — Owner
- [ ] Payment Integration (VNPay) — Upgrade trial → Basic/Pro

### Priority 2 (Business features - nên làm)
- [ ] Feedback Management UI — Owner, Manager
- [ ] Task Management (full CRUD) — Owner, Manager, Staff
- [ ] Sales Reports (Excel export) — Owner, Manager (Pro)
- [ ] Timekeeping (Check-in/out) — All (Pro plan)

### Priority 3 (Advanced - có thể bỏ)
- [ ] Loyalty Program Management — Owner (Pro)
- [ ] Advanced Analytics/Reporting — Owner, Manager (Pro)
- [ ] Multi-store Dashboard switching — Owner (Pro)
- [ ] Promotional Campaigns — Owner, Manager (Pro)

---

## 9. API TESTING NOTES

- **Base URL:** `http://localhost:5000/api` hoặc live API
- **Auth Header:** `Authorization: Bearer {jwt_token}`
- **Rate Limiting:** ~1000 req/min per token
- **Timeout:** 15s (configured in axios client)
- **Cache:** Dashboard endpoints cache 3-10 min, clear on subscription change

---

