import { useRef, useEffect, useState } from 'react';

export default function ColorPicker({ imageData, onColorSelect, addComparisonColor }) {
  const canvasRef = useRef(null);
  const [hoveredColor, setHoveredColor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [magnifier, setMagnifier] = useState({ show: false, x: 0, y: 0 });
  
  useEffect(() => {
    if (!imageData || !canvasRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas dimensions to match image (with max width constraints)
      const maxWidth = canvas.parentElement.clientWidth;
      const scale = Math.min(1, maxWidth / img.width);
      
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setError('Failed to load image. Please try again.');
    };
    
    img.src = imageData.url;
  }, [imageData]);
  
  const getPixelColor = (e) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    
    // Get pixel data
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    
    // Convert to RGB and HEX
    const rgb = {
      r: pixelData[0],
      g: pixelData[1],
      b: pixelData[2]
    };
    
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    return { rgb, hex, hsl, x, y };
  };
  
  const handleMouseMove = (e) => {
    const color = getPixelColor(e);
    if (color) {
      setHoveredColor(color);
      setMagnifier({
        show: true,
        x: e.clientX,
        y: e.clientY
      });
    }
  };
  
  const handleMouseLeave = () => {
    setMagnifier({ show: false, x: 0, y: 0 });
  };
  
  const handleClick = (e) => {
    const color = getPixelColor(e);
    if (color) {
      onColorSelect(color);
    }
  };
  
  const handleRightClick = (e) => {
    e.preventDefault();
    const color = getPixelColor(e);
    if (color) {
      addComparisonColor(color);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && hoveredColor) {
      onColorSelect(hoveredColor);
    }
  };
  
  // Helper function to convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };
  
  // Helper function to convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
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
      }
      
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };
  
  // Determine if text should be white or black based on background color
  const getContrastColor = (hex) => {
    // Remove the # if it exists
    const color = hex.replace('#', '');
    // Convert hex to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    // Calculate brightness (based on YIQ formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    // Return black for bright colors, white for dark colors
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };
  
  return (
    <div className="w-full">
      <div className="relative mb-4">
        {isLoading && (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-64 bg-red-50 text-red-600 rounded-lg border border-red-200">
            <p>{error}</p>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onContextMenu={handleRightClick}
          onKeyDown={handleKeyDown}
          tabIndex="0"
          aria-label="Color picker canvas - navigate and press enter to select a color"
          className={`w-full cursor-crosshair border border-gray-200 rounded-lg ${isLoading || error ? 'hidden' : 'block'}`}
        />
        
        {hoveredColor && !isLoading && !error && (
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-md border border-gray-300" 
              style={{ backgroundColor: hoveredColor.hex }}
            ></div>
            <div>
              <p className="text-sm font-medium">{hoveredColor.hex}</p>
              <p className="text-xs text-gray-500">
                RGB({hoveredColor.rgb.r}, {hoveredColor.rgb.g}, {hoveredColor.rgb.b})
              </p>
              <p className="text-xs text-gray-500">
                HSL({hoveredColor.hsl.h}°, {hoveredColor.hsl.s}%, {hoveredColor.hsl.l}%)
              </p>
            </div>
          </div>
        )}
        
        {magnifier.show && hoveredColor && !isLoading && !error && (
          <div 
            className="absolute w-24 h-24 rounded-full shadow-lg border-2 border-white overflow-hidden pointer-events-none"
            style={{
              left: Math.min(magnifier.x + 20, window.innerWidth - 100),
              top: Math.min(magnifier.y - 120, window.innerHeight - 120),
              backgroundColor: hoveredColor.hex,
              zIndex: 20,
            }}
          >
            <div 
              className="absolute inset-x-0 bottom-0 text-center py-1 text-xs font-medium"
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: '#fff'
              }}
            >
              {hoveredColor.hex}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-600 italic flex justify-between">
        <p>Click to select a color. Right-click to add to comparison.</p>
        <p className="font-medium text-purple-600">Use keyboard navigation with Tab and Enter</p>
      </div>
    </div>
  );
}
