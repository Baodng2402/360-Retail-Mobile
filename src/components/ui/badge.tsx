import { cn } from '@/src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { View, type ViewProps } from 'react-native';
import { Text, TextClassContext } from './text';

// =============================================
// Badge — status chip (IN STOCK, Pending, etc.)
// Usage: <Badge variant="success">CÒN HÀNG</Badge>
// =============================================

const badgeVariants = cva(
    'items-center justify-center rounded-md px-2 py-0.5',
    {
        variants: {
            variant: {
                default: 'bg-primary/15',
                success: 'bg-green-100',
                warning: 'bg-orange-100',
                error: 'bg-red-100',
                info: 'bg-blue-100',
                outline: 'border border-border bg-transparent',
            },
        },
        defaultVariants: { variant: 'default' },
    }
);

const badgeTextVariants = cva('text-[10px] font-bold', {
    variants: {
        variant: {
            default: 'text-cyan-600',
            success: 'text-green-600',
            warning: 'text-orange-600',
            error: 'text-red-600',
            info: 'text-blue-600',
            outline: 'text-foreground',
        },
    },
    defaultVariants: { variant: 'default' },
});

type BadgeVariant = VariantProps<typeof badgeVariants>;

interface BadgeProps extends ViewProps, BadgeVariant {
    label: string;
}

function Badge({ variant, label, className, ...props }: BadgeProps) {
    return (
        <TextClassContext.Provider value={badgeTextVariants({ variant })}>
            <View className={cn(badgeVariants({ variant }), className)} {...props}>
                <Text>{label}</Text>
            </View>
        </TextClassContext.Provider>
    );
}

export { Badge, badgeVariants, type BadgeProps };
