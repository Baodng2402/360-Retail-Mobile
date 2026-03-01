export const formatCurrency = (amount: number): string => amount.toLocaleString('vi-VN') + 'đ';

export const formatCompact = (amount: number): string => {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + ' tỷ';
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + ' tr';
  if (amount >= 1_000) return (amount / 1_000).toFixed(0) + 'K';
  return amount.toFixed(0) + 'đ';
};

export const formatRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ`;
  return `${Math.floor(hours / 24)} ngày`;
};

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

export const getStatusInfo = (status: string) => {
  const map: Record<string, { color: string; bg: string; text: string }> = {
    completed: { color: '#4CAF50', bg: '#E8F5E9', text: 'Hoàn thành' },
    processing: { color: '#42A5F5', bg: '#E3F2FD', text: 'Đang xử lý' },
    pending: { color: '#FFA726', bg: '#FFF3E0', text: 'Chờ xử lý' },
    shipping: { color: '#26C6DA', bg: '#E0F7FA', text: 'Đang giao' },
    cancelled: { color: '#EF5350', bg: '#FFEBEE', text: 'Đã hủy' },
    in_stock: { color: '#26C6DA', bg: '#E0F7FA', text: 'CÒN HÀNG' },
    low_stock: { color: '#FF7043', bg: '#FBE9E7', text: 'SẮP HẾT' },
    out_of_stock: { color: '#EF5350', bg: '#FFEBEE', text: 'HẾT HÀNG' },
  };
  return map[status] || { color: '#94A3B8', bg: '#F1F5F9', text: status };
};
