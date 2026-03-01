import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { InventoryItem } from '@/src/components/ui';
import { products } from '@/src/data/mockData';
import { COLORS } from '@/src/constants/colors';

export function ProductsScreen() {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = products.filter((p) =>
        p.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View className="flex-1 bg-bg">
            <View className="bg-surface border-b border-divider px-5 pb-3" style={{ paddingTop: insets.top + 12 }}>
                <View className="flex-row justify-between items-center">
                    <Text className="text-2xl font-extrabold text-foreground">Kho Hàng</Text>
                    <TouchableOpacity className="w-10 h-10 rounded-xl bg-bg items-center justify-center"
                        activeOpacity={0.7}
                        onPress={() => Toast.show({ type: 'info', text1: 'Bộ lọc', text2: 'Sắp có' })}>
                        <Ionicons name="options-outline" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>
                <View className="flex-row items-center bg-bg rounded-xl px-3.5 h-11 mt-3">
                    <Ionicons name="search" size={20} color={COLORS.textMuted} />
                    <TextInput className="flex-1 text-sm text-foreground ml-2.5"
                        placeholder="Tìm kiếm trong kho..." placeholderTextColor={COLORS.textMuted}
                        value={searchQuery} onChangeText={setSearchQuery} />
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
                {filteredProducts.map((product) => (
                    <InventoryItem key={product.id} name={product.productName}
                        sku={product.sku || 'N/A'} price={product.price} status={product.status || 'in_stock'}
                        onPress={() => Toast.show({ type: 'info', text1: product.productName, text2: `Tồn kho: ${product.stockQuantity}` })} />
                ))}
                {filteredProducts.length === 0 && (
                    <View className="items-center pt-16">
                        <Ionicons name="cube-outline" size={48} color={COLORS.textLight} />
                        <Text className="text-base text-muted mt-3">Không tìm thấy sản phẩm</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
