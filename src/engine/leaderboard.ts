import type { RunStats } from '../types/game';

const LEADERBOARD_KEY = "crit2048_leaderboard";

export interface LeaderboardEntry {
  id: number;
  date: string;
  class: string;
  icon: string;
  ante: number;
  maxDamage: number;
  totalMoves: number;
  totalMerges: number;
  totalCoinsSpent: number;
  maxMultiplier: number;
  duration: number;
  seed: string;
  reason: string;
}

export const LeaderboardLogic = {
  saveRun(runStats: RunStats, playerClass: any, encounterIdx: number) {
    const leaderboard = this.getEntries();
    
    const entry: LeaderboardEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      class: playerClass.name,
      icon: playerClass.icon,
      ante: encounterIdx + 1,
      maxDamage: runStats.maxDamage,
      totalMoves: runStats.totalMoves,
      totalMerges: runStats.totalMerges,
      totalCoinsSpent: runStats.totalCoinsSpent,
      maxMultiplier: runStats.maxMultiplier,
      duration: runStats.endTime - runStats.startTime,
      seed: runStats.seedUsed,
      reason: runStats.endReason
    };
    
    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.ante - a.ante || b.maxDamage - a.maxDamage);
    
    if (leaderboard.length > 50) {
      leaderboard.splice(50);
    }
    
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  },

  getEntries(): LeaderboardEntry[] {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to parse leaderboard", e);
      return [];
    }
  },

  clear() {
    localStorage.removeItem(LEADERBOARD_KEY);
  }
};
