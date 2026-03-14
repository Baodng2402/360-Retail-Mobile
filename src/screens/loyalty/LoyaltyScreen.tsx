import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { customersApi, loyaltyApi } from '@/src/api';
import { PrimaryButton, ScreenHeader } from '@/src/components';
import { COLORS } from '@/src/constants/colors';
import type { MoreStackParamList } from '@/src/navigation/types';
import type { Customer, CreateLoyaltyRuleDto, LoyaltyRule, LoyaltySummary, LoyaltyTransaction } from '@/src/types';

type Props = StackScreenProps<MoreStackParamList, 'Loyalty'>;

export function LoyaltyScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [summary, setSummary] = useState<LoyaltySummary | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<LoyaltyRule | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('1');
  const [earningRate, setEarningRate] = useState('1');
  const [minSpend, setMinSpend] = useState('0');

  const [redeemPoints, setRedeemPoints] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [ruleData, customerData] = await Promise.all([
        loyaltyApi.getLoyaltyRules(),
        customersApi.getCustomers({ pageSize: 100 }),
      ]);
      setRules(ruleData);
      setCustomers(customerData);
    } catch (error) {
      console.error('[LoyaltyScreen.fetchData] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không tải được dữ liệu loyalty' });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const loadCustomerDetail = async (customer: Customer) => {
    setSelectedCustomer(customer);
    try {
      const [sum, tx] = await Promise.all([
        loyaltyApi.getCustomerLoyaltySummary(customer.id),
        loyaltyApi.getCustomerLoyaltyTransactions(customer.id),
      ]);
      setSummary(sum);
      setTransactions(tx);
    } catch (error) {
      console.error('[LoyaltyScreen.loadCustomerDetail] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không tải được điểm loyalty của khách' });
    }
  };

  const openCreateRule = () => {
    setEditingRule(null);
    setName('');
    setType('1');
    setEarningRate('1');
    setMinSpend('0');
    setShowRuleModal(true);
  };

  const openEditRule = (rule: LoyaltyRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setType(String(rule.type));
    setEarningRate(String(rule.earningRate));
    setMinSpend(String(rule.minSpend));
    setShowRuleModal(true);
  };

  const handleSaveRule = async () => {
    const payload: CreateLoyaltyRuleDto = {
      name: name.trim(),
      type: Number(type),
      earningRate: Number(earningRate),
      minSpend: Number(minSpend),
      status: 1,
    };

    if (!payload.name) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Tên rule là bắt buộc' });
      return;
    }

    try {
      if (editingRule) {
        const updated = await loyaltyApi.updateLoyaltyRule(editingRule.id, payload);
        setRules((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        const created = await loyaltyApi.createLoyaltyRule(payload);
        setRules((prev) => [created, ...prev]);
      }
      setShowRuleModal(false);
      Toast.show({ type: 'success', text1: 'Đã lưu loyalty rule' });
    } catch (error) {
      console.error('[LoyaltyScreen.handleSaveRule] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không lưu được rule' });
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await loyaltyApi.deleteLoyaltyRule(id);
      setRules((prev) => prev.filter((x) => x.id !== id));
      Toast.show({ type: 'success', text1: 'Đã xóa rule' });
    } catch (error) {
      console.error('[LoyaltyScreen.handleDeleteRule] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không xóa được rule' });
    }
  };

  const handleRedeem = async () => {
    if (!selectedCustomer) return;
    const points = Number(redeemPoints || '0');
    if (points <= 0) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Điểm đổi phải lớn hơn 0' });
      return;
    }

    try {
      await loyaltyApi.redeemPoints(selectedCustomer.id, points);
      Toast.show({ type: 'success', text1: 'Đổi điểm thành công' });
      setRedeemPoints('');
      await loadCustomerDetail(selectedCustomer);
    } catch (error) {
      console.error('[LoyaltyScreen.handleRedeem] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không đổi được điểm' });
    }
  };

  const topCustomers = useMemo(() => customers.slice(0, 12), [customers]);

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Loyalty"
        topInset={insets.top}
        showBackButton
        rightSlot={
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: COLORS.primaryLight }}
            onPress={openCreateRule}>
            <Ionicons name="add" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={rules}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          ListHeaderComponent={
            <View>
              <Text className="mb-2 text-sm font-semibold text-muted">Customers</Text>
              <View className="mb-4 flex-row flex-wrap gap-2">
                {topCustomers.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    className="rounded-full px-3 py-1.5"
                    style={{ backgroundColor: selectedCustomer?.id === c.id ? COLORS.primary : COLORS.surface }}
                    onPress={() => loadCustomerDetail(c)}>
                    <Text style={{ color: selectedCustomer?.id === c.id ? '#fff' : COLORS.textSecondary }}>
                      {c.fullName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedCustomer && (
                <View className="mb-4 rounded-2xl bg-surface p-4">
                  <Text className="text-base font-bold text-foreground">{selectedCustomer.fullName}</Text>
                  <Text className="mt-1 text-sm text-muted">Points: {summary?.totalPoints ?? 0} • Rank: {summary?.rank ?? '-'}</Text>
                  <View className="mt-3 flex-row gap-2">
                    <TextInput
                      className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm text-foreground"
                      placeholder="Điểm cần đổi"
                      keyboardType="numeric"
                      value={redeemPoints}
                      onChangeText={setRedeemPoints}
                    />
                    <TouchableOpacity
                      className="items-center justify-center rounded-xl px-4"
                      style={{ backgroundColor: COLORS.primary }}
                      onPress={handleRedeem}>
                      <Text className="font-semibold text-white">Redeem</Text>
                    </TouchableOpacity>
                  </View>

                  <Text className="mt-3 text-xs text-muted">Transactions</Text>
                  {transactions.slice(0, 5).map((tx) => (
                    <Text key={tx.id} className="mt-1 text-xs text-muted">
                      {new Date(tx.createdAt).toLocaleDateString('vi-VN')} • {tx.points} • {tx.description || tx.type || ''}
                    </Text>
                  ))}
                </View>
              )}

              <Text className="mb-2 text-sm font-semibold text-muted">Rules</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="mb-3 rounded-2xl bg-surface p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-bold text-foreground">{item.name}</Text>
                  <Text className="text-xs text-muted">Rate: {item.earningRate} • Min spend: {item.minSpend}</Text>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="rounded-lg border border-border px-3 py-1.5"
                    onPress={() => openEditRule(item)}>
                    <Text className="text-xs font-semibold text-foreground">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="rounded-lg px-3 py-1.5"
                    style={{ backgroundColor: COLORS.errorLight }}
                    onPress={() => handleDeleteRule(item.id)}>
                    <Text className="text-xs font-semibold" style={{ color: COLORS.error }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="ribbon-outline" size={48} color={COLORS.textMuted} />
              <Text className="mt-3 text-base text-muted">Chưa có loyalty rule</Text>
            </View>
          }
        />
      )}

      <Modal visible={showRuleModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl bg-surface p-6" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <Text className="mb-4 text-lg font-bold text-foreground">
              {editingRule ? 'Sửa rule' : 'Tạo rule'}
            </Text>

            <TextInput
              className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
              placeholder="Tên rule"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
              placeholder="Type"
              keyboardType="numeric"
              value={type}
              onChangeText={setType}
            />
            <TextInput
              className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
              placeholder="Earning rate"
              keyboardType="numeric"
              value={earningRate}
              onChangeText={setEarningRate}
            />
            <TextInput
              className="mb-4 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
              placeholder="Min spend"
              keyboardType="numeric"
              value={minSpend}
              onChangeText={setMinSpend}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center rounded-xl border border-border py-3"
                onPress={() => setShowRuleModal(false)}>
                <Text className="font-semibold text-muted">Hủy</Text>
              </TouchableOpacity>
              <PrimaryButton
                label="Lưu"
                onPress={handleSaveRule}
                className="flex-1 items-center justify-center rounded-xl"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
