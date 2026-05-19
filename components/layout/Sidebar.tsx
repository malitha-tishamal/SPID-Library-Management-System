'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Library,
  BookMarked,
  CalendarCheck,
  AlertTriangle,
  History,
  Heart,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Trash2,
  FolderOpen
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!profile) return null;

  const role = profile.role;

  // Role-based menu links
  const menuItems = {
    admin: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Manage Students', href: '/admin/users', icon: Users },
      { name: 'Manage Books', href: '/admin/books', icon: Library },
      { name: 'Active Issues', href: '/admin/transactions', icon: BookMarked },
      { name: 'Fines Management', href: '/admin/fines', icon: AlertTriangle },
      { name: 'Report Center', href: '/admin/reports', icon: FileSpreadsheet },
      { name: 'Trash System', href: '/admin/books/trash', icon: Trash2 },
      { name: 'Global Settings', href: '/admin/settings', icon: Settings },
    ],
    librarian: [
      { name: 'Dashboard', href: '/librarian', icon: LayoutDashboard },
      { name: 'Book Inventory', href: '/librarian/books', icon: Library },
      { name: 'Issue Book Wizard', href: '/librarian/issue', icon: BookMarked },
      { name: 'Return Book Flow', href: '/librarian/return', icon: CalendarCheck },
      { name: 'Overdue Summary', href: '/librarian/overdue', icon: AlertTriangle },
      { name: 'All Transactions', href: '/librarian/transactions', icon: History },
    ],
    student: [
      { name: 'My Dashboard', href: '/student', icon: LayoutDashboard },
      { name: 'Explore & Search', href: '/student/search', icon: Library },
      { name: 'My Borrowed Books', href: '/student/borrowed', icon: BookMarked },
      { name: 'Borrowing History', href: '/student/history', icon: History },
      { name: 'Reservations', href: '/student/reservations', icon: CalendarCheck },
      { name: 'Digital Library', href: '/student/digital-library', icon: FolderOpen },
      { name: 'My Favorites', href: '/student/favorites', icon: Heart },
    ],
  }[role] || [];

  return (
    <aside
      className={cn(
        "h-screen bg-primary text-slate-100 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Collapsible Trigger */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-accent hover:bg-accent-light text-white p-1 rounded-full border border-slate-700 shadow-md transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Brand Logo Header */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-800/80">
        <div className="flex items-center justify-center">
          <img
            src="/images/logo/logo.png"
            alt="SPID Logo"
            className="w-10 h-10 object-contain"
          />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col text-left">
            <span className="font-sora font-extrabold text-[13px] tracking-wide text-white leading-tight uppercase">
              SPID <span className="text-accent">Library</span>
            </span>
            <span className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase leading-none mt-0.5">
              Irrigation Dept.
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group font-medium text-[15px]",
                isActive
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  "transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                )}
              />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Card & Signout */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        {!isCollapsed && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm text-white truncate">{profile.full_name}</h4>
              <span className="text-xs text-slate-500 capitalize">{profile.role}</span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-all font-medium text-[15px]",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
