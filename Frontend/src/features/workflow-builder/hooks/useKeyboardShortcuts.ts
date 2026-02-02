/**
 * Keyboard Shortcuts Hook
 * Handles all keyboard shortcuts for the workflow builder
 */

import { useEffect, useRef } from 'react';
import { useWorkflowStore } from '../stores/workflowStore';
import { useUIStore } from '../stores/uiStore';
import { useViewport } from '../contexts/ViewportContext';
import { WorkflowNode } from '../types';

interface UseKeyboardShortcutsOptions {
  onOpenHelp?: () => void;
  onClose?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { 
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    containers, 
    deleteNode, 
    addNode,
    clipboard,
    setClipboard
  } = useWorkflowStore();
  
  const { 
    updateViewport, 
    viewport, 
    setViewport 
  } = useViewport();
  
  const { 
    showNotification,
    selectedNodes,
    clearSelection,
    addNodeToSelection,
    openNodePicker
  } = useUIStore();

  const isSpacePressed = useRef(false);
  const isPanning = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      
      // Prevent default shortcuts on input fields
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
      
      // Space key for panning
      if (e.key === ' ' && !isInputField && !isSpacePressed.current) {
        e.preventDefault();
        isSpacePressed.current = true;
        document.body.style.cursor = 'grab';
        return;
      }

      // Undo (Cmd/Ctrl + Z)
      if (cmdOrCtrl && e.key === 'z' && !e.shiftKey && !isInputField) {
        if (canUndo()) {
          e.preventDefault();
          undo();
          showNotification('Undone', 'info');
        }
        return;
      }

