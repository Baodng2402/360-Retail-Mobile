import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, FlatList, Switch, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

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
    const storeName = route.params?.storeName;
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
    const [imageFile, setImageFile] = useState<any>(null);

    // Variants State
    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState<{ sku: string, size: string, color: string, priceOverride: string, stockQuantity: string }[]>([]);

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

                    if ('variants' in product && product.variants && typeof product.variants === 'string') {
                        try {
                            const parsed = JSON.parse(product.variants as string);
                            if (parsed.length > 0) {
                                setHasVariants(true);
                                setVariants(parsed.map((v: any) => ({
                                    sku: v.sku || '',
                                    size: v.size || '',
                                    color: v.color || '',
                                    priceOverride: v.priceOverride ? v.priceOverride.toString() : '',
                                    stockQuantity: v.stockQuantity ? v.stockQuantity.toString() : '0'
                                })));
                            }
                        } catch { }
                    } else if (Array.isArray(product.variants)) {
                        setHasVariants(true);
                        setVariants(product.variants.map((v: any) => ({
                            sku: v.sku || '',
                            size: v.size || '',
                            color: v.color || '',
                            priceOverride: v.priceOverride ? v.priceOverride.toString() : '',
                            stockQuantity: v.stockQuantity ? v.stockQuantity.toString() : '0'
                        })));
                    }
                }
            } catch (error) {
                Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải dữ liệu' });
                if (isEdit) navigation.goBack();
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [isEdit, productId, activeStore, navigation]);

    // Handle results from system-killed activities (Android specific)
    useEffect(() => {
        async function checkPending() {
            try {
                const results = await ImagePicker.getPendingResultAsync();
                if (results && Array.isArray(results) && results.length > 0) {
                    handleImagePickerResult(results[0] as ImagePicker.ImagePickerResult);
                }
            } catch { }
        }
        checkPending();
    }, []);

    const handleImagePickerResult = (result: ImagePicker.ImagePickerResult) => {
        if (result.canceled) return;

        const asset = result.assets ? result.assets[0] : (result as any);
        let pickedUri = asset.uri;

        if (!pickedUri) return;

        if (!pickedUri.startsWith('file://') && !pickedUri.startsWith('http') && !pickedUri.startsWith('content://')) {
            pickedUri = `file://${pickedUri}`;
        }

        setImageUrl(pickedUri);

        const filename = pickedUri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1].toLowerCase() === 'jpg' ? 'jpeg' : match[1].toLowerCase()}` : `image/jpeg`;

        setImageFile({ uri: pickedUri, name: filename, type });
    };

    const handleSubmit = async () => {
        if (!productName.trim() || !price.trim() || !stockQuantity.trim() || !categoryId) {
            Alert.alert('Lỗi', 'Vui lòng điền tên, giá, tồn kho và danh mục sản phẩm');
            return;
        }

        const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
        const numericStock = parseInt(stockQuantity.replace(/[^0-9]/g, ''), 10) || 0;
        const numericCost = costPrice ? parseFloat(costPrice.replace(/[^0-9.]/g, '')) : undefined;

        setSubmitting(true);
        try {
            const payload: any = {
                productName,
                price: numericPrice,
                stockQuantity: numericStock,
                categoryId,
                isActive,
                barCode,
                description,
                costPrice: numericCost,
                hasVariants,
                variants: hasVariants ? variants.map(v => ({
                    sku: v.sku.trim() || undefined,
                    size: v.size.trim() || undefined,
                    color: v.color.trim() || undefined,
                    priceOverride: v.priceOverride ? parseFloat(v.priceOverride.replace(/[^0-9.]/g, '')) : numericPrice,
                    stockQuantity: v.stockQuantity ? parseInt(v.stockQuantity.replace(/[^0-9]/g, ''), 10) : numericStock
                })) : []
            };

            if (imageFile) payload.imageFile = imageFile;

            if (isEdit) {
                await productsApi.updateProduct(productId, { ...payload, id: productId });
                Toast.show({ type: 'success', text1: 'Cập nhật thành công' });
            } else {
                await productsApi.createProduct(payload);
                Toast.show({ type: 'success', text1: 'Thêm sản phẩm thành công' });
            }
            navigation.goBack();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || '';
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: `Không thể ${isEdit ? 'cập nhật' : 'tạo'} sản phẩm. ${errorMsg}`
            });
        } finally {
            setSubmitting(false);
        }
    };

    const addVariant = () => {
        setVariants([...variants, { sku: '', size: '', color: '', priceOverride: '', stockQuantity: '0' }]);
    };

    const updateVariant = (index: number, field: string, value: string) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    const removeVariant = (index: number) => {
        const newVariants = [...variants];
        newVariants.splice(index, 1);
        setVariants(newVariants);
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Lỗi', 'Bạn cần cho phép quyền truy cập thư viện ảnh để tải ảnh lên');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        handleImagePickerResult(result);
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
            <ScreenHeader
                title={isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
                subtitle={storeName ? `Store: ${storeName}` : undefined}
                topInset={insets.top}
                showBackButton
            />

            <ScrollView className="flex-1 px-4 py-2" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Ảnh SP */}
                <View className="items-center mb-6 mt-4">
                    <TouchableOpacity
                        className="w-24 h-24 rounded-2xl bg-surface border border-dashed border-border items-center justify-center overflow-hidden"
                        activeOpacity={0.8}
                        onPress={handlePickImage}>
                        {imageUrl ? (
                            <Image
                                source={{ uri: imageUrl }}
                                style={{ width: 96, height: 96 }}
                                resizeMode="cover"
                            />
                        ) : (
                            <Ionicons name="camera-outline" size={32} color={COLORS.textMuted} />
                        )}
                        <View className="absolute bottom-0 left-0 right-0 bg-black/50 py-1 items-center">
                            <Text className="text-[10px] text-white font-semibold">Tải ảnh lên</Text>
                        </View>
                    </TouchableOpacity>
                    {imageUrl && (
                        <TouchableOpacity
                            className="mt-2 bg-red-100 py-1 px-3 rounded-lg"
                            onPress={() => { setImageUrl(null); setImageFile(null); }}>
                            <Text className="text-xs text-red-600 font-bold">Xóa ảnh</Text>
                        </TouchableOpacity>
                    )}
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

                {/* Variants Section */}
                <View className="bg-surface rounded-xl p-4 border border-border flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-base font-bold text-foreground">Sản phẩm nhiều phân loại</Text>
                        <Text className="text-xs text-muted">Bật nếu sản phẩm có nhiều màu, size...</Text>
                    </View>
                    <Switch
                        value={hasVariants}
                        onValueChange={(val) => {
                            setHasVariants(val);
                            if (val && variants.length === 0) addVariant();
                        }}
                        trackColor={{ false: COLORS.border, true: COLORS.primary }}
                    />
                </View>

                {hasVariants && (
                    <View className="mb-4">
                        {variants.map((variant, index) => (
                            <View key={index} className="bg-surface rounded-xl p-4 border border-border mb-3 relative">
                                <TouchableOpacity
                                    className="absolute top-2 right-2 p-2 bg-errorLight rounded-full z-10"
                                    onPress={() => removeVariant(index)}
                                >
                                    <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                                </TouchableOpacity>
                                <Text className="font-bold text-foreground mb-3 border-b border-divider pb-2">Phân loại #{index + 1}</Text>

                                <View className="flex-row gap-2 mb-2">
                                    <View className="flex-1">
                                        <Text className="text-xs text-muted mb-1">Màu sắc</Text>
                                        <TextInput
                                            className="border border-divider rounded-lg py-1 px-2 text-sm text-foreground"
                                            placeholder="Đen, Trắng..."
                                            value={variant.color}
                                            onChangeText={(v) => updateVariant(index, 'color', v)}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xs text-muted mb-1">Kích cỡ</Text>
                                        <TextInput
                                            className="border border-divider rounded-lg py-1 px-2 text-sm text-foreground"
                                            placeholder="S, M, L..."
                                            value={variant.size}
                                            onChangeText={(v) => updateVariant(index, 'size', v)}
                                        />
                                    </View>
                                </View>
                                <View className="flex-row gap-2">
                                    <View className="flex-1">
                                        <Text className="text-xs text-muted mb-1">SKU</Text>
                                        <TextInput
                                            className="border border-divider rounded-lg py-1 px-2 text-sm text-foreground"
                                            placeholder="Mã vạch..."
                                            value={variant.sku}
                                            onChangeText={(v) => updateVariant(index, 'sku', v)}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xs text-muted mb-1">Giá bán</Text>
                                        <TextInput
                                            className="border border-divider rounded-lg py-1 px-2 text-sm text-foreground"
                                            placeholder="Mặc định"
                                            keyboardType="numeric"
                                            value={variant.priceOverride}
                                            onChangeText={(v) => updateVariant(index, 'priceOverride', v)}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xs text-muted mb-1">Tồn kho</Text>
                                        <TextInput
                                            className="border border-divider rounded-lg py-1 px-2 text-sm text-foreground"
                                            placeholder="0"
                                            keyboardType="numeric"
                                            value={variant.stockQuantity}
                                            onChangeText={(v) => updateVariant(index, 'stockQuantity', v)}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}
                        <TouchableOpacity
                            className="bg-primaryLight rounded-xl py-3 items-center flex-row justify-center border border-primary/20"
                            activeOpacity={0.7}
                            onPress={addVariant}
                        >
                            <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} className="mr-2" />
                            <Text className="text-primary font-bold ml-1">Thêm dòng phân loại mới</Text>
                        </TouchableOpacity>
                    </View>
                )}

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
