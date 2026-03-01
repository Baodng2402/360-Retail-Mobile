import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';
import { formatCurrency } from '@/src/utils/format';

interface StatCardProps {
    label: string;
    value: string;
    trend?: number;
    icon?: string;
    iconColor?: string;
}

export function StatCard({ label, value, trend, icon, iconColor }: StatCardProps) {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: COLORS.surface,
                borderRadius: 16,
                padding: 16,
                marginHorizontal: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase' }}>
                    {label}
                </Text>
                {icon && (
                    <View
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            backgroundColor: (iconColor || COLORS.primary) + '15',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons name={icon as any} size={16} color={iconColor || COLORS.primary} />
                    </View>
                )}
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.text }}>{value}</Text>
            {trend !== undefined && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Ionicons
                        name={trend >= 0 ? 'trending-up' : 'trending-down'}
                        size={14}
                        color={trend >= 0 ? COLORS.success : COLORS.error}
                    />
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: trend >= 0 ? COLORS.success : COLORS.error,
                            marginLeft: 4,
                        }}
                    >
                        {trend >= 0 ? '+' : ''}{trend}%
                    </Text>
                </View>
            )}
        </View>
    );
}

interface MiniBarChartProps {
    data: number[];
    labels: string[];
    height?: number;
    barColor?: string;
    title: string;
    subtitle?: string;
}

export function MiniBarChart({ data, labels, height = 120, barColor, title, subtitle }: MiniBarChartProps) {
    const maxVal = Math.max(...data);

    return (
        <View
            style={{
                backgroundColor: COLORS.surface,
                borderRadius: 16,
                padding: 16,
                marginTop: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.text }}>{title}</Text>
                <TouchableOpacity activeOpacity={0.7}>
                    <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
            </View>
            {subtitle && (
                <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>{subtitle}</Text>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 6 }}>
                {data.map((val, idx) => {
                    const barH = maxVal > 0 ? (val / maxVal) * (height - 20) : 0;
                    const isHighest = val === maxVal;
                    const color = barColor || COLORS.primary;
                    return (
                        <View key={idx} style={{ flex: 1, alignItems: 'center' }}>
                            <Text
                                style={{
                                    fontSize: 9,
                                    fontWeight: '700',
                                    color: isHighest ? color : COLORS.textMuted,
                                    marginBottom: 4,
                                }}
                            >
                                {val >= 1_000_000 ? (val / 1_000_000).toFixed(0) + 'tr' : val}
                            </Text>
                            <View
                                style={{
                                    width: '80%',
                                    height: Math.max(barH, 4),
                                    borderRadius: 6,
                                    backgroundColor: isHighest ? color : color + '40',
                                }}
                            />
                            <Text style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 4 }}>{labels[idx]}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

interface ProgressCardProps {
    percentage: number;
    label: string;
    value: string;
    color?: string;
}

export function ProgressCard({ percentage, label, value, color }: ProgressCardProps) {
    const ringColor = color || COLORS.primary;
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: COLORS.surface,
                borderRadius: 16,
                padding: 16,
                marginHorizontal: 4,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
            }}
        >
            <View
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    borderWidth: 5,
                    borderColor: ringColor + '25',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                }}
            >
                <View
                    style={{
                        position: 'absolute',
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        borderWidth: 5,
                        borderColor: 'transparent',
                        borderTopColor: ringColor,
                        borderRightColor: percentage > 25 ? ringColor : 'transparent',
                        borderBottomColor: percentage > 50 ? ringColor : 'transparent',
                        borderLeftColor: percentage > 75 ? ringColor : 'transparent',
                    }}
                />
                <Text style={{ fontSize: 16, fontWeight: '800', color: ringColor }}>{percentage}%</Text>
            </View>
            <Text style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: '600', textAlign: 'center' }}>{label}</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 2 }}>{value}</Text>
        </View>
    );
}

interface SoldSummaryCardProps {
    count: number;
    percentage: number;
}

