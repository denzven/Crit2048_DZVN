/**
 * IMAGE GENERATOR: Professional Stat Card Composition
 * 
 * Replaces the buggy html2canvas approach with a high-performance template composition system.
 * Draws run statistics directly onto a canvas for sharing.
 */
export const ImageGenerator = {
  async generate(data: any, options: any = {}): Promise<Uint8Array> {
    const theme = options.theme || 'classic';
    const showSeed = options.showSeed !== false;
    const showArtifacts = options.showArtifacts !== false;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No context');
      
      canvas.width = 1080;
      canvas.height = 1920;

      // 1. Theme Configuration
      let bgStart = '#1e293b', bgEnd = '#020617';
      let accent1 = 'rgba(244, 63, 94, 0.1)', accent2 = 'rgba(79, 70, 229, 0.1)';
      let primaryColor = '#f43f5e';
      let particleColors = ['#ffffff', '#f43f5e'];

      if (theme === 'midnight') {
        bgStart = '#0f172a'; bgEnd = '#000000';
        primaryColor = '#64748b';
      }

      // 2. Background Rendering
      const mainGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width);
      mainGrad.addColorStop(0, bgStart);
      mainGrad.addColorStop(1, bgEnd);
      ctx.fillStyle = mainGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. Ambient Glows
      const drawGlow = (x: number, y: number, radius: number, color: string) => {
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

      // 5. Header
      ctx.textAlign = 'center';
      ctx.fillStyle = primaryColor;
      ctx.font = '900 120px "Serif", serif';
      ctx.fillText('CRIT 2048', canvas.width / 2, 200);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 80px sans-serif';
      ctx.fillText('ROGUE-LIKE RPG', canvas.width / 2, 300);

      // 6. HERO SECTION
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath(); (ctx as any).roundRect(canvas.width / 2 - 300, 450, 600, 300, 48); ctx.fill();
      
      ctx.fillStyle = primaryColor;
      ctx.font = '900 180px sans-serif';
      ctx.fillText(data.ante.toString(), canvas.width / 2 - 100, 660);
      
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 35px sans-serif';
      ctx.fillText('ANTE', canvas.width / 2 + 30, 600);
      ctx.fillStyle = '#64748b';
      ctx.font = '800 50px sans-serif';
      ctx.fillText('REACHED', canvas.width / 2 + 30, 660);

      // 7. CLASS INFO
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 70px sans-serif';
      ctx.fillText(`${data.classIcon} ${data.className.toUpperCase()}`, canvas.width / 2, 850);

      // 8. STATS GRID
      const gridY = 1050;
      const col1X = 300, col2X = 780;
      const rowH = 180;

      const drawStat = (label: string, value: string, x: number, y: number, color = "#ffffff") => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.beginPath(); (ctx as any).roundRect(x - 210, y - 70, 420, 140, 24); ctx.fill();
        
        ctx.textAlign = 'center';
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(label.toUpperCase(), x, y - 10);
        
        ctx.fillStyle = color;
        ctx.font = '900 48px sans-serif';
        ctx.fillText(value, x, y + 45);
      };

      drawStat('Max Damage', Math.floor(data.maxDamage).toString(), col1X, gridY, primaryColor);
      drawStat('Moves Made', data.totalMoves.toString(), col2X, gridY);
      drawStat('Total Merges', data.totalMerges.toString(), col1X, gridY + rowH);
      drawStat('Max Mult', 'x' + data.maxMultiplier.toFixed(1), col2X, gridY + rowH);

      // 9. TREASURES
      if (showArtifacts && data.artifacts && data.artifacts.length > 0) {
        ctx.fillStyle = '#475569';
        ctx.font = '900 30px sans-serif';
        ctx.fillText('TREASURES ACQUIRED', canvas.width / 2, 1500);

        const arts = data.artifacts.slice(0, 5);
        const aS = 130, gap = 20;
        const tW = arts.length * aS + (arts.length - 1) * gap;
        let curX = (canvas.width - tW) / 2 + aS / 2;

        arts.forEach((art: any) => {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.beginPath(); ctx.arc(curX, 1600, aS / 2, 0, Math.PI * 2); ctx.fill();
          ctx.font = '65px sans-serif';
          ctx.fillText(art.icon, curX, 1620);
          curX += aS + gap;
        });
      }

      // 10. FOOTER
      if (showSeed) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`SEED: ${data.seedUsed}`, canvas.width / 2, 1800);
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = '900 24px sans-serif';
      ctx.fillText('CRIT 2048: ROGUELIKE', canvas.width / 2, 1880);

      canvas.toBlob(async (blob) => {
        if (!blob) return reject('Blob creation failed');
        const buffer = await blob.arrayBuffer();
        resolve(new Uint8Array(buffer));
      }, 'image/png');
    });
  }
};
