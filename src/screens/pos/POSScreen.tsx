import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { formatCurrency } from '@/src/utils/format';
import { COLORS } from '@/src/constants/colors';
import type { CartItem } from '@/src/types';
import type { RentalsStackParamList } from '@/src/navigation/types';
import { HorizontalChips, ScreenHeader, SearchField } from '@/src/components';
import { categoriesApi, productsApi } from '@/src/api';
import { useStoreStore } from '@/src/stores/useStoreStore';

// Temporary local interfaces mapped from API
interface ApiProduct {
  id: string;
  productName: string;
  price: number;
  stockQuantity: number;
  category?: { categoryName: string };
  imageUrl?: string;
}

interface ApiCategory {
  id: string;
  categoryName: string;
}

export function POSScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RentalsStackParamList>>();
  const isFocused = useIsFocused();
  const activeStore = useStoreStore((s) => s.activeStore);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [cart, setCart] = useState<CartItem[]>([]);
  const listRef = useRef<FlatList<ApiProduct>>(null);

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    async function fetchData() {
      if (!activeStore) return;
      try {
        setLoading(true);
        const [cats, prods] = await Promise.all([
          categoriesApi.getCategories(),
          productsApi.getProducts(),
        ]);

        // Map data
        setCategories(cats as any);
        setProducts(prods as any);
      } catch (error) {
        console.error('Failed to load POS data', error);
      } finally {
        setLoading(false);
      }
    }

    if (isFocused) {
      fetchData();
    }
  }, [activeStore, isFocused]);


  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const catName = item.category?.categoryName || 'Không có';
      const byCategory = selectedCategory === 'Tất cả' || catName === selectedCategory;
      const byQuery = !normalizedQuery || item.productName.toLowerCase().includes(normalizedQuery);
      return byCategory && byQuery;
    });
  }, [products, normalizedQuery, selectedCategory]);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
  }, [selectedCategory, normalizedQuery]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + (item.product as any).price * item.quantity, 0),
    [cart]
  );
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const categoryItems = useMemo(() => {
    const all = [{ key: 'Tất cả', label: 'Tất cả' }];
    const mapped = categories.map((c) => ({ key: c.categoryName, label: c.categoryName }));
    return [...all, ...mapped];
  }, [categories]);

  const addToCart = useCallback((product: ApiProduct) => {
    if (product.stockQuantity <= 0) {
      Toast.show({ type: 'error', text1: 'Sản phẩm đã hết hàng', text2: product.productName });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);

      // Check stock limit
      if (existing && existing.quantity >= product.stockQuantity) {
        Toast.show({ type: 'error', text1: 'Vượt quá số lượng tồn kho', text2: product.productName });
        return prev;
      }

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      // Hack to match existing CartItem type for now
      return [...prev, { product: product as any, quantity: 1 }];
    });

    Toast.show({ type: 'success', text1: 'Đã thêm vào giỏ', text2: product.productName });
  }, []);

  const renderProductItem = useCallback(
    ({ item }: { item: ApiProduct }) => {
      const isOutOfStock = item.stockQuantity <= 0;
      const lowStock = item.stockQuantity > 0 && item.stockQuantity <= 3;

      return (
        <View className="mb-3 flex-1 rounded-xl border border-border bg-surface p-3" style={{ opacity: isOutOfStock ? 0.6 : 1 }}>
          <View className="relative mb-3 h-32 w-full items-center justify-center overflow-hidden rounded-lg bg-bg">
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} className="h-full w-full" resizeMode="cover" />
            ) : (
              <Ionicons name="cube-outline" size={28} color={COLORS.textMuted} />
            )}

            <View
              className="absolute right-2 top-2 rounded px-1.5 py-0.5"
              style={{
                backgroundColor: isOutOfStock ? 'rgba(100,116,139,0.9)' : lowStock ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)',
              }}>
              <Text className="text-[10px] font-bold text-white">
                {isOutOfStock ? 'Hết hàng' : `Còn ${item.stockQuantity}`}
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
              disabled={isOutOfStock}
              style={{ opacity: isOutOfStock ? 0.5 : 1 }}
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
        />
      </ScreenHeader>

      <HorizontalChips items={categoryItems} activeKey={selectedCategory} onPress={setSelectedCategory} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
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
      )}

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
              onPress={() => navigation.navigate('Checkout', {
                cart: cart as any,
                onComplete: () => setCart([])
              })}>
              <Text className="mr-1 text-sm font-bold text-slate-900">Thanh toán</Text>
              <Ionicons name="arrow-forward" size={16} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
