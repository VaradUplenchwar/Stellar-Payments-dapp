// js/toolbar.js
window.App = window.App || {};
window.App.toolbar = (function() {
  function init() {
    buildToolbar();
    buildZoomControls();
    buildContextMenu();
    
    App.on('viewport:changed', updateZoomDisplay);
    App.on('mode:changed', updateModeUI);
  }

  function buildToolbar() {
    const tb = document.getElementById('toolbar');
    if (!tb) return;
    
    tb.innerHTML = `
      <div class="toolbar-group">
        <button id="btn-select" class="toolbar-btn active" title="Select (Esc)">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
        </button>
        <button id="btn-add-card" class="toolbar-btn" title="Add Card (N)">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>
        <button id="btn-connect" class="toolbar-btn" title="Connect">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/></svg>
        </button>
        <button id="btn-add-group" class="toolbar-btn" title="Add Group (G)">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-dasharray="4 4"/></svg>
        </button>
        <button id="btn-search" class="toolbar-btn" title="Search Notes (Ctrl+F)">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </div>
      <div class="toolbar-separator"></div>
      <div class="toolbar-group">
        <button id="btn-undo" class="toolbar-btn" title="Undo (Ctrl+Z)">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </button>
        <button id="btn-redo" class="toolbar-btn" title="Redo (Ctrl+Y)">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
        </button>
      </div>
      <div class="toolbar-separator"></div>
      <div class="toolbar-group">
        <button id="btn-export" class="toolbar-btn" title="Export JSON">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button id="btn-export-png" class="toolbar-btn" title="Export PNG Image">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </button>
        <button id="btn-import" class="toolbar-btn" title="Import JSON">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </button>
        <button id="btn-help" class="toolbar-btn" title="Keyboard Shortcuts (?)">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </button>
      </div>
    `;

    document.getElementById('btn-select').addEventListener('click', () => setMode('select'));
    document.getElementById('btn-add-card').addEventListener('click', () => {
       if (App.cards && App.cards.createCardAtCenter) App.cards.createCardAtCenter();
    });
    document.getElementById('btn-connect').addEventListener('click', () => setMode('connect'));
    document.getElementById('btn-add-group').addEventListener('click', () => {
       if (App.groups && App.groups.createGroupAtCenter) App.groups.createGroupAtCenter();
    });
    document.getElementById('btn-search').addEventListener('click', toggleSearchModal);
    document.getElementById('btn-undo').addEventListener('click', () => {
      if (App.history) App.history.undo();
    });
    document.getElementById('btn-redo').addEventListener('click', () => {
      if (App.history) App.history.redo();
    });
    document.getElementById('btn-export').addEventListener('click', () => {
      if (App.storage) App.storage.exportJSON();
    });
    document.getElementById('btn-export-png').addEventListener('click', () => {
      if (App.storage) App.storage.exportPNG();
    });
    document.getElementById('btn-import').addEventListener('click', () => {
      if (App.storage) App.storage.importJSON();
    });
    document.getElementById('btn-help').addEventListener('click', toggleHelpModal);

    setupGlobalShortcuts();
  }

  function setupGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleSearchModal();
      } else if (e.key === '?') {
        e.preventDefault();
        toggleHelpModal();
      } else if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
        if (App.cards && App.cards.createCardAtCenter) App.cards.createCardAtCenter();
      } else if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey) {
        if (App.groups && App.groups.createGroupAtCenter) App.groups.createGroupAtCenter();
      }
    });
  }

  function toggleSearchModal() {
    let modal = document.getElementById('search-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'search-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-card">
          <div class="modal-header">
            <h3>Search Canvas Notes</h3>
            <button class="modal-close">&times;</button>
          </div>
          <input type="text" id="search-input" placeholder="Type to search cards..." autofocus />
          <div id="search-results" class="search-results"></div>
        </div>
      `;
      document.body.appendChild(modal);

      const closeBtn = modal.querySelector('.modal-close');
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });

      const input = modal.querySelector('#search-input');
      input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const resultsEl = modal.querySelector('#search-results');
        resultsEl.innerHTML = '';
        if (!query) return;

        App.state.cards.forEach(card => {
          if ((card.content || '').toLowerCase().includes(query)) {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            const snippet = (card.content || 'Empty note').substring(0, 60);
            item.innerHTML = `<strong>Note</strong> <span>${snippet}...</span>`;
            item.addEventListener('click', () => {
              // Center canvas on this card
              if (App.canvas && App.canvas.setViewport) {
                const targetX = (window.innerWidth / 2) - (card.x + card.width / 2);
                const targetY = (window.innerHeight / 2) - (card.y + card.height / 2);
                App.canvas.setViewport(targetX, targetY, 1);
              }
              if (App.cards) App.cards.selectCard(card.id);
              modal.classList.remove('active');
            });
            resultsEl.appendChild(item);
          }
        });
        if (resultsEl.children.length === 0) {
          resultsEl.innerHTML = '<div style="padding: 10px; color: #888;">No notes found</div>';
        }
      });
    }

    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
      const input = modal.querySelector('#search-input');
      input.value = '';
      input.focus();
      modal.querySelector('#search-results').innerHTML = '';
    }
  }

  function toggleHelpModal() {
    let modal = document.getElementById('help-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'help-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-card">
          <div class="modal-header">
            <h3>Keyboard Shortcuts & Commands</h3>
            <button class="modal-close">&times;</button>
          </div>
          <table class="shortcuts-table">
            <tr><td><kbd>Double Click</kbd></td><td>Create Note at position / Edit text</td></tr>
            <tr><td><kbd>Space</kbd> + <kbd>Drag</kbd></td><td>Pan canvas workspace</td></tr>
            <tr><td><kbd>Middle Click</kbd></td><td>Pan canvas workspace</td></tr>
            <tr><td><kbd>Mouse Wheel</kbd></td><td>Zoom in / Zoom out</td></tr>
            <tr><td><kbd>N</kbd></td><td>Create Note at canvas center</td></tr>
            <tr><td><kbd>G</kbd></td><td>Create Group at canvas center</td></tr>
            <tr><td><kbd>Ctrl</kbd> + <kbd>F</kbd></td><td>Search notes</td></tr>
            <tr><td><kbd>Ctrl</kbd> + <kbd>Z</kbd></td><td>Undo last action</td></tr>
            <tr><td><kbd>Ctrl</kbd> + <kbd>Y</kbd></td><td>Redo last action</td></tr>
            <tr><td><kbd>Del</kbd> / <kbd>Backspace</kbd></td><td>Delete selected card/connection</td></tr>
            <tr><td><kbd>Esc</kbd></td><td>Cancel selection / exit connect mode</td></tr>
            <tr><td><kbd>?</kbd></td><td>Open shortcuts guide</td></tr>
          </table>
        </div>
      `;
      document.body.appendChild(modal);

      const closeBtn = modal.querySelector('.modal-close');
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }

    modal.classList.toggle('active');
  }

  function buildZoomControls() {
    const zc = document.getElementById('zoom-controls');
    if (!zc) return;
    
    zc.innerHTML = `
      <button id="btn-zoom-out" class="zoom-btn" title="Zoom Out">-</button>
      <div id="zoom-level">100%</div>
      <button id="btn-zoom-in" class="zoom-btn" title="Zoom In">+</button>
      <button id="btn-fit" class="zoom-btn" title="Fit to Content">Fit</button>
    `;

    document.getElementById('btn-zoom-out').addEventListener('click', () => {
      if (App.canvas) App.canvas.zoomOut();
    });
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
      if (App.canvas) App.canvas.zoomIn();
    });
    document.getElementById('btn-fit').addEventListener('click', () => {
      if (App.canvas) App.canvas.fitToContent();
    });
  }

  function updateZoomDisplay() {
    const zoomLevel = document.getElementById('zoom-level');
    if (zoomLevel) {
      zoomLevel.textContent = Math.round(App.state.viewport.zoom * 100) + '%';
    }
  }

  function setMode(mode) {
    App.state.mode = mode;
    App.emit('mode:changed', mode);
  }

  function updateModeUI(mode) {
    document.getElementById('btn-select').classList.toggle('active', mode === 'select');
    document.getElementById('btn-connect').classList.toggle('active', mode === 'connect');
    
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.classList.toggle('mode-connect', mode === 'connect');
    }
  }

  function buildContextMenu() {
    const ctxMenu = document.getElementById('context-menu');
    if (!ctxMenu) return;
    
    // Close context menu on global clicks or escape
    document.addEventListener('click', (e) => {
      if (!ctxMenu.contains(e.target)) {
        ctxMenu.classList.add('hidden');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ctxMenu.classList.add('hidden');
      }
    });
  }

  function showContextMenu(x, y, type, targetId) {
    const ctxMenu = document.getElementById('context-menu');
    if (!ctxMenu) return;
    
    ctxMenu.innerHTML = ''; // clear previous
    
    if (type === 'card' && targetId) {
      ctxMenu.innerHTML = `
        <div class="menu-item" data-action="edit">Edit</div>
        <div class="menu-item has-submenu">Color &raquo;
           <div class="submenu">
             <div class="color-dot" data-color="default" style="background:#fff;border:1px solid #ccc"></div>
             <div class="color-dot" data-color="red" style="background:var(--card-red)"></div>
             <div class="color-dot" data-color="orange" style="background:var(--card-orange)"></div>
             <div class="color-dot" data-color="yellow" style="background:var(--card-yellow)"></div>
             <div class="color-dot" data-color="green" style="background:var(--card-green)"></div>
             <div class="color-dot" data-color="blue" style="background:var(--card-blue)"></div>
             <div class="color-dot" data-color="purple" style="background:var(--card-purple)"></div>
           </div>
        </div>
        <div class="menu-item" data-action="front">Bring to Front</div>
        <div class="menu-item" data-action="duplicate">Duplicate</div>
        <div class="menu-item" data-action="delete">Delete <span class="shortcut">Del</span></div>
      `;
      
      // Add event listeners
      ctxMenu.querySelectorAll('.menu-item').forEach(el => {
        el.addEventListener('click', (e) => {
          const action = el.getAttribute('data-action');
          if (action === 'edit' && App.cards) App.cards.editCard(targetId);
          if (action === 'front' && App.cards) App.cards.bringToFront(targetId);
          if (action === 'duplicate' && App.cards) App.cards.duplicateCard(targetId);
          if (action === 'delete' && App.cards) App.cards.deleteCard(targetId);
          if (action) ctxMenu.classList.add('hidden');
        });
      });
      ctxMenu.querySelectorAll('.color-dot').forEach(el => {
        el.addEventListener('click', (e) => {
           const color = el.getAttribute('data-color');
           if (App.cards) App.cards.setCardColor(targetId, color);
           ctxMenu.classList.add('hidden');
           e.stopPropagation();
        });
      });
    } else if (type === 'canvas') {
      ctxMenu.innerHTML = `
        <div class="menu-item" data-action="add-card">Add Card Here</div>
        <div class="menu-item" data-action="add-group">Add Group Here</div>
        <div class="menu-item" data-action="fit">Fit to Content</div>
      `;
      ctxMenu.querySelectorAll('.menu-item').forEach(el => {
        el.addEventListener('click', (e) => {
          const action = el.getAttribute('data-action');
          let canvasPos = {x: 0, y: 0};
          if (App.canvas && App.canvas.screenToCanvas) canvasPos = App.canvas.screenToCanvas(x, y);
          if (action === 'add-card' && App.cards) App.cards.createCardAt(canvasPos.x, canvasPos.y);
          if (action === 'add-group' && App.groups) App.groups.createGroupAt(canvasPos.x, canvasPos.y);
          if (action === 'fit' && App.canvas) App.canvas.fitToContent();
          ctxMenu.classList.add('hidden');
        });
      });
    }
    
    ctxMenu.classList.remove('hidden');
    
    // adjust position
    const rect = ctxMenu.getBoundingClientRect();
    let posX = x;
    let posY = y;
    if (posX + rect.width > window.innerWidth) posX = window.innerWidth - rect.width;
    if (posY + rect.height > window.innerHeight) posY = window.innerHeight - rect.height;
    
    ctxMenu.style.left = posX + 'px';
    ctxMenu.style.top = posY + 'px';
  }

  return { init, setMode, showContextMenu };
})();
