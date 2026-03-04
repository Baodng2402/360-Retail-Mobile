import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { COLORS } from '@/src/constants/colors';
import { ScreenHeader } from '@/src/components';
import { categoriesApi } from '@/src/api';
import { useStoreStore } from '@/src/stores/useStoreStore';

export function CategoryFormScreen() {
    const insets = useSafeAreaInsets();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const activeStore = useStoreStore((s) => s.activeStore);

    const categoryId = route.params?.categoryId;
    const isEdit = !!categoryId;

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [categoryName, setCategoryName] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        async function init() {
            if (!activeStore) return;
            try {
                if (isEdit) {
                    const cats = await categoriesApi.getCategories(activeStore.id);
                    const cat = cats.find((c: any) => c.id === categoryId);
                    if (cat) {
                        setCategoryName(cat.categoryName || '');
                        setIsActive(cat.isActive !== false);
                    }
                }
            } catch (error) {
                console.error(error);
                Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải dữ liệu danh mục' });
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [isEdit, categoryId, activeStore]);

    const handleSubmit = async () => {
        if (!categoryName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
            return;
        }

        setSubmitting(true);
        try {
            if (isEdit) {
                await categoriesApi.updateCategory(categoryId, {
                    categoryName,
                    isActive,
                });
                Toast.show({ type: 'success', text1: 'Cập nhật danh mục thành công' });
            } else {
                await categoriesApi.createCategory({
                    categoryName,
                });
                Toast.show({ type: 'success', text1: 'Thêm danh mục thành công' });
            }
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Lỗi', text2: `Không thể ${isEdit ? 'cập nhật' : 'tạo'} danh mục` });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-bg items-center justify-center">
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-bg">
            <ScreenHeader title={isEdit ? 'Sửa danh mục' : 'Thêm danh mục'} topInset={insets.top} showBackButton />

            <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="bg-surface rounded-xl p-4 border border-border mb-4">
                    <Text className="text-sm font-bold text-foreground mb-2">Tên danh mục *</Text>
                    <TextInput
                        className="bg-bg border border-divider rounded-lg p-3 text-base text-foreground mb-2"
                        placeholder="VD: Quần áo nam"
                        placeholderTextColor={COLORS.textMuted}
                        value={categoryName}
                        onChangeText={setCategoryName}
                    />
                </View>

                {isEdit && (
                    <View className="bg-surface rounded-xl p-4 border border-border flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-base font-bold text-foreground">Trạng thái hoạt động</Text>
                            <Text className="text-xs text-muted">Bật để kích hoạt danh mục này</Text>
                        </View>
                        <Switch
                            value={isActive}
                            onValueChange={setIsActive}
                            trackColor={{ false: COLORS.border, true: COLORS.primary }}
                        />
                    </View>
                )}
            </ScrollView>

            {/* Float Button */}
            <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-divider p-4 pb-[env(safe-area-inset-bottom)]" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
                <TouchableOpacity
                    className="w-full bg-primary py-3.5 rounded-xl items-center justify-center opacity-90"
                    activeOpacity={0.8}
                    onPress={handleSubmit}
                    disabled={submitting}>
                    {submitting ? (
                        <ActivityIndicator size="small" color="#0F172A" />
                    ) : (
                        <Text className="text-sm font-bold" style={{ color: '#0F172A' }}>{isEdit ? 'Lưu thay đổi' : 'Tạo danh mục'}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
