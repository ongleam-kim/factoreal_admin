'use client';

import { Sidebar } from '@/components/admin/sidebar';
import { Header } from '@/components/admin/header';
import { useState } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // TODO: 실제 인증 상태 관리는 나중에 구현
  const [user] = useState({
    name: '관리자',
    email: 'admin@factoreal.com'
  });

  const handleLogout = () => {
    // TODO: 로그아웃 로직 구현
    console.log('로그아웃');
  };

  return (
    <div className="h-screen flex flex-col">
      <Header user={user} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="hidden md:flex flex-col border-r bg-muted/40" />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}