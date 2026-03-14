import { useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import type { StackNavigationProp } from '@react-navigation/stack';

import { COLORS } from '@/src/constants/colors';
import { ScreenHeader } from '@/src/components';
import { inventoryApi } from '@/src/api';
import type { MoreStackParamList } from '@/src/navigation/types';
import type { InventoryTicket } from '@/src/types';

type InventoryScreenNavigationProp = StackNavigationProp<MoreStackParamList, 'InventoryManagement'>;

const STATUS_COLOR: Record<string, { bg: string; text: string; label: string }> = {
    Draft: { bg: 'rgba(245,158,11,0.12)', text: '#D97706', label: 'Nháp' },
    Confirmed: { bg: 'rgba(34,197,94,0.12)', text: '#16A34A', label: 'Đã xác nhận' },
    Cancelled: { bg: 'rgba(239,68,68,0.12)', text: '#DC2626', label: 'Đã hủy' },
};

const TYPE_COLOR: Record<string, { bg: string; text: string; label: string; icon: any }> = {
    Import: { bg: 'rgba(56,189,248,0.12)', text: '#0284C7', label: 'Nhập kho', icon: 'arrow-down-circle-outline' },
    Export: { bg: 'rgba(244,114,182,0.12)', text: '#BE185D', label: 'Xuất kho', icon: 'arrow-up-circle-outline' },
};

export function InventoryScreen() {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const navigation = useNavigation<InventoryScreenNavigationProp>();

    const [activeTab, setActiveTab] = useState<'All' | 'Import' | 'Export'>('All');
    const [tickets, setTickets] = useState<InventoryTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const listRef = useRef<FlatList<any>>(null);

    const fetchTickets = useCallback(async () => {
        try {
            const typeParam = activeTab === 'All' ? undefined : activeTab;
            const res = await inventoryApi.getTickets({ type: typeParam });
            setTickets(res.items || []);
        } catch (error) {
            console.error('Failed to load inventory tickets', error);
            Toast.show({ type: 'error', text1: 'Lỗi tải phiếu kho' });
        }
    }, [activeTab]);

    useEffect(() => {
        if (isFocused) {
            setLoading(true);
            fetchTickets().finally(() => setLoading(false));
        }
    }, [isFocused, activeTab, fetchTickets]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTickets();
        setRefreshing(false);
    };

    useEffect(() => {
        requestAnimationFrame(() => {
            listRef.current?.scrollToOffset({ offset: 0, animated: false });
        });
    }, [activeTab]);

    const renderTicket = ({ item }: { item: InventoryTicket }) => {
        const statusCfg = STATUS_COLOR[item.status] || STATUS_COLOR.Draft;
        const typeCfg = TYPE_COLOR[item.type] || TYPE_COLOR.Import;
        const itemsCount = item.items?.reduce((cnt, i) => cnt + Number(i.quantity || 0), 0) || 0;

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('InventoryDetail', { ticketId: item.id })}
                className="mb-3 rounded-xl border border-border bg-surface p-4">

                <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: typeCfg.bg }}>
                            <Ionicons name={typeCfg.icon} size={20} color={typeCfg.text} />
                        </View>
                        <View>
                            <Text className="text-base font-bold text-foreground">{item.code || 'Phiếu kho'}</Text>
                            <Text className="text-xs text-muted">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                        </View>
                    </View>

                    <View className="rounded px-2 py-1" style={{ backgroundColor: statusCfg.bg }}>
                        <Text className="text-xs font-bold" style={{ color: statusCfg.text }}>{statusCfg.label}</Text>
                    </View>
                </View>

                <View className="flex-row items-center justify-between rounded-lg bg-bg p-3">
                    <View>
                        <Text className="text-[11px] text-muted">Loại phiếu</Text>
                        <Text className="text-sm font-semibold" style={{ color: typeCfg.text }}>{typeCfg.label}</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-[11px] text-muted">Tổng số lượng</Text>
                        <Text className="text-sm font-bold text-foreground">{itemsCount} SP</Text>
                    </View>
                </View>

                {item.note && (
                    <Text className="mt-3 text-sm text-muted" numberOfLines={1}>Ghi chú: {item.note}</Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-bg">
            <ScreenHeader
                title="Quản lý kho"
                topInset={insets.top}
                showBackButton
                rightSlot={
                    <TouchableOpacity
                        className="h-10 w-10 items-center justify-center rounded-full bg-primary"
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('InventoryForm', {})}>
                        <Ionicons name="add" size={20} color="#0F172A" />
                    </TouchableOpacity>
                }
            />

            <View className="flex-row border-b border-divider bg-surface px-4">
                {['All', 'Import', 'Export'].map((tab) => {
                    const label = tab === 'All' ? 'Tất cả' : tab === 'Import' ? 'Nhập kho' : 'Xuất kho';
                    const isActive = activeTab === tab;
                    return (
                        <TouchableOpacity
                            key={tab}
                            activeOpacity={0.8}
                            className={`flex-1 items-center justify-center border-b-2 py-3 ${isActive ? 'border-primary' : 'border-transparent'}`}
                            onPress={() => setActiveTab(tab as any)}>
                            <Text className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-muted'}`}>{label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    ref={listRef}
                    data={tickets}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    ListEmptyComponent={
                        <View className="items-center pt-16">
                            <Ionicons name="cube-outline" size={48} color={COLORS.textLight} />
                            <Text className="mt-3 text-base text-muted">Không có phiếu kho nào</Text>
                        </View>
                    }
                    renderItem={renderTicket}
                />
            )}
        </View>
    );
}
