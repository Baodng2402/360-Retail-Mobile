import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { hrApi } from '@/src/api';
import { COLORS } from '@/src/constants/colors';
import type { Employee, UpdateEmployeeByOwnerDto } from '@/src/types';
import type { MoreStackParamList } from '@/src/navigation/types';

type Props = StackScreenProps<MoreStackParamList, 'EmployeeDetail'>;

export function EmployeeDetailScreen({ navigation, route }: Props) {
    const { employeeId } = route.params;
    const insets = useSafeAreaInsets();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);

    // Form state
    const [fullName, setFullName] = useState('');
    const [position, setPosition] = useState('');
    const [baseSalary, setBaseSalary] = useState('');

    const fetchEmployee = useCallback(async () => {
        try {
            const res = await hrApi.getEmployee(employeeId);
            const data = res.data?.data;
            if (data) {
                setEmployee(data);
                setFullName(data.fullName);
                setPosition(data.position || '');
                setBaseSalary(data.baseSalary?.toString() || '');
            }
        } catch {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải thông tin nhân viên' });
        }
    }, [employeeId]);

    useEffect(() => {
        setLoading(true);
        fetchEmployee().finally(() => setLoading(false));
    }, [fetchEmployee]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const dto: UpdateEmployeeByOwnerDto = {
                fullName: fullName.trim(),
                position: position.trim(),
                baseSalary: baseSalary ? Number(baseSalary) : undefined,
            };
            await hrApi.updateEmployee(employeeId, dto);
            Toast.show({ type: 'success', text1: 'Đã lưu' });
            setEditing(false);
            fetchEmployee();
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: error.response?.data?.message || 'Lưu thất bại' });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async () => {
        if (!employee) return;
        setSaving(true);
        try {
            await hrApi.updateEmployee(employeeId, { isActive: !employee.isActive });
            Toast.show({ type: 'success', text1: employee.isActive ? 'Đã ngưng hoạt động' : 'Đã kích hoạt' });
            fetchEmployee();
        } catch {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Thao tác thất bại' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-bg">
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-bg">
            <View className="border-b border-divider bg-surface px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3" activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-foreground">Chi tiết nhân viên</Text>
                    </View>
                    {!editing && (
                        <TouchableOpacity onPress={() => setEditing(true)} activeOpacity={0.7}>
                            <Ionicons name="create-outline" size={22} color={COLORS.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Avatar + Status */}
                <View className="mb-4 items-center">
                    <View className="mb-3 h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: COLORS.primaryLight }}>
                        <Ionicons name="person" size={36} color={COLORS.primary} />
                    </View>
                    <View className="rounded-lg px-3 py-1" style={{ backgroundColor: employee?.isActive ? COLORS.successLight : COLORS.errorLight }}>
                        <Text className="text-xs font-semibold" style={{ color: employee?.isActive ? COLORS.success : COLORS.error }}>
                            {employee?.isActive ? 'Đang hoạt động' : 'Đã ngưng'}
                        </Text>
                    </View>
                </View>

                {/* Info / Edit Form */}
                <View className="rounded-2xl bg-surface p-5">
                    <InfoRow label="Họ tên" editing={editing} value={fullName} onChangeText={setFullName} displayValue={employee?.fullName} />
                    <InfoRow label="Vị trí" editing={editing} value={position} onChangeText={setPosition} displayValue={employee?.position} />
                    <InfoRow label="Lương cơ bản" editing={editing} value={baseSalary} onChangeText={setBaseSalary} displayValue={employee?.baseSalary ? `${employee.baseSalary.toLocaleString('vi-VN')}đ` : 'Chưa cập nhật'} keyboardType="numeric" />

                    {!editing && (
                        <>
                            <InfoDisplay label="Email" value={employee?.email || ''} />
                            <InfoDisplay label="Username" value={employee?.userName || ''} />
                            <InfoDisplay label="SĐT" value={employee?.phoneNumber || 'Chưa cập nhật'} />
                            <InfoDisplay label="Ngày vào" value={employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString('vi-VN') : 'N/A'} />
                        </>
                    )}
                </View>

                {/* Action buttons */}
                {editing ? (
                    <View className="mt-4 flex-row gap-3">
                        <TouchableOpacity className="flex-1 items-center rounded-xl border border-border py-3" onPress={() => setEditing(false)} activeOpacity={0.7}>
                            <Text className="font-semibold text-muted">Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 items-center rounded-xl py-3" style={{ backgroundColor: COLORS.primary }} onPress={handleSave} disabled={saving} activeOpacity={0.7}>
                            <Text className="font-semibold text-white">{saving ? 'Đang lưu...' : 'Lưu'}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        className="mt-4 items-center rounded-xl py-3"
                        style={{ backgroundColor: employee?.isActive ? COLORS.errorLight : COLORS.successLight }}
                        onPress={handleToggleActive} disabled={saving} activeOpacity={0.7}>
                        <Text className="font-semibold" style={{ color: employee?.isActive ? COLORS.error : COLORS.success }}>
                            {employee?.isActive ? 'Ngưng hoạt động' : 'Kích hoạt lại'}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

/** Helper: Row hiển thị hoặc edit */
function InfoRow({ label, editing, value, onChangeText, displayValue, keyboardType }: any) {
    return (
        <View className="mb-3">
            <Text className="mb-1 text-xs font-medium text-muted">{label}</Text>
            {editing ? (
                <TextInput className="rounded-xl border border-border px-4 py-2.5 text-sm text-foreground" value={value} onChangeText={onChangeText} keyboardType={keyboardType} placeholderTextColor={COLORS.textMuted} />
            ) : (
                <Text className="text-base text-foreground">{displayValue || 'N/A'}</Text>
            )}
        </View>
    );
}

/** Helper: Row chỉ hiển thị */
function InfoDisplay({ label, value }: { label: string; value: string }) {
    return (
        <View className="mb-3">
            <Text className="mb-1 text-xs font-medium text-muted">{label}</Text>
            <Text className="text-base text-foreground">{value}</Text>
        </View>
    );
}
