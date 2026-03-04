import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { COLORS } from '@/src/constants/colors';
import { formatCurrency } from '@/src/utils/format';
import { ScreenHeader } from '@/src/components';
import { inventoryApi, productsApi } from '@/src/api';
import { useStoreStore } from '@/src/stores/useStoreStore';

export function InventoryFormScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const activeStore = useStoreStore((s) => s.activeStore);

    const [type, setType] = useState<'Import' | 'Export'>('Import');
    const [note, setNote] = useState('');
    const [items, setItems] = useState<{ productId: string; productName: string; quantity: number }[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Bảng chọn SP
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    useEffect(() => {
        if (showProductPicker && products.length === 0 && activeStore) {
            setLoadingProducts(true);
            productsApi.getProducts({ storeId: activeStore.id })
                .then(setProducts)
                .catch(console.error)
                .finally(() => setLoadingProducts(false));
        }
    }, [showProductPicker, activeStore, products.length]);

    const handleAddProduct = (product: any) => {
        if (items.some(i => i.productId === product.id)) {
            Toast.show({ type: 'error', text1: 'Sản phẩm đã có trong phiếu' });
            return;
        }
        setItems(prev => [...prev, { productId: product.id, productName: product.productName, quantity: 1 }]);
        setShowProductPicker(false);
    };

    const updateQuantity = (index: number, diff: number) => {
        const newItems = [...items];
        const newQty = newItems[index].quantity + diff;
        if (newQty > 0) {
            newItems[index].quantity = newQty;
            setItems(newItems);
        }
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            Alert.alert('Lỗi', 'Vui lòng chọn ít nhất 1 sản phẩm');
            return;
        }

        setSubmitting(true);
        try {
            await inventoryApi.createTicket({
                type,
                note,
                items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
            });
            Toast.show({ type: 'success', text1: 'Tạo phiếu kho thành công' });
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tạo phiếu kho' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-bg">
            <ScreenHeader title="Tạo phiếu kho" topInset={insets.top} showBackButton />

            <ScrollView className="flex-1 px-4 py-2" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Loại phiếu */}
                <Text className="text-sm font-bold text-foreground mb-2 mt-2">Loại phiếu</Text>
                <View className="flex-row mb-4">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setType('Import')}
                        className={`flex-1 py-3 items-center justify-center rounded-l-xl border ${type === 'Import' ? 'bg-primary border-primary' : 'bg-surface border-border'}`}>
                        <Text className={`font-semibold ${type === 'Import' ? 'text-[#0F172A]' : 'text-muted'}`}>Nhập kho</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setType('Export')}
                        className={`flex-1 py-3 items-center justify-center rounded-r-xl border border-l-0 ${type === 'Export' ? 'bg-primary border-primary' : 'bg-surface border-border'}`}>
                        <Text className={`font-semibold ${type === 'Export' ? 'text-[#0F172A]' : 'text-muted'}`}>Xuất kho</Text>
                    </TouchableOpacity>
                </View>

                {/* Ghi chú */}
                <Text className="text-sm font-bold text-foreground mb-2">Ghi chú</Text>
                <TextInput
                    className="bg-surface border border-border rounded-xl p-4 text-foreground mb-6"
                    placeholder="Nhập ghi chú cho phiếu kho này..."
                    placeholderTextColor={COLORS.textMuted}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                    style={{ minHeight: 80, textAlignVertical: 'top' }}
                />

                {/* Sản phẩm */}
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-sm font-bold text-foreground">Danh sách sản phẩm</Text>
                    <TouchableOpacity className="flex-row items-center" onPress={() => setShowProductPicker(true)}>
                        <Ionicons name="add-circle" size={20} color={COLORS.primary} />
                        <Text className="ml-1 text-sm font-semibold text-primary">Thêm SP</Text>
                    </TouchableOpacity>
                </View>

                {items.length === 0 ? (
                    <View className="bg-surface border border-border border-dashed rounded-xl py-8 items-center justify-center mb-6">
                        <Ionicons name="cube-outline" size={32} color={COLORS.textMuted} />
                        <Text className="mt-2 text-sm text-muted">Chưa có sản phẩm nào</Text>
                        <TouchableOpacity className="mt-3 px-4 py-2 bg-[rgba(38,198,218,0.1)] rounded-lg" onPress={() => setShowProductPicker(true)}>
                            <Text className="text-sm font-semibold text-primary">Chọn sản phẩm</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="bg-surface border border-border rounded-xl p-2 mb-6">
                        {items.map((item, index) => (
                            <View key={index} className="flex-row items-center justify-between p-2 border-b border-divider last:border-0">
                                <View className="flex-1 mr-2">
                                    <Text className="text-sm font-medium text-foreground">{item.productName}</Text>
                                </View>

                                <View className="flex-row items-center border border-divider rounded-lg">
                                    <TouchableOpacity className="p-2" onPress={() => updateQuantity(index, -1)}>
                                        <Ionicons name="remove" size={16} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                    <Text className="w-8 text-center text-sm font-bold text-foreground">{item.quantity}</Text>
                                    <TouchableOpacity className="p-2" onPress={() => updateQuantity(index, 1)}>
                                        <Ionicons name="add" size={16} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity className="ml-3 p-2" onPress={() => removeItem(index)}>
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <View className="bg-surface border-t border-divider p-4 pb-[env(safe-area-inset-bottom)]" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
                <TouchableOpacity
                    className="w-full bg-primary py-3.5 rounded-xl items-center justify-center"
                    activeOpacity={0.8}
                    onPress={handleSubmit}
                    disabled={submitting}>
                    {submitting ? (
                        <ActivityIndicator size="small" color="#0F172A" />
                    ) : (
                        <Text className="text-sm font-bold" style={{ color: '#0F172A' }}>Tạo phiếu kho</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Modal chọn sản phẩm */}
            <Modal visible={showProductPicker} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-bg p-4" style={{ paddingTop: Math.max(insets.top, 24) }}>
                    <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-divider">
                        <Text className="text-lg font-bold text-foreground">Chọn sản phẩm</Text>
                        <TouchableOpacity onPress={() => setShowProductPicker(false)} className="p-1">
                            <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {loadingProducts ? (
                        <View className="pt-10 items-center">
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={products}
                            keyExtractor={i => i.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="flex-row items-center justify-between p-3 border-b border-divider"
                                    onPress={() => handleAddProduct(item)}>
                                    <View className="flex-1">
                                        <Text className="text-base font-semibold text-foreground">{item.productName}</Text>
                                        <Text className="text-sm text-muted">Tồn: {item.stockQuantity} • {formatCurrency(item.price)}</Text>
                                    </View>
                                    <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text className="mt-10 text-center text-muted">Không có sản phẩm nào</Text>
                            }
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}
