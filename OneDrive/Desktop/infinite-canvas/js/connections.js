(function() {
  window.App = window.App || {};
  window.App.history = window.App.history || { push: function(){} };
  
  let svgLayer, draftLine;
  
  window.App.connections = {
    init: function() {
      svgLayer = document.getElementById('connections-layer');
      
      if(svgLayer) {
        // Add defs
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        defs.innerHTML = `
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        `;
        svgLayer.appendChild(defs);
        
        // Setup draft line
        draftLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
        draftLine.setAttribute('class', 'connection-draft');
        draftLine.setAttribute('stroke', '#666');
        draftLine.setAttribute('stroke-width', '2');
        draftLine.setAttribute('stroke-dasharray', '5,5');
        draftLine.setAttribute('fill', 'none');
        draftLine.style.display = 'none';
        svgLayer.appendChild(draftLine);
      }
      
      App.on('cards:changed', () => this.updateAllPaths());
      
      window.addEventListener('mousemove', this.onMouseMove.bind(this));
      window.addEventListener('mouseup', this.onMouseUp.bind(this));
      
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.contentEditable !== 'true') {
          // If connections can be selected, delete them
          // Here we assume connections selection is part of App.state.selection
          Array.from(App.state.selection).forEach(id => {
            if (App.state.connections.has(id)) {
              this.deleteConnection(id);
            }
          });
        }
      });
    },
    
    onMouseMove: function(e) {
      if (App.state.connectionDraft) {
        const canvasPos = App.canvas.screenToCanvas(e.clientX, e.clientY);
        this.updateDraftLine(canvasPos.x, canvasPos.y);
      }
    },
    
    onMouseUp: function(e) {
      if (App.state.connectionDraft) {
        if (!e.target.classList.contains('card-port')) {
          // Cancel draft
          App.state.connectionDraft = null;
          if (draftLine) draftLine.style.display = 'none';
        }
      }
    },
    
    createConnection: function(fromCardId, fromSide, toCardId, toSide) {
      if (fromCardId === toCardId) return null; // No self connect
      
      // Check duplicate
      for (const [id, conn] of App.state.connections.entries()) {
        if (conn.fromCardId === fromCardId && conn.toCardId === toCardId && 
            conn.fromSide === fromSide && conn.toSide === toSide) {
          return null;
        }
      }
      
      const id = App.generateId();
      const connData = { id, fromCardId, toCardId, fromSide, toSide, label: '' };
      
      App.state.connections.set(id, connData);
      this.renderConnection(connData);
      
      App.history.push({type: 'create-connection', data: {...connData}});
      App.emit('connections:changed');
      App.emit('state:changed');
      
      if (draftLine) draftLine.style.display = 'none';
      
      return connData;
    },
    
    renderConnection: function(connData) {
      if (!svgLayer) return;
      
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute('id', `conn-${connData.id}`);
      path.setAttribute('class', 'connection-path');
      path.setAttribute('data-id', connData.id);
      path.setAttribute('marker-end', 'url(#arrowhead)');
      path.setAttribute('stroke', '#666');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      
      path.addEventListener('click', (e) => {
        if (!e.shiftKey) App.cards.clearSelection(); // Assume we clear cards
        App.state.selection.add(connData.id);
        path.setAttribute('stroke', '#2196F3');
        App.emit('selection:changed');
      });
      
      svgLayer.appendChild(path);
      this.updatePath(connData.id);
    },
    
    updatePath: function(id) {
      const conn = App.state.connections.get(id);
      if (!conn) return;
      
      const fromPos = App.cards.getCardPortPosition(conn.fromCardId, conn.fromSide);
      const toPos = App.cards.getCardPortPosition(conn.toCardId, conn.toSide);
      
      if (!fromPos || !toPos) return;
      
      const d = this.computePath(fromPos, toPos, conn.fromSide, conn.toSide);
      const pathEl = document.getElementById(`conn-${id}`);
      if (pathEl) {
        pathEl.setAttribute('d', d);
      }
    },
    
    updateAllPaths: function() {
      for (const id of App.state.connections.keys()) {
        this.updatePath(id);
      }
    },
    
    computePath: function(fromPos, toPos, fromSide, toSide) {
      const dx = Math.abs(toPos.x - fromPos.x);
      const dy = Math.abs(toPos.y - fromPos.y);
      const distance = Math.sqrt(dx*dx + dy*dy);
      
      const offset = Math.max(50, Math.min(200, distance * 0.4));
      
      const getCP = (pos, side) => {
        switch(side) {
          case 'right': return { x: pos.x + offset, y: pos.y };
          case 'left': return { x: pos.x - offset, y: pos.y };
          case 'top': return { x: pos.x, y: pos.y - offset };
          case 'bottom': return { x: pos.x, y: pos.y + offset };
          default: return { x: pos.x, y: pos.y };
        }
      };
      
      const cp1 = getCP(fromPos, fromSide);
      const cp2 = getCP(toPos, toSide);
      
      return `M ${fromPos.x} ${fromPos.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${toPos.x} ${toPos.y}`;
    },
    
    updateDraftLine: function(mouseX, mouseY) {
      if (!draftLine || !App.state.connectionDraft) return;
      
      const fromPos = App.cards.getCardPortPosition(
        App.state.connectionDraft.fromCardId, 
        App.state.connectionDraft.fromSide
      );
      
      if (!fromPos) return;
      
      const toPos = { x: mouseX, y: mouseY };
      
      // Auto-determine toSide based on relative position for draft
      let toSide = 'left';
      if (Math.abs(mouseX - fromPos.x) > Math.abs(mouseY - fromPos.y)) {
        toSide = mouseX > fromPos.x ? 'left' : 'right';
      } else {
        toSide = mouseY > fromPos.y ? 'top' : 'bottom';
      }
      
      const d = this.computePath(fromPos, toPos, App.state.connectionDraft.fromSide, toSide);
      draftLine.setAttribute('d', d);
      draftLine.style.display = 'block';
    },
    
    deleteConnection: function(id) {
      const conn = App.state.connections.get(id);
      if (!conn) return;
      
      App.state.connections.delete(id);
      const el = document.getElementById(`conn-${id}`);
      if (el) el.remove();
      
      App.state.selection.delete(id);
      
      App.history.push({type: 'delete-connection', data: conn});
      App.emit('connections:changed');
      App.emit('state:changed');
    },
    
    clearAll: function() {
      // Remove all connection path elements from SVG (but keep defs and draft line)
      if (svgLayer) {
        const paths = svgLayer.querySelectorAll('.connection-path');
        paths.forEach(p => p.remove());
      }
      App.state.connections.clear();
    }
  };
})();
