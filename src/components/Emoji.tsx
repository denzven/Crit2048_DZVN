import React from 'react';
import { clsx } from 'clsx';
import { ASSET_MAP } from '../engine/assets';

interface EmojiProps {
  char: string;
  className?: string;
  active?: boolean;
  animateType?: 'spin' | 'bounce' | 'wiggle';
  assetKey?: string; // e.g., 'Barbarian', 'Ancient Dragon'
}

export const Emoji: React.FC<EmojiProps> = ({ 
  char, 
  className, 
  active = false, 
  animateType = 'wiggle',
  assetKey
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [loadedSrc, setLoadedSrc] = React.useState<string | null>(null);
  const effectiveActive = active || isHovered;

  // Asset Manager Override
  const asset = assetKey ? ASSET_MAP[assetKey] : null;
  const targetChar = asset ? asset.fallback : char;

  // Extract hex codepoint
  const codePoints = Array.from(targetChar)
    .map(c => c.codePointAt(0)!.toString(16))
    .filter(cp => cp !== 'fe0f');
  
  const fullCP = codePoints.join('_');
  const simpleCP = codePoints[0];

  // Asset URLs (Prefer semantic AssetManager paths)
  const localAnimated = asset?.animated || `/emojis/${fullCP}.webp`;
  const localStatic = asset?.static || `/emojis/${fullCP}.svg`;
  const remoteAnimated = `https://fonts.gstatic.com/s/e/notoemoji/latest/${fullCP}/512.webp`;
  const remoteSimpleAnimated = `https://fonts.gstatic.com/s/e/notoemoji/latest/${simpleCP}/512.webp`;
  const remoteStatic = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u${fullCP}.svg`;

  // Pre-load logic to avoid "glitching" (flickering)
  React.useEffect(() => {
    // Reset loaded src if not active
    if (!effectiveActive) {
      setLoadedSrc(null);
      return;
    }

    const tryLoad = async (urls: string[]) => {
      for (const url of urls) {
        try {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.crossOrigin = "anonymous";
            img.onload = resolve;
            img.onerror = reject;
          });
          setLoadedSrc(url);
          return; // Success!
        } catch (e) {
          continue; // Try next fallback
        }
      }
    };

    tryLoad([localAnimated, remoteAnimated, remoteSimpleAnimated]);
  }, [effectiveActive, fullCP, simpleCP]);

  // Determine final display source
  // If active, use the successfully loaded animated src, or fall back to static
  const displaySrc = (effectiveActive && loadedSrc) ? loadedSrc : localStatic;
  
  const animationClass = effectiveActive ? (
    animateType === 'spin' ? 'animate-gear-spin' :
    animateType === 'bounce' ? 'animate-bounce-subtle' :
    'animate-soft-wiggle'
  ) : '';

  return (
    <img 
      src={displaySrc}
      alt={char}
      crossOrigin="anonymous"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        "emoji inline-block align-middle transition-all duration-300", 
        effectiveActive ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" : "scale-100",
        animationClass, 
        className
      )}
      loading="lazy"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        // If the current displaySrc fails (e.g. localStatic is missing), fallback to remoteStatic
        if (target.src.includes(localStatic)) {
          target.src = remoteStatic;
        } else if (target.src.includes(remoteStatic)) {
          // Final fallback to text span if even remoteStatic fails
          const span = document.createElement('span');
          span.textContent = char;
          span.className = className || '';
          target.replaceWith(span);
        }
      }}
    />
  );
};
