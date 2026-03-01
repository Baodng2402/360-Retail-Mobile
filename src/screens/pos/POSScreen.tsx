import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ProductCard, CategoryChip } from '@/src/components/ui';
import { products, categories } from '@/src/data/mockData';
import { formatCurrency } from '@/src/utils/format';
import { COLORS } from '@/src/constants/colors';
import type { Product, CartItem } from '@/src/types';

export function POSScreen() {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [cart, setCart] = useState<CartItem[]>([]);

    const filteredProducts = products.filter(
        (p) =>
            (selectedCategory === 'Tất cả' || p.categoryName === selectedCategory) &&
            p.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.product.id === product.id);
            if (existing) {
                return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { product, quantity: 1 }];
        });
        Toast.show({ type: 'success', text1: 'Đã thêm', text2: product.productName });
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <View className="flex-1 bg-bg">
            {/* Header */}
            <View className="bg-surface border-b border-divider px-5 pb-3" style={{ paddingTop: insets.top + 12 }}>
                <Text className="text-2xl font-extrabold text-foreground mb-3">Bán Hàng</Text>
                <View className="flex-row items-center bg-bg rounded-xl px-3.5 h-11">
                    <Ionicons name="search" size={20} color={COLORS.textMuted} />
                    <TextInput className="flex-1 text-sm text-foreground ml-2.5"
                        placeholder="Tìm kiếm sản phẩm..." placeholderTextColor={COLORS.textMuted}
                        value={searchQuery} onChangeText={setSearchQuery} />
                </View>
            </View>

            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                className="bg-surface border-b border-divider grow-0"
                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}>
                {categories.map((cat) => (
                    <CategoryChip key={cat.id} label={cat.name} isActive={selectedCategory === cat.name}
                        onPress={() => setSelectedCategory(cat.name)} />
                ))}
            </ScrollView>

            {/* Product Grid */}
            <FlatList data={filteredProducts} numColumns={2} keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 12, paddingBottom: cart.length > 0 ? 100 : 120 }}
                renderItem={({ item }) => (
                    <ProductCard name={item.productName} price={item.price} stock={item.stockQuantity}
                        onPress={() => Toast.show({ type: 'info', text1: item.productName, text2: formatCurrency(item.price) })}
                        onAddToCart={() => addToCart(item)} />
                )}
                ListEmptyComponent={
                    <View className="items-center pt-16">
                        <Ionicons name="search-outline" size={48} color={COLORS.textLight} />
                        <Text className="text-base text-muted mt-3">Không tìm thấy sản phẩm</Text>
                    </View>
                }
            />

            {/* Cart Bar */}
            {cart.length > 0 && (
                <View className="absolute bottom-5 left-4 right-4 bg-primary rounded-2xl px-5 py-3.5 flex-row items-center justify-between"
                    style={{ shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}>
                    <View className="flex-row items-center">
                        <View className="w-7 h-7 rounded-lg bg-white/20 items-center justify-center">
                            <Text className="text-white font-extrabold text-sm">{cartCount}</Text>
                        </View>
                        <Text className="text-white font-semibold text-sm ml-2.5">{formatCurrency(cartTotal)}</Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.8} className="bg-white px-5 py-2.5 rounded-xl">
                        <Text className="text-primary font-bold text-sm">Thanh toán</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
