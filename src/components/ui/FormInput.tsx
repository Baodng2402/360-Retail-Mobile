import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormInputProps extends Omit<TextInputProps, 'style'> {
    label: string;
    icon: string;
    isPassword?: boolean;
}

export function FormInput({ label, icon, isPassword = false, ...inputProps }: FormInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View className="mb-4">
            <Text className="text-sm font-medium text-slate-600 mb-2">{label}</Text>
            <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-14">
                <Ionicons name={icon as any} size={22} color="#94A3B8" />
                <TextInput
                    className="flex-1 text-base text-slate-800 ml-3"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={isPassword && !showPassword}
                    {...inputProps}
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#94A3B8" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
