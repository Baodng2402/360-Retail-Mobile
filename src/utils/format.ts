export const formatCurrency = (amount: number): string => amount.toLocaleString('vi-VN') + 'đ';

export const formatRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ`;
  return `${Math.floor(hours / 24)} ngày`;
};

export const getStatusInfo = (status: string) => {
  const map: Record<string, { color: string; bg: string; text: string }> = {
    completed: { color: 'text-green-600', bg: 'bg-green-100', text: 'Hoàn thành' },
    processing: { color: 'text-blue-600', bg: 'bg-blue-100', text: 'Đang xử lý' },
    pending: { color: 'text-amber-600', bg: 'bg-amber-100', text: 'Chờ xử lý' },
    cancelled: { color: 'text-red-600', bg: 'bg-red-100', text: 'Đã hủy' },
  };
  return map[status] || { color: 'text-gray-600', bg: 'bg-gray-100', text: status };
};
