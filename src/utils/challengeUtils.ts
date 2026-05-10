/**
 * Utility for encoding and decoding challenge data into URL parameters.
 */

export interface ChallengeData {
  s: string; // seed
  sc: number; // score
  m: number; // merges
  d: number; // total damage
  mx: number; // max damage
  mv: number; // moves
  n?: string; // class name
  i?: string; // class icon
}

export const ChallengeUtils = {
  /**
   * Encodes challenge data into a compact URL-safe string.
   * Format: seed|score|merges|totalDamage|maxDamage|moves|name|icon
   */
  encode(data: ChallengeData): string {
    try {
      const parts = [data.s, data.sc, data.m, data.d, data.mx, data.mv, data.n || '', data.i || ''];
      const raw = parts.join('|');
      // Use URL-safe base64
      return btoa(encodeURIComponent(raw))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    } catch (e) {
      console.error('Failed to encode challenge data:', e);
      return '';
    }
  },

  /**
   * Decodes challenge data from a compact URL-safe string.
   */
  decode(str: string): ChallengeData | null {
    try {
      // Restore base64 characters
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      const raw = decodeURIComponent(atob(base64));
      const p = raw.split('|');

      return {
        s: p[0],
        sc: parseInt(p[1]),
        m: parseInt(p[2]),
        d: parseInt(p[3]),
        mx: parseInt(p[4]),
        mv: parseInt(p[5]),
        n: p[6],
        i: p[7],
      };
    } catch (e) {
      console.error('Failed to decode challenge data:', e);
      return null;
    }
  },

  /**
   * Generates a full challenge URL.
   */
  generateUrl(data: ChallengeData): string {
    const encoded = this.encode(data);
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('c', encoded);
    return url.toString();
  },

  /**
   * Parses challenge data from the current URL.
   */
  parseUrl(): ChallengeData | null {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('c');
    if (!encoded) return null;
    return this.decode(encoded);
  },
};
