'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/utils/admin-api';
import type { EmailTemplate } from '@/lib/types';

export function useEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 템플릿 목록 로드
  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminApi.getEmailTemplates();

      if (response.success && response.data) {
        setTemplates(response.data);
      } else {
        setError(response.message || '템플릿을 불러오는데 실패했습니다.');
        setTemplates([]);
      }
    } catch (err) {
      console.error('템플릿 로드 오류:', err);
      setError('템플릿을 불러오는 중 오류가 발생했습니다.');
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 템플릿 생성
  const createTemplate = useCallback(async (
    templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const response = await adminApi.createEmailTemplate(templateData);

      if (response.success && response.data) {
        setTemplates(prev => [...prev, response.data!]);
        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          message: response.message || '템플릿 생성에 실패했습니다.',
        };
      }
    } catch (err) {
      console.error('템플릿 생성 오류:', err);
      return {
        success: false,
        message: '템플릿 생성 중 오류가 발생했습니다.',
      };
    }
  }, []);

  // 템플릿 수정
  const updateTemplate = useCallback(async (
    id: string,
    templateData: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    try {
      const response = await adminApi.updateEmailTemplate(id, templateData);

      if (response.success && response.data) {
        setTemplates(prev =>
          prev.map(template =>
            template.id === id ? response.data! : template
          )
        );
        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          message: response.message || '템플릿 수정에 실패했습니다.',
        };
      }
    } catch (err) {
      console.error('템플릿 수정 오류:', err);
      return {
        success: false,
        message: '템플릿 수정 중 오류가 발생했습니다.',
      };
    }
  }, []);

  // 템플릿 삭제
  const deleteTemplate = useCallback(async (id: string) => {
    try {
      const response = await adminApi.deleteEmailTemplate(id);

      if (response.success) {
        setTemplates(prev => prev.filter(template => template.id !== id));
        return { success: true };
      } else {
        return {
          success: false,
          message: response.message || '템플릿 삭제에 실패했습니다.',
        };
      }
    } catch (err) {
      console.error('템플릿 삭제 오류:', err);
      return {
        success: false,
        message: '템플릿 삭제 중 오류가 발생했습니다.',
      };
    }
  }, []);

  // 특정 템플릿 조회
  const getTemplate = useCallback((id: string) => {
    return templates.find(template => template.id === id) || null;
  }, [templates]);

  // 카테고리별 템플릿 필터링
  const getTemplatesByCategory = useCallback((category: string) => {
    return templates.filter(template => template.category === category);
  }, [templates]);

  // 새로고침
  const refresh = useCallback(() => {
    loadTemplates();
  }, [loadTemplates]);

  // 컴포넌트 마운트 시 템플릿 로드
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    // 데이터
    templates,
    isLoading,
    error,

    // 액션
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    getTemplatesByCategory,
    refresh,
    loadTemplates,
  };
}