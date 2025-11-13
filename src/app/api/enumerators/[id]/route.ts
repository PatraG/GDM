/**
 * Enumerator Detail API Route
 * 
 * Server-side API for individual enumerator operations
 * Handles get, update, and status changes
 * 
 * @module app/api/enumerators/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getEnumerator,
  updateEnumeratorStatus,
  hasActiveSessions,
} from '@/lib/services/userService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const enumerator = await getEnumerator(id);
    return NextResponse.json(enumerator);
  } catch (error) {
    console.error('Get enumerator API error:', error);
    return NextResponse.json(
      { error: 'Failed to get enumerator' },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Check for active sessions before suspension
    if (body.status === 'suspended') {
      const hasActive = await hasActiveSessions(id);
      if (hasActive) {
        return NextResponse.json(
          {
            error: 'Cannot suspend enumerator with active sessions',
            hasActiveSessions: true,
          },
          { status: 400 }
        );
      }
    }
    
    const updated = await updateEnumeratorStatus(id, body.status);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update enumerator API error:', error);
    return NextResponse.json(
      { error: 'Failed to update enumerator' },
      { status: 400 }
    );
  }
}
