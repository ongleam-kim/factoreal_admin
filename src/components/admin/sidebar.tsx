'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Mail, BarChart3, Settings, FileText } from 'lucide-react';

const navigation = [
  {
    name: '대시보드',
    href: '/',
    icon: BarChart3,
  },
  {
    name: '사용자 관리',
    href: '/users-inquiries',
    icon: Users,
  },
  {
    name: '이메일 템플릿',
    href: '/email-templates',
    icon: FileText,
  },
  {
    name: '이메일 발송',
    href: '/send-email',
    icon: Mail,
  },
  {
    name: '설정',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn('w-64 pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="px-4 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Factoreal Admin</h2>
          </div>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start', isActive && 'bg-muted font-medium')}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
