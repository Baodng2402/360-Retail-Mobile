import { apiClient } from './client';

export const reportsApi = {
  async exportSalesReport(params?: { fromDate?: string; toDate?: string }): Promise<Blob> {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 30);

    const fromDate = params?.fromDate ?? from.toISOString();
    const toDate = params?.toDate ?? now.toISOString();

    try {
      const res = await apiClient.get('/sales/report/sales/export', {
        params: { fromDate, toDate },
        responseType: 'arraybuffer',
      });

      const contentType =
        res.headers?.['content-type'] ??
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      return new Blob([res.data], { type: contentType });
    } catch (error) {
      console.error('[reportsApi.exportSalesReport] Failed to export report:', error);
      throw error;
    }
  },
};
