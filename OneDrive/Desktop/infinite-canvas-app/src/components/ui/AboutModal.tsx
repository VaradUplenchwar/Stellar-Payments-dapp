import React, { useState, useEffect } from 'react';
import { X, Compass, Sparkles, Keyboard, Info, Search, MousePointerClick, Plus, Link2, PenTool, Navigation, Save } from 'lucide-react';

interface ShortcutItem {
  keys: string[];
  desc: string;
  category: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['V'], desc: 'Select tool', category: 'Tools' },
  { keys: ['H'], desc: 'Pan tool', category: 'Tools' },
  { keys: ['P'], desc: 'Freehand pen', category: 'Tools' },
  { keys: ['E'], desc: 'Eraser', category: 'Tools' },
  { keys: ['Space + Drag'], desc: 'Pan canvas', category: 'Navigation' },
  { keys: ['Middle Click'], desc: 'Pan canvas', category: 'Navigation' },
  { keys: ['Mouse Wheel'], desc: 'Zoom in / out', category: 'Navigation' },
  { keys: ['Ctrl + 0'], desc: 'Fit all content', category: 'Navigation' },
  { keys: ['N'], desc: 'Add Markdown note', category: 'Create' },
  { keys: ['Double Click'], desc: 'Create note / edit text', category: 'Create' },
  { keys: ['C'], desc: 'Add checklist / task list', category: 'Create' },
  { keys: ['Ctrl + V'], desc: 'Paste image from clipboard', category: 'Create' },
  { keys: ['Ctrl + Z'], desc: 'Undo', category: 'Edit' },
  { keys: ['Ctrl + Y'], desc: 'Redo', category: 'Edit' },
  { keys: ['Ctrl + D'], desc: 'Duplicate selection', category: 'Edit' },
  { keys: ['Del / Backspace'], desc: 'Delete selection', category: 'Edit' },
  { keys: ['Shift + Click'], desc: 'Multi-select toggle', category: 'Edit' },
  { keys: ['Ctrl + Shift + P'], desc: 'Command palette', category: 'Modals' },
  { keys: ['Ctrl + F'], desc: 'Search canvas', category: 'Modals' },
  { keys: ['?'], desc: 'This guide', category: 'Modals' },
  { keys: ['Esc'], desc: 'Close modal / menu', category: 'Modals' },
  { keys: ['Drag port'], desc: 'Create connection', category: 'Connections' },
  { keys: ['Double-click line'], desc: 'Edit connection label', category: 'Connections' },
  { keys: ['Click line'], desc: 'Change type / color', category: 'Connections' },
];

const CATEGORY_ORDER = ['Tools', 'Navigation', 'Create', 'Edit', 'Connections', 'Modals'];

type TabId = 'start' | 'features' | 'shortcuts' | 'about';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'start', label: 'Get Started', icon: <Compass size={14} /> },
  { id: 'features', label: 'Features', icon: <Sparkles size={14} /> },
  { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard size={14} /> },
  { id: 'about', label: 'About', icon: <Info size={14} /> },
];

interface Step {
  icon: React.ReactNode;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: <MousePointerClick size={16} />,
    title: 'Add your first cards',
    body: 'Drag tools from the left toolbar, press N for a note, or simply double-click empty canvas. Mind-map nodes grow with their + buttons.',
  },
  {
    icon: <Plus size={16} />,
    title: 'Edit & style',
    body: 'Click a card to select it. Drag corners to resize, use the palette dot in the card header to change its color, and double-click the title to rename it. Double-click card content to edit it.',
  },
  {
    icon: <Link2 size={16} />,
    title: 'Link your ideas',
    body: 'Hover a card to reveal 4 connection ports (small accent dots). Drag from a port on one card to a port on another to create a connection. Double-click the line to label it.',
  },
  {
    icon: <PenTool size={16} />,
    title: 'Draw & annotate',
    body: 'Switch to the pen tool (P) to sketch freehand, and the eraser (E) to remove strokes. Drawings live on the canvas just like cards.',
  },
  {
    icon: <Navigation size={16} />,
    title: 'Move around',
    body: 'Scroll to zoom, hold Space (or middle mouse) and drag to pan. Use the minimap bottom-right to jump anywhere, or press Ctrl+0 to fit everything on screen.',
  },
  {
    icon: <Save size={16} />,
    title: 'It saves itself',
    body: 'Everything is stored locally and autosaved every few seconds — no account needed. Use Settings to export JSON backups or export as PNG / SVG / Markdown.',
  },
];

const FEATURES: { icon: React.ReactNode; label: string }[] = [
  { icon: <MousePointerClick size={14} />, label: 'Markdown notes with rich text' },
  { icon: <Compass size={14} />, label: 'Infinite pan & zoom canvas' },
  { icon: <Link2 size={14} />, label: 'Labeled connections & mind maps' },
  { icon: <Sparkles size={14} />, label: 'Tool & element colors' },
  { icon: <PenTool size={14} />, label: 'Freehand pen & eraser' },
  { icon: <Navigation size={14} />, label: 'Minimap & fit-to-view' },
  { icon: <Save size={14} />, label: 'Autosave, undo & redo' },
  { icon: <Keyboard size={14} />, label: 'Command palette & search' },
];

