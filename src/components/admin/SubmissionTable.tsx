/**
 * SubmissionTable Component
 * Displays survey submissions with filtering and void functionality
 * 
 * Features (T107-T111):
 * - Submission overview table with all details
 * - Date range filtering
 * - Enumerator filter dropdown
 * - Survey type filter dropdown
 * - Void response action
 * - Export functionality
 * 
 * @module components/admin/SubmissionTable
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  XCircle,
  Filter,
  X,
} from 'lucide-react';
import { formatDate, formatGPSCoordinates } from '@/lib/utils/formatters';
import { ResponseWithDetails } from '@/lib/types/response';
import VoidResponseModal from './VoidResponseModal';
import { Pagination } from '@/components/shared/Pagination';

interface SubmissionTableProps {
  responses: ResponseWithDetails[];
  enumerators: Array<{ id: string; email: string }>;
  surveys: Array<{ id: string; title: string }>;
  onVoid: (responseId: string, reason: string) => Promise<void>;
  onExport: (format: 'csv' | 'json') => void;
  loading?: boolean;
}

/**
 * SubmissionTable Component
 * Main table for displaying and managing submissions
 */
export default function SubmissionTable({
  responses,
  enumerators,
  surveys,
  onVoid,
  onExport,
  loading = false,
}: SubmissionTableProps) {
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEnumerator, setSelectedEnumerator] = useState<string>('all');
  const [selectedSurvey, setSelectedSurvey] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Void modal state
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<ResponseWithDetails | null>(null);

  // Export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtered responses
  const filteredResponses = useMemo(() => {
    return responses.filter((response) => {
      // Date range filter
      if (dateFrom && response.submittedAt) {
        if (response.submittedAt < dateFrom) return false;
      }
      if (dateTo && response.submittedAt) {
        if (response.submittedAt > dateTo) return false;
      }

      // Enumerator filter
      if (selectedEnumerator !== 'all') {
        if (response.enumeratorEmail !== selectedEnumerator) return false;
      }

      // Survey filter
      if (selectedSurvey !== 'all') {
        if (response.surveyId !== selectedSurvey) return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (response.status !== selectedStatus) return false;
      }

      return true;
    });
  }, [responses, dateFrom, dateTo, selectedEnumerator, selectedSurvey, selectedStatus]);

  // Paginated responses
  const paginatedResponses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredResponses.slice(startIndex, endIndex);
  }, [filteredResponses, currentPage, pageSize]);

  // Total pages
  const totalPages = Math.ceil(filteredResponses.length / pageSize);

  // Clear all filters
  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedEnumerator('all');
    setSelectedSurvey('all');
    setSelectedStatus('all');
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle void button click
  const handleVoidClick = (response: ResponseWithDetails) => {
    setSelectedResponse(response);
    setVoidModalOpen(true);
  };

  // Handle void confirmation
  const handleVoidConfirm = async (responseId: string, reason: string) => {
    await onVoid(responseId, reason);
    setVoidModalOpen(false);
    setSelectedResponse(null);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, string> = {
      submitted: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      voided: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Survey Submissions</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('json')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Filters</h3>
              {(dateFrom || dateTo || selectedEnumerator !== 'all' || selectedSurvey !== 'all' || selectedStatus !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Date From */}
              <div className="space-y-2">
                <Label htmlFor="date-from" className="text-xs">
                  Date From
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label htmlFor="date-to" className="text-xs">
                  Date To
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)}
                />
              </div>

              {/* Enumerator Filter */}
              <div className="space-y-2">
                <Label htmlFor="enumerator-filter" className="text-xs">
                  Enumerator
                </Label>
                <Select value={selectedEnumerator} onValueChange={setSelectedEnumerator}>
                  <SelectTrigger id="enumerator-filter">
                    <SelectValue placeholder="All Enumerators" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Enumerators</SelectItem>
                    {enumerators.map((enum_) => (
                      <SelectItem key={enum_.id} value={enum_.email}>
                        {enum_.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Survey Filter */}
              <div className="space-y-2">
                <Label htmlFor="survey-filter" className="text-xs">
                  Survey
                </Label>
                <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
                  <SelectTrigger id="survey-filter">
                    <SelectValue placeholder="All Surveys" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Surveys</SelectItem>
                    {surveys.map((survey) => (
                      <SelectItem key={survey.id} value={survey.id}>
                        {survey.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-xs">
                  Status
                </Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="voided">Voided</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredResponses.length} of {responses.length} submissions
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Response ID</TableHead>
                  <TableHead>Respondent</TableHead>
                  <TableHead>Enumerator</TableHead>
                  <TableHead>Survey</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No submissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedResponses.map((response) => (
                    <TableRow key={response.$id}>
                      <TableCell className="font-mono text-xs">
                        {response.$id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        {response.respondentPseudonym}
                      </TableCell>
                      <TableCell>{response.enumeratorEmail}</TableCell>
                      <TableCell>
                        {response.surveyTitle}
                        <span className="text-xs text-muted-foreground ml-1">
                          v{response.surveyVersion}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={response.status} />
                      </TableCell>
                      <TableCell>
                        {response.submittedAt
                          ? formatDate(response.submittedAt)
                          : '-'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {response.parsedLocation
                          ? formatGPSCoordinates(response.parsedLocation)
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {response.status === 'submitted' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVoidClick(response)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Void
                          </Button>
                        )}
                        {response.status === 'voided' && (
                          <span className="text-xs text-muted-foreground">
                            Voided
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredResponses.length > 0 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalCount={filteredResponses.length}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[25, 50, 100, 200]}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Void Modal */}
      {selectedResponse && (
        <VoidResponseModal
          open={voidModalOpen}
          onOpenChange={setVoidModalOpen}
          responseId={selectedResponse.$id}
          respondentPseudonym={selectedResponse.respondentPseudonym}
          surveyTitle={selectedResponse.surveyTitle}
          onVoid={handleVoidConfirm}
        />
      )}
    </>
  );
}
