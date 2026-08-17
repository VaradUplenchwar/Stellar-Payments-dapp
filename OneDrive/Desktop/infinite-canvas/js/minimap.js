// js/minimap.js
window.App = window.App || {};
window.App.minimap = (function() {
  let canvas, ctx;
  const WIDTH = 200;
  const HEIGHT = 140;
  let isDragging = false;
  
  function init() {
    canvas = document.getElementById('minimap');
    if (!canvas) return;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx = canvas.getContext('2d');
    
    App.on('cards:changed', render);
    App.on('viewport:changed', render);
    App.on('groups:changed', render);
    
    // Navigation events
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Initial render
    render();
  }
  
  function handleMouseDown(e) {
    if (e.button !== 0) return;
    isDragging = true;
    navigate(e);
  }
  
  function handleMouseMove(e) {
    if (!isDragging) return;
    navigate(e);
  }
  
  function handleMouseUp() {
    isDragging = false;
  }
  
  let currentMetrics = null;
  
  function navigate(e) {
    if (!currentMetrics) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // convert minimap (x,y) back to canvas (cx, cy)
    const { minX, minY, scale, panX, panY } = currentMetrics;
    const cx = (x - panX) / scale + minX;
    const cy = (y - panY) / scale + minY;
    
    // Center viewport on this point
    const vpW = window.innerWidth / App.state.viewport.zoom;
    const vpH = window.innerHeight / App.state.viewport.zoom;
    
    const targetPanX = - (cx - vpW / 2) * App.state.viewport.zoom;
    const targetPanY = - (cy - vpH / 2) * App.state.viewport.zoom;
    
    if (App.canvas && App.canvas.setViewport) {
      App.canvas.setViewport(targetPanX, targetPanY, App.state.viewport.zoom);
    }
  }

  function getCardColor(colorName) {
    const map = {
      'red': '#e03e3e',
      'orange': '#d9730d',
      'yellow': '#dfab01',
      'green': '#0f7b6c',
      'blue': '#2383e2',
      'purple': '#6940a5',
      'default': '#ffffff'
    };
    return map[colorName] || map['default'];
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let hasItems = false;
    
    App.state.cards.forEach(c => {
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + c.width);
      maxY = Math.max(maxY, c.y + c.height);
      hasItems = true;
    });
    
    App.state.groups.forEach(g => {
      minX = Math.min(minX, g.x);
      minY = Math.min(minY, g.y);
      maxX = Math.max(maxX, g.x + g.width);
      maxY = Math.max(maxY, g.y + g.height);
      hasItems = true;
    });
    
    if (!hasItems) {
      minX = -1000; minY = -1000; maxX = 1000; maxY = 1000;
    }
    
    const PADDING = 1000; // lots of padding so it's not edge to edge
    minX -= PADDING;
    minY -= PADDING;
    maxX += PADDING;
    maxY += PADDING;
    
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    
    const scale = Math.min(WIDTH / contentW, HEIGHT / contentH);
    const panX = (WIDTH - contentW * scale) / 2;
    const panY = (HEIGHT - contentH * scale) / 2;
    
    currentMetrics = { minX, minY, scale, panX, panY };
    
    // Draw groups
    App.state.groups.forEach(g => {
      ctx.strokeStyle = '#999';
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(
        panX + (g.x - minX) * scale,
        panY + (g.y - minY) * scale,
        g.width * scale,
        g.height * scale
      );
    });
    ctx.setLineDash([]);
    
    // Draw cards
    App.state.cards.forEach(c => {
      ctx.fillStyle = getCardColor(c.color);
      ctx.fillRect(
        panX + (c.x - minX) * scale,
        panY + (c.y - minY) * scale,
        c.width * scale,
        c.height * scale
      );
      ctx.strokeStyle = '#ccc';
      ctx.strokeRect(
        panX + (c.x - minX) * scale,
        panY + (c.y - minY) * scale,
        c.width * scale,
        c.height * scale
      );
    });
    
    // Draw viewport
    const vpX = -App.state.viewport.panX / App.state.viewport.zoom;
    const vpY = -App.state.viewport.panY / App.state.viewport.zoom;
    const vpW = window.innerWidth / App.state.viewport.zoom;
    const vpH = window.innerHeight / App.state.viewport.zoom;
    
    ctx.fillStyle = 'rgba(35, 131, 226, 0.2)';
    ctx.strokeStyle = '#2383e2';
    ctx.lineWidth = 1;
    ctx.fillRect(
      panX + (vpX - minX) * scale,
      panY + (vpY - minY) * scale,
      vpW * scale,
      vpH * scale
    );
    ctx.strokeRect(
      panX + (vpX - minX) * scale,
      panY + (vpY - minY) * scale,
      vpW * scale,
      vpH * scale
    );
  }
  
  return { init, render };
})();