export const AboutModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<TabId>('start');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTab('start');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredShortcuts = SHORTCUTS.filter(
    (s) =>
      s.desc.toLowerCase().includes(query.toLowerCase()) ||
      s.keys.join(' ').toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase())
  );
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: filteredShortcuts.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-[620px] max-w-[92vw] max-h-[82vh] modal-shell rounded-2xl overflow-hidden text-obsidian-text flex flex-col animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-obsidian-border">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-accent-soft text-accent">
              <Compass size={16} />
            </span>
            <div>
              <h3 className="font-bold text-base leading-tight">Second Brain</h3>
              <p className="text-[10px] text-obsidian-textMuted">Your infinite canvas workspace</p>
            </div>
          </div>
          <button onClick={onClose} data-tip="Close" data-tip-place="top" className="text-obsidian-textMuted hover:text-obsidian-text transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-3 pt-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === t.id
                  ? 'bg-accent-soft text-accent ring-1 ring-accent/30'
                  : 'text-obsidian-textMuted hover:bg-obsidian-toolbar hover:text-obsidian-text'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 pt-4 flex-1">
          {tab === 'start' && (
            <div className="flex flex-col gap-3">
              {STEPS.map((s, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-obsidian-toolbar/40 border border-obsidian-border/50">
                  <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-obsidian-input border border-obsidian-border text-accent">
                    {s.icon}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold">
                      <span className="text-obsidian-textMuted/70 mr-1.5 font-mono">0{i + 1}</span>
                      {s.title}
                    </span>
                    <p className="text-[11px] leading-relaxed text-obsidian-textMuted">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'features' && (
            <div className="grid grid-cols-2 gap-2">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-obsidian-toolbar/40 border border-obsidian-border/50">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-obsidian-input border border-obsidian-border text-accent shrink-0">
                    {f.icon}
                  </span>
                  <span className="text-[11px] font-medium leading-tight">{f.label}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'shortcuts' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-obsidian-input border border-obsidian-border/60 focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent/40 transition-all">
                <Search size={13} className="text-obsidian-textMuted" />
                <input
                  type="text"
                  placeholder="Search shortcuts..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs placeholder-obsidian-textMuted"
                  autoFocus={tab === 'shortcuts'}
                />
              </div>
              <div className="flex flex-col gap-4">
                {grouped.map((group) => (
                  <div key={group.category}>
                    <h4 className="text-[10px] uppercase tracking-wider font-mono text-obsidian-textMuted/70 mb-2 px-1">
                      {group.category}
                    </h4>
                    <div className="flex flex-col gap-1 text-xs">
                      {group.items.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg hover:bg-obsidian-toolbar/60 transition-colors"
                        >
                          <span className="text-obsidian-text">{s.desc}</span>
                          <span className="flex items-center gap-1 flex-shrink-0">
                            {s.keys.map((k, ki) => (
                              <React.Fragment key={ki}>
                                {ki > 0 && <span className="text-obsidian-textMuted/50 mx-0.5">/</span>}
                                <kbd className="px-1.5 py-0.5 bg-obsidian-input border border-obsidian-border rounded font-mono text-[10px] text-accent whitespace-nowrap">
                                  {k}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredShortcuts.length === 0 && (
                  <div className="py-6 text-center text-xs text-obsidian-textMuted">No shortcuts match “{query}”</div>
                )}
              </div>
            </div>
          )}

          {tab === 'about' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-obsidian-toolbar/40 border border-obsidian-border/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="relative flex w-2 h-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                  </span>
                  <span className="text-xs font-bold">Second Brain v1.0</span>
                  <span className="text-[10px] font-mono bg-obsidian-input border border-obsidian-border px-1.5 py-0.5 rounded text-obsidian-textMuted">
                    local-first
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-obsidian-textMuted">
                  An infinite canvas for notes, code, tasks, sketches and ideas — all connected visually.
                  Build notes, sticky reminders, code snippets, checklists, LaTeX equations, images, shapes
                  and mind maps, then link them together into a living map of your thinking.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-obsidian-toolbar/40 border border-obsidian-border/50">
                <span className="text-xs font-bold mb-1.5 block">Your data stays on this device</span>
                <p className="text-[11px] leading-relaxed text-obsidian-textMuted">
                  The entire app runs in your browser and saves to local storage automatically — no account,
                  no cloud, no tracking. Install it as a PWA from the browser menu for an app-like experience
                  that also works offline. Export JSON backups anytime from Settings.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-obsidian-toolbar/40 border border-obsidian-border/50">
                <span className="text-xs font-bold mb-1.5 block">Pro tips</span>
                <ul className="flex flex-col gap-1.5 text-[11px] text-obsidian-textMuted list-disc pl-4 leading-relaxed">
                  <li>Use <kbd className="px-1 py-0.5 bg-obsidian-input border border-obsidian-border rounded font-mono text-[9px] text-accent">Shift + Click</kbd> to multi-select, then drag them all together.</li>
                  <li>Paste any image from your clipboard with <kbd className="px-1 py-0.5 bg-obsidian-input border border-obsidian-border rounded font-mono text-[9px] text-accent">Ctrl + V</kbd>.</li>
                  <li>Right-click any card for quick actions like duplicate, layer order and delete.</li>
                  <li>Mind-map nodes grow branches with their <span className="text-accent font-semibold">+</span> buttons — great for brainstorming.</li>
                  <li>Search jumps straight to a card from anywhere with <kbd className="px-1 py-0.5 bg-obsidian-input border border-obsidian-border rounded font-mono text-[9px] text-accent">Ctrl + F</kbd>.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};