import { memo, useMemo } from 'react';
import { View, Dimensions, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';
import { LineChart } from 'react-native-gifted-charts';
import { formatCompact } from '@/src/utils/format';

interface ModernRevenueChartProps {
    dataPoints: { label: string; revenue: number; orderCount: number; }[];
    title: string;
    subtitle?: string;
}

const screenWidth = Dimensions.get('window').width;

function ModernRevenueChartComponent({ dataPoints, title, subtitle }: ModernRevenueChartProps) {
    const chartData = useMemo(() => {
        if (!dataPoints || dataPoints.length === 0) return [];
        return dataPoints.map(point => ({
            value: point.revenue,
            dateLabel: point.label,
        }));
    }, [dataPoints]);

    return (
        <View className="mt-2 rounded-2xl bg-surface p-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[15px] font-bold text-foreground">{title}</Text>
                <TouchableOpacity activeOpacity={0.7}>
                    <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
            </View>
            {subtitle && (
                <Text className="mb-4 text-xs text-muted">{subtitle}</Text>
            )}

            {chartData.length > 0 ? (
                <View className="pt-6 pb-2">
                    <LineChart
                        areaChart
                        data={chartData}
                        hideDataPoints={false}
                        dataPointsColor={COLORS.primary}
                        dataPointsRadius={4}
                        color={COLORS.primary}
                        startFillColor={COLORS.primary}
                        endFillColor={COLORS.primaryLight}
                        startOpacity={0.4}
                        endOpacity={0.05}
                        spacing={screenWidth > 380 ? 45 : 35}
                        hideRules={false}
                        rulesColor={COLORS.border}
                        rulesType="dashed"
                        yAxisThickness={0}
                        xAxisThickness={1}
                        xAxisColor={COLORS.border}
                        yAxisTextStyle={{ color: COLORS.textMuted, fontSize: 10, fontWeight: '600' }}
                        noOfSections={4}
                        yAxisLabelTexts={["0", "1", "2", "3", "4"].map((_, i) => {
                            const max = Math.max(...chartData.map(d => d.value));
                            const sectionValue = (max / 4) * i;
                            return formatCompact(sectionValue);
                        })}
                        isAnimated
                        animationDuration={1200}
                        width={screenWidth - 90}
                        height={160}
                        initialSpacing={20}
                        pointerConfig={{
                            pointerStripHeight: 160,
                            pointerStripColor: COLORS.border,
                            pointerStripWidth: 2,
                            pointerColor: COLORS.primary,
                            radius: 6,
                            pointerLabelWidth: 100,
                            pointerLabelHeight: 50,
                            activatePointersOnLongPress: false,
                            autoAdjustPointerLabelPosition: true,
                            pointerLabelComponent: (items: any) => {
                                const item = items[0];
                                return (
                                    <View className="bg-foreground px-3 py-2 rounded-xl shadow-sm justify-center items-center">
                                        <Text className="text-white font-bold text-xs">{formatCompact(item.value)}</Text>
                                        <Text className="text-muted text-[10px] mt-0.5">{item.dateLabel}</Text>
                                    </View>
                                );
                            },
                        }}
                    />
                </View>
            ) : (
                <View className="h-40 items-center justify-center">
                    <Text className="text-muted">Không có dữ liệu</Text>
                </View>
            )}
        </View>
    );
}

export const ModernRevenueChart = memo(ModernRevenueChartComponent);
