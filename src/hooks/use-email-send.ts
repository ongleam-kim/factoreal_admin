'use client';

import { useState, useCallback } from 'react';
import { adminApi } from '@/lib/utils/admin-api';
import type { EmailSendRequest, EmailSendHistory } from '@/lib/types';

export function useEmailSend() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이메일 발송
  const sendEmail = useCallback(async (request: EmailSendRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminApi.sendEmail(request);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: '이메일이 성공적으로 발송되었습니다.',
        };
      } else {
        setError(response.message || '이메일 발송에 실패했습니다.');
        return {
          success: false,
          message: response.message || '이메일 발송에 실패했습니다.',
        };
      }
    } catch (err) {
      console.error('이메일 발송 오류:', err);
      const errorMessage = '이메일 발송 중 오류가 발생했습니다.';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 에러 클리어
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    sendEmail,
    clearError,
  };
}

// 이메일 발송 이력 관리를 위한 훅
export function useEmailHistory() {
  const [history, setHistory] = useState<EmailSendHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // 이메일 이력 로드
  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminApi.getEmailHistory(pagination);

      if (response.success && response.data) {
        setHistory(response.data.data);
        setTotal(response.data.total);
      } else {
        setError(response.message || '이메일 이력을 불러오는데 실패했습니다.');
        setHistory([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('이메일 이력 로드 오류:', err);
      setError('이메일 이력을 불러오는 중 오류가 발생했습니다.');
      setHistory([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [pagination]);

  // 페이지네이션 업데이트
  const updatePagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // 새로고침
  const refresh = useCallback(() => {
    loadHistory();
  }, [loadHistory]);

  // 페이지 정보 계산
  const totalPages = Math.ceil(total / pagination.pageSize);
  const currentPage = pagination.pageIndex + 1;

  return {
    // 데이터
    history,
    total,
    isLoading,
    error,

    // 페이지네이션
    pagination,
    totalPages,
    currentPage,

    // 액션
    updatePagination,
    refresh,
    loadHistory,
  };
}