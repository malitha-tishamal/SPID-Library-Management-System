'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../notifications/NotificationBell';
import { Search, Library, CircleDot } from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { profile } = useAuth();
  const pathname = usePathname();

  if (!profile) return null;

  // Parse path to create user-friendly breadcrumbs
  const pathSegments = pathname.split('/').filter(Boolean);
  const pageTitle = pathSegments[pathSegments.length - 1] || 'Dashboard';
  const cleanTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1).replace('-', ' ');

  return (
    <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Official Government Department Branding */}
      <div className="flex items-center gap-3">
        {/* Sri Lanka State Emblem */}
        <img
          src="/images/logo/gov.png"
          alt="Sri Lanka Emblem"
          className="h-11 w-auto object-contain hidden sm:block"
        />
        
        {/* Divider line */}
        <div className="h-10 w-px bg-slate-200 hidden sm:block" />

        {/* Round SPID Department Logo */}
        <img
          src="/images/logo/logo.png"
          alt="SPID Logo"
          className="h-11 w-auto object-contain"
        />

        {/* Agency Multilingual Title Block */}
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-bold text-slate-800 leading-tight">
            දකුණු පළාත් වාරිමාර්ග දෙපාර්තමේන්තුව
          </span>
          <span className="text-[9px] font-semibold text-slate-500 leading-tight font-medium">
            தென் மாகாண நீர்ப்பாசன திணைக்களம்
          </span>
          <span className="text-[10px] font-extrabold text-indigo-900 tracking-wide uppercase leading-none mt-0.5">
            SOUTHERN PROVINCIAL IRRIGATION DEPARTMENT
          </span>
        </div>
      </div>

      {/* Center/Right controls */}
      <div className="flex items-center gap-6">
        {/* Dynamic Breadcrumb Badge */}
        <div className="hidden lg:flex items-center gap-1.5 bg-indigo-50/50 border border-indigo-100/60 px-3 py-1.5 rounded-full shadow-sm">
          <span className="text-[10px] uppercase font-extrabold text-indigo-500 tracking-wider capitalize">{profile.role}</span>
          <span className="text-indigo-200">/</span>
          <span className="text-xs font-bold text-slate-700">{cleanTitle}</span>
        </div>
        {/* Token displaying specifically for students */}
        {profile.role === 'student' && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Tokens:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: profile.max_tokens }).map((_, i) => (
                <CircleDot
                  key={i}
                  size={12}
                  className={cn(
                    "transition-all duration-300",
                    i < profile.token_balance ? "text-accent fill-accent animate-pulse" : "text-slate-200 fill-transparent"
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700 ml-1">
              ({profile.token_balance}/{profile.max_tokens})
            </span>
          </div>
        )}

        {/* Notifications and Profile */}
        <div className="flex items-center gap-4">
          <NotificationBell />

          <div className="h-8 w-px bg-slate-200" />

          {/* User Display */}
          <div className="flex items-center gap-3">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-sm">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden md:block text-left">
              <span className="block font-semibold text-xs text-slate-800 leading-none">
                {profile.full_name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {profile.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
