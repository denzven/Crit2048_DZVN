/**
 * IMAGE GENERATOR: Professional Stat Card Composition
 * 
 * Replaces the buggy html2canvas approach with a high-performance template composition system.
 * Draws run statistics directly onto a pre-rendered background image.
 */

(function() {
  const ImageGenerator = {
    /**
     * Generate a high-resolution share card as a Uint8Array
     * @param {Object} data - The run statistics to draw
     * @returns {Promise<Uint8Array>}
     */
    async generate(data, options = {}) {
      const theme = options.theme || 'classic';
      const showSeed = options.showSeed !== false;
      const showArtifacts = options.showArtifacts !== false;
      const showExtraStats = options.showExtraStats !== false;

      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 1080;
        canvas.height = 1920;

        // 1. Theme Configuration
        let bgStart = '#1e293b', bgEnd = '#020617';
        let accent1 = 'rgba(244, 63, 94, 0.1)', accent2 = 'rgba(79, 70, 229, 0.1)';
        let primaryColor = '#f43f5e';
        let particleColors = ['#ffffff', '#f43f5e'];

        if (theme === 'midnight') {
          bgStart = '#0f172a'; bgEnd = '#000000';
          accent1 = 'rgba(30, 41, 59, 0.2)'; accent2 = 'rgba(15, 23, 42, 0.2)';
          primaryColor = '#64748b';
          particleColors = ['#94a3b8', '#ffffff'];
        } else if (theme === 'golden') {
          bgStart = '#451a03'; bgEnd = '#0c0a09';
          accent1 = 'rgba(251, 191, 36, 0.15)'; accent2 = 'rgba(245, 158, 11, 0.15)';
          primaryColor = '#fbbf24';
          particleColors = ['#ffffff', '#fbbf24', '#f59e0b'];
        } else if (theme === 'cyber') {
          bgStart = '#083344'; bgEnd = '#020617';
          accent1 = 'rgba(34, 211, 238, 0.2)'; accent2 = 'rgba(192, 38, 211, 0.2)';
          primaryColor = '#22d3ee';
          particleColors = ['#22d3ee', '#c026d3', '#ffffff'];
        } else if (theme === 'rose') {
          bgStart = '#4c0519'; bgEnd = '#020617';
          accent1 = 'rgba(244, 63, 94, 0.25)'; accent2 = 'rgba(136, 19, 55, 0.25)';
          primaryColor = '#fb7185';
          particleColors = ['#ffffff', '#fb7185', '#f43f5e'];
        }

        // 2. Background Rendering
        const mainGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width);
        mainGrad.addColorStop(0, bgStart);
        mainGrad.addColorStop(1, bgEnd);
        ctx.fillStyle = mainGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3. Ambient Glows & Depth
        const drawGlow = (x, y, radius, color) => {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
          glow.addColorStop(0, color);
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.globalCompositeOperation = 'screen';
          ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
          ctx.globalCompositeOperation = 'source-over';
        };
        drawGlow(canvas.width * 0.2, canvas.height * 0.3, 1200, accent1);
        drawGlow(canvas.width * 0.8, canvas.height * 0.7, 1400, accent2);

        // 4. Background Particle Field
        for (let i = 0; i < 120; i++) {
          const x = Math.random() * canvas.width, y = Math.random() * canvas.height;
          const size = Math.random() * 2 + 1, alpha = Math.random() * 0.4 + 0.1;
          ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = particleColors[Math.floor(Math.random() * particleColors.length)] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
          ctx.fill();
        }

        // 5. 3D EXTRUDED HEADER
        ctx.textAlign = 'center';
        const titleText = 'CRIT 2048';
        const titleX = canvas.width / 2, titleY = 180;
        
        // Shadow/Extrusion layers
        for (let i = 20; i > 0; i--) {
          ctx.fillStyle = `rgba(0, 0, 0, ${0.05 * (21-i)})`;
          ctx.font = '900 120px "Inter", sans-serif';
          ctx.letterSpacing = '18px';
          ctx.fillText(titleText, titleX + i * 0.8, titleY + i * 0.8);
        }
        ctx.fillStyle = primaryColor;
        ctx.fillText(titleText, titleX, titleY);
        ctx.letterSpacing = '0px';

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 80px "Inter", sans-serif';
        ctx.fillText('ROGUE-LIKE RPG', canvas.width / 2, 280);

        // Date/Time Badge
        const dateStr = new Date(data.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath(); ctx.roundRect(canvas.width / 2 - 200, 310, 400, 60, 30); ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 24px "Inter", sans-serif';
        ctx.fillText(dateStr.toUpperCase(), canvas.width / 2, 350);

        // 6. HERO SECTION: ISOMETRIC ANTE BOX
        const heroY = 580;
        ctx.save();
        ctx.translate(canvas.width / 2, heroY);
        ctx.transform(1, -0.05, 0, 1, 0, 0); // Isometric skew
        
        // Box Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.roundRect(-300, -130, 600, 260, 48); ctx.fill();
        
        // Box Body
        const boxGrad = ctx.createLinearGradient(-300, -130, 300, 130);
        boxGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
        boxGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
        ctx.fillStyle = boxGrad;
        ctx.beginPath(); ctx.roundRect(-300, -140, 600, 260, 48); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = primaryColor;
        ctx.font = '900 180px "Inter", sans-serif';
        ctx.fillText(data.ante.toString(), -80, 40);
        
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 35px "Inter", sans-serif';
        ctx.fillText('ANTE', 30, -30);
        ctx.fillStyle = '#64748b';
        ctx.font = '800 50px "Inter", sans-serif';
        ctx.fillText('REACHED', 30, 30);
        ctx.restore();

        // 7. CLASS INFO
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 70px "Inter", sans-serif';
        ctx.fillText(`${data.classIcon} ${data.className.toUpperCase()}`, canvas.width / 2, 800);

        // 8. ADVANCED STATS GRID (Isometric Layout)
        const gridY = 980;
        const col1X = 300, col2X = 780;
        const rowH = 160;

        const drawIsoStat = (label, value, x, y, icon = "", color = "#ffffff") => {
          ctx.save();
          ctx.translate(x, y);
          ctx.transform(1, -0.02, 0, 1, 0, 0);
          
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath(); ctx.roundRect(-210, -65, 420, 130, 24); ctx.fill();
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.beginPath(); ctx.roundRect(-210, -70, 420, 130, 24); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.08)';
          ctx.stroke();
          
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 20px "Inter", sans-serif';
          ctx.fillText(label.toUpperCase(), 0, -15);
          
          ctx.fillStyle = color;
          ctx.font = '900 42px "Inter", sans-serif';
          ctx.fillText((icon ? icon + " " : "") + value, 0, 35);
          ctx.restore();
        };

        drawIsoStat('Max Damage', Math.floor(data.maxDamage), col1X, gridY, "⚔️", primaryColor);
        drawIsoStat('Total Damage', Math.floor(data.totalDamageDealt).toLocaleString(), col2X, gridY);
        
        drawIsoStat('Best Weapon', data.highestTileValue, col1X, gridY + rowH);
        drawIsoStat('Most Merged', data.mostMergedVal, col2X, gridY + rowH, "🔁");

        drawIsoStat('Spell Damage', Math.floor(data.spellDamageDealt).toLocaleString(), col1X, gridY + rowH * 2, "🔥");
        drawIsoStat('Luck Factor', data.luckFactor.toFixed(1), col2X, gridY + rowH * 2, "🎲");

        drawIsoStat('Hazards Cleared', data.totalHazardsCleared, col1X, gridY + rowH * 3, "💀");
        drawIsoStat('Total Moves', data.totalMoves, col2X, gridY + rowH * 3);

        // 9. TREASURES SECTION
        if (showArtifacts && data.artifacts && data.artifacts.length > 0) {
          const artY = 1620;
          ctx.fillStyle = '#475569';
          ctx.font = '900 30px "Inter", sans-serif';
          ctx.fillText('TREASURES ACQUIRED', canvas.width / 2, artY - 90);

          const arts = data.artifacts.slice(0, 5);
          const aS = 130, gap = 20;
          const tW = arts.length * aS + (arts.length - 1) * gap;
          let curX = (canvas.width - tW) / 2 + aS / 2;

          arts.forEach((art, i) => {
            ctx.save();
            ctx.translate(curX, artY);
            ctx.rotate((i - 2) * 0.05); // Slight tilt for depth
            
            // Artifact shadow
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath(); ctx.arc(5, 5, aS / 2, 0, Math.PI * 2); ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath(); ctx.arc(0, 0, aS / 2, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.stroke();
            
            ctx.font = '65px "Inter", sans-serif';
            ctx.fillText(art.icon, 0, 20);
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 24px "Inter", sans-serif';
            ctx.fillText(`L${art.level}`, 0, 58);
            ctx.restore();
            curX += aS + gap;
          });
        }

        // 10. FOREGROUND BOKEH EFFECTS
        for (let i = 0; i < 15; i++) {
          const x = Math.random() * canvas.width, y = Math.random() * canvas.height;
          const size = Math.random() * 60 + 20, alpha = Math.random() * 0.1;
          ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        }

        // 11. FOOTER
        if (showSeed) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.font = 'bold 24px "Monospace", monospace';
          ctx.fillText(`SEED: ${data.seedUsed}`, canvas.width / 2, 1800);
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '900 24px "Inter", sans-serif';
        ctx.letterSpacing = '12px';
        ctx.fillText('CRIT 2048: ROGUELIKE', canvas.width / 2, 1880);

        canvas.toBlob(async (blob) => {
          if (!blob) return reject(new Error("Fail"));
          const arrayBuffer = await blob.arrayBuffer();
          resolve(new Uint8Array(arrayBuffer));
        }, 'image/png', 0.9);
      });
    }
  };

  window.ImageGenerator = ImageGenerator;
})();
