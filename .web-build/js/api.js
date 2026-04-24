// --- GEMINI API (AI ORACLE) ---
async function callGeminiOracle() {
  if (state.gold < 50) {
    SFX.fail();
    return;
  }
  SFX.coin();
  state.gold -= 50;
  renderHUD();
  el.btnAiOracle.classList.add("hide");
  el.aiLoading.classList.remove("hide");

  const prompt = `You are a merchant in a D&D roguelike. The player is a ${state.playerClass.id} and defeated Ante ${state.encounterIdx}. Create a magical artifact. ONLY valid JSON: {"name": "Cool Item Name", "desc": "1-sentence flavor. Grants +1.0 Multiplier."}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: { name: { type: "STRING" }, desc: { type: "STRING" } },
      },
    },
  };

  let resultData = null;
  try {
    const jsonString = await window.__TAURI__.core.invoke('call_gemini_api', { prompt });
    const data = JSON.parse(jsonString);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      resultData = JSON.parse(text);
    }
  } catch (e) {
    console.error("Gemini API error:", e);
  }

  el.aiLoading.classList.add("hide");
  el.btnAiOracle.classList.remove("hide");
  if (resultData && resultData.name) {
    state.artifacts.push({
      id: "AI_ART_" + Date.now(),
      name: resultData.name,
      icon: "✨",
      rarity: "Legendary",
      level: 1,
      basePrice: 0,
      desc: () => resultData.desc,
    });
    state.multiplier += 1.0;
    addLog(`Oracle forged ${resultData.name}!`);
    SFX.crit();
    renderTavern();
  } else {
    state.gold += 50;
    alert("Oracle asleep (API Error). Gold refunded.", "API Error", "💤");
    renderHUD();
  }
}
