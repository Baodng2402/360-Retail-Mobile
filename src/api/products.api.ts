import { apiClient } from './client';
import type {
  ApiResponse,
  Product,
  GetProductsParams,
  CreateProductDto,
  UpdateProductDto,
  ProductsResponse,
} from '@/src/types';
import { extractList, extractPaged, extractSingle } from './utils/normalizeResponse';

type ProductFormPayload = FormData | CreateProductDto | UpdateProductDto;

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function buildProductFormData(data: ProductFormPayload, productId?: string): FormData {
  if (isFormData(data)) {
    return data;
  }

  const formData = new FormData();
  const typedData = data as CreateProductDto | UpdateProductDto;

  if (productId || 'id' in typedData) {
    formData.append('Id', productId ?? (typedData as UpdateProductDto).id);
  }

  formData.append('ProductName', typedData.productName);
  formData.append('CategoryId', typedData.categoryId);
  formData.append('Price', typedData.price.toString());
  formData.append('StockQuantity', typedData.stockQuantity.toString());

  if ('isActive' in typedData && typedData.isActive !== undefined) {
    formData.append('IsActive', typedData.isActive.toString());
  }
  if (typedData.hasVariants !== undefined) {
    formData.append('HasVariants', typedData.hasVariants.toString());
  }
  if (typedData.barCode) formData.append('BarCode', typedData.barCode);
  if (typedData.description) formData.append('Description', typedData.description);
  if (typedData.costPrice !== undefined) {
    formData.append('CostPrice', typedData.costPrice.toString());
  }

  if ('variantsJson' in typedData && typedData.variantsJson) {
    formData.append('VariantsJson', typedData.variantsJson);
  } else if (typedData.variants && typedData.variants.length > 0) {
    formData.append('VariantsJson', JSON.stringify(typedData.variants));
  }

  if (typedData.imageFile) {
    formData.append('ImageFile', typedData.imageFile as any);
  }

  return formData;
}

export const productsApi = {
  async getProducts(params?: GetProductsParams): Promise<Product[]> {
    const mapProduct = (p: any) => ({
      ...p,
      category: p.category || { categoryName: p.categoryName || 'Không có' },
    });

    try {
      const queryParams = new URLSearchParams();

      if (params?.storeId) queryParams.append('storeId', params.storeId);
      if (params?.keyword) queryParams.append('keyword', params.keyword);
      if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.includeInactive !== undefined) {
        queryParams.append('includeInactive', params.includeInactive.toString());
      }

      const url = `sales/Products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await apiClient.get<ApiResponse<ProductsResponse> | Product[]>(url);
      const paged = extractPaged<Product>(res);
      if (paged.items.length > 0) {
        return paged.items.map(mapProduct);
      }

      return extractList<Product>(res).map(mapProduct);
    } catch (error) {
      throw error;
    }
  },

  async getProductById(id: string, storeId?: string): Promise<Product> {
    const queryParams = new URLSearchParams();
    if (storeId) queryParams.append('storeId', storeId);

    const res = await apiClient.get<ApiResponse<Product> | Product>(
      `sales/Products/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    );

    return extractSingle<Product>(res);
  },

  async createProduct(data: FormData | CreateProductDto): Promise<Product> {
    const formData = buildProductFormData(data);
    const res = await apiClient.post<ApiResponse<Product> | Product>('sales/Products', formData, {
      headers: { 'Content-Type': undefined },
    });
    return extractSingle<Product>(res);
  },

  async updateProduct(id: string, data: FormData | UpdateProductDto): Promise<Product> {
    const formData = buildProductFormData(data, id);
    const res = await apiClient.put<ApiResponse<Product> | Product>(`sales/Products/${id}`, formData, {
      headers: { 'Content-Type': undefined },
    });
    return extractSingle<Product>(res);
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`sales/Products/${id}`);
  },
};
