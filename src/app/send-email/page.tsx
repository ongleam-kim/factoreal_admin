'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Eye, Users, FileText } from 'lucide-react';
import type { User, EmailTemplate } from '@/lib/types';

// Mock data for MVP
const mockUsers: User[] = [
  {
    id: '1',
    name: '김철수',
    email: 'kim@example.com',
    companyName: '테크컴퍼니',
    registeredAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: '이영희',
    email: 'lee@example.com',
    companyName: '디자인스튜디오',
    registeredAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    name: '박민수',
    email: 'park@example.com',
    companyName: '스타트업',
    registeredAt: new Date('2024-01-05'),
  },
];

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: '기술 문의 응답',
    subject: 'Factoreal 기술 문의에 대한 답변',
    content: '안녕하세요.\n\n기술 문의에 대해 답변드립니다.\n\n감사합니다.',
    category: 'technical',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    name: '가격 문의 응답',
    subject: 'Factoreal 가격 정책 안내',
    content: '안녕하세요.\n\n가격 정책에 대해 안내드립니다.\n\n감사합니다.',
    category: 'pricing',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
];

export default function SendEmailPage() {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleUserSelect = (user: User) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setCustomSubject(template.subject);
    setCustomContent(template.content);
  };

  const handleSend = () => {
    if (selectedUsers.length === 0) {
      alert('수신자를 선택해주세요.');
      return;
    }
    
    if (!customSubject.trim() || !customContent.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    // TODO: 실제 이메일 발송 API 호출
    const emailData = {
      recipientIds: selectedUsers.map(u => u.id),
      recipients: selectedUsers.map(u => u.email),
      subject: customSubject,
      content: customContent,
      templateId: selectedTemplate?.id,
    };
    
    console.log('이메일 발송:', emailData);
    alert(`${selectedUsers.length}명에게 이메일을 발송했습니다.`);
    
    // 폼 초기화
    setSelectedUsers([]);
    setSelectedTemplate(null);
    setCustomSubject('');
    setCustomContent('');
    setIsPreviewMode(false);
  };

  const subject = customSubject || selectedTemplate?.subject || '';
  const content = customContent || selectedTemplate?.content || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">이메일 발송</h1>
        <p className="text-muted-foreground">
          사용자에게 이메일을 발송합니다.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 수신자 선택 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              수신자 선택
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.find(u => u.id === user.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground">{user.companyName}</div>
                    </div>
                    {selectedUsers.find(u => u.id === user.id) && (
                      <Badge variant="default">선택됨</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">
                  선택된 수신자 ({selectedUsers.length}명):
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <Badge key={user.id} variant="secondary">
                      {user.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 템플릿 선택 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              템플릿 선택
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {template.subject}
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {template.category}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">
                템플릿을 선택하면 제목과 내용이 자동으로 입력됩니다. 필요에 따라 수정할 수 있습니다.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 이메일 작성 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>이메일 작성</CardTitle>
            <Button
              variant="outline"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {isPreviewMode ? '편집 모드' : '미리보기'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isPreviewMode ? (
            <div className="space-y-4">
              <div>
                <Label>받는 사람:</Label>
                <div className="mt-1 text-sm">
                  {selectedUsers.map(u => u.email).join(', ') || '선택된 수신자 없음'}
                </div>
              </div>
              <div>
                <Label>제목:</Label>
                <div className="mt-1 p-2 border rounded bg-muted/50">
                  {subject || '제목 없음'}
                </div>
              </div>
              <div>
                <Label>내용:</Label>
                <div className="mt-1 p-3 border rounded bg-muted/50 whitespace-pre-wrap min-h-[200px]">
                  {content || '내용 없음'}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">제목</Label>
                <Input
                  id="subject"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="이메일 제목을 입력하세요"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="이메일 내용을 입력하세요"
                  className="mt-1 min-h-[200px]"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 발송 버튼 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedUsers.length}명의 수신자에게 이메일을 발송합니다.
            </div>
            <Button 
              onClick={handleSend}
              disabled={selectedUsers.length === 0 || !subject.trim() || !content.trim()}
              className="min-w-[120px]"
            >
              <Send className="mr-2 h-4 w-4" />
              발송하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}