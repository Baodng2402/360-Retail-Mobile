import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';

interface FormInputProps extends Omit<TextInputProps, 'style'> {
    label: string;
    icon: string;
    isPassword?: boolean;
}

export function FormInput({ label, icon, isPassword = false, ...inputProps }: FormInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: COLORS.textSecondary, marginBottom: 8 }}>
                {label}
            </Text>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F8FAFC',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    height: 52,
                    borderWidth: 1.5,
                    borderColor: isFocused ? COLORS.primary : COLORS.border,
                }}
            >
                <Ionicons name={icon as any} size={20} color={isFocused ? COLORS.primary : COLORS.textMuted} />
                <TextInput
                    style={{ flex: 1, fontSize: 15, color: COLORS.text, marginLeft: 12 }}
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={isPassword && !showPassword}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...inputProps}
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={COLORS.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
