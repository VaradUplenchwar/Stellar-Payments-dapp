// js/storage.js
window.App = window.App || {};
window.App.storage = (function() {
  const STORAGE_KEY = 'infinite-canvas-data';
  let saveTimeout = null;

  function init() {
    App.on('state:changed', debouncedSave);
  }

  function debouncedSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      save();
    }, 500);
  }

  function save() {
    const data = exportData();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }
  
  function exportData() {
    return {
      cards: Array.from(App.state.cards.entries()),
      connections: Array.from(App.state.connections.entries()),
      groups: Array.from(App.state.groups.entries()),
      viewport: App.state.viewport,
      nextZIndex: App.state.nextZIndex
    };
  }

  function load() {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (!json) return;
      const data = JSON.parse(json);
      restoreData(data);
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
  }
  
  function restoreData(data) {
    if (!data) return;
    
    // Clear existing
    if (App.cards && App.cards.clearAll) App.cards.clearAll();
    if (App.connections && App.connections.clearAll) App.connections.clearAll();
    if (App.groups && App.groups.clearAll) App.groups.clearAll();
    
    App.state.cards = new Map(data.cards || []);
    App.state.connections = new Map(data.connections || []);
    App.state.groups = new Map(data.groups || []);
    App.state.viewport = data.viewport || { panX: 0, panY: 0, zoom: 1 };
    App.state.nextZIndex = data.nextZIndex || 1;
    App.state.selection = new Set();
    
    // Render everything
    if (App.cards && App.cards.renderCard) {
      App.state.cards.forEach(c => App.cards.renderCard(c));
    }
    if (App.connections && App.connections.renderConnection) {
      App.state.connections.forEach(c => App.connections.renderConnection(c));
    }
    if (App.groups && App.groups.renderGroup) {
      App.state.groups.forEach(g => App.groups.renderGroup(g));
    }
    if (App.canvas && App.canvas.setViewport) {
      App.canvas.setViewport(App.state.viewport.panX, App.state.viewport.panY, App.state.viewport.zoom);
    }
    
    App.emit('cards:changed');
    App.emit('connections:changed');
    App.emit('groups:changed');
  }

  function exportJSON() {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!confirm('This will clear your current canvas. Proceed?')) return;
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          restoreData(data);
          save();
        } catch (err) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function exportPNG() {
    if (App.state.cards.size === 0) {
      alert('Canvas is empty');
      return;
    }
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    App.state.cards.forEach(c => {
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + c.width);
      maxY = Math.max(maxY, c.y + c.height);
    });
    
    const padding = 60;
    minX -= padding; minY -= padding;
    maxX += padding; maxY += padding;
    const width = Math.max(400, maxX - minX);
    const height = Math.max(300, maxY - minY);
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#1e1e24';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    App.state.connections.forEach(conn => {
      const fromPos = App.cards.getCardPortPosition(conn.fromCardId, conn.fromSide);
      const toPos = App.cards.getCardPortPosition(conn.toCardId, conn.toSide);
      if (fromPos && toPos) {
        ctx.beginPath();
        ctx.moveTo(fromPos.x - minX, fromPos.y - minY);
        ctx.lineTo(toPos.x - minX, toPos.y - minY);
        ctx.stroke();
      }
    });
    
    App.state.cards.forEach(c => {
      const x = c.x - minX;
      const y = c.y - minY;
      
      ctx.fillStyle = '#26262d';
      ctx.strokeStyle = '#3a3a45';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, c.width, c.height, 8);
      else ctx.rect(x, y, c.width, c.height);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#9e9ea0';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Note', x + 16, y + 24);
      
      ctx.fillStyle = '#dcddde';
      ctx.font = '14px Inter, sans-serif';
      const lines = (c.content || '').split('\n');
      lines.slice(0, 6).forEach((line, idx) => {
        const cleanLine = line.replace(/^[#\-\*]+\s*/, '');
        ctx.fillText(cleanLine.substring(0, 30), x + 16, y + 50 + (idx * 20));
      });
    });
    
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'canvas-export.png';
    a.click();
  }

  function clear() {
    if (!confirm('Are you sure you want to clear the canvas?')) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  return { init, save, load, exportJSON, exportData, importJSON, exportPNG, clear };
})();
