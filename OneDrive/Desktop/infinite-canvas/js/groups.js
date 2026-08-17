(function() {
  window.App = window.App || {};
  window.App.history = window.App.history || { push: function(){} };
  
  let groupsLayer;
  let dragGroupState = null;
  
  window.App.groups = {
    init: function() {
      groupsLayer = document.getElementById('groups-layer');
      
      App.on('cards:changed', () => this.updateGroupChildren());
      
      window.addEventListener('mousemove', this.onMouseMove.bind(this));
      window.addEventListener('mouseup', this.onMouseUp.bind(this));
      
      // Mousedown on group for dragging is handled by event delegation on groupsLayer
      if (groupsLayer) {
        groupsLayer.addEventListener('mousedown', this.onMouseDown.bind(this));
      }
    },
    
    onMouseDown: function(e) {
      const groupEl = e.target.closest('.canvas-group');
      if (!groupEl) return;
      
      const id = groupEl.getAttribute('data-id');
      const group = App.state.groups.get(id);
      
      if (e.target.classList.contains('resize-handle')) {
        dragGroupState = {
          type: 'resize',
          id: id,
          startX: e.clientX,
          startY: e.clientY,
          origW: group.width,
          origH: group.height
        };
        e.preventDefault();
      } else if (!e.target.classList.contains('group-label') || groupEl === e.target) {
        dragGroupState = {
          type: 'move',
          id: id,
          startX: e.clientX,
          startY: e.clientY,
          origX: group.x,
          origY: group.y,
          childrenOrig: group.children.map(cid => {
             const c = App.state.cards.get(cid);
             return c ? { id: cid, x: c.x, y: c.y } : null;
          }).filter(c => c)
        };
        e.preventDefault();
      }
    },
    
    onMouseMove: function(e) {
      if (!dragGroupState) return;
      
      const zoom = App.state.viewport.zoom;
      const dx = (e.clientX - dragGroupState.startX) / zoom;
      const dy = (e.clientY - dragGroupState.startY) / zoom;
      
      const group = App.state.groups.get(dragGroupState.id);
      
      if (dragGroupState.type === 'move') {
        group.x = dragGroupState.origX + dx;
        group.y = dragGroupState.origY + dy;
        this.updateGroupDOM(group);
        
        // Move children
        dragGroupState.childrenOrig.forEach(orig => {
          const card = App.state.cards.get(orig.id);
          if (card) {
            card.x = orig.x + dx;
            card.y = orig.y + dy;
            App.cards.updateCardDOM(card);
          }
        });
        
        App.emit('cards:changed');
      } else if (dragGroupState.type === 'resize') {
        group.width = Math.max(200, dragGroupState.origW + dx);
        group.height = Math.max(150, dragGroupState.origH + dy);
        this.updateGroupDOM(group);
      }
    },
    
    onMouseUp: function(e) {
      if (dragGroupState) {
        if (dragGroupState.type === 'move') {
          App.history.push({type: 'move-group', id: dragGroupState.id});
        }
        dragGroupState = null;
        this.updateGroupChildren();
        App.emit('state:changed');
      }
    },
    
    createGroup: function(x, y, width, height, options = {}) {
      const id = App.generateId();
      const groupData = {
        id,
        x,
        y,
        width: width || 400,
        height: height || 300,
        label: options.label || 'Group',
        color: options.color || 'default',
        children: []
      };
      
      App.state.groups.set(id, groupData);
      this.renderGroup(groupData);
      this.updateGroupChildren();
      
      App.history.push({type: 'create-group', id, data: {...groupData}});
      App.emit('state:changed');
      
      return groupData;
    },
    
    renderGroup: function(groupData) {
      if (!groupsLayer) return;
      
      const el = document.createElement('div');
      el.className = 'canvas-group';
      el.setAttribute('data-id', groupData.id);
      el.setAttribute('data-color', groupData.color);
      el.style.left = groupData.x + 'px';
      el.style.top = groupData.y + 'px';
      el.style.width = groupData.width + 'px';
      el.style.height = groupData.height + 'px';
      el.style.position = 'absolute';
      
      el.innerHTML = `
        <div class="group-label" contenteditable="false">${groupData.label}</div>
        <div class="resize-handle se" style="cursor: nwse-resize;"></div>
      `;
      
      const labelEl = el.querySelector('.group-label');
      labelEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        labelEl.contentEditable = "true";
        labelEl.focus();
      });
      labelEl.addEventListener('blur', (e) => {
        labelEl.contentEditable = "false";
        const group = App.state.groups.get(groupData.id);
        if (group && group.label !== labelEl.innerText) {
          group.label = labelEl.innerText;
          App.emit('state:changed');
        }
      });
      
      groupsLayer.appendChild(el);
    },
    
    updateGroupDOM: function(groupData) {
      const el = document.querySelector(`.canvas-group[data-id="${groupData.id}"]`);
      if (el) {
        el.style.left = groupData.x + 'px';
        el.style.top = groupData.y + 'px';
        el.style.width = groupData.width + 'px';
        el.style.height = groupData.height + 'px';
      }
    },
    
    updateGroupChildren: function() {
      for (const group of App.state.groups.values()) {
        group.children = [];
        for (const card of App.state.cards.values()) {
          // Check if card center is inside group
          const cx = card.x + card.width/2;
          const cy = card.y + card.height/2;
          
          if (cx >= group.x && cx <= group.x + group.width &&
              cy >= group.y && cy <= group.y + group.height) {
            group.children.push(card.id);
          }
        }
      }
    },
    
    moveGroup: function(id, dx, dy) {
      const group = App.state.groups.get(id);
      if (!group) return;
      
      group.x += dx;
      group.y += dy;
      this.updateGroupDOM(group);
      
      group.children.forEach(cid => {
        const card = App.state.cards.get(cid);
        if (card) {
          card.x += dx;
          card.y += dy;
          App.cards.updateCardDOM(card);
        }
      });
      
      App.emit('cards:changed');
    },
    
    deleteGroup: function(id) {
      const group = App.state.groups.get(id);
      if (!group) return;
      
      App.state.groups.delete(id);
      const el = document.querySelector(`.canvas-group[data-id="${id}"]`);
      if (el) el.remove();
      
      App.history.push({type: 'delete-group', data: group});
      App.emit('state:changed');
    },
    
    createGroupAtCenter: function() {
      const cx = (window.innerWidth / 2 - App.state.viewport.panX) / App.state.viewport.zoom;
      const cy = (window.innerHeight / 2 - App.state.viewport.panY) / App.state.viewport.zoom;
      return this.createGroup(cx - 200, cy - 150, 400, 300);
    },
    
    createGroupAt: function(x, y) {
      return this.createGroup(x, y, 400, 300);
    },
    
    clearAll: function() {
      if (groupsLayer) groupsLayer.innerHTML = '';
      App.state.groups.clear();
    }
  };
})();
