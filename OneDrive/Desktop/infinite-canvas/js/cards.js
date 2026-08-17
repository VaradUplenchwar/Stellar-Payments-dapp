(function() {
  window.App = window.App || {};
  window.App.history = window.App.history || { push: function(){} };
  
  let cardsLayer, appEl;
  
  let dragState = null; // { type: 'move'|'resize', cardIds, startX, startY, cardsOrig, ... }
  
  window.App.cards = {
    init: function() {
      cardsLayer = document.getElementById('cards-layer');
      appEl = document.getElementById('app');
      
      if(appEl) {
        appEl.addEventListener('dblclick', this.onDoubleClick.bind(this));
        appEl.addEventListener('mousedown', this.onMouseDown.bind(this));
      }
      
      window.addEventListener('mousemove', this.onMouseMove.bind(this));
      window.addEventListener('mouseup', this.onMouseUp.bind(this));
      
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.contentEditable !== 'true') {
          Array.from(App.state.selection).forEach(id => {
            if (App.state.cards.has(id)) {
              this.deleteCard(id);
            }
          });
        }
      });
    },
    
    onDoubleClick: function(e) {
      if (e.target.id === 'app' || e.target.id === 'grid-canvas' || e.target.id === 'canvas-viewport') {
        const canvasPos = App.canvas.screenToCanvas(e.clientX, e.clientY);
        this.createCard(canvasPos.x, canvasPos.y);
      }
    },
    
    onMouseDown: function(e) {
      const cardEl = e.target.closest('.canvas-card');
      
      if (!cardEl) {
        // Clicked outside card, clear selection if not clicking port or handle or connection
        if (!e.target.closest('.card-port') && !e.target.closest('.resize-handle') && e.target.id !== 'connections-layer') {
          this.clearSelection();
        }
        return;
      }
      
      const cardId = cardEl.getAttribute('data-id');
      
      // Port click (connect mode)
      if (e.target.classList.contains('card-port')) {
        App.state.connectionDraft = {
          fromCardId: cardId,
          fromSide: e.target.getAttribute('data-side')
        };
        App.state.mode = 'connect';
        return;
      }
      
      // Selection logic
      if (e.target.closest('.card-header') || cardEl === e.target || e.target.classList.contains('card-body')) {
        if (!e.shiftKey && !App.state.selection.has(cardId)) {
          this.clearSelection();
        }
        this.selectCard(cardId, e.shiftKey);
      }
      
      // Handle drag if not editing text or interacting with controls
      const isEditing = e.target.isContentEditable || (e.target.closest('.card-body') && e.target.closest('.card-body').isContentEditable);
      if (!isEditing && !e.target.classList.contains('card-port') && !e.target.classList.contains('resize-handle')) {
        dragState = {
          type: 'move',
          cardIds: Array.from(App.state.selection), // move all selected
          startX: e.clientX,
          startY: e.clientY,
          cardsOrig: Array.from(App.state.selection).map(id => {
             const c = App.state.cards.get(id);
             return { id, x: c.x, y: c.y };
          })
        };
        e.preventDefault(); // Prevent text selection
      }
      
      // Handle resize
      if (e.target.classList.contains('resize-handle')) {
        const card = App.state.cards.get(cardId);
        const handle = Array.from(e.target.classList).find(c => c !== 'resize-handle');
        dragState = {
          type: 'resize',
          cardId: cardId,
          startX: e.clientX,
          startY: e.clientY,
          origX: card.x,
          origY: card.y,
          origW: card.width,
          origH: card.height,
          handle: handle
        };
        e.preventDefault();
      }
    },
    
    onMouseMove: function(e) {
      if (!dragState) return;
      
      const zoom = App.state.viewport.zoom;
      const dx = (e.clientX - dragState.startX) / zoom;
      const dy = (e.clientY - dragState.startY) / zoom;
      
      if (dragState.type === 'move') {
        dragState.cardsOrig.forEach(orig => {
          const card = App.state.cards.get(orig.id);
          if (card) {
            card.x = orig.x + dx;
            card.y = orig.y + dy;
            this.updateCardDOM(card);
          }
        });
        App.emit('cards:changed');
      } else if (dragState.type === 'resize') {
        const card = App.state.cards.get(dragState.cardId);
        let newX = dragState.origX;
        let newY = dragState.origY;
        let newW = dragState.origW;
        let newH = dragState.origH;
        
        if (dragState.handle.includes('e')) newW = Math.max(180, dragState.origW + dx);
        if (dragState.handle.includes('s')) newH = Math.max(80, dragState.origH + dy);
        if (dragState.handle.includes('w')) {
          const possibleW = Math.max(180, dragState.origW - dx);
          if (possibleW > 180) {
            newW = possibleW;
            newX = dragState.origX + dx;
          }
        }
        if (dragState.handle.includes('n')) {
          const possibleH = Math.max(80, dragState.origH - dy);
          if (possibleH > 80) {
            newH = possibleH;
            newY = dragState.origY + dy;
          }
        }
        
        card.x = newX;
        card.y = newY;
        card.width = newW;
        card.height = newH;
        this.updateCardDOM(card);
        App.emit('cards:changed');
      }
    },
    
    onMouseUp: function(e) {
      if (App.state.connectionDraft && e.target.classList.contains('card-port')) {
        const toCardId = e.target.closest('.canvas-card').getAttribute('data-id');
        const toSide = e.target.getAttribute('data-side');
        
        if (App.state.connectionDraft.fromCardId !== toCardId) {
           App.connections.createConnection(
             App.state.connectionDraft.fromCardId,
             App.state.connectionDraft.fromSide,
             toCardId,
             toSide
           );
        }
      }
      
      App.state.connectionDraft = null;
      
      if (dragState) {
        if (dragState.type === 'move') {
          App.history.push({type: 'move-cards', data: dragState.cardsOrig});
        } else if (dragState.type === 'resize') {
          App.history.push({type: 'resize-card', cardId: dragState.cardId});
        }
        dragState = null;
        App.emit('state:changed');
      }
    },
    
    createCard: function(x, y, options = {}) {
      const id = App.generateId();
      const cardData = {
        id,
        x,
        y,
        width: options.width || 240,
        height: options.height || 120,
        content: options.content || '',
        color: options.color || 'default',
        zIndex: App.state.nextZIndex++
      };
      
      App.state.cards.set(id, cardData);
      this.renderCard(cardData);
      
      App.history.push({type: 'create-card', cardId: id, data: {...cardData}});
      App.emit('cards:changed');
      App.emit('state:changed');
      
      return cardData;
    },
    
    renderMarkdown: function(text) {
      if (!text) return '';
      // Simple markdown parser
      let html = text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/^### (.*$)/gim, '<h3 style="margin:4px 0;font-size:1.1em;">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 style="margin:6px 0;font-size:1.2em;">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 style="margin:8px 0;font-size:1.3em;">$1</h1>')
        .replace(/^\- \[ \] (.*$)/gim, '<div style="margin:2px 0;"><input type="checkbox" disabled> $1</div>')
        .replace(/^\- \[x\] (.*$)/gim, '<div style="margin:2px 0;"><input type="checkbox" checked disabled> <del>$1</del></div>')
        .replace(/^\- (.*$)/gim, '<li style="margin-left:16px;">$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code style="background:#2a2a32;padding:2px 4px;border-radius:3px;">$1</code>')
        .replace(/\n/g, '<br>');
      return html;
    },

    renderCard: function(cardData) {
      if (!cardsLayer) return;
      
      const el = document.createElement('div');
      el.className = 'canvas-card';
      el.setAttribute('data-id', cardData.id);
      el.setAttribute('data-color', cardData.color);
      el.style.left = cardData.x + 'px';
      el.style.top = cardData.y + 'px';
      el.style.width = cardData.width + 'px';
      el.style.height = cardData.height + 'px';
      el.style.zIndex = cardData.zIndex;
      el.style.position = 'absolute'; 
      
      const formattedContent = this.renderMarkdown(cardData.content);
      
      el.innerHTML = `
        <div class="card-header" style="cursor: move;">
          <span class="card-color-dot"></span>
          <span class="card-title">Note</span>
        </div>
        <div class="card-body" contenteditable="false">${formattedContent}</div>
        <div class="resize-handle nw" style="cursor: nwse-resize;"></div>
        <div class="resize-handle ne" style="cursor: nesw-resize;"></div>
        <div class="resize-handle sw" style="cursor: nesw-resize;"></div>
        <div class="resize-handle se" style="cursor: nwse-resize;"></div>
        <div class="resize-handle n" style="cursor: ns-resize;"></div>
        <div class="resize-handle s" style="cursor: ns-resize;"></div>
        <div class="resize-handle e" style="cursor: ew-resize;"></div>
        <div class="resize-handle w" style="cursor: ew-resize;"></div>
        <div class="card-port top" data-side="top"></div>
        <div class="card-port bottom" data-side="bottom"></div>
        <div class="card-port left" data-side="left"></div>
        <div class="card-port right" data-side="right"></div>
      `;
      
      const bodyEl = el.querySelector('.card-body');
      bodyEl.addEventListener('dblclick', (e) => {
        const card = App.state.cards.get(cardData.id);
        bodyEl.innerText = card ? card.content : '';
        bodyEl.contentEditable = "true";
        bodyEl.focus();
        el.classList.add('editing');
      });
      
      bodyEl.addEventListener('blur', (e) => {
        bodyEl.contentEditable = "false";
        el.classList.remove('editing');
        const card = App.state.cards.get(cardData.id);
        if (card) {
          const newRaw = bodyEl.innerText;
          card.content = newRaw;
          bodyEl.innerHTML = this.renderMarkdown(newRaw);
          App.history.push({type: 'edit-card', cardId: card.id, content: card.content});
          App.emit('state:changed');
        }
      });
      
      cardsLayer.appendChild(el);
    },
    
    updateCardDOM: function(cardData) {
      const el = document.querySelector(`.canvas-card[data-id="${cardData.id}"]`);
      if (el) {
        el.style.left = cardData.x + 'px';
        el.style.top = cardData.y + 'px';
        el.style.width = cardData.width + 'px';
        el.style.height = cardData.height + 'px';
        el.style.zIndex = cardData.zIndex;
        el.setAttribute('data-color', cardData.color);
      }
    },
    
    deleteCard: function(id) {
      const card = App.state.cards.get(id);
      if (!card) return;
      
      App.state.cards.delete(id);
      const el = document.querySelector(`.canvas-card[data-id="${id}"]`);
      if (el) el.remove();
      
      App.state.selection.delete(id);
      
      const connsToDelete = [];
      App.state.connections.forEach(conn => {
        if (conn.fromCardId === id || conn.toCardId === id) {
          connsToDelete.push(conn.id);
        }
      });
      if (App.connections) {
        connsToDelete.forEach(connId => App.connections.deleteConnection(connId));
      }
      
      App.history.push({type: 'delete-card', data: card});
      App.emit('cards:changed');
      App.emit('state:changed');
      App.emit('selection:changed');
    },
    
    selectCard: function(id, additive = false) {
      if (!additive) {
        this.clearSelection();
      }
      
      const card = App.state.cards.get(id);
      if (card) {
        card.zIndex = App.state.nextZIndex++;
        this.updateCardDOM(card);
      }
      
      App.state.selection.add(id);
      const el = document.querySelector(`.canvas-card[data-id="${id}"]`);
      if (el) el.classList.add('selected');
      
      App.emit('selection:changed');
    },
    
    clearSelection: function() {
      App.state.selection.forEach(id => {
        const el = document.querySelector(`.canvas-card[data-id="${id}"]`);
        if (el) el.classList.remove('selected');
      });
      App.state.selection.clear();
      App.emit('selection:changed');
    },
    
    updateCardColor: function(id, color) {
      const card = App.state.cards.get(id);
      if (card) {
        card.color = color;
        this.updateCardDOM(card);
        App.history.push({type: 'recolor-card', cardId: id, color});
        App.emit('state:changed');
      }
    },
    
    createCardAtCenter: function() {
      const cx = (window.innerWidth / 2 - App.state.viewport.panX) / App.state.viewport.zoom;
      const cy = (window.innerHeight / 2 - App.state.viewport.panY) / App.state.viewport.zoom;
      return this.createCard(cx - 120, cy - 60);
    },
    
    createCardAt: function(x, y) {
      return this.createCard(x, y);
    },
    
    editCard: function(id) {
      const el = document.querySelector(`.canvas-card[data-id="${id}"] .card-body`);
      if (el) {
        el.contentEditable = "true";
        el.focus();
        el.closest('.canvas-card').classList.add('editing');
      }
    },
    
    bringToFront: function(id) {
      const card = App.state.cards.get(id);
      if (card) {
        card.zIndex = App.state.nextZIndex++;
        this.updateCardDOM(card);
        App.emit('state:changed');
      }
    },
    
    duplicateCard: function(id) {
      const card = App.state.cards.get(id);
      if (card) {
        this.createCard(card.x + 30, card.y + 30, {
          width: card.width,
          height: card.height,
          content: card.content,
          color: card.color
        });
      }
    },
    
    setCardColor: function(id, color) {
      this.updateCardColor(id, color);
    },
    
    clearAll: function() {
      if (cardsLayer) cardsLayer.innerHTML = '';
      App.state.cards.clear();
      App.state.selection.clear();
    },
    
    getCardPortPosition: function(cardId, side) {
      const card = App.state.cards.get(cardId);
      if (!card) return null;
      
      switch(side) {
        case 'top': return { x: card.x + card.width/2, y: card.y };
        case 'bottom': return { x: card.x + card.width/2, y: card.y + card.height };
        case 'left': return { x: card.x, y: card.y + card.height/2 };
        case 'right': return { x: card.x + card.width, y: card.y + card.height/2 };
        default: return { x: card.x + card.width/2, y: card.y + card.height/2 };
      }
    }
  };
})();
