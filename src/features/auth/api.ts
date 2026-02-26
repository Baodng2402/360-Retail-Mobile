import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@/src/lib/api/axios';
import { useAppStore } from '@/src/store';

import type { AuthUser, LoginFormValues } from './types';
import { AuthUserSchema } from './types';

type LoginResponse = {
  token: string;
  user: AuthUser;
};

export const loginRequest = async (payload: LoginFormValues): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', payload);

  const parsedUser = AuthUserSchema.parse(response.data.user);

  return {
    token: response.data.token,
    user: parsedUser,
  };
};

export const useLoginMutation = () => {
  const setCredentials = useAppStore((state) => state.setCredentials);

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: loginRequest,
    onSuccess: ({ token, user }) => {
      setCredentials({ accessToken: token, user });
    },
  });
};

