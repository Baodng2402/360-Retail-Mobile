# 360 Rental Mobile — Implementation Tasks (Codex Agent Prompts)

> Sử dụng các prompt dưới để giao cho Codex Agent implement features.
> Mỗi task độc lập, có thể làm song song.

---

## Priority 1 — CORE FEATURES (Tuần 1-2)

### Task 1.1 — API Client & Response Normalization Utility

**Status:** 🔴 Required

**Description:** Tạo utility normalize API response format (vì backend trả về nhiều format khác nhau)

**Codex Agent Prompt:**
```
Tạo file: src/api/utils/normalizeResponse.ts

Implement các function sau:
1. extractList<T>(response: AxiosResponse): T[]
   - Xử lý khi API trả về:
     * data.data (ApiResponse<T[]>)
     * data.items (paginated response)
     * data (raw array)
   - Return default empty array nếu không match

2. extractPaged<T>(response: AxiosResponse): PagedResult<T>
   - Normalize paginated response
   - Return { items, totalCount, pageNumber, pageSize, totalPages }
   - Handle missing fields với default values

3. extractSingle<T>(response: AxiosResponse): T
   - Normalize single object response
   - Handle both ApiResponse<T> và raw T format

Dùng TypeScript strict mode. Add JSDoc comments.
Export tất cả functions.
```

---

### Task 1.2 — Product Management API Layer

**Status:** 🔴 Required

**Description:** Complete product management API (CRUD)

**Codex Agent Prompt:**
```
Mở rộng: src/api/products.api.ts

Thêm các functions:
1. createProduct(formData: FormData): Promise<Product>
   - Dùng multipart/form-data
   - Fields: productName, sku, description, price, costPrice, stockQuantity, categoryId, imageFile, variants
   - POST /products

2. updateProduct(id: string, formData: FormData): Promise<Product>
   - PUT /products/{id}
   - Cùng fields như create

3. deleteProduct(id: string): Promise<void>
   - DELETE /products/{id}

4. getProductById(id: string): Promise<Product>
   - GET /products/{id}

Cài đặt axios FormData handling:
- Tự động set Content-Type: multipart/form-data
- Handle file upload (IFormFile từ backend)

Dùng normalizeResponse utility cho consistent format.
Add error handling với console.error().
Export tất cả dưới productsApi object.
```

---

### Task 1.3 — Category Management API Layer

**Status:** 🔴 Required

**Description:** Complete category CRUD API

**Codex Agent Prompt:**
```
Tạo/Mở rộng: src/api/categories.api.ts

Implement:
1. createCategory(name: string, description?: string): Promise<Category>
   - POST /categories
   - { categoryName: name, description }

2. updateCategory(id: string, name: string, description?: string): Promise<Category>
   - PUT /categories/{id}

3. deleteCategory(id: string): Promise<void>
   - DELETE /categories/{id}

4. getCategories() — đã có, ensure dùng normalizeResponse

Response type: Category (từ types/index.ts)
Dùng normalizeResponse cho consistency.
Add error handling.
Export dưới categoriesApi.
```

---

### Task 1.4 — Customer Management API Layer

**Status:** 🔴 Required

**Description:** Customer CRUD API

**Codex Agent Prompt:**
```
Tạo: src/api/customers.api.ts

Implement:
1. getCustomers(params?: { paging?: number; pageSize?: number }): Promise<Customer[]>
   - GET /customers
   - Handle pagination

2. getCustomerById(id: string): Promise<Customer>
   - GET /customers/{id}

3. createCustomer(fullName: string, phoneNumber: string, email?: string): Promise<Customer>
   - POST /customers
   - { fullName, phoneNumber, email }

4. updateCustomer(id: string, data: { fullName?: string; phoneNumber?: string; email?: string }): Promise<Customer>
   - PUT /customers/{id}

5. deleteCustomer(id: string): Promise<void>
   - DELETE /customers/{id}

Type: Customer (từ types/index.ts)
Dùng normalizeResponse.
Add JSDoc comments.
Export dưới customersApi.
```

---

### Task 1.5 — Employee/HR Management API Layer

**Status:** 🔴 Required

**Description:** Complete employee management API

