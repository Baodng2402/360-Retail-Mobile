import type { AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { extractList, extractPaged, extractSingle } from './normalizeResponse';

function response(data: unknown): AxiosResponse {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

describe('normalizeResponse', () => {
  describe('extractList', () => {
    it('extracts from raw array', () => {
      const res = response([{ id: 1 }, { id: 2 }]);
      expect(extractList<{ id: number }>(res)).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('extracts from ApiResponse<T[]> data.data', () => {
      const res = response({ success: true, data: [{ id: 10 }] });
      expect(extractList<{ id: number }>(res)).toEqual([{ id: 10 }]);
    });

    it('extracts from paged payload data.items', () => {
      const res = response({
        success: true,
        data: {
          items: [{ id: 3 }, { id: 4 }],
          totalCount: 2,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        },
      });
      expect(extractList<{ id: number }>(res)).toEqual([{ id: 3 }, { id: 4 }]);
    });

    it('returns empty array when unknown structure', () => {
      const res = response({ hello: 'world' });
      expect(extractList(res)).toEqual([]);
    });
  });

  describe('extractPaged', () => {
    it('normalizes paged response with defaults', () => {
      const res = response({
        data: {
          items: [{ id: 1 }],
          totalCount: 5,
          pageNumber: 2,
          pageSize: 1,
          totalPages: 5,
        },
      });

      expect(extractPaged<{ id: number }>(res)).toEqual({
        items: [{ id: 1 }],
        totalCount: 5,
        pageNumber: 2,
        pageSize: 1,
        totalPages: 5,
      });
    });

    it('falls back to derived defaults when fields missing', () => {
      const res = response([{ id: 7 }, { id: 8 }]);
      expect(extractPaged<{ id: number }>(res)).toEqual({
        items: [{ id: 7 }, { id: 8 }],
        totalCount: 2,
        pageNumber: 1,
        pageSize: 2,
        totalPages: 1,
      });
    });

    it('handles BE CRM format { data: [...], meta: { page, pageSize, total } }', () => {
      // This is the exact format returned by BE CustomerController GET /crm/customers
      const res = response({
        data: [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }],
        meta: { page: 1, pageSize: 20, total: 3 },
      });
      expect(extractPaged<{ id: string }>(res)).toMatchObject({
        items: [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }],
        totalCount: 3,
        pageNumber: 1,
        pageSize: 20, // comes from meta.pageSize
      });
    });
  });

  describe('extractSingle', () => {
    it('extracts from ApiResponse<T>', () => {
      const res = response({ success: true, data: { id: 'abc' } });
      expect(extractSingle<{ id: string }>(res)).toEqual({ id: 'abc' });
    });

    it('extracts from raw object', () => {
      const res = response({ id: 'raw' });
      expect(extractSingle<{ id: string }>(res)).toEqual({ id: 'raw' });
    });
  });
});
