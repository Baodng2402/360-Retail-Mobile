import type {
  Store,
  Product,
  Order,
  Category,
  Customer,
  ActivityItem,
  BestSeller,
} from '@/src/types';

export const stores: Store[] = [
  {
    id: '1',
    storeName: '360 Store - Chi nhánh chính',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    isActive: true,
  },
  {
    id: '2',
    storeName: '360 Store - Thủ Đức',
    address: '456 Võ Văn Ngân, Thủ Đức, TP.HCM',
    isActive: true,
  },
];

export const categories: Category[] = [
  { id: '1', name: 'Tất cả', icon: 'grid-outline' },
  { id: '2', name: 'Điện thoại', icon: 'phone-portrait-outline' },
  { id: '3', name: 'Laptop', icon: 'laptop-outline' },
  { id: '4', name: 'Phụ kiện', icon: 'headset-outline' },
  { id: '5', name: 'Đồng hồ', icon: 'watch-outline' },
  { id: '6', name: 'Âm thanh', icon: 'musical-notes-outline' },
];

export const products: Product[] = [
  {
    id: '1',
    productName: 'iPhone 15 Pro Max',
    price: 34_990_000,
    stockQuantity: 12,
    categoryName: 'Điện thoại',
    sku: 'IPH-001',
    status: 'in_stock',
  },
  {
    id: '2',
    productName: 'Samsung Galaxy S24 Ultra',
    price: 31_990_000,
    stockQuantity: 8,
    categoryName: 'Điện thoại',
    sku: 'SAM-001',
    status: 'in_stock',
  },
  {
    id: '3',
    productName: 'MacBook Pro 14" M3',
    price: 49_990_000,
    stockQuantity: 3,
    categoryName: 'Laptop',
    sku: 'MAC-001',
    status: 'low_stock',
  },
  {
    id: '4',
    productName: 'iPad Air M2',
    price: 18_990_000,
    stockQuantity: 0,
    categoryName: 'Laptop',
    sku: 'IPD-001',
    status: 'out_of_stock',
  },
  {
    id: '5',
    productName: 'AirPods Pro 2',
    price: 6_490_000,
    stockQuantity: 25,
    categoryName: 'Phụ kiện',
    sku: 'AIR-001',
    status: 'in_stock',
  },
  {
    id: '6',
    productName: 'Apple Watch Ultra 2',
    price: 23_990_000,
    stockQuantity: 2,
    categoryName: 'Đồng hồ',
    sku: 'AWU-001',
    status: 'low_stock',
  },
  {
    id: '7',
    productName: 'Sony WH-1000XM5',
    price: 8_490_000,
    stockQuantity: 15,
    categoryName: 'Âm thanh',
    sku: 'SNY-001',
    status: 'in_stock',
  },
  {
    id: '8',
    productName: 'Samsung Galaxy Buds3 Pro',
    price: 5_990_000,
    stockQuantity: 10,
    categoryName: 'Âm thanh',
    sku: 'SGB-001',
    status: 'in_stock',
  },
];

export const customers: Customer[] = [
  { id: '1', name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', phone: '0901 234 567' },
  { id: '2', name: 'Trần Thị Bình', email: 'binh.tran@email.com', phone: '0912 345 678' },
  { id: '3', name: 'Lê Minh Cường', email: 'cuong.le@email.com', phone: '0923 456 789' },
  { id: '4', name: 'Phạm Hồng Đào', email: 'dao.pham@email.com', phone: '0934 567 890' },
  { id: '5', name: 'Hoàng Đức Em', email: 'em.hoang@email.com', phone: '0945 678 901' },
];

export const orders: Order[] = [
  {
    id: '1',
    code: '#DH2094',
    customerName: 'Nguyễn Văn An',
    totalAmount: 41_480_000,
    status: 'pending',
    createdAt: new Date('2023-10-24').toISOString(),
    itemCount: 2,
  },
  {
    id: '2',
    code: '#DH2093',
    customerName: 'Trần Thị Bình',
    totalAmount: 34_990_000,
    status: 'processing',
    createdAt: new Date('2023-10-23').toISOString(),
    itemCount: 1,
  },
  {
    id: '3',
    code: '#DH2092',
    customerName: 'Lê Minh Cường',
    totalAmount: 68_970_000,
    status: 'completed',
    createdAt: new Date('2023-10-22').toISOString(),
    itemCount: 3,
  },
  {
    id: '4',
    code: '#DH2091',
    customerName: 'Phạm Hồng Đào',
    totalAmount: 23_990_000,
    status: 'shipping',
    createdAt: new Date('2023-10-21').toISOString(),
    itemCount: 1,
  },
  {
    id: '5',
    code: '#DH2090',
    customerName: 'Hoàng Đức Em',
    totalAmount: 0,
    status: 'cancelled',
    createdAt: new Date('2023-10-20').toISOString(),
    itemCount: 1,
  },
];

export const activityFeed: ActivityItem[] = [
  {
    id: '1',
    type: 'order_shipped',
    title: 'Đơn #DH2094 đã giao',
    subtitle: 'Giao đến Q.1, TP.HCM',
    time: new Date(Date.now() - 2 * 60000).toISOString(),
    icon: 'cube-outline',
    iconColor: '#26C6DA',
  },
  {
    id: '2',
    type: 'payment_received',
    title: 'Nhận thanh toán',
    subtitle: 'Hóa đơn #HD8832 - 34.990.000đ',
    time: new Date(Date.now() - 15 * 60000).toISOString(),
    icon: 'card-outline',
    iconColor: '#4CAF50',
  },
  {
    id: '3',
    type: 'new_order',
    title: 'Đơn hàng mới',
    subtitle: 'iPhone 15 Pro Max × 1',
    time: new Date(Date.now() - 45 * 60000).toISOString(),
    icon: 'cart-outline',
    iconColor: '#FF7043',
  },
  {
    id: '4',
    type: 'stock_alert',
    title: 'Cảnh báo tồn kho',
    subtitle: 'MacBook Pro 14" - Còn 3 sản phẩm',
    time: new Date(Date.now() - 120 * 60000).toISOString(),
    icon: 'alert-circle-outline',
    iconColor: '#FFA726',
  },
];

export const bestSellers: BestSeller[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    category: 'Điện thoại',
    salesCount: 48,
    revenue: 1_679_520_000,
    trend: 15,
  },
  {
    id: '2',
    name: 'AirPods Pro 2',
    category: 'Phụ kiện',
    salesCount: 36,
    revenue: 233_640_000,
    trend: 22,
  },
  {
    id: '3',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Điện thoại',
    salesCount: 24,
    revenue: 767_760_000,
    trend: 8,
  },
];

export const dashboardStats = {
  totalSales: 2_850_000_000,
  totalSalesTrend: 15,
  activeOrders: 34,
  activeOrdersTrend: 2,
  productsSold: 156,
  soldCapacity: 72,
  inventoryValue: 1_480_000_000,
  inventoryTrend: 5,
  todayRevenue: 185_000_000,
  weeklyRevenue: [
    120_000_000, 165_000_000, 142_000_000, 198_000_000, 175_000_000, 210_000_000, 185_000_000,
  ],
  weeklyOrders: [8, 12, 9, 15, 11, 18, 14],
  monthlyTarget: 3_500_000_000,
  newCustomers: 12,
  returnRate: 2.1,
};
