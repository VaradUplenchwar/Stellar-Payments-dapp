// js/history.js
window.App = window.App || {};
window.App.history = (function() {
  let undoStack = [];
  let redoStack = [];
  const MAX_HISTORY = 50;

  function push(action) {
    undoStack.push(action);
    if (undoStack.length > MAX_HISTORY) {
      undoStack.shift();
    }
    redoStack = [];
  }

  function undo() {
    if (undoStack.length === 0) return;
    const action = undoStack.pop();
    action.undo();
    redoStack.push(action);
    App.emit('state:changed');
  }

  function redo() {
    if (redoStack.length === 0) return;
    const action = redoStack.pop();
    action.redo();
    undoStack.push(action);
    App.emit('state:changed');
  }

  function canUndo() { return undoStack.length > 0; }
  function canRedo() { return redoStack.length > 0; }

  function init() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        redo();
        e.preventDefault();
      }
    });
  }

  return { push, undo, redo, canUndo, canRedo, init };
})();
