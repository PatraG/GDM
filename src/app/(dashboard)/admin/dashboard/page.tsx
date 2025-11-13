/**
 * Admin Dashboard Page
 * Main overview page for administrators
 * 
 * Features (T105):
 * - Submission statistics cards
 * - Data visualizations (charts)
 * - Submission list with filters
 * - Export functionality
 * - Void response capability
 * 
 * @module app/(dashboard)/admin/dashboard/page
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import SubmissionStats, { type SubmissionStatsData } from '@/components/admin/SubmissionStats';
import SubmissionCharts, { type SurveyTypeData, type TimeSeriesData } from '@/components/admin/SubmissionCharts';
import SubmissionTable from '@/components/admin/SubmissionTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { getDashboardStats, listResponses, voidResponse } from '@/lib/services/responseService';
import { listEnumerators } from '@/lib/services/userService';
import { listActiveSurveys } from '@/lib/services/surveyService';
import { exportResponses } from '@/lib/services/exportService';
import { ResponseWithDetails } from '@/lib/types/response';
import { Response } from '@/lib/types/response';
import { Survey } from '@/lib/types/survey';
import type { User } from '@/lib/types/auth';

/**
 * Admin Dashboard Page Component
 */
export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  // Data states
  const [stats, setStats] = useState<SubmissionStatsData | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [enumerators, setEnumerators] = useState<User[]>([]);
  
  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingStats(true);
        setLoadingData(true);

        // Fetch all data in parallel
        const [statsData, responsesData, surveysData, enumeratorsData] = await Promise.all([
          getDashboardStats(),
          listResponses(undefined, 1000, 0), // Get up to 1000 responses
          listActiveSurveys(100, 0),
          listEnumerators(undefined, 100, 0),
        ]);

        // Count active enumerators (simplified - those with any submissions)
        const enumeratorIdsWithSubmissions = new Set(
          responsesData.responses
            .map(r => {
              // We don't have direct enumeratorId, so we'll count all enumerators for now
              return enumeratorsData.documents.length;
            })
        );

        setStats({
          ...statsData,
          activeEnumerators: enumeratorsData.documents.length, // Simplified
        });

        setResponses(responsesData.responses);
        setSurveys(surveysData.surveys);
        setEnumerators(enumeratorsData.documents);

        setLoadingStats(false);
        setLoadingData(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        setLoadingStats(false);
        setLoadingData(false);
      }
    }

    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user]);

  // Build ResponseWithDetails from responses
  const responsesWithDetails: ResponseWithDetails[] = useMemo(() => {
    return responses.map((response) => {
      // Find survey
      const survey = surveys.find(s => s.$id === response.surveyId);

      // Parse location
      let parsedLocation = null;
      if (response.location) {
        try {
          parsedLocation = {
            ...JSON.parse(response.location),
            raw: response.location,
          };
        } catch {
          // Invalid JSON, ignore
        }
      }

      return {
        ...response,
        respondentPseudonym: `R-${response.respondentId.slice(0, 5)}`, // Simplified for now
        enumeratorEmail: 'Unknown', // Would need to query sessions and users
        surveyTitle: survey?.title || 'Unknown Survey',
        answerCount: 0, // Would need to fetch from answers collection
        parsedLocation,
      };
    });
  }, [responses, surveys]);

  // Chart data: Survey type distribution
  const surveyTypeData: SurveyTypeData[] = useMemo(() => {
    const counts = new Map<string, number>();
    
    responses.forEach((response) => {
      const survey = surveys.find(s => s.$id === response.surveyId);
      const title = survey?.title || 'Unknown';
      counts.set(title, (counts.get(title) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([surveyTitle, count]) => ({
      surveyTitle,
      count,
    }));
  }, [responses, surveys]);

  // Chart data: Time series (last 30 days)
  const timeSeriesData: TimeSeriesData[] = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Initialize map with all dates
    const dateMap = new Map<string, number>();
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, 0);
    }

    // Count responses by date
    responses.forEach((response) => {
      if (response.submittedAt) {
        const dateStr = response.submittedAt.split('T')[0];
        if (dateMap.has(dateStr)) {
          dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
        }
      }
    });

    return Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }, [responses]);

  // Handle void response
  const handleVoid = async (responseId: string, reason: string) => {
    if (!user) return;

    await voidResponse(responseId, {
      voidedBy: user.$id,
      voidReason: reason,
    });

    // Refresh data
    const responsesData = await listResponses(undefined, 1000, 0);
    setResponses(responsesData.responses);

    // Refresh stats
    const statsData = await getDashboardStats();
    const enumeratorsData = await listEnumerators(undefined, 100, 0);
    setStats({
      ...statsData,
      activeEnumerators: enumeratorsData.documents.length,
    });
  };

  // Handle export
  const handleExport = (format: 'csv' | 'json') => {
    exportResponses(responsesWithDetails, format);
  };

  if (authLoading || loadingStats || loadingData) {
    return (
      <div className="container mx-auto py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Dashboard</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Survey submission overview and analytics
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && <SubmissionStats stats={stats} loading={loadingStats} />}

      {/* Charts */}
      <SubmissionCharts
        surveyTypeData={surveyTypeData}
        timeSeriesData={timeSeriesData}
        loading={loadingData}
      />

      {/* Submission Table */}
      <SubmissionTable
        responses={responsesWithDetails}
        enumerators={enumerators.map(e => ({ id: e.$id, email: e.email }))}
        surveys={surveys.map(s => ({ id: s.$id, title: s.title }))}
        onVoid={handleVoid}
        onExport={handleExport}
        loading={loadingData}
      />
    </div>
  );
}
