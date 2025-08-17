'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Mail } from 'lucide-react';
import type { EmailTemplate } from '@/lib/types';

// Mock data for MVP
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
  {
    id: '3',
    name: '환영 이메일',
    subject: 'Factoreal에 오신 것을 환영합니다',
    content: '안녕하세요.\n\nFactoreal 서비스에 가입해주셔서 감사합니다.\n\n앞으로 좋은 서비스를 제공하겠습니다.',
    category: 'welcome',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-15'),
  },
];

interface TemplateFormData {
  name: string;
  subject: string;
  content: string;
  category: string;
}

const getCategoryBadge = (category: string) => {
  const categoryLabels: Record<string, string> = {
    general: '일반',
    technical: '기술',
    pricing: '가격',
    partnership: '파트너십',
    welcome: '환영',
    'follow-up': '후속',
  };
  
  return <Badge variant="outline">{categoryLabels[category] || category}</Badge>;
};

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState(mockTemplates);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    subject: '',
    content: '',
    category: 'general',
  });

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: '',
      content: '',
      category: 'general',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingTemplate) {
      // 수정
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, ...formData, updatedAt: new Date() }
          : t
      ));
    } else {
      // 생성
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTemplates([...templates, newTemplate]);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleUseTemplate = (template: EmailTemplate) => {
    // TODO: 이메일 발송 페이지로 이동
    console.log('템플릿 사용:', template.name);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">이메일 템플릿 관리</h1>
          <p className="text-muted-foreground">
            이메일 템플릿을 생성하고 관리합니다.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          새 템플릿
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>템플릿 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>템플릿명</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead>수정일</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">{template.subject}</div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(template.category)}</TableCell>
                  <TableCell>
                    {template.createdAt.toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    {template.updatedAt.toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? '템플릿 수정' : '새 템플릿 생성'}
            </DialogTitle>
            <DialogDescription>
              이메일 템플릿 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                템플릿명
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                제목
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                카테고리
              </Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="general">일반</option>
                <option value="technical">기술</option>
                <option value="pricing">가격</option>
                <option value="partnership">파트너십</option>
                <option value="welcome">환영</option>
                <option value="follow-up">후속</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right mt-2">
                내용
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="col-span-3 min-h-[120px]"
                placeholder="이메일 내용을 입력하세요..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSave}>
              {editingTemplate ? '수정' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}