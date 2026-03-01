import React from 'react';
import { View, TouchableOpacity, Linking } from 'react-native';
import { Alert, AlertTitle, AlertDescription } from '@/src/components/ui/alert';
import { Text } from '@/src/components/ui/text';
import { AlertCircleIcon, ClockIcon } from 'lucide-react-native';
import { COLORS } from '@/src/constants/colors';

// URL placeholder — mốt sẽ thay bằng link thật (replace later)
const UPGRADE_URL = 'https://360retail.app/pricing';

interface Props {
    daysRemaining: number | null;
}

// Alert hiển thị khi trial sắp hết (near-expiry) hoặc đã hết hạn (expired)
export function TrialExpiredAlert({ daysRemaining }: Props) {
    if (daysRemaining === null) return null;

    const isExpired = daysRemaining <= 0;
    const isNearExpiry = daysRemaining > 0 && daysRemaining <= 3;

    // Không hiện gì nếu trial còn dư dả (> 3 ngày)
    if (!isExpired && !isNearExpiry) return null;

    const handleUpgrade = () => {
        Linking.openURL(UPGRADE_URL);
    };

    return (
        <View style={{ marginBottom: 12 }}>
            <Alert
                icon={isExpired ? AlertCircleIcon : ClockIcon}
                variant={isExpired ? 'destructive' : 'default'}
            >
                <AlertTitle>
                    {isExpired
                        ? 'Thời gian dùng thử đã hết!'
                        : `Còn ${daysRemaining} ngày dùng thử`}
                </AlertTitle>
                <AlertDescription>
                    {isExpired
                        ? 'Vui lòng nâng cấp gói để tiếp tục sử dụng đầy đủ tính năng.'
                        : 'Nâng cấp ngay để không bị gián đoạn khi hết hạn dùng thử.'}
                </AlertDescription>
                <TouchableOpacity
                    onPress={handleUpgrade}
                    activeOpacity={0.7}
                    style={{
                        marginTop: 8,
                        marginLeft: 24,
                        backgroundColor: isExpired ? COLORS.error : COLORS.primary,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        alignSelf: 'flex-start',
                    }}>
                    <Text className="text-white font-semibold text-[13px]">
                        Nâng cấp ngay →
                    </Text>
                </TouchableOpacity>
            </Alert>
        </View>
    );
}
