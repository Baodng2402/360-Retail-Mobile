import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * navigationRef — Singleton navigation reference
 *
 * Dùng để navigate từ bên NGOÀI React component tree
 * (interceptors, background handlers, etc.)
 *
 * Usage:
 *   import { navigationRef } from '@/src/navigation/navigationRef';
 *   if (navigationRef.isReady()) navigationRef.navigate('Login');
 */
export const navigationRef = createNavigationContainerRef();
