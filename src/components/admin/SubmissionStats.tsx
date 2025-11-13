/**
 * SubmissionStats Component
 * Displays submission overview statistics for admin dashboard
 * 
 * Features (T106, T114):
 * - Total responses count
 * - Responses submitted today
 * - Active enumerators count
 * - Status breakdown (submitted/draft/voided)
 * 
 * @module components/admin/SubmissionStats
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Users,
  TrendingUp,
} from 'lucide-react';

export interface SubmissionStatsData {
  totalResponses: number;
  responsesSubmitted: number;
  responsesVoided: number;
  responsesDraft: number;
  responsesToday: number;
  activeEnumerators: number;
}

interface SubmissionStatsProps {
  stats: SubmissionStatsData;
  loading?: boolean;
}

/**
 * Statistics card component
 */
const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}> = ({ title, value, icon, description, trend }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * SubmissionStats Component
 * Displays key metrics about survey submissions
 */
export default function SubmissionStats({ stats, loading = false }: SubmissionStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Responses */}
      <StatCard
        title="Total Responses"
        value={stats.totalResponses}
        icon={<FileText className="h-4 w-4" />}
        description="All survey submissions"
      />

      {/* Submitted Today */}
      <StatCard
        title="Submitted Today"
        value={stats.responsesToday}
        icon={<TrendingUp className="h-4 w-4" />}
        description="New submissions today"
        trend="up"
      />

      {/* Active Enumerators */}
      <StatCard
        title="Active Enumerators"
        value={stats.activeEnumerators}
        icon={<Users className="h-4 w-4" />}
        description="Enumerators with active sessions"
      />

      {/* Submitted Responses */}
      <StatCard
        title="Submitted"
        value={stats.responsesSubmitted}
        icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
        description={`${((stats.responsesSubmitted / stats.totalResponses) * 100 || 0).toFixed(1)}% of total`}
      />

      {/* Draft Responses */}
      <StatCard
        title="Drafts"
        value={stats.responsesDraft}
        icon={<Clock className="h-4 w-4 text-yellow-500" />}
        description="Incomplete submissions"
      />

      {/* Voided Responses */}
      <StatCard
        title="Voided"
        value={stats.responsesVoided}
        icon={<XCircle className="h-4 w-4 text-red-500" />}
        description={`${((stats.responsesVoided / stats.totalResponses) * 100 || 0).toFixed(1)}% of total`}
      />
    </div>
  );
}
