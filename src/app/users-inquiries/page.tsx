'use client';

import { useState } from 'react';
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
import type { UserInquiryJoin, InquiryStatus, InquiryType } from '@/lib/types';

// Mock data for MVP - 실제로는 API에서 가져올 데이터
const mockData: UserInquiryJoin[] = [
  {
    user: {
      id: '1',
      name: '김철수',
      email: 'kim@example.com',
      companyName: '테크컴퍼니',
      registeredAt: new Date('2024-01-15'),
    },
    inquiry: {
      id: '1',
      userId: '1',
      type: 'technical',
      title: 'API 연동 관련 문의',
      content: 'REST API 연동 방법에 대해 문의드립니다.',
      status: 'pending',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      responseCount: 0,
    },
  },
  {
    user: {
      id: '2',
      name: '이영희',
      email: 'lee@example.com',
      companyName: '디자인스튜디오',
      registeredAt: new Date('2024-01-10'),
    },
    inquiry: {
      id: '2',
      userId: '2',
      type: 'pricing',
      title: '가격 정책 문의',
      content: '엔터프라이즈 플랜 가격에 대해 문의드립니다.',
      status: 'in_progress',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-19'),
      responseCount: 2,
    },
  },
  {
    user: {
      id: '3',
      name: '박민수',
      email: 'park@example.com',
      companyName: '스타트업',
      registeredAt: new Date('2024-01-05'),
    },
    inquiry: {
      id: '3',
      userId: '3',
      type: 'partnership',
      title: '파트너십 제안',
      content: '비즈니스 파트너십에 대해 논의하고 싶습니다.',
      status: 'resolved',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-17'),
      responseCount: 1,
    },
  },
];

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
  const [data] = useState(mockData);

  const filteredData = data.filter(
    (item) =>
      item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.inquiry.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    // TODO: API 호출로 데이터 새로고침
    console.log('데이터 새로고침');
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
          <CardTitle>사용자 & 문의 목록</CardTitle>
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
              {filteredData.map((item) => (
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
              ))}
            </TableBody>
          </Table>

          {filteredData.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