**Codex Agent Prompt:**
```
Mở rộng: src/api/hr.api.ts

Thêm:
1. inviteEmployee(email: string, role: "Manager"|"Staff", storeId: string): Promise<{ message: string }>
   - POST /employees/invite
   - { email, role, storeId }
   - Gửi email mời

2. updateEmployee(id: string, data: { fullName?: string; position?: string; baseSalary?: number }): Promise<Employee>
   - PUT /employees/{id}

3. uploadAvatar(file: File): Promise<{ avatarUrl: string }>
   - POST /employees/me/avatar
   - multipart/form-data

4. getEmployees(storeId: string, params?: { paging?: number }): Promise<Employee[]>
   - GET /employees?storeId={storeId}

5. getEmployeeById(id: string): Promise<Employee>
   - GET /employees/{id}

Dùng normalizeResponse.
Handle FormData cho avatar upload.
Export tất cả dưới hrApi.
```

---

### Task 1.6 — Product Management Screen (Create/Edit)

**Status:** 🔴 Required

**Description:** Screen to create/edit products (Owner, Manager)

**Codex Agent Prompt:**
```
Tạo: src/screens/products/ProductFormScreen.tsx

Implement:
1. Component nhận route params:
   - productId?: string (nếu edit mode)
   - storeName: string (để hiển thị breadcrumb)

2. Form fields:
   - Product Name (text input, required)
   - SKU (text input, optional)
   - Description (textarea)
   - Price (number input, required)
   - Cost Price (number input)
   - Stock Quantity (number input, required)
   - Category (dropdown, required)
   - Image (file picker)
   - Has Variants? (toggle - Basic plan+)

3. Behavior:
   - On mount: nếu productId → fetch product data
   - Submit: call productsApi.createProduct() hoặc updateProduct()
   - Validation: productName, price, stockQuantity là required
   - Success: toast message + navigate back
   - Error: toast error message

4. UI:
   - Dùng PrimaryButton, TextInput, Dropdown components
   - Layout: ScrollView với padding 16
   - Safe area insets dùng useSafeAreaInsets()

Tech stack: React hooks, TS, TailwindCSS (nativewind)
Use ScreenHeader component.
Type safety: define ProductFormData type.
```

---

### Task 1.7 — Customer Management Screen (List/Create/Edit)

**Status:** 🔴 Required

**Description:** Screen to manage customers (view, create, edit, delete)

**Codex Agent Prompt:**
```
Tạo: src/screens/customers/CustomerManagementScreen.tsx

Implement:
1. Tabs / Two-panel layout:
   - Left: Customer list (FlatList)
   - Right: Customer detail / edit form (or separate modal)

2. List features:
   - Display: fullName, phoneNumber, totalOrders (if available)
   - Search by name / phone
   - Swipe to delete (optional) hoặc delete button
   - Add button (+) to create new

3. Create/Edit form:
   - Fields: fullName, phoneNumber, email
   - Validation: fullName & phoneNumber required
   - On save: call customersApi.createCustomer() hoặc updateCustomer()
   - On delete: confirm dialog → customersApi.deleteCustomer()

4. Loading states:
   - Show spinner khi fetching list
   - Disable buttons khi submitting

5. Error handling:
   - Toast error messages
   - Log to console

Tech stack: React hooks, FlatList, Modal/BottomSheet, TS
Use ScreenHeader.
Type safety: define Customer CRUD types.
Safe area insets.
```

---

### Task 1.8 — Employee Management Screen (Invite/List/Update)

**Status:** 🔴 Required

**Description:** Screen to manage staff (invite, view, update)

**Codex Agent Prompt:**
```
Tạo: src/screens/employees/EmployeeManagementScreen.tsx

Implement:
1. Two-section layout:
   - Top: Invite new employee button
   - Bottom: Employee list (FlatList)

2. Invite modal:
   - Fields: email, role (dropdown: Manager/Staff)
   - On submit: hrApi.inviteEmployee(email, role, storeId)
   - Success: add to list, close modal, toast "Invitation sent"
   - Error: toast error

3. Employee list:
   - Display: fullName, position, role, joinDate
   - Tap to edit
   - (Owner only) can delete

4. Edit modal:
   - Fields: fullName, position, baseSalary
   - On submit: hrApi.updateEmployee(id, data)
   - Success: update list

5. Loading & error:
   - Spinner on load
   - Toast messages
   - Disable buttons on submit

Tech stack: React hooks, FlatList, Modal, TS
Use ScreenHeader, PrimaryButton, TextInput.
Fetch employee list on mount + refresh
Type safety: Employee type from types/index.ts.
```

---

## Priority 2 — BUSINESS FEATURES (Tuần 3)

### Task 2.1 — Feedback/Reviews Display

**Status:** 🟡 Medium Priority

**Description:** Display customer feedback & ratings (Owner, Manager)

