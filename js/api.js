// --- GEMINI API (AI ORACLE) ---
async function callGeminiOracle() {
  if (state.gold < 50) { SFX.fail(); return; }
  SFX.coin(); state.gold -= 50; renderHUD();
  el.btnAiOracle.classList.add('hide'); el.aiLoading.classList.remove('hide');

  const prompt = `You are a merchant in a D&D roguelike. The player is a ${state.playerClass.id} and defeated Ante ${state.encounterIdx}. Create a magical artifact. ONLY valid JSON: {"name": "Cool Item Name", "desc": "1-sentence flavor. Grants +1.0 Multiplier."}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: { type: "OBJECT", properties: { name: { type: "STRING" }, desc: { type: "STRING" } } }
    }
  };

  let resultData = null; let delays = [1000, 2000, 4000];

  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await response.json(); const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) { resultData = JSON.parse(text); break; }
    } catch (e) { if (attempt === 3) break; await new Promise(r => setTimeout(r, delays[attempt])); }
  }

  el.aiLoading.classList.add('hide'); el.btnAiOracle.classList.remove('hide');
  if (resultData && resultData.name) {
    state.artifacts.push({ id: 'AI_ART_' + Date.now(), name: resultData.name, icon: '✨', rarity: 'Legendary', level: 1, basePrice: 0, desc: () => resultData.desc });
    state.multiplier += 1.0; addLog(`Oracle forged ${resultData.name}!`); SFX.crit(); renderTavern();
  } else { state.gold += 50; alert("Oracle asleep (API Error). Gold refunded."); renderHUD(); }
}
