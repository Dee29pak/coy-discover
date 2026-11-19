import { NextResponse } from 'next/server';
import { load, publicProfile } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = load();
  const feed = db.profiles.filter((p) => !db.swipes[p.id]).map(publicProfile);
  return NextResponse.json(feed);
}