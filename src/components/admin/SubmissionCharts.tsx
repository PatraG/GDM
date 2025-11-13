/**
 * SubmissionCharts Component
 * Displays data visualizations for survey submissions
 * 
 * Features (T116, T117):
 * - Bar chart: Responses by survey type
 * - Line chart: Responses over time (last 30 days)
 * 
 * @module components/admin/SubmissionCharts
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface SurveyTypeData {
  surveyTitle: string;
  count: number;
}

export interface TimeSeriesData {
  date: string; // YYYY-MM-DD format
  count: number;
}

interface SubmissionChartsProps {
  surveyTypeData: SurveyTypeData[];
  timeSeriesData: TimeSeriesData[];
  loading?: boolean;
}

/**
 * SubmissionCharts Component
 * Renders bar and line charts for dashboard analytics
 */
export default function SubmissionCharts({
  surveyTypeData,
  timeSeriesData,
  loading = false,
}: SubmissionChartsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Bar Chart: Responses by Survey Type */}
      <Card>
        <CardHeader>
          <CardTitle>Responses by Survey Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={surveyTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="surveyTitle" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))" 
                name="Responses"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Line Chart: Responses Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Responses Over Time (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  // Format: MM-DD
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric' 
                  });
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Submissions"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
