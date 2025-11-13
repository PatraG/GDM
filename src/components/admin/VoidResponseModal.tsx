/**
 * VoidResponseModal Component
 * Modal for voiding a survey response with reason
 * 
 * Features (T111):
 * - Confirmation dialog before voiding
 * - Required reason input field
 * - Cancel/Confirm actions
 * - Error handling
 * 
 * @module components/admin/VoidResponseModal
 */

'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface VoidResponseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responseId: string;
  respondentPseudonym: string;
  surveyTitle: string;
  onVoid: (responseId: string, reason: string) => Promise<void>;
}

/**
 * VoidResponseModal Component
 * Handles voiding of survey responses with reason tracking
 */
export default function VoidResponseModal({
  open,
  onOpenChange,
  responseId,
  respondentPseudonym,
  surveyTitle,
  onVoid,
}: VoidResponseModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVoid = async () => {
    // Validation
    if (!reason.trim()) {
      setError('Void reason is required');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Void reason must be at least 10 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onVoid(responseId, reason.trim());
      
      toast.success('Response voided successfully', {
        description: `Survey response ${responseId} has been voided.`,
      });
      
      // Reset and close
      setReason('');
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to void response';
      setError(message);
      toast.error('Failed to void response', {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Void Response</DialogTitle>
          <DialogDescription>
            This action will mark the response as voided and cannot be undone.
            Please provide a reason for voiding this submission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Response Details */}
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Respondent:</span>{' '}
              <span className="text-muted-foreground">{respondentPseudonym}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Survey:</span>{' '}
              <span className="text-muted-foreground">{surveyTitle}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Response ID:</span>{' '}
              <span className="text-muted-foreground font-mono text-xs">
                {responseId}
              </span>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="void-reason">
              Void Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="void-reason"
              placeholder="Enter reason for voiding this response (minimum 10 characters)..."
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              rows={4}
              disabled={loading}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {reason.length} characters (minimum 10 required)
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleVoid}
            disabled={loading || !reason.trim()}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Voiding...' : 'Void Response'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
