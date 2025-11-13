/**
 * Enumerators API Route
 * 
 * Server-side API for enumerator management
 * Handles creation, listing, and status updates
 * 
 * @module app/api/enumerators
 */

import { NextRequest, NextResponse } from 'next/server';
import { createEnumerator, listEnumerators } from '@/lib/services/userService';
import type { UserCreate } from '@/lib/types/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'active' | 'suspended' | null;
    
    const enumerators = await listEnumerators(
      status || undefined,
      100,
      0
    );
    
    return NextResponse.json(enumerators);
  } catch (error) {
    console.error('List enumerators API error:', error);
    return NextResponse.json(
      { error: 'Failed to list enumerators' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as UserCreate;
    
    const enumerator = await createEnumerator(body);
    
    return NextResponse.json(enumerator, { status: 201 });
  } catch (error) {
    console.error('Create enumerator API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create enumerator' },
      { status: 400 }
    );
  }
}
