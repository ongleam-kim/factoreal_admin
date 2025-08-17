'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/utils/admin-api';
import type {
  UserInquiryJoin,
  TableFilters,
  PaginationState,
  SortingState,
  PaginatedResponse,
} from '@/lib/types';

interface UseUsersInquiriesOptions {
  initialFilters?: TableFilters;
  initialPagination?: PaginationState;
  initialSorting?: SortingState;
}

export function useUsersInquiries(options: UseUsersInquiriesOptions = {}) {
  const [data, setData] = useState<UserInquiryJoin[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<TableFilters>(
    options.initialFilters || {}
  );
  const [pagination, setPagination] = useState<PaginationState>(
    options.initialPagination || { pageIndex: 0, pageSize: 20 }
  );
  const [sorting, setSorting] = useState<SortingState>(
    options.initialSorting || { id: 'createdAt', desc: true }
  );

  // 데이터 로드
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminApi.getUsersInquiries(filters, pagination, sorting);

      if (response.success && response.data) {
        setData(response.data.data);
        setTotal(response.data.total);
      } else {
        setError(response.message || '데이터를 불러오는데 실패했습니다.');
        setData([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('데이터 로드 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setData([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination, sorting]);

  // 필터 업데이트
  const updateFilters = useCallback((newFilters: Partial<TableFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, pageIndex: 0 })); // 필터 변경시 첫 페이지로
  }, []);

  // 페이지네이션 업데이트
  const updatePagination = useCallback((newPagination: Partial<PaginationState>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // 정렬 업데이트
  const updateSorting = useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
    setPagination(prev => ({ ...prev, pageIndex: 0 })); // 정렬 변경시 첫 페이지로
  }, []);

  // 검색
  const search = useCallback((searchTerm: string) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  // 새로고침
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // 필터/페이지네이션/정렬 변경시 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 페이지 정보 계산
  const totalPages = Math.ceil(total / pagination.pageSize);
  const currentPage = pagination.pageIndex + 1;

  return {
    // 데이터
    data,
    total,
    isLoading,
    error,

    // 상태
    filters,
    pagination,
    sorting,

    // 페이지 정보
    totalPages,
    currentPage,

    // 액션
    updateFilters,
    updatePagination,
    updateSorting,
    search,
    refresh,
    loadData,
  };
}