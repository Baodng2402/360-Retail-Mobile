import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Hàm merge className cho NativeWind/Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
