import { NextResponse } from 'next/server';
import { load, publicProfile } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = load();
  const out = db.matches
    .map((m) => ({ ...publicProfile(db.profiles.find((p) => p.id === m.profileId)), matchedAt: m.at }))
    .reverse();
  return NextResponse.json(out);
}