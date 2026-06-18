import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Copy, Check, Heart, Bell, User, Home, Filter, X, Plus, Edit2, Trash2, BarChart2, Calendar, Clock, Users, Globe, ChevronRight, Coins, Crown, Gift, Share2, Eye, TrendingUp, Settings, LogOut, ChevronDown, Play, Lock, Mail, Smartphone } from 'lucide-react';

/* ============================================================
   MOCK DATA
   ============================================================ */

const MODES = ['Squad', 'Duo', 'Solo', 'Clash Squad'];
const REGIONS = ['Indian', 'Bangladesh', 'MENA', 'Indonesia', 'Asia'];
const LANGUAGES = ['English', 'Malayalam', 'Hindi'];

const MODE_COLORS = {
  Squad: '#FF4655',
  Duo: '#39E2A0',
  Solo: '#FFC93C',
  'Clash Squad': '#9D7BFF',
};

function makeRoom(overrides = {}) {
  return {
    id: Math.random().toString(36).slice(2, 9),
    roomId: String(Math.floor(100000000 + Math.random() * 900000000)),
    password: String(Math.floor(1000 + Math.random() * 9000)),
    mode: MODES[Math.floor(Math.random() * MODES.length)],
    region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
    language: LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)],
    creator: 'Player' + Math.floor(Math.random() * 999),
    creatorVerified: Math.random() > 0.6,
    startsInSec: Math.floor(Math.random() * 600) + 20,
    totalSlots: 48,
    filledSlots: Math.floor(Math.random() * 48),
    views: Math.floor(Math.random() * 500),
    joins: Math.floor(Math.random() * 100),
    trending: Math.random() > 0.8,
    ...overrides,
  };
}

const CREATOR_NAMES = ['ProGamerXO', 'KeralaSniper', 'NightHawk_FF', 'DesertEagle99', 'MallluGamer', 'TigerClawYT', 'ShadowBlade'];

const initialRooms = [
  makeRoom({ creator: 'ProGamerXO', creatorVerified: true, mode: 'Squad', region: 'Indian', language: 'English', startsInSec: 45, filledSlots: 44, totalSlots: 48, trending: true }),
  makeRoom({ creator: 'KeralaSniper', creatorVerified: true, mode: 'Clash Squad', region: 'Indian', language: 'Malayalam', startsInSec: 180, filledSlots: 3, totalSlots: 8 }),
  makeRoom({ creator: 'NightHawk_FF', mode: 'Solo', region: 'Asia', language: 'English', startsInSec: 320, filledSlots: 22, totalSlots: 50 }),
  makeRoom({ creator: 'DesertEagle99', mode: 'Duo', region: 'MENA', language: 'English', startsInSec: 90, filledSlots: 38, totalSlots: 50, trending: true }),
  makeRoom({ creator: 'MallluGamer', creatorVerified: true, mode: 'Squad', region: 'Indian', language: 'Malayalam', startsInSec: 500, filledSlots: 10, totalSlots: 48 }),
  makeRoom({ creator: 'TigerClawYT', mode: 'Clash Squad', region: 'Bangladesh', language: 'Hindi', startsInSec: 25, filledSlots: 7, totalSlots: 8 }),
  makeRoom({ creator: 'ShadowBlade', mode: 'Solo', region: 'Indonesia', language: 'English', startsInSec: 600, filledSlots: 5, totalSlots: 50 }),
];

/* ============================================================
   UTIL
   ============================================================ */

function formatTime(totalSec) {
  if (totalSec <= 0) return 'LIVE';
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeUrgency(sec) {
  if (sec <= 60) return 'critical';
  if (sec <= 180) return 'warning';
  return 'normal';
}

/* ============================================================
   SHARED UI ATOMS
   ============================================================ */

function ModeBadge({ mode, size = 'sm' }) {
  const color = MODE_COLORS[mode];
  return (
    <span
      className={`mode-badge ${size}`}
      style={{ color, background: `${color}1A`, borderColor: `${color}40` }}
    >
      {mode}
    </span>
  );
}

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button className="copy-field" onClick={handleCopy}>
      <div className="copy-field-text">
        <span className="copy-field-label">{label}</span>
        <span className="copy-field-value">{value}</span>
      </div>
      <span className={`copy-field-icon ${copied ? 'copied' : ''}`}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </span>
    </button>
  );
}

