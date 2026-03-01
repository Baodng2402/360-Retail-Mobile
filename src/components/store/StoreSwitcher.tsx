import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { useStoreStore } from '@/src/stores/useStoreStore';
import { COLORS } from '@/src/constants/colors';
import Toast from 'react-native-toast-message';
import type { Store } from '@/src/types';

// =============================================
// StoreSwitcher — dropdown chọn cửa hàng
// Hiện tên store hiện tại, tap → bottom sheet chọn store khác
// =============================================

export function StoreSwitcher() {
    const stores = useStoreStore((s) => s.stores);
    const activeStore = useStoreStore((s) => s.activeStore);
    const switchStore = useStoreStore((s) => s.switchStore);
    const isSwitching = useStoreStore((s) => s.isSwitching);
    const [showModal, setShowModal] = useState(false);

    // Nếu chỉ có 1 store → hiện tên, không cho switch
    const canSwitch = stores.length > 1;

    const handleSelect = async (store: Store) => {
        if (store.id === activeStore?.id) {
            setShowModal(false);
            return;
        }
        const success = await switchStore(store.id);
        setShowModal(false);
        if (success) {
            Toast.show({
                type: 'success',
                text1: `Đã chuyển sang ${store.storeName}`,
                text2: 'Dữ liệu đã được cập nhật.',
            });
        } else {
            Toast.show({ type: 'error', text1: 'Không thể chuyển cửa hàng' });
        }
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => canSwitch && setShowModal(true)}
                activeOpacity={canSwitch ? 0.7 : 1}
                className="flex-row items-center"
            >
                <View className="w-8 h-8 rounded-lg bg-cyan-100 items-center justify-center mr-2">
                    <Ionicons name="storefront" size={16} color={COLORS.primary} />
                </View>
                <View className="flex-1 mr-1">
                    <Text className="text-xs text-gray-400">Cửa hàng</Text>
                    <Text className="text-sm font-bold" numberOfLines={1}>
                        {activeStore?.storeName || 'Chưa có store'}
                    </Text>
                </View>
                {canSwitch && (
                    <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                )}
            </TouchableOpacity>

            {/* Modal chọn store */}
            <Modal visible={showModal} transparent animationType="slide" statusBarTranslucent>
                <TouchableOpacity
                    className="flex-1 bg-black/40"
                    activeOpacity={1}
                    onPress={() => setShowModal(false)}
                >
                    <View className="mt-auto bg-white rounded-t-3xl pb-10">
                        {/* Header */}
                        <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
                            <Text className="text-lg font-bold">Chọn cửa hàng</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>

                        {/* Loading indicator */}
                        {isSwitching && (
                            <View className="py-3 items-center">
                                <ActivityIndicator color={COLORS.primary} />
                                <Text className="text-xs text-gray-400 mt-1">Đang chuyển...</Text>
                            </View>
                        )}

                        {/* Store list */}
                        <FlatList
                            data={stores}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
                            renderItem={({ item }) => {
                                const isActive = item.id === activeStore?.id;
                                return (
                                    <TouchableOpacity
                                        onPress={() => handleSelect(item)}
                                        disabled={isSwitching}
                                        activeOpacity={0.7}
                                        className={`flex-row items-center p-4 mb-2 rounded-2xl border ${isActive ? 'border-cyan-400 bg-cyan-50' : 'border-gray-100 bg-white'
                                            }`}
                                    >
                                        <View
                                            className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${isActive ? 'bg-cyan-500' : 'bg-gray-100'
                                                }`}
                                        >
                                            <Ionicons
                                                name="storefront"
                                                size={20}
                                                color={isActive ? '#fff' : COLORS.textMuted}
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className={`text-sm font-semibold ${isActive ? 'text-cyan-700' : ''}`}>
                                                {item.storeName}
                                            </Text>
                                            {item.address && (
                                                <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
                                                    {item.address}
                                                </Text>
                                            )}
                                        </View>
                                        {isActive && (
                                            <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}
