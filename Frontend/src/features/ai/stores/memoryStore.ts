import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Memory {
  id: string;
  content: string;
  createdAt: string;
}

interface MemoryStore {
  memories: Memory[];
  addMemory: (content: string) => void;
  removeMemory: (id: string) => void;
  updateMemory: (id: string, content: string) => void;
  isLoading: boolean;
}

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set) => ({
      memories: [],
      isLoading: false,
      addMemory: (content: string) =>
        set((state) => ({
          memories: [
            ...state.memories,
            {
              id: Date.now().toString(),
              content,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      removeMemory: (id: string) =>
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== id),
        })),
      updateMemory: (id: string, content: string) =>
        set((state) => ({
          memories: state.memories.map((m) =>
            m.id === id ? { ...m, content } : m
          ),
        })),
    }),
    {
      name: 'flowversal-memories',
    }
  )
);

