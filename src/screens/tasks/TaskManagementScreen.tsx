import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { hrApi, tasksApi } from '@/src/api';
import { PrimaryButton, ScreenHeader } from '@/src/components';
import { COLORS } from '@/src/constants/colors';
import type { MoreStackParamList } from '@/src/navigation/types';
import { useAuthStore } from '@/src/stores';
import { useStoreStore } from '@/src/stores/useStoreStore';
import type { CreateTaskDto, Employee, Task, TaskPriority, TaskStatus } from '@/src/types';
import { isStaff } from '@/src/utils/role';

type Props = StackScreenProps<MoreStackParamList, 'TaskManagement'>;

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];
const STATUS_FLOW: TaskStatus[] = ['Pending', 'InProgress', 'Completed'];

export function TaskManagementScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const activeStore = useStoreStore((s) => s.activeStore);
  const rawRole = useAuthStore((s) => s.user?.role ?? '');
  const staffMode = isStaff(rawRole);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');

  const fetchData = useCallback(async () => {
    if (!activeStore?.id) return;

    try {
      if (staffMode) {
        const myTasks = await tasksApi.getMyTasks();
        setTasks(myTasks);
      } else {
        const [allTasks, emps] = await Promise.all([
          tasksApi.getTasks(activeStore.id),
          hrApi.getEmployees(activeStore.id),
        ]);
        setTasks(allTasks);
        setEmployees(emps);
      }
    } catch (error) {
      console.error('[TaskManagementScreen.fetchData] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không tải được danh sách task' });
    }
  }, [activeStore?.id, staffMode]);

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const employeeMap = useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach((e) => map.set(e.id, e.fullName));
    return map;
  }, [employees]);

  const keyExtractor = useCallback((item: Task) => item.id, []);

  const renderTaskItem = useCallback(
    ({ item }: { item: Task }) => (
      <TouchableOpacity
        className="mb-3 rounded-2xl bg-surface p-4"
        activeOpacity={0.9}
        onPress={() => (!staffMode ? openEditModal(item) : undefined)}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">{item.title}</Text>
            <Text className="mt-1 text-xs text-muted">{item.description || 'Không có mô tả'}</Text>
            <Text className="mt-1 text-xs text-muted">
              Người phụ trách: {item.assigneeName || employeeMap.get(item.assigneeId || '') || 'N/A'}
            </Text>
            <Text className="mt-1 text-xs text-muted">Hạn: {item.dueDate ? new Date(item.dueDate).toLocaleDateString('vi-VN') : 'N/A'}</Text>
          </View>
          <View className="rounded-md px-2 py-0.5" style={{ backgroundColor: COLORS.infoLight }}>
            <Text className="text-[10px] font-semibold" style={{ color: COLORS.info }}>{item.status}</Text>
          </View>
        </View>

        <View className="mt-3 flex-row gap-2">
          {item.status !== 'Completed' && (
            <TouchableOpacity
              className="flex-1 items-center rounded-lg py-2"
              style={{ backgroundColor: COLORS.primaryLight }}
              onPress={() => handleMoveStatus(item)}>
              <Text className="text-sm font-semibold" style={{ color: COLORS.primary }}>Cập nhật tiến độ</Text>
            </TouchableOpacity>
          )}
          {!staffMode && (
            <TouchableOpacity
              className="flex-1 items-center rounded-lg py-2"
              style={{ backgroundColor: COLORS.errorLight }}
              onPress={() => handleDelete(item.id)}>
              <Text className="text-sm font-semibold" style={{ color: COLORS.error }}>Xóa</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    ),
    [staffMode, employeeMap],
  );

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setAssigneeId('');
    setDueDate('');
    setPriority('Medium');
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title || '');
    setDescription(task.description || '');
    setAssigneeId(task.assigneeId || '');
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
    setPriority(task.priority);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || (!staffMode && !assigneeId)) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Thiếu thông tin bắt buộc' });
      return;
    }

    let finalDeadline = new Date().toISOString();
    if (dueDate) {
      const d = new Date(dueDate);
      if (isNaN(d.getTime())) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Định dạng ngày không hợp lệ (YYYY-MM-DD)' });
        return;
      }
      finalDeadline = d.toISOString();
    }

    setSubmitting(true);
    try {
      const payload: CreateTaskDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        assigneeId: assigneeId || undefined,
        dueDate: finalDeadline,
        priority,
      };

      if (editingTask) {
        await tasksApi.updateTask(editingTask.id, payload);
        Toast.show({ type: 'success', text1: 'Đã cập nhật task' });
      } else {
        await tasksApi.createTask(payload);
        Toast.show({ type: 'success', text1: 'Đã tạo task' });
      }

      setShowModal(false);
      await fetchData();
    } catch (error: any) {
      console.error('[TaskManagementScreen.handleSubmit] Failed:', error);
      const msg = error?.response?.data?.message || 'Không lưu được task';
      Toast.show({ type: 'error', text1: 'Lỗi', text2: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await tasksApi.deleteTask(id);
      setTasks((prev) => prev.filter((x) => x.id !== id));
      Toast.show({ type: 'success', text1: 'Đã xóa task' });
    } catch (error: any) {
      console.error('[TaskManagementScreen.handleDelete] Failed:', error);
      const msg = error?.response?.data?.message || 'Không xóa được task';
      Toast.show({ type: 'error', text1: 'Lỗi', text2: msg });
    }
  };

  const handleMoveStatus = async (task: Task) => {
    const idx = STATUS_FLOW.indexOf(task.status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;

    const next = STATUS_FLOW[idx + 1];
    try {
      await tasksApi.updateTaskStatus(task.id, next);
      setTasks((prev) => prev.map((x) => (x.id === task.id ? { ...x, status: next } : x)));
      Toast.show({ type: 'success', text1: `Task -> ${next}` });
    } catch (error: any) {
      console.error('[TaskManagementScreen.handleMoveStatus] Failed:', error);
      const msg = error?.response?.data?.message || 'Không cập nhật được trạng thái';
      Toast.show({ type: 'error', text1: 'Lỗi', text2: msg });
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title={staffMode ? 'Công việc của tôi' : 'Quản lý công việc'}
        subtitle={`${tasks.length} công việc`}
        topInset={insets.top}
        showBackButton
        rightSlot={
          !staffMode ? (
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: COLORS.primaryLight }}
              onPress={openCreateModal}>
              <Ionicons name="add" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          renderItem={renderTaskItem}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="checkbox-outline" size={48} color={COLORS.textMuted} />
              <Text className="mt-3 text-base text-muted">Chưa có task</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl bg-surface p-6" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <Text className="mb-4 text-lg font-bold text-foreground">
              {editingTask ? 'Sửa task' : 'Tạo task'}
            </Text>

            <TextInput
              className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
              placeholder="Tiêu đề *"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
              placeholder="Mô tả"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {!staffMode && (
              <View className="mb-3">
                <Text className="mb-2 text-xs text-muted">Người phụ trách *</Text>
                <View className="flex-row flex-wrap gap-2">
                  {employees.map((emp) => {
                    const active = assigneeId === emp.id;
                    return (
                      <TouchableOpacity
                        key={emp.id}
                        className="rounded-full px-3 py-1.5"
                        style={{ backgroundColor: active ? COLORS.primary : COLORS.bg }}
                        onPress={() => setAssigneeId(emp.id)}>
                        <Text style={{ color: active ? '#fff' : COLORS.textSecondary }}>{emp.fullName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <TextInput
              className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
              placeholder="Hạn hoàn thành (YYYY-MM-DD)"
              value={dueDate}
              onChangeText={setDueDate}
            />

            <View className="mb-4 flex-row gap-2">
              {PRIORITIES.map((p) => {
                const active = p === priority;
                return (
                  <TouchableOpacity
                    key={p}
                    className="flex-1 items-center rounded-lg py-2"
                    style={{ backgroundColor: active ? COLORS.primary : COLORS.bg }}
                    onPress={() => setPriority(p)}>
                    <Text style={{ color: active ? '#fff' : COLORS.textSecondary }}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center rounded-xl border border-border py-3"
                onPress={() => setShowModal(false)}>
                <Text className="font-semibold text-muted">Hủy</Text>
              </TouchableOpacity>
              <PrimaryButton
                label="Lưu"
                loading={submitting}
                onPress={handleSubmit}
                className="flex-1 items-center justify-center rounded-xl"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
