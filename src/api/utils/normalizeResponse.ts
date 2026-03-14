import type { AxiosResponse } from 'axios';

/** Normalized paged shape used by mobile API layers. */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

/**
 * Extract list data from different backend response formats.
 *
 * Supported formats:
 * - data.data (ApiResponse<T[]>)
 * - data.items (paginated payload)
 * - data (raw array)
 */
export function extractList<T>(response: AxiosResponse): T[] {
  const payload = response.data;

  if (Array.isArray(payload)) {
    return payload as T[];
  }

  const payloadObj = asRecord(payload);
  if (!payloadObj) {
    return [];
  }

  const data = payloadObj.data;
  if (Array.isArray(data)) {
    return data as T[];
  }

  const items = payloadObj.items;
  if (Array.isArray(items)) {
    return items as T[];
  }

  const dataObj = asRecord(data);
  if (dataObj && Array.isArray(dataObj.items)) {
    return dataObj.items as T[];
  }

  return [];
}

/**
 * Normalize paged responses into one predictable structure.
 */
export function extractPaged<T>(response: AxiosResponse): PagedResult<T> {
  const payload = response.data;
  const payloadObj = asRecord(payload);

  // Case: { data: { items: [...], totalCount, ... } } — nested paged object
  const nestedData = asRecord(payloadObj?.data);

  let items: T[];
  let source: Record<string, unknown> | null;

  if (nestedData && Array.isArray(nestedData.items)) {
    // Standard paged: { data: { items: [...], totalCount, pageNumber, pageSize, totalPages } }
    items = nestedData.items as T[];
    source = nestedData;
  } else if (Array.isArray(payloadObj?.data)) {
    // BE CRM format: { data: [...], meta: { page, pageSize, total } }
    items = payloadObj!.data as T[];
    const meta = asRecord(payloadObj?.meta);
    source = meta
      ? {
          totalCount: meta.total ?? items.length,
          pageNumber: meta.page ?? 1,
          pageSize: meta.pageSize ?? items.length,
          totalPages: meta.totalPages ?? 1,
        }
      : { totalCount: items.length, pageNumber: 1, pageSize: items.length, totalPages: 1 };
  } else if (Array.isArray(payload)) {
    // Raw array
    items = payload as T[];
    source = { totalCount: items.length, pageNumber: 1, pageSize: items.length, totalPages: 1 };
  } else {
    items = [];
    source = payloadObj;
  }

  const totalCount = Number(source?.totalCount ?? items.length);
  const pageNumber = Number(source?.pageNumber ?? 1);
  const pageSize = Number(source?.pageSize ?? (items.length > 0 ? items.length : 10));
  const totalPages = Number(
    source?.totalPages ?? (pageSize > 0 ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1),
  );

  return {
    items,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
  };
}

/**
 * Extract a single object from ApiResponse<T> or raw T format.
 */
export function extractSingle<T>(response: AxiosResponse): T {
  const payload = response.data;
  const payloadObj = asRecord(payload);

  if (payloadObj && payloadObj.data !== undefined) {
    return payloadObj.data as T;
  }

  return payload as T;
}
