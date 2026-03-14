import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image, RefreshControl, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import type { StackNavigationProp } from '@react-navigation/stack';

import { formatCurrency } from '@/src/utils/format';
import { COLORS } from '@/src/constants/colors';
import { ScreenHeader, SearchField } from '@/src/components';
import { productsApi, categoriesApi } from '@/src/api';
import { useStoreStore } from '@/src/stores/useStoreStore';
import { useAuthStore } from '@/src/stores/useAuthStore';
import type { MoreStackParamList } from '@/src/navigation/types';
import { isManagerOrOwner } from '@/src/utils/role';
import type { Product, Category } from '@/src/types';

type ProductsScreenNavigationProp = StackNavigationProp<MoreStackParamList, 'ProductManagement'>;
type ProductListItem = Product & { sku?: string };
type CategoryListItem = Category & { name?: string };

const STOCK_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  in_stock: { label: 'CÒN HÀNG', bg: 'rgba(34,197,94,0.12)', text: '#16A34A' },
  low_stock: { label: 'SẮP HẾT', bg: 'rgba(245,158,11,0.12)', text: '#D97706' },
  out_of_stock: { label: 'HẾT HÀNG', bg: 'rgba(239,68,68,0.12)', text: '#DC2626' },
};

export function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const activeStore = useStoreStore((s) => s.activeStore);

  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [searchQuery, setSearchQuery] = useState('');

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const rawRole = useAuthStore((s) => s.user?.role);
  const canViewInactive = isManagerOrOwner(rawRole);

  const listRef = useRef<FlatList<ProductListItem | CategoryListItem>>(null);

  const fetchData = useCallback(async () => {
    if (!activeStore) return;
    try {
      if (activeTab === 'products') {
        const fetchedProducts = await productsApi.getProducts({
          storeId: activeStore.id,
          includeInactive: showInactive
        });
        setProducts(fetchedProducts as ProductListItem[]);
      } else {
        const fetchedCategories = await categoriesApi.getCategories(activeStore.id, showInactive);
        setCategories(fetchedCategories as CategoryListItem[]);
      }
    } catch (error) {
      console.error('Failed to load data', error);
      Toast.show({ type: 'error', text1: 'Lỗi tải dữ liệu' });
    }
  }, [activeStore, activeTab, showInactive]);

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      fetchData().finally(() => setLoading(false));
    }
  }, [isFocused, activeTab, fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(
    () =>
      products.filter((item) => {
        if (!normalizedQuery) return true;
        return (
          (item.productName || '').toLowerCase().includes(normalizedQuery) ||
          (item.sku || '').toLowerCase().includes(normalizedQuery) ||
          (item.category?.categoryName || '').toLowerCase().includes(normalizedQuery)
        );
      }),
    [products, normalizedQuery],
  );

  const filteredCategories = useMemo(
    () =>
      categories.filter((item) => {
        if (!normalizedQuery) return true;
        return (
          (item.categoryName || '').toLowerCase().includes(normalizedQuery) ||
          (item.name || '').toLowerCase().includes(normalizedQuery)
        );
      }),
    [categories, normalizedQuery],
  );

  const filteredData = useMemo<(ProductListItem | CategoryListItem)[]>(
    () => (activeTab === 'products' ? filteredProducts : filteredCategories),
    [activeTab, filteredProducts, filteredCategories],
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
  }, [normalizedQuery, activeTab]);

  const handleAdd = () => {
    if (activeTab === 'products') {
      navigation.navigate('ProductForm', {});
    } else {
      navigation.navigate('CategoryForm', {});
    }
  };

  const renderProductItem = useCallback(({ item }: { item: ProductListItem }) => {
    let stockStatus = 'in_stock';
    if (item.stockQuantity <= 0) stockStatus = 'out_of_stock';
    else if (item.stockQuantity <= 3) stockStatus = 'low_stock';
    const stock = STOCK_STYLE[stockStatus];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProductForm', { productId: item.id })}
        className="mb-3 flex-row rounded-xl border border-border bg-surface p-3"
        style={{ opacity: item.stockQuantity <= 0 ? 0.6 : 1 }}>
        <View className="relative mr-3 h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-bg">
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <Ionicons name="cube-outline" size={24} color={COLORS.textMuted} />
          )}
          <View className="absolute left-1 top-1 rounded px-1.5 py-0.5" style={{ backgroundColor: stock.bg }}>
            <Text className="text-[9px] font-bold" style={{ color: stock.text }}>{stock.label}</Text>
          </View>
        </View>

        <View className="flex-1 justify-between py-0.5">
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-center flex-1 mr-3">
              <Text className="text-sm font-semibold text-foreground flex-shrink-1" numberOfLines={2}>{item.productName}</Text>
              {item.isActive === false && (
                <View className="ml-2 rounded px-1.5 py-0.5" style={{ backgroundColor: COLORS.errorLight }}>
                  <Text className="text-[9px] font-bold" style={{ color: COLORS.error }}>ĐÃ ẨN</Text>
                </View>
              )}
            </View>
            <TouchableOpacity className="rounded-full p-1 ml-1" activeOpacity={0.7} onPress={() => navigation.navigate('ProductForm', { productId: item.id })}>
              <Ionicons name="pencil" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-muted">Mã: {item.barCode || item.sku || 'N/A'}</Text>
          <View className="mt-2 flex-row items-end justify-between">
            <View>
              <Text className="text-[11px] text-muted">Đơn giá</Text>
              <Text className="text-sm font-bold text-primary">{formatCurrency(item.price)}</Text>
            </View>
            <View className="items-end">
              <Text className="text-[11px] text-muted">Tồn kho</Text>
              <Text className="text-sm font-bold text-foreground">{item.stockQuantity}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  const renderCategoryItem = useCallback(({ item }: { item: CategoryListItem }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('CategoryForm', { categoryId: item.id })}
      className="mb-3 flex-row items-center justify-between rounded-xl border border-border bg-surface p-4">
      <View className="flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(38,198,218,0.12)' }}>
          <Ionicons name="folder-outline" size={20} color={COLORS.primary} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-base font-semibold text-foreground flex-shrink-1" numberOfLines={1}>{item.name || item.categoryName}</Text>
            {item.isActive === false && (
              <View className="ml-2 rounded px-1.5 py-0.5" style={{ backgroundColor: COLORS.errorLight }}>
                <Text className="text-[9px] font-bold" style={{ color: COLORS.error }}>ĐÃ ẨN</Text>
              </View>
            )}
          </View>
          {item.parentName && <Text className="text-xs text-muted">Thuộc: {item.parentName}</Text>}
        </View>
      </View>
      <TouchableOpacity className="rounded-full p-1" activeOpacity={0.7} onPress={() => navigation.navigate('CategoryForm', { categoryId: item.id })}>
        <Ionicons name="pencil" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  ), [navigation]);

  const keyExtractor = useCallback((item: ProductListItem | CategoryListItem) => item.id, []);

  const renderListItem = useMemo(
    () => (activeTab === 'products' ? renderProductItem : renderCategoryItem),
    [activeTab, renderProductItem, renderCategoryItem],
  );

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Sản phẩm & Danh mục"
        subtitle={
          activeTab === 'products'
            ? `${filteredData.length} sản phẩm`
            : `${filteredData.length} danh mục`
        }
        topInset={insets.top}
        showBackButton
        rightSlot={
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30"
            activeOpacity={0.8}
            onPress={handleAdd}>
            <Ionicons name="add" size={24} color="#0F172A" />
          </TouchableOpacity>
        }>
        {activeTab === 'products' && (
          <View
            className="flex-row items-center rounded-xl p-3 mb-4 border"
            style={{
              backgroundColor: COLORS.primaryLight,
              borderColor: 'rgba(25, 214, 200, 0.2)'
            }}>
            <View className="bg-primary/20 p-1.5 rounded-full mr-3">
              <Ionicons name="information-circle" size={18} color={COLORS.primaryDark} />
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-bold text-foreground mb-0.5">Mẹo nhỏ</Text>
              <Text className="text-[12px] text-foreground opacity-70 leading-4">
                Nếu chưa có Danh Mục, vui lòng tạo trước để quản lý sản phẩm tốt hơn!
              </Text>
            </View>
          </View>
        )}
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={activeTab === 'products' ? "Tìm theo tên, mã..." : "Tìm danh mục..."}
        />
      </ScreenHeader>

      {canViewInactive && (
        <View className="flex-row items-center justify-between px-4 py-3 bg-surface border-b border-divider">
          <Text className="text-sm font-semibold text-foreground">Hiển thị mục đã ẩn</Text>
          <Switch
            value={showInactive}
            onValueChange={setShowInactive}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
          />
        </View>
      )}

      <View className="flex-row border-b border-divider bg-surface px-4">
        <TouchableOpacity
          activeOpacity={0.8}
          className={`flex-1 items-center justify-center border-b-2 py-3 ${activeTab === 'products' ? 'border-primary' : 'border-transparent'}`}
          onPress={() => setActiveTab('products')}>
          <Text className={`text-sm font-semibold ${activeTab === 'products' ? 'text-primary' : 'text-muted'}`}>Sản phẩm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          className={`flex-1 items-center justify-center border-b-2 py-3 ${activeTab === 'categories' ? 'border-primary' : 'border-transparent'}`}
          onPress={() => setActiveTab('categories')}>
          <Text className={`text-sm font-semibold ${activeTab === 'categories' ? 'text-primary' : 'text-muted'}`}>Danh mục</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={filteredData}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          ListEmptyComponent={
            <View className="items-center pt-16">
              <Ionicons name={activeTab === 'products' ? 'cube-outline' : 'folder-outline'} size={48} color={COLORS.textLight} />
              <Text className="mt-3 text-base text-muted">
                {activeTab === 'products' ? 'Không có sản phẩm nào' : 'Không có danh mục nào'}
              </Text>
            </View>
          }
          renderItem={renderListItem as any}
        />
      )}
    </View>
  );
}
