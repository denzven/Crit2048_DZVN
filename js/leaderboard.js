/**
 * LEADERBOARD LOGIC
 * Handles saving, retrieving, and managing run history in localStorage.
 */

const LEADERBOARD_KEY = "crit2048_leaderboard";

function saveRunToLeaderboard(runStats, playerClass, encounterIdx) {
  const leaderboard = getLeaderboard();
  
  const entry = {
    id: Date.now(),
    date: new Date().toISOString(),
    class: playerClass.id,
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
  
  // Sort by Ante (desc), then Max Damage (desc)
  leaderboard.sort((a, b) => b.ante - a.ante || b.maxDamage - a.maxDamage);
  
  // Keep only top 50 runs?
  if (leaderboard.length > 50) {
    leaderboard.splice(50);
  }
  
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

function getLeaderboard() {
  const data = localStorage.getItem(LEADERBOARD_KEY);
  try {
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse leaderboard", e);
    return [];
  }
}

function removeLeaderboardEntry(id) {
  let leaderboard = getLeaderboard();
  leaderboard = leaderboard.filter(entry => entry.id !== id);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  renderLeaderboard();
  updateStartLeaderboardVisibility();
}

function clearLeaderboard() {
  if (confirm("Are you sure you want to clear the entire leaderboard? This cannot be undone.")) {
    localStorage.removeItem(LEADERBOARD_KEY);
    renderLeaderboard();
    updateStartLeaderboardVisibility();
  }
}

function updateStartLeaderboardVisibility() {
  if (state.gameState === "START" && el.btnStartLeaderboard) {
    if (getLeaderboard().length > 0) {
      el.btnStartLeaderboard.classList.remove("hide");
    } else {
      el.btnStartLeaderboard.classList.add("hide");
    }
  }
}

async function shareLeaderboard() {
  const area = document.getElementById("leaderboard-capture-area");
  if (!area) return;
  
  try {
    const canvas = await html2canvas(area, {
      backgroundColor: "#0f172a",
      scale: 2,
      logging: false,
      useCORS: true
    });
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `crit2048_leaderboard.png`, { type: 'image/png' });
      
      const shareData = {
        title: 'Crit 2048 Leaderboard',
        text: `Check out my progress in Crit 2048! Here is my Hall of Heroes.`
      };

      if (window.Plugins && window.Plugins.isTauri) {
        shareData.files = [file];
        await window.Plugins.share(shareData);
      } else if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            ...shareData,
            files: [file],
          });
        } catch (err) {
          if (err.name !== 'AbortError') console.error('Share failed:', err);
        }
      } else {
        const link = document.createElement('a');
        link.download = `crit2048_leaderboard.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        alert("Sharing not supported on this browser. Image downloaded instead!");
      }
    });
  } catch (e) {
    console.error("Screenshot failed", e);
    alert("Failed to generate screenshot.");
  }
}

// Export functions to window
window.saveRunToLeaderboard = saveRunToLeaderboard;
window.getLeaderboard = getLeaderboard;
window.removeLeaderboardEntry = removeLeaderboardEntry;
window.clearLeaderboard = clearLeaderboard;
window.shareLeaderboard = shareLeaderboard;
