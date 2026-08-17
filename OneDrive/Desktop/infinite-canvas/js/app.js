// js/app.js
document.addEventListener('DOMContentLoaded', () => {
  // Setup minimal polyfills/utilities if missing
  window.App = window.App || {};
  window.App.events = window.App.events || {};
  window.App.on = window.App.on || function(event, fn) { (App.events[event] = App.events[event] || []).push(fn); };
  window.App.emit = window.App.emit || function(event, data) { (App.events[event] || []).forEach(fn => fn(data)); };
  window.App.generateId = window.App.generateId || function() { return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5); };

  // Global state object
  window.App.state = window.App.state || {
    cards: new Map(),
    connections: new Map(),
    groups: new Map(),
    selection: new Set(),
    viewport: { panX: 0, panY: 0, zoom: 1 },
    nextZIndex: 1
  };

  // Initialize modules in order
  if (App.canvas) App.canvas.init();
  if (App.history) App.history.init();
  if (App.cards) App.cards.init();
  if (App.connections) App.connections.init();
  if (App.groups) App.groups.init();
  if (App.toolbar) App.toolbar.init();
  if (App.minimap) App.minimap.init();
  if (App.storage) App.storage.init();
  
  // Load saved state or create initial demo cards
  if (App.storage) App.storage.load();
  
  if (App.state.cards.size === 0 && App.cards) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const c1 = App.cards.createCard(cx - 280, cy - 100, {
      content: '### Welcome to Infinite Canvas 🚀\n\n- Drag to move cards\n- Double-click to edit text\n- Connect nodes via handles\n- Use **Space + Drag** or **Middle-Click** to pan',
      color: 'blue',
      width: 280,
      height: 200
    });
    const c2 = App.cards.createCard(cx + 60, cy - 100, {
      content: '### Ideas & Notes 💡\n\nOrganize your thoughts visually in an obsidian-like canvas workspace.',
      color: 'purple',
      width: 260,
      height: 180
    });
    if (c1 && c2 && App.connections) {
      App.connections.createConnection(c1.id, 'right', c2.id, 'left');
    }
  }
  
  // Global keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (App.toolbar) App.toolbar.setMode('select');
      if (App.cards && App.cards.clearSelection) App.cards.clearSelection();
      const ctxMenu = document.getElementById('context-menu');
      if (ctxMenu) ctxMenu.classList.add('hidden');
    }
  });
  
  // Prevent default context menu on #app
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.addEventListener('contextmenu', e => {
      // allow default if it's on an input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      e.preventDefault();
      if (App.toolbar && App.toolbar.showContextMenu) {
         // Determine if clicked on canvas background vs card
         if (e.target.id === 'grid-canvas' || e.target.id === 'connections-layer' || e.target.id === 'canvas-viewport' || e.target.id === 'cards-layer') {
            App.toolbar.showContextMenu(e.clientX, e.clientY, 'canvas');
         }
      }
    });
  }
  
  // Window resize → redraw grid, minimap
  window.addEventListener('resize', () => {
    if (App.canvas && App.canvas.handleResize) App.canvas.handleResize();
    if (App.minimap && App.minimap.render) App.minimap.render();
  });
  
  console.log('Infinite Canvas initialized');
});