export function SoldSummaryCard({ count, percentage }: SoldSummaryCardProps) {
    return (
        <View
            style={{
                backgroundColor: COLORS.surface,
                borderRadius: 16,
                padding: 16,
                marginTop: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                    <Text style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: '500' }}>Đã bán tháng này</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
                        <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.text }}>{count}</Text>
                        <Text style={{ fontSize: 13, color: COLORS.textMuted, marginLeft: 4 }}>sản phẩm</Text>
                    </View>
                </View>
                <View
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        backgroundColor: COLORS.primaryLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
                </View>
            </View>
            <View style={{ marginTop: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 12, color: COLORS.textMuted }}>Tiến độ mục tiêu</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>{percentage}%</Text>
                </View>
                <View style={{ height: 8, backgroundColor: COLORS.divider, borderRadius: 4, overflow: 'hidden' }}>
                    <View
                        style={{ height: '100%', width: `${Math.min(percentage, 100)}%`, backgroundColor: COLORS.primary, borderRadius: 4 }}
                    />
                </View>
            </View>
        </View>
    );
}

interface ActivityCardProps {
    icon: string;
    iconColor: string;
    title: string;
    subtitle: string;
    time: string;
}

export function ActivityCard({ icon, iconColor, title, subtitle, time }: ActivityCardProps) {
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 14,
                padding: 14,
                marginBottom: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 3,
                elevation: 1,
            }}
        >
            <View
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: iconColor + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Ionicons name={icon as any} size={20} color={iconColor} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>{title}</Text>
                <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{subtitle}</Text>
            </View>
            <Text style={{ fontSize: 11, color: COLORS.textMuted }}>{time}</Text>
        </View>
    );
}

interface ProductCardProps {
    name: string;
    price: number;
    stock: number;
    onPress?: () => void;
    onAddToCart?: () => void;
}

export function ProductCard({ name, price, stock, onPress, onAddToCart }: ProductCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                flex: 1,
                backgroundColor: COLORS.surface,
                borderRadius: 16,
                overflow: 'hidden',
                margin: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
            }}
        >
            <View
                style={{
                    width: '100%',
                    aspectRatio: 1,
                    backgroundColor: '#F1F5F9',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Ionicons name="phone-portrait-outline" size={40} color={COLORS.textMuted} />
            </View>
            <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.text, height: 36 }} numberOfLines={2}>
                    {name}
                </Text>
                <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                    Còn {stock}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: COLORS.primary }}>
                        {formatCurrency(price)}
                    </Text>
                    <TouchableOpacity
                        onPress={onAddToCart}
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            backgroundColor: COLORS.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

interface InventoryItemProps {
    name: string;
    sku: string;
    price: number;
    status: string;
    onPress?: () => void;
}

export function InventoryItem({ name, sku, price, status, onPress }: InventoryItemProps) {
    const statusMap: Record<string, { color: string; bg: string; text: string }> = {
        in_stock: { color: COLORS.primary, bg: COLORS.primaryLight, text: 'CÒN HÀNG' },
        low_stock: { color: COLORS.accent, bg: COLORS.accentLight, text: 'SẮP HẾT' },
        out_of_stock: { color: COLORS.error, bg: COLORS.errorLight, text: 'HẾT HÀNG' },
    };
    const s = statusMap[status] || statusMap.in_stock;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 14,
                padding: 14,
                marginBottom: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 3,
                elevation: 1,
            }}
        >
            <View
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: '#F1F5F9',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Ionicons name="phone-portrait-outline" size={22} color={COLORS.textMuted} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>{name}</Text>
                <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>SKU: {sku}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text }}>
                    {formatCurrency(price)}
                </Text>
                <View
                    style={{
                        marginTop: 4,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                        backgroundColor: s.bg,
                    }}
                >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: s.color }}>{s.text}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

interface OrderHistoryCardProps {
    code: string;
    customerName: string;
    date: string;
    itemCount: number;
    amount: string;
    status: string;
    onPress?: () => void;
}

