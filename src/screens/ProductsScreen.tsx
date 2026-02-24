import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ProductCard, CategoryChip } from '@/src/components/ui';
import { products, categories } from '@/src/data/mockData';
import { formatCurrency } from '@/src/utils/format';
import { COLORS } from '@/src/constants/colors';

const CARD_GAP = 12;

export function ProductsScreen() {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');

    const allCategories = ['Tất cả', ...categories.map(c => c.name)];

    const filteredProducts = products.filter(p =>
        (selectedCategory === 'Tất cả' || p.categoryName === selectedCategory) &&
        p.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddProduct = () => {
        Toast.show({ type: 'success', text1: 'Thêm sản phẩm', text2: 'Tính năng đang phát triển' });
    };

    return (
        <View className="flex-1 bg-slate-50">
            <View className="bg-white border-b border-slate-100" style={{ paddingTop: insets.top + 12 }}>
                <View className="px-5 pb-4">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-2xl font-extrabold text-slate-800">Sản phẩm</Text>
                        <TouchableOpacity activeOpacity={0.7} onPress={handleAddProduct}>
                            <LinearGradient
                                colors={[COLORS.accent, '#EA580C']}
                                className="flex-row items-center px-4 py-2.5 rounded-xl"
                            >
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text className="text-white font-semibold text-sm ml-1">Thêm</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center bg-slate-100 rounded-2xl px-4 h-12 mt-4">
                        <Ionicons name="search" size={22} color="#94A3B8" />
                        <TextInput
                            className="flex-1 text-base text-slate-800 ml-3"
                            placeholder="Tìm kiếm sản phẩm..."
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexGrow: 0 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center' }}
            >
                {allCategories.map(cat => (
                    <CategoryChip
                        key={cat}
                        label={cat}
                        isActive={selectedCategory === cat}
                        onPress={() => setSelectedCategory(cat)}
                    />
                ))}
            </ScrollView>

            <FlatList
                data={filteredProducts}
                numColumns={2}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 20 }}
                columnWrapperStyle={{ gap: CARD_GAP }}
                ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
                renderItem={({ item }) => (
                    <ProductCard
                        name={item.productName}
                        price={formatCurrency(item.price)}
                        stock={item.stockQuantity}
                        onPress={() => Toast.show({ type: 'info', text1: item.productName, text2: formatCurrency(item.price) })}
                    />
                )}
                ListFooterComponent={<View style={{ height: 100 }} />}
            />
        </View>
    );
}
