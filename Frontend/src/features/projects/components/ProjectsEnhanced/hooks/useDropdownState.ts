import { useState, useRef, useEffect } from 'react';

export function useDropdownState() {
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);

  const projectDropdownRef = useRef<HTMLDivElement | null>(null);
  const boardDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        showProjectDropdown &&
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(target)
      ) {
        setShowProjectDropdown(false);
      }

      if (
        showBoardDropdown &&
        boardDropdownRef.current &&
        !boardDropdownRef.current.contains(target)
      ) {
        setShowBoardDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectDropdown, showBoardDropdown]);

  const dropdownHandlers = {
    toggleProjectDropdown: () => {
      setShowProjectDropdown(!showProjectDropdown);
      setShowBoardDropdown(false); // Close board dropdown
    },

    toggleBoardDropdown: () => {
      setShowBoardDropdown(!showBoardDropdown);
      setShowProjectDropdown(false); // Close project dropdown
    },

    closeAllDropdowns: () => {
      setShowProjectDropdown(false);
      setShowBoardDropdown(false);
    },
  };

  return {
    showProjectDropdown,
    showBoardDropdown,
    projectDropdownRef,
    boardDropdownRef,
    dropdownHandlers,
  };
}
