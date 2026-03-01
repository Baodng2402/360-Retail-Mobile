import { cn } from '@/src/lib/utils';
import { View, type ViewProps } from 'react-native';

// =============================================
// Progress — linear progress bar
// Usage: <Progress value={65} className="h-2" />
// =============================================

interface ProgressProps extends ViewProps {
    value: number; // 0-100
    color?: string; // override indicator color
}

function Progress({ value, color, className, ...props }: ProgressProps) {
    const clampedValue = Math.min(Math.max(value, 0), 100);

    return (
        <View
            className={cn('h-2 w-full overflow-hidden rounded-full bg-gray-100', className)}
            {...props}
        >
            <View
                className="h-full rounded-full bg-cyan-500"
                style={[
                    { width: `${clampedValue}%` },
                    color ? { backgroundColor: color } : undefined,
                ]}
            />
        </View>
    );
}

export { Progress, type ProgressProps };