**Codex Agent Prompt:**
```
Tạo: src/api/feedback.api.ts & src/screens/feedback/FeedbackScreen.tsx

API Layer:
1. getFeedback(params?: { fromDate?: string; toDate?: string; paging?: number }): Promise<Feedback[]>
   - GET /feedback

2. getFeedbackSummary(): Promise<FeedbackSummary>
   - GET /feedback/summary
   - Return: avgRating, totalCount, distribution (1-5)

UI Screen:
1. Header: Rating summary (star, avg score, total count)
   - Display distribution bar chart (1-5 stars)

2. List: Recent feedback (FlatList)
   - Display: customerName, rating (stars), content, createdAt
   - Filter by date range (date picker)

3. Interaction:
   - Pull-to-refresh: fetch latest feedback
   - Empty state: "No feedback yet"

Tech: React hooks, FlatList, date picker, TS
Use ScreenHeader, formatRelativeTime utility.
Type: Feedback, FeedbackSummary from types/index.ts.
```

---

### Task 2.2 — Task Management (CRUD + Assignment)

**Status:** 🟡 Medium Priority

**Description:** Create/edit/assign tasks to staff (Owner, Manager)

**Codex Agent Prompt:**
```
Tạo: src/api/tasks.api.ts & src/screens/tasks/TaskManagementScreen.tsx

API Layer:
1. createTask(data: CreateTaskDto): Promise<Task>
   - POST /tasks
   - title, description, assignedToEmployeeId, dueDate, priority

2. updateTask(id: string, data: CreateTaskDto): Promise<Task>
   - PUT /tasks/{id}

3. updateTaskStatus(id: string, status: TaskStatus): Promise<Task>
   - PUT /tasks/{id}/status

4. getTasks(storeId: string): Promise<Task[]>
   - GET /tasks

5. deleteTask(id: string): Promise<void>
   - DELETE /tasks/{id}

6. getMyTasks(): Promise<Task[]>
   - GET /tasks/me (for Staff)

UI Screen (Owner/Manager view):
1. Tab 1: All tasks
   - List: title, assignee, dueDate, priority, status
   - Filter by status, priority, date
   - Create button (+)

2. Tab 2: Create/Edit task modal
   - Fields: title, description, assignedToEmployeeId (dropdown), dueDate (date picker), priority
   - Validation: title, assignee required

3. Tap task → Edit modal
   - Can update all fields
   - Can change status: Pending → InProgress → Completed
   - Can delete (confirm)

UI Screen (Staff view):
- Show only tasks assigned to me
- Can update status (Pending → InProgress → Completed)
- Read-only for other fields

Tech: React hooks, FlatList, Modal, date picker, dropdown, TS
Use ScreenHeader, PrimaryButton, Ionicons.
Type: Task, TaskStatus, CreateTaskDto from types/index.ts.
```

---

### Task 2.3 — Timekeeping (Check-in/out with GPS)

**Status:** 🟡 Medium Priority (Pro plan only)

**Description:** GPS-based employee check-in/out

**Codex Agent Prompt:**
```
Tạo: src/api/timekeeping.api.ts & src/screens/timekeeping/TimekeepingScreen.tsx

API Layer:
1. checkIn(latitude: number, longitude: number, selfieUrl?: string): Promise<CheckInResult>
   - POST /timekeeping/check-in

2. checkOut(latitude: number, longitude: number): Promise<CheckOutResult>
   - POST /timekeeping/check-out

3. getTodayStatus(): Promise<TodayTimekeepingResponse>
   - GET /timekeeping/today
   - Return: hasCheckedIn, hasCheckedOut, workHours, warning

4. getTimekeepingHistory(params?: { paging?: number }): Promise<TimekeepingHistoryRecord[]>
   - GET /timekeeping

5. uploadSelfie(file: File): Promise<{ url: string }>
   - POST /timekeeping/upload-selfie

UI Screen:
1. Status section:
   - Big button: "Check In" or "Check Out" (depends on today status)
   - Display current time, work hours (if checked in)

2. Check-in flow:
   - Tap "Check In" button
   - Auto-get GPS location (require location permission)
   - Optional: take selfie (camera picker)
   - Confirm dialog
   - Call API → toast success/error

3. Check-out flow:
   - Tap "Check Out" button
   - Auto-get GPS
   - Call API → show work hours

4. History section:
   - List recent check-in/out times
   - Pull-to-refresh

Permissions:
- Ask location permission on first check-in
- Ask camera permission if selfie

Tech: React Native location, camera, permissions, TS
Use ScreenHeader, PrimaryButton, formatRelativeTime.
Type: TodayTimekeepingResponse, TimekeepingHistoryRecord.
Require Pro plan (check via useSubscriptionStore).
```

