export interface Store {
  id: string;
  storeName: string;
  address?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  productName: string;
  price: number;
  stockQuantity: number;
  categoryName?: string;
}

export interface Order {
  id: string;
  code: string;
  customerName?: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  itemCount?: number;
}

export interface Category {
  id: string;
  name: string;
}

export const stores: Store[] = [
  { id: '1', storeName: 'Cửa hàng ABC - CN1', address: '123 Nguyễn Huệ, Q1', isActive: true },
  { id: '2', storeName: 'Cửa hàng ABC - CN2', address: '456 Lê Lợi, Q3', isActive: true },
];

export const categories: Category[] = [
  { id: '1', name: 'Điện tử' },
  { id: '2', name: 'Thời trang' },
  { id: '3', name: 'Gia dụng' },
  { id: '4', name: 'Thực phẩm' },
];

export const products: Product[] = [
  {
    id: '1',
    productName: 'iPhone 15 Pro Max',
    price: 29990000,
    stockQuantity: 12,
    categoryName: 'Điện tử',
  },
  {
    id: '2',
    productName: 'Samsung Galaxy S24',
    price: 22990000,
    stockQuantity: 8,
    categoryName: 'Điện tử',
  },
  {
    id: '3',
    productName: 'Áo thun nam Premium',
    price: 299000,
    stockQuantity: 45,
    categoryName: 'Thời trang',
  },
  {
    id: '4',
    productName: 'Quần jean nữ Slim',
    price: 450000,
    stockQuantity: 23,
    categoryName: 'Thời trang',
  },
  {
    id: '5',
    productName: 'Nồi chiên không dầu',
    price: 1890000,
    stockQuantity: 5,
    categoryName: 'Gia dụng',
  },
  {
    id: '6',
    productName: 'Máy xay sinh tố',
    price: 799000,
    stockQuantity: 15,
    categoryName: 'Gia dụng',
  },
];

export const orders: Order[] = [
  {
    id: '1',
    code: 'DH001234',
    customerName: 'Nguyễn Văn A',
    totalAmount: 580000,
    status: 'pending',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    itemCount: 3,
  },
  {
    id: '2',
    code: 'DH001233',
    customerName: 'Trần Thị B',
    totalAmount: 1250000,
    status: 'processing',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    itemCount: 5,
  },
  {
    id: '3',
    code: 'DH001232',
    customerName: 'Lê Văn C',
    totalAmount: 320000,
    status: 'completed',
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    itemCount: 2,
  },
  {
    id: '4',
    code: 'DH001231',
    customerName: 'Phạm Thị D',
    totalAmount: 29990000,
    status: 'completed',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    itemCount: 1,
  },
];
