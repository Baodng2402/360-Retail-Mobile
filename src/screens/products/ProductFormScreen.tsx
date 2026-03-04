import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, FlatList, Switch, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { COLORS } from '@/src/constants/colors';
import { ScreenHeader } from '@/src/components';
import { productsApi, categoriesApi } from '@/src/api';
import { useStoreStore } from '@/src/stores/useStoreStore';

export function ProductFormScreen() {
    const insets = useSafeAreaInsets();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const activeStore = useStoreStore((s) => s.activeStore);

    const productId = route.params?.productId;
    const isEdit = !!productId;

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    // Form state
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [stockQuantity, setStockQuantity] = useState('0');
    const [categoryId, setCategoryId] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [barCode, setBarCode] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        async function init() {
            if (!activeStore) return;
            try {
                const cats = await categoriesApi.getCategories(activeStore.id);
                setCategories(cats);

                if (isEdit) {
                    const product = await productsApi.getProductById(productId, activeStore.id);
                    setProductName(product.productName || '');
                    setPrice(product.price ? product.price.toString() : '0');
                    setStockQuantity(product.stockQuantity ? product.stockQuantity.toString() : '0');
                    setCategoryId(product.categoryId || '');
                    setCategoryName(product.categoryName || cats.find(c => c.id === product.categoryId)?.categoryName || '');
                    setBarCode(product.barCode || '');
                    setCostPrice(product.costPrice ? product.costPrice.toString() : '');
                    setDescription(product.description || '');
                    setIsActive(product.isActive !== false);
                    setImageUrl(product.imageUrl || null);
                }
            } catch (error) {
                console.error(error);
                Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải dữ liệu' });
                if (isEdit) navigation.goBack();
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [isEdit, productId, activeStore, navigation]);

    const handleSubmit = async () => {
        if (!productName.trim() || !price.trim() || !categoryId) {
            Alert.alert('Lỗi', 'Vui lòng điền tên, giá và danh mục sản phẩm');
            return;
        }

        const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
        const numericStock = parseInt(stockQuantity.replace(/[^0-9]/g, ''), 10) || 0;
        const numericCost = costPrice ? parseFloat(costPrice.replace(/[^0-9.]/g, '')) : undefined;

        setSubmitting(true);
        try {
            if (isEdit) {
                await productsApi.updateProduct(productId, {
                    id: productId,
                    productName,
                    price: numericPrice,
                    stockQuantity: numericStock,
                    categoryId,
                    isActive,
                    barCode,
                    description,
                    costPrice: numericCost,
                });
                Toast.show({ type: 'success', text1: 'Cập nhật thành công' });
            } else {
                await productsApi.createProduct({
                    productName,
                    price: numericPrice,
                    stockQuantity: numericStock,
                    categoryId,
                    isActive,
                    barCode,
                    description,
                    costPrice: numericCost,
                });
                Toast.show({ type: 'success', text1: 'Thêm sản phẩm thành công' });
            }
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Lỗi', text2: `Không thể ${isEdit ? 'cập nhật' : 'tạo'} sản phẩm` });
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
            <ScreenHeader title={isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} topInset={insets.top} showBackButton />

            <ScrollView className="flex-1 px-4 py-2" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Ảnh SP Placeholder */}
                <View className="items-center mb-6 mt-4">
                    <TouchableOpacity
                        className="w-24 h-24 rounded-2xl bg-surface border border-dashed border-border items-center justify-center overflow-hidden"
                        activeOpacity={0.8}
                        onPress={() => Toast.show({ type: 'info', text1: 'Đang phát triển upload ảnh' })}>
                        {imageUrl ? (
                            <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <Ionicons name="camera-outline" size={32} color={COLORS.textMuted} />
                        )}
                        <View className="absolute bottom-0 left-0 right-0 bg-black/50 py-1 items-center">
                            <Text className="text-[10px] text-white font-semibold">Tải ảnh lên</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Form Inputs */}
                <View className="bg-surface rounded-xl p-4 border border-border mb-4">
                    <Text className="text-sm font-bold text-foreground mb-1">Tên sản phẩm *</Text>
                    <TextInput
                        className="border-b border-divider py-2 text-base text-foreground mb-4"
                        placeholder="VD: Áo phông trắng"
                        placeholderTextColor={COLORS.textMuted}
                        value={productName}
                        onChangeText={setProductName}
                    />

                    <Text className="text-sm font-bold text-foreground mb-1">Giá bán (VNĐ) *</Text>
                    <TextInput
                        className="border-b border-divider py-2 text-base text-foreground mb-4"
                        placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                    />

                    <Text className="text-sm font-bold text-foreground mb-1">Số lượng tồn kho</Text>
                    <TextInput
                        className="border-b border-divider py-2 text-base text-foreground mb-4"
                        placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="numeric"
                        value={stockQuantity}
                        onChangeText={setStockQuantity}
                    />

                    <Text className="text-sm font-bold text-foreground mb-1">Danh mục *</Text>
                    <TouchableOpacity
                        className="border-b border-divider py-2 mb-4 flex-row justify-between items-center"
                        onPress={() => setShowCategoryPicker(true)}>
                        <Text className={`text-base ${categoryId ? 'text-foreground' : 'text-muted'}`}>
                            {categoryName || 'Chọn danh mục'}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>

                <View className="bg-surface rounded-xl p-4 border border-border mb-4">
                    <Text className="text-sm font-bold text-foreground mb-1">Mã nguyên liệu/SKU</Text>
                    <TextInput
                        className="border-b border-divider py-2 text-base text-foreground mb-4"
                        placeholder="VD: SP001"
                        placeholderTextColor={COLORS.textMuted}
                        value={barCode}
                        onChangeText={setBarCode}
                    />

                    <Text className="text-sm font-bold text-foreground mb-1">Giá vốn (VNĐ)</Text>
                    <TextInput
                        className="border-b border-divider py-2 text-base text-foreground mb-4"
                        placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="numeric"
                        value={costPrice}
                        onChangeText={setCostPrice}
                    />

                    <Text className="text-sm font-bold text-foreground mb-1">Mô tả chi tiết</Text>
                    <TextInput
                        className="border border-divider rounded-xl py-3 px-3 text-base text-foreground mb-2 mt-2"
                        placeholder="Mô tả về sản phẩm..."
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        numberOfLines={3}
                        style={{ minHeight: 80, textAlignVertical: 'top' }}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {isEdit && (
                    <View className="bg-surface rounded-xl p-4 border border-border flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-base font-bold text-foreground">Trạng thái hoạt động</Text>
                            <Text className="text-xs text-muted">Bật để cho phép bán sản phẩm này</Text>
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
                        <Text className="text-sm font-bold" style={{ color: '#0F172A' }}>{isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Category Picker Modal */}
            <Modal visible={showCategoryPicker} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-bg p-4" style={{ paddingTop: Math.max(insets.top, 24) }}>
                    <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-divider">
                        <Text className="text-lg font-bold text-foreground">Chọn danh mục</Text>
                        <TouchableOpacity onPress={() => setShowCategoryPicker(false)} className="p-1">
                            <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={categories}
                        keyExtractor={c => c.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className="py-3 border-b border-divider"
                                onPress={() => {
                                    setCategoryId(item.id);
                                    setCategoryName(item.name || item.categoryName);
                                    setShowCategoryPicker(false);
                                }}>
                                <Text className="text-base font-semibold text-foreground">{item.name || item.categoryName}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text className="text-center text-muted mt-5">Chưa có danh mục nào</Text>}
                    />
                </View>
            </Modal>
        </View>
    );
}