---

### Task 2.4 — Sales Reports & Export (Excel)

**Status:** 🟡 Medium Priority (Pro plan)

**Description:** Generate & download sales report as Excel

**Codex Agent Prompt:**
```
Tạo: src/api/reports.api.ts & src/screens/reports/SalesReportScreen.tsx

API Layer:
1. exportSalesReport(params?: { fromDate?: string; toDate?: string }): Promise<Blob>
   - GET /report/sales/export
   - Return Excel file as blob
   - Default: last 30 days

UI Screen:
1. Header section:
   - Date range picker (from, to dates)
   - "Export" button

2. Preview section (optional):
   - Show summary before export
   - Total revenue, orders, products sold (last 30 days)

3. Export flow:
   - Tap "Export" → call API with date range
   - Show loading spinner
   - On success: auto-download or show share menu
   - On error: toast error

4. History section (optional):
   - List previously exported reports
   - Tap to download again

Permissions:
- Request write permission (iOS/Android)

Tech: React Native Share, file system access, TS
Use ScreenHeader, date picker, PrimaryButton.
Type: SalesReportDto (define locally).
Require Pro plan.
```

---

## Priority 3 — ADVANCED FEATURES (Tuần 4+)

### Task 3.1 — Loyalty Program Management

**Status:** 🟠 Low Priority (Pro plan)

**Description:** Create & manage loyalty rules, view customer points

**Codex Agent Prompt:**
```
Tạo: src/api/loyalty.api.ts & src/screens/loyalty/LoyaltyScreen.tsx

API Layer:
1. getLoyaltyRules(): Promise<LoyaltyRule[]>
   - GET /loyalty-rules

2. createLoyaltyRule(data: CreateLoyaltyRuleDto): Promise<LoyaltyRule>
   - POST /loyalty-rules
   - { name, type, earningRate, minSpend }

3. updateLoyaltyRule(id: string, data: CreateLoyaltyRuleDto): Promise<LoyaltyRule>
   - PUT /loyalty-rules/{id}

4. deleteLoyaltyRule(id: string): Promise<void>
   - DELETE /loyalty-rules/{id}

5. getCustomerLoyaltySummary(customerId: string): Promise<LoyaltySummary>
   - GET /customers/{customerId}/loyalty-summary

6. getCustomerLoyaltyTransactions(customerId: string): Promise<LoyaltyTransaction[]>
   - GET /customers/{customerId}/loyalty-transactions

7. redeemPoints(customerId: string, points: number): Promise<void>
   - POST /customers/{customerId}/redeem

UI Screen (Owner/Manager):
1. Tabs:
   - Tab 1: Loyalty rules list
   - Tab 2: Create/edit rule
   - Tab 3: Customer points lookup

2. Rules list:
   - Display: rule name, earning rate, min spend
   - Edit/delete buttons

3. Create rule modal:
   - Fields: name, type (dropdown), earningRate, minSpend
   - Save/cancel buttons

4. Customer lookup:
   - Search customer by name/phone
   - Show: totalPoints, rank
   - List recent transactions
   - "Redeem" button → enter points → confirm

Tech: React hooks, FlatList, Modal, dropdown, search, TS
Use ScreenHeader, PrimaryButton.
Type: LoyaltyRule, LoyaltySummary, LoyaltyTransaction.
Require Pro plan.
```

---

### Task 3.2 — Payment Integration (VNPay)

**Status:** 🟠 Low Priority

**Description:** Buy subscription plan via VNPay payment gateway

**Codex Agent Prompt:**
```
Tạo: src/api/payment.api.ts & src/screens/subscription/PaymentScreen.tsx

API Layer:
1. purchasePlan(planId: string): Promise<{ paymentId: string; message: string }>
   - POST /subscriptions/purchase

2. initiatePayment(paymentId: string, provider: "vnpay"|"sepay"): Promise<{ paymentUrl?: string; qrCode?: string }>
   - GET /payments/initiate?paymentId={id}&provider=vnpay
   - Return payment URL (redirect to VNPay) or QR code

3. checkPaymentStatus(paymentId: string): Promise<{ status: "pending"|"success"|"failed" }>
   - GET /payments/{paymentId}/status

UI Screen:
1. Plan selection:
   - Display: Basic, Pro plans (price, duration, features)
   - "Upgrade" button

2. Payment flow:
   - Tap "Upgrade" on plan
   - Call purchasePlan() → get paymentId
   - Call initiatePayment() → get VNPay URL
   - Open WebView → navigate to VNPay URL
   - Polling checkPaymentStatus() every 2 seconds
   - On success: close WebView, show success message, refresh subscription status
   - On failure: show error, allow retry

3. Loading states:
   - Show spinner during API calls
   - WebView loading indicator

Tech: React Native WebView, polling, TS
Use ScreenHeader, PrimaryButton, ActivityIndicator.
Type: Plan, PaymentStatus (define locally).
Handle VNPay redirect properly.
```

