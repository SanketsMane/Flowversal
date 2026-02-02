/**
 * Board View Wrapper
 * Wraps the existing Projects component to work with the new project/board system
 */

import React from 'react';
import { Projects } from '../../../components/Projects';
import { useProjectStore } from '../store';

export function BoardViewWrapper() {
  const { getSelectedBoard, getSelectedProject } = useProjectStore();
  const board = getSelectedBoard();
  const project = getSelectedProject();

  if (!board) {
    return null;
  }

  // The existing Projects component handles all the functionality
  // We just need to render it when a board is selected
  return <Projects />;
}
