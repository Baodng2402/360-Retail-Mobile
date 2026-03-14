# 🔗 Hướng dẫn cấu hình API URL

## Tại sao cần làm bước này?

App mobile kết nối đến backend qua **IP mạng nội bộ (LAN)**. Mỗi khi bạn đổi mạng WiFi (nhà → trường → quán café...), IP máy bạn sẽ thay đổi → cần cập nhật lại.

> ⚠️ File `.env` **KHÔNG được push lên Git** (đã nằm trong `.gitignore`), nên mỗi người phải tự tạo riêng.

---

## Bước 1: Tạo file `.env`

Khi mới clone project về, **copy file mẫu**:

```bash
cp .env.example .env
```

---

## Bước 2: Tìm IP máy đang chạy backend

### macOS

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Windows (CMD)

```bash
ipconfig
```

→ Tìm dòng **IPv4 Address** trong phần WiFi, ví dụ: `192.168.1.5`

### Linux

```bash
hostname -I
```

---

## Bước 3: Cập nhật file `.env`

Mở file `.env` ở thư mục gốc project, sửa IP:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:5001
```

Thay `192.168.x.x` bằng IP bạn vừa tìm được.

**Ví dụ:**

| Địa điểm  | IP máy        | Giá trị trong `.env`                            |
| --------- | ------------- | ----------------------------------------------- |
| Ở nhà     | 192.168.2.4   | `EXPO_PUBLIC_API_URL=http://192.168.2.4:5001`   |
| Ở trường  | 10.87.20.15   | `EXPO_PUBLIC_API_URL=http://10.87.20.15:5001`   |
| Quán café | 192.168.1.100 | `EXPO_PUBLIC_API_URL=http://192.168.1.100:5001` |

---

## Bước 4: Restart Expo

**Mỗi lần sửa `.env`, phải restart Expo** (env chỉ được đọc 1 lần khi khởi động):

```bash
npx expo start --clear
```

---

## ⚡ Tóm tắt nhanh (TL;DR)

Mỗi khi đổi WiFi hoặc clone mới:

```bash
# 1. Tìm IP
ifconfig | grep "inet " | grep -v 127.0.0.1    # macOS
ipconfig                                         # Windows

# 2. Sửa .env
# EXPO_PUBLIC_API_URL=http://<IP_CỦA_BẠN>:5001

# 3. Restart Expo
npx expo start --clear
```

---

## ❓ Lỗi thường gặp

| Lỗi                           | Nguyên nhân                   | Cách sửa                       |
| ----------------------------- | ----------------------------- | ------------------------------ |
| `Network Error`               | IP sai hoặc backend chưa chạy | Kiểm tra lại IP + chạy backend |
| Sửa `.env` rồi mà vẫn lỗi     | Chưa restart Expo             | Chạy `npx expo start --clear`  |
| Điện thoại không kết nối được | Khác mạng WiFi với máy tính   | Kết nối cùng 1 WiFi            |
