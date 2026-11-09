export function hexToRgb(hex: string | number): string {
  if (typeof hex === 'string' && hex.indexOf('rgb') !== -1) {
    return hex as string;
  }

  let hexString: string;

  if (typeof hex === 'number') {
    hexString = hex.toString(16).padStart(6, '0');
  } else {
    hexString = hex.replace(/^#/, '');
  }

  if (hexString.length === 3) {
    hexString = hexString
      .split('')
      .map(c => c + c)
      .join('');
  }

  if (hexString.length !== 6) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const r = parseInt(hexString.slice(0, 2), 16);
  const g = parseInt(hexString.slice(2, 4), 16);
  const b = parseInt(hexString.slice(4, 6), 16);

  return `rgb(${r}, ${g}, ${b})`;
}
