import { NextResponse } from 'next/server';
import { load, save, publicProfile } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { profileId, action } = await req.json().catch(() => ({}));
  if (!['like', 'pass'].includes(action))
    return NextResponse.json({ error: 'action must be like or pass' }, { status: 400 });

  const db = load();
  const profile = db.profiles.find((p) => p.id === profileId);
  if (!profile) return NextResponse.json({ error: 'profile not found' }, { status: 404 });
  if (db.swipes[profileId]) return NextResponse.json({ error: 'already swiped' }, { status: 409 });

  db.swipes[profileId] = action;
  // Match only when BOTH sides liked.
  const match = action === 'like' && profile.likedMe === true;
  if (match) db.matches.push({ profileId, at: new Date().toISOString() });
  save(db);

  return NextResponse.json(match ? { match: true, profile: publicProfile(profile) } : { match: false });
}