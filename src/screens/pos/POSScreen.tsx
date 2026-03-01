import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { products, categories } from '@/src/data/mockData';
import { formatCurrency } from '@/src/utils/format';
import { COLORS } from '@/src/constants/colors';
import type { Product, CartItem } from '@/src/types';
import type { RentalsStackParamList } from '@/src/navigation/types';
import { HorizontalChips, ScreenHeader, SearchField } from '@/src/components';

export function POSScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RentalsStackParamList>>();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [cart, setCart] = useState<CartItem[]>([]);
  const listRef = useRef<FlatList<Product>>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const byCategory = selectedCategory === 'Tất cả' || item.categoryName === selectedCategory;
      const byQuery = !normalizedQuery || item.productName.toLowerCase().includes(normalizedQuery);
      return byCategory && byQuery;
    });
  }, [normalizedQuery, selectedCategory]);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
  }, [selectedCategory, normalizedQuery]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const categoryItems = useMemo(
    () => categories.map((category) => ({ key: category.name, label: category.name, icon: category.icon as any })),
    []
  );

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...prev, { product, quantity: 1 }];
    });

    Toast.show({ type: 'success', text1: 'Đã thêm vào giỏ', text2: product.productName });
  }, []);

  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => {
      const lowStock = item.stockQuantity <= 3;

      return (
        <View className="mb-3 flex-1 rounded-xl border border-border bg-surface p-3">
          <View className="relative mb-3 h-32 items-center justify-center rounded-lg bg-bg">
            <Ionicons name="cube-outline" size={28} color={COLORS.textMuted} />
            <View
              className="absolute right-2 top-2 rounded px-1.5 py-0.5"
              style={{
                backgroundColor: lowStock ? 'rgba(239,68,68,0.14)' : 'rgba(34,197,94,0.15)',
              }}>
              <Text className="text-[10px] font-bold" style={{ color: lowStock ? '#DC2626' : '#16A34A' }}>
                Còn {item.stockQuantity}
              </Text>
            </View>
          </View>

          <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
            {item.productName}
          </Text>

          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-primary">{formatCurrency(item.price)}</Text>
            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full bg-primary"
              activeOpacity={0.8}
              onPress={() => addToCart(item)}>
              <Ionicons name="add" size={16} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [addToCart]
  );

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Quầy bán hàng"
        topInset={insets.top}
        rightSlot={
          <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-full" activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={19} color={COLORS.textMuted} />
          </TouchableOpacity>
        }>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm sản phẩm hoặc quét mã..."
          rightIcon="barcode-outline"
        />
      </ScreenHeader>

      <HorizontalChips items={categoryItems} activeKey={selectedCategory} onPress={setSelectedCategory} />

      <FlatList
        key={`${selectedCategory}|${normalizedQuery}`}
        ref={listRef}
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 12, paddingBottom: cart.length > 0 ? 160 : 120 }}
        columnWrapperStyle={{ gap: 12 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews
        renderItem={renderProductItem}
        ListEmptyComponent={
          <View className="items-center pt-16">
            <Ionicons name="search-outline" size={48} color={COLORS.textLight} />
            <Text className="mt-3 text-base text-muted">Không tìm thấy sản phẩm</Text>
          </View>
        }
      />

      {cart.length > 0 && (
        <View className="absolute bottom-20 left-4 right-4 z-10 rounded-2xl border border-border bg-surface p-3 shadow-sm shadow-black/10">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Ionicons name="bag-outline" size={18} color="#0F172A" />
                <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-white">
                  <Text className="text-[10px] font-bold text-foreground">{cartCount}</Text>
                </View>
              </View>
              <View>
                <Text className="text-xs text-muted">Tổng tạm tính</Text>
                <Text className="text-sm font-bold text-foreground">
                  {formatCurrency(cartTotal)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="flex-row items-center rounded-xl bg-primary px-4 py-2.5"
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Checkout')}>
              <Text className="mr-1 text-sm font-bold text-slate-900">Thanh toán</Text>
              <Ionicons name="arrow-forward" size={16} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
