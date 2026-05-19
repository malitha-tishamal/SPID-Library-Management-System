'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { RecommendationsService } from '../../services/recommendations.service';
import { Book } from '../../types';
import RecommendedBookCard from './RecommendedBookCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Sparkles } from 'lucide-react';

export default function RecommendationSection() {
  const { profile } = useAuth();
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    
    const fetchRecommendations = async () => {
      try {
        const data = await RecommendationsService.getRecommendations(profile.id, 4);
        setRecommendations(data);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [profile]);

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-2xl flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-2">
          <LoadingSpinner className="h-8 w-8 text-accent animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Compiling personalized recommendations...</span>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-55 text-accent p-1.5 rounded-lg flex items-center justify-center bg-indigo-50 border border-indigo-100">
          <Sparkles size={16} className="text-accent" />
        </div>
        <h3 className="font-sora font-bold text-lg text-slate-800">
          Recommended For You
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((book) => (
          <RecommendedBookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