export function OrderHistoryCard({
    code,
    customerName,
    date,
    itemCount,
    amount,
    status,
    onPress,
}: OrderHistoryCardProps) {
    const statusMap: Record<string, { color: string; bg: string; text: string }> = {
        pending: { color: COLORS.warning, bg: COLORS.warningLight, text: 'Chờ xử lý' },
        processing: { color: COLORS.info, bg: '#E3F2FD', text: 'Đang xử lý' },
        shipping: { color: COLORS.primary, bg: COLORS.primaryLight, text: 'Đang giao' },
        completed: { color: COLORS.success, bg: COLORS.successLight, text: 'Hoàn thành' },
        cancelled: { color: COLORS.error, bg: COLORS.errorLight, text: 'Đã hủy' },
    };
    const s = statusMap[status] || statusMap.pending;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                backgroundColor: COLORS.surface,
                borderRadius: 14,
                padding: 14,
                marginBottom: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 3,
                elevation: 1,
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: COLORS.primaryLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.primaryDark }}>
                        {customerName.charAt(0)}
                    </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.text }}>
                            Đơn {code}
                        </Text>
                        <View
                            style={{
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 6,
                                backgroundColor: s.bg,
                            }}
                        >
                            <Text style={{ fontSize: 10, fontWeight: '700', color: s.color }}>{s.text}</Text>
                        </View>
                    </View>
                    <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{customerName}</Text>
                </View>
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 12,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.divider,
                }}
            >
                <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
                    {date} • {itemCount} sản phẩm
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '800', color: COLORS.text }}>{amount}</Text>
            </View>
        </TouchableOpacity>
    );
}

interface CategoryChipProps {
    label: string;
    isActive: boolean;
    onPress: () => void;
}

export function CategoryChip({ label, isActive, onPress }: CategoryChipProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: isActive ? COLORS.primary : COLORS.surface,
                borderWidth: isActive ? 0 : 1,
                borderColor: COLORS.border,
                minHeight: 36,
                justifyContent: 'center',
                alignItems: 'center',
            }}
            activeOpacity={0.7}
        >
            <Text
                style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: isActive ? '#fff' : COLORS.textSecondary,
                }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

interface TabChipProps {
    label: string;
    isActive: boolean;
    onPress: () => void;
}

export function TabChip({ label, isActive, onPress }: TabChipProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: isActive ? COLORS.primary : 'transparent',
                borderWidth: isActive ? 0 : 1,
                borderColor: COLORS.border,
            }}
            activeOpacity={0.7}
        >
            <Text
                style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: isActive ? '#fff' : COLORS.textMuted,
                }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

interface MenuItemProps {
    icon: string;
    label: string;
    subtitle?: string;
    iconColor: string;
    showBorder?: boolean;
    onPress?: () => void;
}

export function MenuItem({ icon, label, subtitle, iconColor, showBorder = true, onPress }: MenuItemProps) {
    return (
        <TouchableOpacity
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderBottomWidth: showBorder ? 1 : 0,
                borderBottomColor: COLORS.divider,
            }}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: iconColor + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Ionicons name={icon as any} size={20} color={iconColor} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: '500', color: COLORS.text }}>{label}</Text>
                {subtitle && (
                    <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{subtitle}</Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
        </TouchableOpacity>
    );
}

interface BestSellerCardProps {
    rank: number;
    name: string;
    category: string;
    revenue: number;
    trend: number;
}

export function BestSellerCard({ rank, name, category, revenue, trend }: BestSellerCardProps) {
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 14,
                padding: 14,
                marginBottom: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 3,
                elevation: 1,
            }}
        >
            <View
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: rank <= 3 ? COLORS.primaryLight : COLORS.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text style={{ fontSize: 14, fontWeight: '800', color: rank <= 3 ? COLORS.primary : COLORS.textMuted }}>
                    #{rank}
                </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>{name}</Text>
                <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{category}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text }}>
                    {formatCurrency(revenue)}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.success, marginTop: 2 }}>
                    +{trend}%
                </Text>
            </View>
        </View>
    );
}
