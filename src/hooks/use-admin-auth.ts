'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/utils/admin-api';
import type { AuthState, LoginRequest } from '@/lib/types';

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // 현재 사용자 정보 확인
  const checkAuth = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response = await adminApi.getCurrentUser();

      if (response.success && response.data) {
        setAuthState({
          user: response.data,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('인증 확인 오류:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // 로그인
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response = await adminApi.login(credentials);

      if (response.success && response.data) {
        adminApi.setToken(response.data.token);
        setAuthState({
          user: response.data.user,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true };
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return {
          success: false,
          message: response.message || '로그인에 실패했습니다.',
        };
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        message: '로그인 중 오류가 발생했습니다.',
      };
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
}