      // Redo (Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y)
      if (((cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z') || (cmdOrCtrl && e.key.toLowerCase() === 'y')) && !isInputField) {
        if (canRedo()) {
          e.preventDefault();
          redo();
          showNotification('Redone', 'info');
        }
        return;
      }

      // Copy (Cmd/Ctrl + C)
      if (cmdOrCtrl && e.key.toLowerCase() === 'c' && !isInputField && selectedNodes.length > 0) {
        e.preventDefault();
        const { containerId, nodeId } = selectedNodes[0];
        const container = containers.find(c => c.id === containerId);
        const node = container?.nodes.find(n => n.id === nodeId);
        
        if (node) {
          setClipboard(JSON.parse(JSON.stringify(node)));
          showNotification(`Copied "${node.label}"`, 'success');
        }
        return;
      }

      // Paste (Cmd/Ctrl + V)
      if (cmdOrCtrl && e.key.toLowerCase() === 'v' && !isInputField && clipboard) {
        e.preventDefault();
        
        // Find the first container or use selected node's container
        const targetContainerId = selectedNodes.length > 0 
          ? selectedNodes[0].containerId 
          : containers[0]?.id;
        
        if (targetContainerId) {
          const newNode: WorkflowNode = {
            ...clipboard,
            id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };
          
          addNode(targetContainerId, newNode);
          showNotification(`Pasted "${clipboard.label}"`, 'success');
        }
        return;
      }

      // Duplicate (Cmd/Ctrl + D)
      if (cmdOrCtrl && e.key.toLowerCase() === 'd' && !isInputField && selectedNodes.length > 0) {
        e.preventDefault();
        const { containerId, nodeId } = selectedNodes[0];
        const container = containers.find(c => c.id === containerId);
        const node = container?.nodes.find(n => n.id === nodeId);
        
        if (node) {
          const duplicatedNode: WorkflowNode = {
            ...JSON.parse(JSON.stringify(node)),
            id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            label: `${node.label} (Copy)`,
          };
          
          addNode(containerId, duplicatedNode);
          showNotification(`Duplicated "${node.label}"`, 'success');
        }
        return;
      }

      // Delete (Delete or Backspace)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputField && selectedNodes.length > 0) {
        e.preventDefault();
        
        selectedNodes.forEach(({ containerId, nodeId }) => {
          const container = containers.find(c => c.id === containerId);
          const node = container?.nodes.find(n => n.id === nodeId);
          
          if (node) {
            deleteNode(containerId, nodeId);
          }
        });
        
        showNotification(`Deleted ${selectedNodes.length} node${selectedNodes.length > 1 ? 's' : ''}`, 'success');
        clearSelection();
        return;
      }

      // Select All (Cmd/Ctrl + A)
      if (cmdOrCtrl && e.key.toLowerCase() === 'a' && !isInputField) {
        e.preventDefault();
        
        // Clear selection first
        clearSelection();
        
        // Select all nodes across all containers
        containers.forEach(container => {
          container.nodes.forEach(node => {
            const uiStore = useUIStore.getState();
            uiStore.addNodeToSelection(container.id, node.id);
          });
        });
        
        const totalNodes = containers.reduce((sum, c) => sum + c.nodes.length, 0);
        if (totalNodes > 0) {
          showNotification(`Selected ${totalNodes} node${totalNodes > 1 ? 's' : ''}`, 'info');
        }
        return;
      }

      // Escape (Clear selection or close workflow)
      if (e.key === 'Escape' && !isInputField) {
        e.preventDefault();
        
        if (selectedNodes.length > 0) {
          clearSelection();
          showNotification('Selection cleared', 'info');
        } else if (options.onClose) {
          options.onClose();
        }
        return;
      }

      // Zoom In (Cmd/Ctrl + =)
      if (cmdOrCtrl && (e.key === '=' || e.key === '+') && !isInputField) {
        e.preventDefault();
        updateViewport({ zoom: Math.min(viewport.zoom * 1.2, 2) });
        return;
      }

      // Zoom Out (Cmd/Ctrl + -)
      if (cmdOrCtrl && e.key === '-' && !isInputField) {
        e.preventDefault();
        updateViewport({ zoom: Math.max(viewport.zoom / 1.2, 0.25) });
        return;
      }

      // Reset Zoom (Cmd/Ctrl + 0)
      if (cmdOrCtrl && e.key === '0' && !isInputField) {
        e.preventDefault();
        setViewport({ zoom: 1, offsetX: 0, offsetY: 0 });
        showNotification('View reset', 'info');
        return;
      }

      // Help Menu (? - which is Shift + /)
      if (e.key === '?' && !cmdOrCtrl && !isInputField) {
        e.preventDefault();
        options.onOpenHelp?.();
        return;
      }

      // Open Node Picker / "Add to Workflow" popup (Cmd/Ctrl + K)
      if (cmdOrCtrl && e.key.toLowerCase() === 'k' && !isInputField) {
        e.preventDefault();
        // Open the node picker in 'floating' mode to add any node/trigger/tool
        openNodePicker('floating');
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Space key release
      if (e.key === ' ' && isSpacePressed.current) {
        e.preventDefault();
        isSpacePressed.current = false;
        isPanning.current = false;
        document.body.style.cursor = 'default';
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (isSpacePressed.current) {
        e.preventDefault();
        isPanning.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        document.body.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning.current && isSpacePressed.current) {
        e.preventDefault();
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        
        updateViewport({
          offsetX: viewport.offsetX + deltaX,
          offsetY: viewport.offsetY + deltaY,
        });
        
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isPanning.current) {
        e.preventDefault();
        isPanning.current = false;
        document.body.style.cursor = isSpacePressed.current ? 'grab' : 'default';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Reset cursor on unmount
      document.body.style.cursor = 'default';
      isSpacePressed.current = false;
      isPanning.current = false;
    };
  }, [
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    updateViewport, 
    viewport, 
    setViewport, 
    showNotification, 
    options,
    selectedNodes,
    clearSelection,
    containers,
    deleteNode,
    addNode,
    clipboard,
    setClipboard,
    addNodeToSelection,
    openNodePicker
  ]);
}