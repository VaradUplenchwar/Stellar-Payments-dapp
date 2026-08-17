(function() {
  window.App = window.App || {};
  
  // Basic mock for history if not exists
  window.App.history = window.App.history || {
    push: function() {}
  };
  
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 3.0;
  const ZOOM_SENSITIVITY = 0.001;
  
  let appEl, viewportEl, gridCanvas, ctx;
  let isPanning = false;
  let isSpaceHeld = false;
  let panStart = null;
  let lastPanX = 0;
  let lastPanY = 0;
  
  window.App.canvas = {
    init: function() {
      appEl = document.getElementById('app');
      viewportEl = document.getElementById('canvas-viewport');
      gridCanvas = document.getElementById('grid-canvas');
      
      if(gridCanvas) {
        ctx = gridCanvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
      }
      
      this.attachEvents();
      this.applyTransform();
    },
    
    resizeCanvas: function() {
      if(!gridCanvas) return;
      gridCanvas.width = window.innerWidth;
      gridCanvas.height = window.innerHeight;
      this.drawGrid();
    },
    
    attachEvents: function() {
      if(!appEl) return;
      
      appEl.addEventListener('mousedown', this.onMouseDown.bind(this));
      window.addEventListener('mousemove', this.onMouseMove.bind(this));
      window.addEventListener('mouseup', this.onMouseUp.bind(this));
      
      appEl.addEventListener('wheel', this.onWheel.bind(this), {passive: false});
      
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !isSpaceHeld && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.contentEditable !== 'true') {
          isSpaceHeld = true;
          appEl.classList.add('is-space-held');
        }
      });
      
      window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
          isSpaceHeld = false;
          appEl.classList.remove('is-space-held');
        }
      });
    },
    
    onMouseDown: function(e) {
      const isMiddleClick = e.button === 1;
      const isSpaceLeftClick = e.button === 0 && isSpaceHeld;
      
      if (isMiddleClick || isSpaceLeftClick) {
        isPanning = true;
        panStart = { x: e.clientX, y: e.clientY };
        lastPanX = App.state.viewport.panX;
        lastPanY = App.state.viewport.panY;
        appEl.classList.add('is-panning');
        e.preventDefault();
      }
    },
    
    onMouseMove: function(e) {
      if (!isPanning) return;
      
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      
      App.state.viewport.panX = lastPanX + dx;
      App.state.viewport.panY = lastPanY + dy;
      
      this.applyTransform();
      App.emit('viewport:changed');
    },
    
    onMouseUp: function(e) {
      if (isPanning) {
        isPanning = false;
        appEl.classList.remove('is-panning');
      }
    },
    
    onWheel: function(e) {
      e.preventDefault(); // always prevent default scroll/zoom
      
      const zoomDelta = -e.deltaY * ZOOM_SENSITIVITY;
      
      const oldZoom = App.state.viewport.zoom;
      const newZoom = Math.min(Math.max(oldZoom * (1 + zoomDelta), MIN_ZOOM), MAX_ZOOM);
      
      // Pan to keep cursor in same canvas position
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      const panX = App.state.viewport.panX;
      const panY = App.state.viewport.panY;
      
      App.state.viewport.panX = mouseX - (mouseX - panX) * (newZoom / oldZoom);
      App.state.viewport.panY = mouseY - (mouseY - panY) * (newZoom / oldZoom);
      App.state.viewport.zoom = newZoom;
      
      this.applyTransform();
      App.emit('viewport:changed');
    },
    
    applyTransform: function() {
      if(viewportEl) {
        viewportEl.style.transform = `translate(${App.state.viewport.panX}px, ${App.state.viewport.panY}px) scale(${App.state.viewport.zoom})`;
        viewportEl.style.transformOrigin = '0 0';
      }
      this.drawGrid();
    },
    
    drawGrid: function() {
      if(!ctx || !gridCanvas) return;
      
      ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
      
      const zoom = App.state.viewport.zoom;
      const panX = App.state.viewport.panX;
      const panY = App.state.viewport.panY;
      
      const spacing = 20 * zoom;
      const radius = 1.5 * Math.max(0.5, zoom * 0.8);
      
      ctx.fillStyle = '#3a3a3a';
      
      const startX = panX % spacing;
      const startY = panY % spacing;
      
      for (let x = startX; x < gridCanvas.width; x += spacing) {
        for (let y = startY; y < gridCanvas.height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    
    screenToCanvas: function(sx, sy) {
      return {
        x: (sx - App.state.viewport.panX) / App.state.viewport.zoom,
        y: (sy - App.state.viewport.panY) / App.state.viewport.zoom
      };
    },
    
    canvasToScreen: function(cx, cy) {
      return {
        x: cx * App.state.viewport.zoom + App.state.viewport.panX,
        y: cy * App.state.viewport.zoom + App.state.viewport.panY
      };
    },
    
    setViewport: function(panX, panY, zoom) {
      App.state.viewport.panX = panX;
      App.state.viewport.panY = panY;
      App.state.viewport.zoom = zoom;
      this.applyTransform();
      App.emit('viewport:changed');
    },
    
    fitToContent: function() {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      let hasItems = false;
      App.state.cards.forEach(c => {
        minX = Math.min(minX, c.x); minY = Math.min(minY, c.y);
        maxX = Math.max(maxX, c.x + c.width); maxY = Math.max(maxY, c.y + c.height);
        hasItems = true;
      });
      App.state.groups.forEach(g => {
        minX = Math.min(minX, g.x); minY = Math.min(minY, g.y);
        maxX = Math.max(maxX, g.x + g.width); maxY = Math.max(maxY, g.y + g.height);
        hasItems = true;
      });
      if (!hasItems) { this.resetZoom(); return; }
      const padding = 80;
      const contentW = maxX - minX + padding * 2;
      const contentH = maxY - minY + padding * 2;
      const zoom = Math.min(window.innerWidth / contentW, window.innerHeight / contentH, MAX_ZOOM);
      const panX = (window.innerWidth - contentW * zoom) / 2 - (minX - padding) * zoom;
      const panY = (window.innerHeight - contentH * zoom) / 2 - (minY - padding) * zoom;
      this.setViewport(panX, panY, zoom);
    },
    
    handleResize: function() {
      this.resizeCanvas();
    },
    
    getZoom: function() { return App.state.viewport.zoom; },
    zoomIn: function() { this.setViewport(App.state.viewport.panX, App.state.viewport.panY, Math.min(App.state.viewport.zoom * 1.2, MAX_ZOOM)); },
    zoomOut: function() { this.setViewport(App.state.viewport.panX, App.state.viewport.panY, Math.max(App.state.viewport.zoom / 1.2, MIN_ZOOM)); },
    resetZoom: function() { this.setViewport(0, 0, 1); }
  };
})();