function SlotBar({ filled, total }) {
  const pct = Math.min(100, (filled / total) * 100);
  const isFull = filled >= total;
  const isAlmost = pct >= 85;
  return (
    <div className="slot-wrap">
      <div className="slot-bar-bg">
        <div
          className="slot-bar-fg"
          style={{
            width: `${pct}%`,
            background: isFull ? '#FF4655' : isAlmost ? '#FFC93C' : '#39E2A0',
          }}
        />
      </div>
      <span className="slot-text">{filled}/{total} slots</span>
    </div>
  );
}

function CountdownStrip({ seconds }) {
  const urgency = timeUrgency(seconds);
  const maxRef = useRef(seconds < 600 ? 600 : seconds);
  const pct = Math.max(0, Math.min(100, (seconds / maxRef.current) * 100));
  return <div className={`countdown-strip ${urgency}`} style={{ width: `${pct}%` }} />;
}

/* ============================================================
   ROOM CARD
   ============================================================ */

function RoomCard({ room, onOpen, isFavorite, onToggleFavorite, tick }) {
  const seconds = Math.max(0, room.startsInSec - tick);
  const urgency = timeUrgency(seconds);
  const pulse = seconds <= 60 && seconds > 0;

  return (
    <div className={`room-card ${pulse ? 'pulse' : ''}`} onClick={() => onOpen(room)}>
      <CountdownStrip seconds={seconds} />
      <div className="room-card-top">
        <div className="room-card-badges">
          <ModeBadge mode={room.mode} />
          {room.trending && (
            <span className="trending-chip"><TrendingUp size={11} /> Trending</span>
          )}
        </div>
        <button
          className={`fav-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(room.creator); }}
          aria-label="Save creator"
        >
          <Heart size={16} fill={isFavorite ? '#FF4655' : 'none'} />
        </button>
      </div>

      <div className="room-card-codes">
        <CopyField label="ROOM ID" value={room.roomId} />
        <CopyField label="PASSWORD" value={room.password} />
      </div>

      <div className="room-card-meta">
        <span className="meta-chip"><Globe size={12} /> {room.region}</span>
        <span className="meta-chip">{room.language}</span>
      </div>

      <div className="room-card-bottom">
        <div className="creator-row">
          <div className="creator-avatar">{room.creator.slice(0, 2).toUpperCase()}</div>
          <span className="creator-name">{room.creator}</span>
          {room.creatorVerified && <span className="verified-dot" title="Verified creator" />}
        </div>
        <div className={`countdown-pill ${urgency}`}>
          <Clock size={12} />
          {formatTime(seconds)}
        </div>
      </div>

      <SlotBar filled={room.filledSlots} total={room.totalSlots} />
    </div>
  );
}

/* ============================================================
   FILTER SHEET
   ============================================================ */

function FilterSheet({ open, onClose, filters, setFilters }) {
  if (!open) return null;
  const toggle = (key, val) => {
    setFilters((f) => ({ ...f, [key]: f[key] === val ? null : val }));
  };
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h3>Filter rooms</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="filter-group">
          <span className="filter-label">Game mode</span>
          <div className="chip-row">
            {MODES.map((m) => (
              <button
                key={m}
                className={`filter-chip ${filters.mode === m ? 'active' : ''}`}
                style={filters.mode === m ? { borderColor: MODE_COLORS[m], color: MODE_COLORS[m], background: `${MODE_COLORS[m]}1A` } : {}}
                onClick={() => toggle('mode', m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Region</span>
          <div className="chip-row">
            {REGIONS.map((r) => (
              <button key={r} className={`filter-chip ${filters.region === r ? 'active' : ''}`} onClick={() => toggle('region', r)}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Language</span>
          <div className="chip-row">
            {LANGUAGES.map((l) => (
              <button key={l} className={`filter-chip ${filters.language === l ? 'active' : ''}`} onClick={() => toggle('language', l)}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="sheet-actions">
          <button className="btn-ghost" onClick={() => setFilters({ mode: null, region: null, language: null })}>Clear all</button>
          <button className="btn-primary" onClick={onClose}>Show results</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ROOM DETAIL MODAL
   ============================================================ */

function RoomDetailModal({ room, onClose, tick }) {
  if (!room) return null;
  const seconds = Math.max(0, room.startsInSec - tick);
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet detail-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="detail-header">
          <ModeBadge mode={room.mode} size="lg" />
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="detail-countdown">
          <span className="detail-countdown-label">Room starts in</span>
          <span className={`detail-countdown-value ${timeUrgency(seconds)}`}>{formatTime(seconds)}</span>
        </div>

        <div className="room-card-codes" style={{ marginTop: 16 }}>
          <CopyField label="ROOM ID" value={room.roomId} />
          <CopyField label="PASSWORD" value={room.password} />
        </div>

        <div className="detail-grid">
          <div className="detail-stat"><Globe size={14} /><span>{room.region}</span></div>
          <div className="detail-stat"><Smartphone size={14} /><span>{room.language}</span></div>
          <div className="detail-stat"><Users size={14} /><span>{room.filledSlots}/{room.totalSlots} joined</span></div>
        </div>

        <SlotBar filled={room.filledSlots} total={room.totalSlots} />

        <div className="detail-creator">
          <div className="creator-avatar lg">{room.creator.slice(0, 2).toUpperCase()}</div>
          <div>
            <div className="creator-name-row">
              <span className="creator-name">{room.creator}</span>
              {room.creatorVerified && <span className="verified-dot" />}
            </div>
            <span className="detail-creator-sub">Room creator</span>
          </div>
          <button className="btn-ghost small">View profile</button>
        </div>

        <button className="btn-primary full join-btn">
          <Play size={16} fill="#0B0E14" /> Join Room
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   HOME SCREEN
   ============================================================ */

function HomeScreen({ rooms, tick, favorites, onToggleFavorite, onOpenRoom, query, setQuery, filters, setFilters, onOpenFilters }) {
  const filtered = useMemo(() => {
    return rooms.filter((r) => {
      if (r.startsInSec - tick < -5) return false; // hide expired
      if (filters.mode && r.mode !== filters.mode) return false;
      if (filters.region && r.region !== filters.region) return false;
      if (filters.language && r.language !== filters.language) return false;
      if (query && !(r.creator.toLowerCase().includes(query.toLowerCase()) || r.roomId.includes(query))) return false;
      return true;
    });
  }, [rooms, tick, filters, query]);

  const trending = filtered.filter((r) => r.trending);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="screen">
      <div className="home-header">
        <div>
          <div className="brand-row">
            <div className="brand-mark">RD</div>
            <span className="brand-name">RoomDrop</span>
          </div>
          <p className="home-sub">Find a room. Join in seconds.</p>
        </div>
        <button className="icon-btn-circle"><Bell size={18} /></button>
      </div>

      <div className="search-row">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search creator or room ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="filter-btn" onClick={onOpenFilters}>
          <Filter size={16} />
          {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
        </button>
      </div>

      {activeFilterCount > 0 && (
        <div className="active-filters-row">
          {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
            <span key={k} className="active-filter-chip">
              {v}
              <X size={12} onClick={() => setFilters((f) => ({ ...f, [k]: null }))} />
            </span>
          ))}
        </div>
      )}

      {trending.length > 0 && !query && activeFilterCount === 0 && (
        <>
          <div className="section-label"><TrendingUp size={14} /> Trending now</div>
          <div className="trending-scroll">
            {trending.map((r) => (
              <div key={r.id} className="trending-card" onClick={() => onOpenRoom(r)}>
                <ModeBadge mode={r.mode} />
                <span className="trending-card-creator">{r.creator}</span>
                <span className="trending-card-slots">{r.filledSlots}/{r.totalSlots} joined</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-label">Active rooms <span className="count-pill">{filtered.length}</span></div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h4>No rooms match right now</h4>
          <p>Try clearing filters or check back in a minute — new rooms drop constantly.</p>
        </div>
      ) : (
        <div className="room-list">
          {filtered.map((r) => (
            <RoomCard
              key={r.id}
              room={r}
              tick={tick}
              onOpen={onOpenRoom}
              isFavorite={favorites.includes(r.creator)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SAVED SCREEN
   ============================================================ */

function SavedScreen({ rooms, tick, favorites, onToggleFavorite, onOpenRoom }) {
  const favRooms = rooms.filter((r) => favorites.includes(r.creator) && r.startsInSec - tick > -5);
  return (
    <div className="screen">
      <h2 className="page-title">Saved creators</h2>
      <p className="page-sub">You'll get a push notification the moment they publish a new room.</p>

      <div className="saved-creators-row">
        {favorites.length === 0 ? (
          <span className="empty-inline">No saved creators yet — tap the heart on any room.</span>
        ) : favorites.map((name) => (
          <div key={name} className="saved-creator-pill">
            <div className="creator-avatar">{name.slice(0, 2).toUpperCase()}</div>
            <span>{name}</span>
            <X size={12} onClick={() => onToggleFavorite(name)} />
          </div>
        ))}
      </div>

      <div className="section-label">Rooms from saved creators</div>
      {favRooms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <h4>Nothing live right now</h4>
          <p>Rooms from your saved creators will show up here as soon as they go live.</p>
        </div>
      ) : (
        <div className="room-list">
          {favRooms.map((r) => (
            <RoomCard key={r.id} room={r} tick={tick} onOpen={onOpenRoom} isFavorite onToggleFavorite={onToggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CREATOR STUDIO SCREEN
   ============================================================ */

function CreatorStudioScreen({ myRooms, onCreateNew, onEdit, onDelete, tick }) {
  const [tab, setTab] = useState('rooms');
  const totalViews = myRooms.reduce((a, r) => a + r.views, 0);
  const totalJoins = myRooms.reduce((a, r) => a + r.joins, 0);

  return (
    <div className="screen">
      <div className="studio-header">
        <h2 className="page-title">Creator Studio</h2>
        <button className="btn-primary small" onClick={onCreateNew}><Plus size={14} /> New room</button>
      </div>

      <div className="studio-tabs">
        <button className={`studio-tab ${tab === 'rooms' ? 'active' : ''}`} onClick={() => setTab('rooms')}>My rooms</button>
        <button className={`studio-tab ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>Analytics</button>
      </div>

      {tab === 'analytics' ? (
        <>
          <div className="dash-grid">
            <div className="dash-card"><Eye size={16} /><span className="dash-value">{totalViews}</span><span className="dash-label">Total views</span></div>
            <div className="dash-card"><Users size={16} /><span className="dash-value">{totalJoins}</span><span className="dash-label">Total joins</span></div>
            <div className="dash-card"><BarChart2 size={16} /><span className="dash-value">{myRooms.length}</span><span className="dash-label">Rooms posted</span></div>
            <div className="dash-card"><TrendingUp size={16} /><span className="dash-value">{totalViews ? Math.round((totalJoins / totalViews) * 100) : 0}%</span><span className="dash-label">Join rate</span></div>
          </div>
          <div className="section-label">Per-room performance</div>
          {myRooms.map((r) => (
            <div key={r.id} className="analytics-row">
              <ModeBadge mode={r.mode} />
              <div className="analytics-row-mid">
                <span className="analytics-room-id">#{r.roomId.slice(0, 6)}</span>
                <span className="analytics-sub">{formatTime(Math.max(0, r.startsInSec - tick))} to start</span>
              </div>
              <div className="analytics-stats">
                <span><Eye size={12} /> {r.views}</span>
                <span><Users size={12} /> {r.joins}</span>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="room-list">
          {myRooms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎮</div>
              <h4>No rooms posted yet</h4>
              <p>Create your first room post — it'll notify everyone who's saved you.</p>
            </div>
          ) : myRooms.map((r) => (
      