---

## Priority 4 — OPTIONAL POLISH

### Task 4.1 — Advanced Dashboard (Pro plan)

**Status:** 🟣 Polish (optional)

**Description:** More metrics & interactive charts on dashboard

**Codex Agent Prompt:**
```
Mở rộng: src/screens/HomeScreen.tsx

Thêm sections (behind Pro plan gate):
1. Top selling products chart (pie or bar)
   - Call: salesDashboardApi.getTopProducts()

2. Order status distribution chart
   - Call: salesDashboardApi.getOrderStatus()
   - Show: pending, processing, completed, cancelled

3. Customer analytics
   - Repeat customers vs new customers
   - Customer lifetime value (if available)

4. Best performing days (heatmap)
   - Which day of week has highest revenue

5. Inventory alerts
   - Low stock products (stock <= 10)
   - Out of stock products

6. Interactive filtering
   - Date range picker
   - Category filter
   - Product filter

Tech: React hooks, chart library (react-native-gifted-charts), date picker, TS
Add loading states, error handling.
Keep performance optimized (memoization, lazy loading).
```

---

### Task 4.2 — Dark Mode Support

**Status:** 🟣 Polish (optional)

**Description:** Add dark mode theme toggle

**Codex Agent Prompt:**
```
Tạo: src/stores/useThemeStore.ts & update colors configuration

1. Create Zustand store:
   - State: isDarkMode (boolean)
   - Action: toggleDarkMode()
   - Persist to AsyncStorage

2. Update src/constants/colors.ts:
   - Define dark theme colors (COLORS_DARK)
   - Conditional export based on isDarkMode

3. Update UI components:
   - Read isDarkMode from useThemeStore
   - Apply dark colors conditionally

4. Settings screen:
   - Add "Dark Mode" toggle
   - Save to AsyncStorage

Tech: Zustand, AsyncStorage, TS
Keep backward compatibility (light mode default).
Test on dark theme.
```

---

## Summary Table

| Task | Priority | Role | Plan | Status | Est. Days |
|------|----------|------|------|--------|-----------|
| 1.1 — API Normalization | 🔴 | All | All | ⚪ | 0.5 |
| 1.2 — Product Management API | 🔴 | Owner, Mgr | All | ⚪ | 1 |
| 1.3 — Category Management API | 🔴 | Owner, Mgr | All | ⚪ | 0.5 |
| 1.4 — Customer Management API | 🔴 | Owner, Mgr | All | ⚪ | 1 |
| 1.5 — Employee Management API | 🔴 | Owner, Mgr | All | ⚪ | 1 |
| 1.6 — Product Form Screen | 🔴 | Owner, Mgr | All | ⚪ | 2 |
| 1.7 — Customer Management Screen | 🔴 | Owner, Mgr | All | ⚪ | 2 |
| 1.8 — Employee Management Screen | 🔴 | Owner, Mgr | All | ⚪ | 2 |
| 2.1 — Feedback Display | 🟡 | Owner, Mgr | All | ⚪ | 1.5 |
| 2.2 — Task Management | 🟡 | All | All | ⚪ | 2.5 |
| 2.3 — Timekeeping (GPS) | 🟡 | All | Pro | ⚪ | 2 |
| 2.4 — Sales Reports | 🟡 | Owner, Mgr | Pro | ⚪ | 1.5 |
| 3.1 — Loyalty Program | 🟠 | Owner | Pro | ⚪ | 2 |
| 3.2 — Payment (VNPay) | 🟠 | Owner | All | ⚪ | 2 |
| 4.1 — Advanced Dashboard | 🟣 | Owner, Mgr | Pro | ⚪ | 1 |
| 4.2 — Dark Mode | 🟣 | All | All | ⚪ | 1 |

**Total Estimate:** ~22 days (Priority 1-2: ~12 days)

---

## How to Use

1. **Pick a task** from Priority 1
2. **Copy the prompt** từ "Codex Agent Prompt" section
3. **Paste vào** Codex/Claude conversation
4. **Agent implement** code theo spec
5. **Review code** → merge vào codebase
6. **Test** → move to next task

---

