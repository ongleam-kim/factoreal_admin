'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Mail, RefreshCw } from 'lucide-react';
// 타입 정의
type InquiryStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';
type InquiryType = 'general' | 'technical' | 'pricing' | 'partnership';

interface UserInquiryJoin {
  user: {
    id: string;
    name: string;
    email: string;
    companyName: string | null;
    registeredAt: Date;
  };
  inquiry: {
    id: string;
    userId: string;
    type: InquiryType;
    title: string;
    content: string;
    status: InquiryStatus;
    createdAt: Date;
    updatedAt: Date;
    responseCount: number;
  };
}

const getStatusBadge = (status: InquiryStatus) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary">대기</Badge>;
    case 'in_progress':
      return <Badge variant="outline">진행중</Badge>;
    case 'resolved':
      return <Badge variant="default">완료</Badge>;
    case 'closed':
      return <Badge variant="destructive">종료</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const getTypeBadge = (type: InquiryType) => {
  const typeLabels = {
    general: '일반',
    technical: '기술',
    pricing: '가격',
    partnership: '파트너십',
  };

  return <Badge variant="outline">{typeLabels[type]}</Badge>;
};

export default function UsersInquiriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<UserInquiryJoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchData = async (search: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('limit', '50');
      params.append('offset', '0');
      
      const response = await fetch(`/api/users-inquiries?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        // Date 문자열을 Date 객체로 변환
        const transformedData = result.data.items.map((item: any) => ({
          ...item,
          user: {
            ...item.user,
            registeredAt: new Date(item.user.registeredAt)
          },
          inquiry: {
            ...item.inquiry,
            createdAt: new Date(item.inquiry.createdAt),
            updatedAt: new Date(item.inquiry.updatedAt)
          }
        }));
        setData(transformedData);
        setTotal(result.data.total);
      } else {
        console.error('데이터 로딩 실패:', result.error);
        setData([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('API 호출 실패:', error);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(searchTerm);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchData(searchTerm);
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleRefresh = () => {
    fetchData(searchTerm);
  };

  const handleSendEmail = (userInquiry: UserInquiryJoin) => {
    // TODO: 이메일 발송 페이지로 이동
    console.log('이메일 발송:', userInquiry.user.email);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">사용자 & 문의 관리</h1>
          <p className="text-muted-foreground">사용자 정보와 문의 내역을 통합 관리합니다.</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="이름, 이메일, 회사명, 문의 제목으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            사용자 & 문의 목록 
            {!loading && <span className="text-muted-foreground text-sm ml-2">({total}건)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사용자</TableHead>
                <TableHead>회사명</TableHead>
                <TableHead>문의 유형</TableHead>
                <TableHead>문의 제목</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      데이터를 로딩 중입니다...
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">
                      {searchTerm ? '검색 결과가 없습니다.' : '문의가 없습니다.'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                <TableRow key={item.inquiry.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.user.name}</div>
                      <div className="text-muted-foreground text-sm">{item.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{item.user.companyName || '-'}</TableCell>
                  <TableCell>{getTypeBadge(item.inquiry.type)}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="truncate font-medium">{item.inquiry.title}</div>
                      <div className="text-muted-foreground text-sm">
                        응답 {item.inquiry.responseCount}회
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.inquiry.status)}</TableCell>
                  <TableCell>{item.inquiry.createdAt.toLocaleDateString('ko-KR')}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleSendEmail(item)}>
                      <Mail className="mr-2 h-4 w-4" />
                      이메일
                    </Button>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
