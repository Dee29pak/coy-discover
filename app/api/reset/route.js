import { NextResponse } from 'next/server';
import { reset } from '@/lib/db';
export const dynamic = 'force-dynamic';

// Demo helper: wipes swipes/matches and reseeds.
export async function POST() {
  reset();
  return NextResponse.json({ ok: true });
}