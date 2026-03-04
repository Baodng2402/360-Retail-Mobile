import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { COLORS } from '@/src/constants/colors';
import { ScreenHeader } from '@/src/components';
import { inventoryApi } from '@/src/api';
import type { InventoryTicket } from '@/src/types';

export function InventoryDetailScreen() {
    const insets = useSafeAreaInsets();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();

    const [ticket, setTicket] = useState<InventoryTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const ticketId = route.params?.ticketId;

    useEffect(() => {
        if (!ticketId) {
            navigation.goBack();
            return;
        }

        async function fetchTicket() {
            try {
                const data = await inventoryApi.getTicketById(ticketId);
                setTicket(data);
            } catch (error) {
                console.error(error);
                Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải chi tiết phiếu kho' });
            } finally {
                setLoading(false);
            }
        }

        fetchTicket();
    }, [ticketId, navigation]);

    const handleConfirm = () => {
        Alert.alert('Xác nhận phiếu', 'Bạn có chắc chắn muốn xác nhận phiếu kho này? Kho hàng sẽ được cập nhật.', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xác nhận',
                style: 'destructive',
                onPress: async () => {
                    setProcessing(true);
                    try {
                        await inventoryApi.confirmTicket(ticketId);
                        Toast.show({ type: 'success', text1: 'Đã xác nhận phiếu kho' });
                        navigation.goBack();
                    } catch (error) {
                        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể xác nhận phiếu kho' });
                    } finally {
                        setProcessing(false);
                    }
                }
            }
        ]);
    };

    const handleCancel = () => {
        Alert.alert('Hủy phiếu', 'Bạn có chắc chắn muốn hủy phiếu kho này?', [
            { text: 'Đóng', style: 'cancel' },
            {
                text: 'Hủy phiếu',
                style: 'destructive',
                onPress: async () => {
                    setProcessing(true);
                    try {
                        await inventoryApi.cancelTicket(ticketId);
                        Toast.show({ type: 'success', text1: 'Đã hủy phiếu kho' });
                        navigation.goBack();
                    } catch (error) {
                        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể hủy phiếu kho' });
                    } finally {
                        setProcessing(false);
                    }
                }
            }
        ]);
    };

    const handleDelete = () => {
        Alert.alert('Xóa phiếu', 'Hành động này không thể hoàn tác. Bạn chắc chắn chứ?', [
            { text: 'Đóng', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    setProcessing(true);
                    try {
                        await inventoryApi.deleteTicket(ticketId);
                        Toast.show({ type: 'success', text1: 'Đã xóa phiếu kho' });
                        navigation.goBack();
                    } catch (error) {
                        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể xóa phiếu kho' });
                    } finally {
                        setProcessing(false);
                    }
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View className="flex-1 bg-bg items-center justify-center">
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!ticket) {
        return (
            <View className="flex-1 bg-bg">
                <ScreenHeader title="Chi tiết phiếu" topInset={insets.top} showBackButton />
                <View className="flex-1 items-center justify-center">
                    <Text className="text-muted">Không tìm thấy thông tin phiếu</Text>
                </View>
            </View>
        );
    }

    const typeLabel = ticket.type === 'Import' ? 'Nhập kho' : 'Xuất kho';
    const totalQty = ticket.items?.reduce((cnt, item) => cnt + item.quantity, 0) || 0;

    return (
        <View className="flex-1 bg-bg">
            <ScreenHeader title={`Chi tiết: ${ticket.code}`} topInset={insets.top} showBackButton />

            <ScrollView className="flex-1 px-4 py-2" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Thông tin chung */}
                <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
                    <Text className="text-base font-bold text-foreground mb-3">Thông tin chung</Text>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-sm text-muted">Loại phiếu</Text>
                        <Text className="text-sm font-semibold text-foreground">{typeLabel}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-sm text-muted">Trạng thái</Text>
                        <Text className="text-sm font-semibold text-primary">{ticket.status}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-sm text-muted">Ngày tạo</Text>
                        <Text className="text-sm font-semibold text-foreground">
                            {new Date(ticket.createdAt).toLocaleString('vi-VN')}
                        </Text>
                    </View>
                    {ticket.note && (
                        <View className="mt-2 pt-2 border-t border-divider">
                            <Text className="text-sm text-muted">Ghi chú</Text>
                            <Text className="text-sm text-foreground mt-1">{ticket.note}</Text>
                        </View>
                    )}
                </View>

                {/* Danh sách SP */}
                <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
                    <Text className="text-base font-bold text-foreground mb-3">Sản phẩm ({ticket.items?.length || 0})</Text>

                    {ticket.items?.map((item, index) => (
                        <View key={index} className="flex-row justify-between items-center py-2 border-b border-divider last:border-0">
                            <View className="flex-1 pr-2">
                                <Text className="text-sm font-medium text-foreground">{item.productName || 'Sản phẩm ' + item.productId}</Text>
                                {item.note && <Text className="text-xs text-muted mt-1">{item.note}</Text>}
                            </View>
                            <View className="items-end pl-2">
                                <Text className="text-xs text-muted">Số lượng</Text>
                                <Text className="text-sm font-bold text-foreground">{item.quantity}</Text>
                            </View>
                        </View>
                    ))}

                    <View className="mt-3 pt-3 border-t border-divider flex-row justify-between items-center">
                        <Text className="text-sm font-bold text-foreground">Tổng số lượng</Text>
                        <Text className="text-base font-bold text-primary">{totalQty}</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Actions */}
            <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-divider p-4 flex-row justify-between pb-[env(safe-area-inset-bottom)]" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
                {ticket.status === 'Draft' && (
                    <>
                        <TouchableOpacity
                            className="flex-1 bg-bg border border-border rounded-xl py-3 mr-2 items-center justify-center opacity-80"
                            activeOpacity={0.8}
                            onPress={handleCancel}
                            disabled={processing}>
                            <Text className="text-sm font-bold text-foreground">Hủy phiếu</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 bg-primary rounded-xl py-3 ml-2 items-center justify-center"
                            activeOpacity={0.8}
                            onPress={handleConfirm}
                            disabled={processing}>
                            {processing ? <ActivityIndicator size="small" color="#0F172A" /> : <Text className="text-sm font-bold" style={{ color: '#0F172A' }}>Xác nhận</Text>}
                        </TouchableOpacity>
                    </>
                )}

                {(ticket.status === 'Cancelled' || ticket.status === 'Draft') && (
                    <TouchableOpacity
                        className="flex-shrink-0 bg-bg border border-rose-500 rounded-xl py-3 px-4 ml-2 items-center justify-center"
                        activeOpacity={0.8}
                        onPress={handleDelete}
                        disabled={processing}>
                        <Ionicons name="trash" size={18} color="#EF4444" />
                    </TouchableOpacity>
                )}

                {ticket.status === 'Confirmed' && (
                    <View className="flex-1 items-center py-3">
                        <Text className="text-sm font-bold text-success">Phiếu đã hoàn tất</Text>
                    </View>
                )}
            </View>
        </View>
    );
}
