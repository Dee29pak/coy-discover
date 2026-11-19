'use client';
import { useEffect, useRef, useState } from 'react';

const post = (url, body) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());

function Card({ p, style, children, ...handlers }) {
  return (
    <div
      className="absolute inset-0 cursor-grab touch-pan-y select-none overflow-hidden rounded-2xl bg-gray-200 shadow-xl"
      style={style}
      {...handlers}
    >
      <img src={p.photo} alt={p.name} draggable={false} className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-16 text-white">
        <h2 className="text-2xl font-bold">{p.name}, {p.age}</h2>
        <p className="text-sm opacity-80">{p.place}</p>
        <p className="my-1.5">{p.bio}</p>
        <div className="flex flex-wrap gap-1.5">
          {p.interests.map((i) => (
            <span key={i} className="rounded-full bg-white/20 px-3 py-0.5 text-xs">{i}</span>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}

function Discover() {
  const [cards, setCards] = useState(null);
  const [view, setView] = useState('swipe');
  const [matches, setMatches] = useState([]);
  const [match, setMatch] = useState(null);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exit, setExit] = useState(0);
  const startX = useRef(0);
  const busy = useRef(false);

  useEffect(() => { fetch('/api/feed').then((r) => r.json()).then(setCards); }, []);
  useEffect(() => {
    if (view === 'matches') fetch('/api/matches').then((r) => r.json()).then(setMatches);
  }, [view]);

  async function commit(action) {
    const p = cards?.[0];
    if (!p || busy.current) return;
    busy.current = true;
    setExit(action === 'like' ? 1 : -1);
    const req = post('/api/swipe', { profileId: p.id, action }).catch(() => ({}));
    await new Promise((r) => setTimeout(r, 280));
    setCards((c) => c.slice(1));
    setExit(0);
    setDx(0);
    const res = await req;
    if (res.match) setMatch(res.profile);
    busy.current = false;
  }

  const down = (e) => { e.currentTarget.setPointerCapture(e.pointerId); startX.current = e.clientX; setDragging(true); };
  const move = (e) => dragging && setDx(e.clientX - startX.current);
  const up = () => {
    setDragging(false);
    Math.abs(dx) > 110 ? commit(dx > 0 ? 'like' : 'pass') : setDx(0);
  };
  const resetDemo = async () => {
    await post('/api/reset');
    setCards(await fetch('/api/feed').then((r) => r.json()));
  };

  const x = exit ? exit * 700 : dx;
  const top = cards?.[0];
  const seg = (on) =>
    `rounded-full border px-5 py-1.5 text-sm ${on ? 'border-pink-600 bg-pink-600 text-white' : 'border-gray-300 bg-white'}`;

  return (
    <>
      <div className="mb-3 flex justify-center gap-2">
        <button className={seg(view === 'swipe')} onClick={() => setView('swipe')}>Swipe</button>
        <button className={seg(view === 'matches')} onClick={() => setView('matches')}>Matches</button>
      </div>

      {view === 'swipe' && (
        <div className="relative mb-2 min-h-0 flex-1">
          {cards === null && <p className="m-auto text-center text-gray-500">Loading…</p>}
          {cards && !top && (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
              <h2 className="text-xl font-semibold">You&apos;re all caught up</h2>
              <p>No more profiles for now. Check back later.</p>
              <button className="mt-3 text-pink-600 underline" onClick={resetDemo}>Reset demo data</button>
            </div>
          )}
          {cards?.[1] && <Card p={cards[1]} style={{ transform: 'scale(.95)', top: 8 }} />}
          {top && (
            <Card
              key={top.id}
              p={top}
              style={{
                transform: `translateX(${x}px) rotate(${x / 20}deg)`,
                transition: dragging ? 'none' : 'transform .28s ease',
              }}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
            >
              <span
                className="absolute left-5 top-6 -rotate-12 rounded-lg border-4 border-green-500 bg-white/70 px-3 py-1 text-3xl font-extrabold text-green-500"
                style={{ opacity: Math.min(Math.max(x, 0) / 100, 1) }}
              >LIKE</span>
              <span
                className="absolute right-5 top-6 rotate-12 rounded-lg border-4 border-red-500 bg-white/70 px-3 py-1 text-3xl font-extrabold text-red-500"
                style={{ opacity: Math.min(Math.max(-x, 0) / 100, 1) }}
              >PASS</span>
            </Card>
          )}
        </div>
      )}

      {view === 'swipe' && top && (
        <div className="flex justify-center gap-9 pb-2">
          <button onClick={() => commit('pass')} aria-label="Pass"
            className="h-16 w-16 rounded-full bg-white text-2xl text-red-500 shadow-lg active:scale-95">✕</button>
          <button onClick={() => commit('like')} aria-label="Like"
            className="h-16 w-16 rounded-full bg-white text-2xl text-green-500 shadow-lg active:scale-95">♥</button>
        </div>
      )}

      {view === 'matches' && (
        <div className="overflow-auto">
          {matches.length === 0 && <p className="mt-10 text-center text-gray-500">No matches yet. Keep swiping.</p>}
          {matches.map((m) => (
            <div key={m.id} className="flex items-center gap-3 border-b border-gray-100 py-2.5">
              <img src={m.photo} alt="" className="h-14 w-14 rounded-full object-cover" />
              <div>
                <b>{m.name}, {m.age}</b>
                <p className="text-sm text-gray-500">{m.place}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {match && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-pink-500/95 to-purple-600/95 text-white">
          <h1 className="text-4xl font-extrabold">It&apos;s a match!</h1>
          <img src={match.photo} alt={match.name} className="h-44 w-44 rounded-full border-4 border-white object-cover" />
          <p>You and {match.name} liked each other.</p>
          <button onClick={() => setMatch(null)} className="rounded-full bg-white px-7 py-3 font-medium text-pink-600">
            Keep swiping
          </button>
          <button onClick={() => { setMatch(null); setView('matches'); }} className="underline">
            View matches
          </button>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState('discover');
  const tabCls = (on) => `flex-1 py-3.5 text-[15px] ${on ? 'font-semibold text-pink-600' : 'text-gray-400'}`;

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col bg-white">
      <section className="flex flex-1 flex-col overflow-hidden p-3">
        {tab === 'discover' ? <Discover /> : null /* Home stays blank */}
      </section>
      <nav className="flex border-t border-gray-100">
        <button className={tabCls(tab === 'home')} onClick={() => setTab('home')}>Home</button>
        <button className={tabCls(tab === 'discover')} onClick={() => setTab('discover')}>Discover</button>
      </nav>
    </main>
  );
}