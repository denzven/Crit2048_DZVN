import { create } from 'zustand';

export interface GameAction {
  type: string;
  payload?: unknown;
  delay?: number;
  log?: string;
  sfx?: string;
}

interface ActionQueueState {
  queue: GameAction[];
  isProcessing: boolean;

  // Actions
  push: (action: GameAction | GameAction[]) => void;
  process: () => Promise<void>;
  clear: () => void;
}

export const useActionQueue = create<ActionQueueState>((set, get) => ({
  queue: [],
  isProcessing: false,

  push: (action) => {
    const actions = Array.isArray(action) ? action : [action];
    set((s) => ({ queue: [...s.queue, ...actions] }));
    if (!get().isProcessing) {
      get().process();
    }
  },

  process: async () => {
    if (get().isProcessing || get().queue.length === 0) return;

    set({ isProcessing: true });

    while (get().queue.length > 0) {
      const action = get().queue[0];

      // Emit event for UI to respond (e.g. via a listener or another store)
      // For now, we'll just handle basic logic and delays
      console.log(`Processing action: ${action.type}`, action.payload);

      if (action.log) {
        const store = (
          window as unknown as {
            useGameStore?: { getState: () => { addLog: (m: string) => void } };
          }
        ).useGameStore;
        store?.getState().addLog(action.log);
      }

      if (action.sfx) {
        // Trigger SFX
      }

      await new Promise((r) => setTimeout(r, action.delay || 100));

      set((s) => ({ queue: s.queue.slice(1) }));
    }

    set({ isProcessing: false });
  },

  clear: () => set({ queue: [], isProcessing: false }),
}));
