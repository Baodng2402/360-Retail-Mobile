import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { hrApi } from '@/src/api';
import { COLORS } from '@/src/constants/colors';
import type { Task, TaskStatus, TaskPriority } from '@/src/types';

// =============================================
// MyTasksScreen — Công việc của tôi
//
// Hiển thị danh sách tasks được giao, lọc theo status,
// cập nhật trạng thái trực tiếp từ danh sách.
// =============================================

/** Cấu hình màu cho từng trạng thái */
const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
    Pending: { label: 'Chờ xử lý', color: COLORS.warning, bg: COLORS.warningLight },
    InProgress: { label: 'Đang làm', color: COLORS.info, bg: COLORS.infoLight },
    Completed: { label: 'Hoàn thành', color: COLORS.success, bg: COLORS.successLight },
    Cancelled: { label: 'Đã hủy', color: COLORS.error, bg: COLORS.errorLight },
};

/** Cấu hình badge ưu tiên */
const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
    Low: { label: 'Thấp', color: COLORS.textMuted },
    Medium: { label: 'TB', color: COLORS.warning },
    High: { label: 'Cao', color: COLORS.error },
};

/** Các tab filter */
const FILTER_TABS: { key: TaskStatus | 'All'; label: string }[] = [
    { key: 'All', label: 'Tất cả' },
    { key: 'Pending', label: 'Chờ' },
    { key: 'InProgress', label: 'Đang làm' },
    { key: 'Completed', label: 'Xong' },
];

export function MyTasksScreen({ navigation }: { navigation: any }) {
    const insets = useSafeAreaInsets();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<TaskStatus | 'All'>('All');

    // ──────────── Fetch data ────────────
    const fetchTasks = useCallback(async () => {
        try {
            const res = await hrApi.getMyTasks();
            const data = res.data?.data;
            setTasks(Array.isArray(data) ? data : []);
        } catch {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải danh sách công việc' });
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchTasks().finally(() => setLoading(false));
    }, [fetchTasks]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTasks();
        setRefreshing(false);
    };

    // ──────────── Cập nhật trạng thái ────────────
    const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
        try {
            await hrApi.updateTaskStatus(task.id, newStatus);
            Toast.show({ type: 'success', text1: 'Đã cập nhật', text2: `Trạng thái → ${STATUS_CONFIG[newStatus].label}` });
            fetchTasks();
        } catch {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể cập nhật trạng thái' });
        }
    };

    // ──────────── Lọc tasks ────────────
    const filteredTasks = activeFilter === 'All'
        ? tasks
        : tasks.filter((t) => t.status === activeFilter);

    // ──────────── Format deadline ────────────
    const formatDeadline = (deadline: string | null | undefined) => {
        if (!deadline) return null;
        const date = new Date(deadline);
        const now = new Date();
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: `Quá hạn ${Math.abs(diffDays)} ngày`, isOverdue: true };
        if (diffDays === 0) return { text: 'Hết hạn hôm nay', isOverdue: true };
        if (diffDays <= 3) return { text: `Còn ${diffDays} ngày`, isOverdue: false };
        return { text: date.toLocaleDateString('vi-VN'), isOverdue: false };
    };

    // ──────────── Render 1 task card ────────────
    const renderTask = ({ item }: { item: Task }) => {
        const statusCfg = STATUS_CONFIG[item.status];
        const priorityCfg = PRIORITY_CONFIG[item.priority];
        const deadline = formatDeadline(item.dueDate);

        return (
            <View className="mb-3 rounded-2xl bg-surface p-4">
                {/* Header: Title + Priority */}
                <View className="mb-2 flex-row items-start justify-between">
                    <Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View className="ml-2 rounded-md px-2 py-0.5" style={{ backgroundColor: COLORS.bg }}>
                        <Text className="text-xs font-semibold" style={{ color: priorityCfg.color }}>
                            {priorityCfg.label}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                {item.description && (
                    <Text className="mb-2 text-sm text-muted" numberOfLines={2}>{item.description}</Text>
                )}

                {/* Meta: Assignee + Deadline */}
                <View className="mb-3 flex-row items-center gap-4">
                    {item.assigneeName && (
                        <View className="flex-row items-center">
                            <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
                            <Text className="ml-1 text-xs text-muted">{item.assigneeName}</Text>
                        </View>
                    )}
                    {deadline && (
                        <View className="flex-row items-center">
                            <Ionicons name="calendar-outline" size={14} color={deadline.isOverdue ? COLORS.error : COLORS.textMuted} />
                            <Text
                                className="ml-1 text-xs"
                                style={{ color: deadline.isOverdue ? COLORS.error : COLORS.textMuted }}>
                                {deadline.text}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Footer: Status badge + Quick actions */}
                <View className="flex-row items-center justify-between">
                    <View className="rounded-lg px-3 py-1" style={{ backgroundColor: statusCfg.bg }}>
                        <Text className="text-xs font-semibold" style={{ color: statusCfg.color }}>
                            {statusCfg.label}
                        </Text>
                    </View>

                    {/* Quick status buttons */}
                    {item.status !== 'Completed' && item.status !== 'Cancelled' && (
                        <View className="flex-row gap-2">
                            {item.status === 'Pending' && (
                                <TouchableOpacity
                                    className="rounded-lg px-3 py-1.5"
                                    style={{ backgroundColor: COLORS.primaryLight }}
                                    activeOpacity={0.7}
                                    onPress={() => handleStatusChange(item, 'InProgress')}>
                                    <Text className="text-xs font-semibold" style={{ color: COLORS.primary }}>
                                        Bắt đầu
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {item.status === 'InProgress' && (
                                <TouchableOpacity
                                    className="rounded-lg px-3 py-1.5"
                                    style={{ backgroundColor: COLORS.successLight }}
                                    activeOpacity={0.7}
                                    onPress={() => handleStatusChange(item, 'Completed')}>
                                    <Text className="text-xs font-semibold" style={{ color: COLORS.success }}>
                                        Hoàn thành
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-bg">
            {/* Header */}
            <View
                className="border-b border-divider bg-surface px-5 pb-4"
                style={{ paddingTop: insets.top + 12 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3" activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-foreground">Công việc của tôi</Text>
                <Text className="mt-1 text-sm text-muted">{tasks.length} công việc</Text>
            </View>

            {/* Filter tabs */}
            <View className="flex-row gap-2 px-4 py-3">
                {FILTER_TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        className="rounded-full px-4 py-2"
                        style={{
                            backgroundColor: activeFilter === tab.key ? COLORS.primary : COLORS.surface,
                        }}
                        activeOpacity={0.7}
                        onPress={() => setActiveFilter(tab.key)}>
                        <Text
                            className="text-xs font-semibold"
                            style={{ color: activeFilter === tab.key ? '#fff' : COLORS.textSecondary }}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Task list */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredTasks}
                    renderItem={renderTask}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    ListEmptyComponent={
                        <View className="items-center py-20">
                            <Ionicons name="checkbox-outline" size={48} color={COLORS.textMuted} />
                            <Text className="mt-3 text-base text-muted">Chưa có công việc nào</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
