/**
 * Custom Drag Layer Component
 * Phase 4 Part 1 - Drag & Drop System
 * 
 * Renders custom drag preview that follows cursor
 */

import { useDragLayer } from 'react-dnd';
import { DragPreview } from './DragPreview';
import { DragPreviewData, FormFieldDragItem, DragItem } from '../../types';
import { 
  Type, FileText, Mail, Hash, ToggleLeft, Circle, 
  ChevronDown, CheckSquare, Calendar, Clock, Link2, 
  Upload, Image as ImageIcon, Zap, Box, Wrench 
} from 'lucide-react';

const FIELD_ICONS: Record<string, React.ReactNode> = {
  text: <Type className="h-4 w-4" />,
  textarea: <FileText className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  number: <Hash className="h-4 w-4" />,
  toggle: <ToggleLeft className="h-4 w-4" />,
  radio: <Circle className="h-4 w-4" />,
  dropdown: <ChevronDown className="h-4 w-4" />,
  checklist: <CheckSquare className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
  time: <Clock className="h-4 w-4" />,
  url: <Link2 className="h-4 w-4" />,
  file: <Upload className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
};

function getLayerStyles(currentOffset: { x: number; y: number } | null) {
  if (!currentOffset) {
    return {
      display: 'none',
    };
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;

  return {
    transform,
    WebkitTransform: transform,
    pointerEvents: 'none' as const,
  };
}

export function CustomDragLayer() {
  const { itemType, isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem() as DragItem,
    itemType: monitor.getItemType(),
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || !item) {
    return null;
  }

  // Generate preview data based on item type
  const getPreviewData = (): DragPreviewData | null => {
    switch (item.type) {
      case 'FORM_FIELD': {
        const fieldItem = item as any;
        const fieldData = fieldItem.data || {};
        return {
          title: fieldData.label || 'Form Field',
          subtitle: fieldData.type || 'field',
          icon: FIELD_ICONS[fieldData.type] || <Type className="h-4 w-4" />,
          type: 'FORM_FIELD',
        };
      }

      case 'WORKFLOW_STEP':
        return {
          title: 'Workflow Step',
          subtitle: 'step',
          icon: <Box className="h-4 w-4" />,
          type: 'WORKFLOW_STEP',
        };

      case 'TRIGGER_CARD':
        return {
          title: 'Trigger',
          subtitle: 'trigger',
          icon: <Zap className="h-4 w-4" />,
          type: 'TRIGGER_CARD',
        };

      case 'NODE_CARD':
        return {
          title: 'Node',
          subtitle: 'node',
          icon: <Box className="h-4 w-4" />,
          type: 'NODE_CARD',
        };

      case 'TOOL_CARD':
        return {
          title: 'Tool',
          subtitle: 'tool',
          icon: <Wrench className="h-4 w-4" />,
          type: 'TOOL_CARD',
        };

      case 'SIDEBAR_TRIGGER':
        return {
          title: item.data?.name || 'Trigger Template',
          subtitle: 'from sidebar',
          icon: <Zap className="h-4 w-4" />,
          type: 'SIDEBAR_TRIGGER',
        };

      case 'SIDEBAR_NODE':
        return {
          title: item.data?.name || 'Node Template',
          subtitle: 'from sidebar',
          icon: <Box className="h-4 w-4" />,
          type: 'SIDEBAR_NODE',
        };

      case 'SIDEBAR_TOOL':
        return {
          title: item.data?.name || 'Tool Template',
          subtitle: 'from sidebar',
          icon: <Wrench className="h-4 w-4" />,
          type: 'SIDEBAR_TOOL',
        };

      default:
        return null;
    }
  };

  const previewData = getPreviewData();
  if (!previewData) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 100,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div style={getLayerStyles(currentOffset)}>
        <DragPreview data={previewData} />
      </div>
    </div>
  );
}
