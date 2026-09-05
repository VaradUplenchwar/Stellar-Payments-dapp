# Personal Second Brain — Infinite Canvas

An Obsidian-inspired infinite canvas knowledge workspace built with **React 19, TypeScript, Vite, Zustand, and Tailwind CSS**. Local-first: everything auto-saves to `localStorage`.

## Features

### Canvas Engine
- Infinite pan (middle-click / Space+drag / pan tool) and cursor-anchored wheel zoom
- Dot-grid background (HTML5 Canvas) rendered at any zoom level
- Minimap navigation + zoom widget (fit / reset)
- Snap-to-grid alignment (toggle in Settings)

### Elements
- **Note card** with live Markdown preview (double-click to edit)
- **Sticky note**, **Code block** (multi-language), **Image card** (upload / URL / paste)
- **Geometric shapes** (rectangle, circle, diamond, arrow)
- **LaTeX math node** (KaTeX rendering)
- **Mind map node** with ballistic branch expansion
- **Checklist / task list** with interactive checkboxes + progress bar

### Connections
- Drag port-to-port to create connections (Bezier / straight / step)
- Double-click a line to edit its label
- Cycle line style, adjust line style (solid/dashed/dotted) and color via the selected-line toolbar

### Editing & Organization
- Drag, resize, multi-select (Shift+click) and marquee box selection
- Right-click context menu (duplicate, bring to front/back, delete, add-at-position)
- Node color picker on every element header
- Freehand pen + eraser drawing layers

### Productivity
- Command palette (`Ctrl+Shift+P`)
- Global search (`Ctrl+F`) that jumps to matching cards
- Full keyboard shortcuts (`?` to view)
- Undo/redo (with visual stack indicator) · Duplicate · Delete
- Clipboard image paste (`Ctrl+V`) → instantly creates an image card
- Dark / Light / AMOLED themes
- Auto-save to `localStorage` + restore on reload

### Export
- Canvas JSON (backup/restore)
- High-resolution PNG
- SVG vector export
- Markdown document export

## Getting Started

```bash
npm install
npm run dev       # http://localhost:5173
```

## Run as a Local App (installed-PWA mode)

The app ships with a self-contained local server + PWA so it runs like a desktop app:

- **One click:** double-click `start-app.bat` — it builds the app (first run only), starts `http://localhost:3000`, and opens your browser automatically.
- **Or from the terminal:**
  ```bash
  npm run build
  npm start        # serves dist/ at http://localhost:3000
  ```
- **Install like an app:** open `http://localhost:3000`, click the install icon in the browser address bar (Edge/Chrome), and it becomes a standalone window with its own desktop icon. A service worker caches everything for **offline use**.

Other scripts:

```bash
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build
npm run lint      # oxlint
```

## Tech Stack

React 19 · TypeScript · Vite 8 · Zustand 5 · Tailwind CSS 4 · KaTeX · html-to-image · Lucide icons · PWA (manifest + service worker) · local static server

## Project Structure

```
src/
├── components/
│   ├── canvas/          # viewport, grid, drawing, marquee
│   ├── connections/     # SVG connection layer
│   ├── elements/        # note, sticky, code, image, shape, math, mindmap, checklist
│   └── ui/              # toolbar, palette, modals, minimap, widgets
├── hooks/               # useAutoSave
├── store/               # Zustand canvas store (elements, connections, history)
├── types/               # shared TypeScript types
└── utils/               # PNG / SVG / Markdown export helpers
```