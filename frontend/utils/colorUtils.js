/**
 * Utility functions for working with colors
 */

// Convert RGB to HEX
export const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.floor(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Convert HEX to RGB
export const hexToRgb = (hex) => {
  // Remove the # if it exists
  const cleanHex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return { r, g, b };
};

// Calculate Euclidean distance between two RGB colors
export const getColorDistance = (rgb1, rgb2) => {
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;
  
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
};

// Convert RGB to HSL
export const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: break;
    }
    
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

// Get contrast text color (black or white) based on background color
export const getContrastColor = (hex) => {
  const rgb = hexToRgb(hex);
  // Use YIQ formula to determine brightness
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  // Return black for bright colors, white for dark colors
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

// Generate complementary color
export const getComplementaryColor = (hex) => {
  const rgb = hexToRgb(hex);
  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
};

// Calculate Delta E (CIE76) between two colors
export const getDeltaE76 = (rgb1, rgb2) => {
  // Simplified implementation - for production use a proper color library
  const lab1 = rgbToLab(rgb1);
  const lab2 = rgbToLab(rgb2);
  
  const deltaL = lab1.l - lab2.l;
  const deltaA = lab1.a - lab2.a;
  const deltaB = lab1.b - lab2.b;
  
  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
};

// Helper function to convert RGB to Lab color space (simplified)
export const rgbToLab = (rgb) => {
  // Convert to normalized values
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;
  
  // Apply gamma correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  
  // Convert to XYZ
  let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  let z = r * 0.0193 + g * 0.1192 + b * 0.9505;
  
  // Normalize XYZ values
  x /= 0.95047;
  y /= 1.00000;
  z /= 1.08883;
  
  // Apply cube root transformation
  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);
  
  // Calculate Lab values
  const l = (116 * y) - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);
  
  return { l, a, b };
};
