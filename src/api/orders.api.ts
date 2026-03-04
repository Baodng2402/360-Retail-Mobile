import { apiClient } from './client';

export interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  barCode?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productVariantId?: string;
  sku?: string;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  storeId: string;
  code: string;
  employeeId?: string;
  customerId?: string;
  totalAmount: number;
  discountAmount?: number;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export interface OrderItemDto {
  productId: string;
  quantity: number;
  productVariantId?: string;
}

export interface CreateOrderDto {
  customerId?: string;
  paymentMethod?: string;
  discountAmount?: number;
  items: OrderItemDto[];
}

export interface GetOrdersParams {
  page?: number;
  pageSize?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const ordersApi = {
  async createOrder(data: CreateOrderDto): Promise<string> {
    const res = await apiClient.post<any>('sales/orders', data);

    if (res.data && typeof res.data === 'object' && 'success' in res.data) {
      if (!res.data.success) {
        throw new Error(res.data.message || 'Server error creating order');
      }
      return res.data.data;
    }

    if (typeof res.data === 'string') return res.data;

    throw new Error('Invalid response format');
  },

  async getOrders(params?: GetOrdersParams): Promise<Order[]> {
    const paged = await this.getOrdersPaged(params);
    return paged.items;
  },

  async getOrdersPaged(params?: GetOrdersParams): Promise<{
    items: Order[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    queryParams.append('page', (params?.page ?? 1).toString());
    queryParams.append('pageSize', (params?.pageSize ?? 20).toString());

    const res = await apiClient.get<
      | ApiResponse<{
          items: Order[];
          totalCount: number;
          pageNumber: number;
          pageSize: number;
          totalPages: number;
        }>
      | Order[]
    >(`sales/orders?${queryParams.toString()}`);

    if ('success' in res.data && res.data.success && res.data.data) {
      const data = res.data.data;
      if (typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
        return {
          items: data.items,
          totalCount: data.totalCount ?? data.items.length,
          pageNumber: data.pageNumber ?? 1,
          pageSize: data.pageSize ?? 20,
          totalPages: data.totalPages ?? 1,
        };
      }
      if (Array.isArray(data)) {
        return {
          items: data,
          totalCount: data.length,
          pageNumber: 1,
          pageSize: data.length,
          totalPages: 1,
        };
      }
    }
    if (Array.isArray(res.data)) {
      return {
        items: res.data,
        totalCount: res.data.length,
        pageNumber: 1,
        pageSize: res.data.length,
        totalPages: 1,
      };
    }
    return { items: [], totalCount: 0, pageNumber: 1, pageSize: 20, totalPages: 0 };
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await apiClient.get<ApiResponse<Order> | Order>(`sales/orders/${id}`);
    if ('success' in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Order;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const res = await apiClient.put<ApiResponse<Order> | Order>(
      `sales/orders/${id}/status?status=${encodeURIComponent(status)}`
    );
    if ('success' in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Order;
  },

  async cancelOrder(id: string): Promise<Order> {
    const res = await apiClient.put<ApiResponse<Order> | Order>(`sales/orders/${id}/cancel`);
    if ('success' in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Order;
  },
};
