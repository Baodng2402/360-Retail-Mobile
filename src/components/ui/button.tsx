import type { ReactNode } from 'react';
import type { PressableProps } from 'react-native';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/src/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex flex-row items-center justify-center rounded-md px-4 py-3 active:opacity-90',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border border-border bg-background text-foreground',
        ghost: 'bg-transparent text-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 px-3',
        lg: 'h-12 px-6',
        icon: 'h-10 w-10 items-center justify-center p-0',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  },
);

type ButtonBaseProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    children?: ReactNode;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    isLoading?: boolean;
    textClassName?: string;
  };

export function Button({
  children,
  leftIcon,
  rightIcon,
  isLoading,
  disabled,
  variant,
  size,
  fullWidth,
  className,
  textClassName,
  ...rest
}: ButtonBaseProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={cn(
        buttonVariants({ variant, size, fullWidth }),
        isDisabled && 'opacity-60',
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          {typeof children === 'string' ? (
            <Text
              className={cn(
                'text-sm font-medium text-primary-foreground',
                textClassName,
              )}
            >
              {children}
            </Text>
          ) : (
            children
          )}
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </Pressable>
  );
}

