import { useEffect, useState } from 'react';
import { rgbToHex } from '../utils/colorUtils';

const ColorAnalysis = ({ color, addComparisonColor }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!color) return;

    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch from API first
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ color: color.hex }),
        });
        
        if (!response.ok) {
          throw new Error('API request failed');
        }
        
        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error('Error analyzing color:', error);
        setError('Failed to fetch color analysis. Using local approximation.');
        
        // Fallback to local analysis when API fails
        const colorName = getApproximateColorName(color.rgb);
        const complementaryColors = generateComplementaryColors(color.rgb);
        
        setAnalysis({
          color_name: colorName,
          complementary_colors: complementaryColors.map(c => c.hex)
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [color]);

  // Simple function to approximate color names based on RGB values
  const getApproximateColorName = (rgb) => {
    const { r, g, b } = rgb;
    
    // Very simplified color naming logic
    if (r > 200 && g > 200 && b > 200) return 'White';
    if (r < 50 && g < 50 && b < 50) return 'Black';
    
    if (r > 200 && g < 100 && b < 100) return 'Red';
    if (r < 100 && g > 200 && b < 100) return 'Green';
    if (r < 100 && g < 100 && b > 200) return 'Blue';
    
    if (r > 200 && g > 200 && b < 100) return 'Yellow';
    if (r > 200 && g < 100 && b > 200) return 'Magenta';
    if (r < 100 && g > 200 && b > 200) return 'Cyan';
    
    if (r > g && r > b) return 'Reddish';
    if (g > r && g > b) return 'Greenish';
    if (b > r && b > g) return 'Bluish';
    
    return 'Mixed';
  };
  
  // Generate complementary colors (simplified algorithm)
  const generateComplementaryColors = (rgb) => {
    const { r, g, b } = rgb;
    
    // Complementary color (opposite on color wheel)
    const complementary = {
      r: 255 - r,
      g: 255 - g,
      b: 255 - b
    };
    
    // Analogous colors (adjacent on color wheel)
    const analogous1 = {
      r: Math.min(255, Math.max(0, r + 30)),
      g: Math.min(255, Math.max(0, g - 30)),
      b: Math.min(255, Math.max(0, b - 30))
    };
    
    const analogous2 = {
      r: Math.min(255, Math.max(0, r - 30)),
      g: Math.min(255, Math.max(0, g + 30)),
      b: Math.min(255, Math.max(0, b + 30))
    };
    
    return [
      { 
        rgb: complementary, 
        hex: rgbToHex(complementary.r, complementary.g, complementary.b),
        name: 'Complementary'
      },
      { 
        rgb: analogous1, 
        hex: rgbToHex(analogous1.r, analogous1.g, analogous1.b),
        name: 'Analogous 1'
      },
      { 
        rgb: analogous2, 
        hex: rgbToHex(analogous2.r, analogous2.g, analogous2.b),
        name: 'Analogous 2'
      }
    ];
  };
  
  // Helper function to convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.floor(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  if (!color) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Color Analysis</h3>
      
      <div className="flex items-center mb-5">
        <div 
          className="w-16 h-16 rounded-lg shadow-inner mr-4 border border-gray-200" 
          style={{ backgroundColor: color.hex }}
        />
        
        <div>
          <p className="font-medium">{analysis?.color_name || 'Analyzing...'}</p>
          <p className="text-sm text-gray-500">{color.hex}</p>
          <p className="text-xs text-gray-500">
            RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
          </p>
          
          <button
            className="text-sm text-blue-500 hover:text-blue-700 mt-1 flex items-center"
            onClick={() => addComparisonColor(color)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add to comparison
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 text-yellow-800 p-2 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Analyzing color...</p>
        </div>
      ) : analysis?.complementary_colors ? (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-3">Color Harmony</h4>
          <div className="grid grid-cols-3 gap-3">
            {analysis.complementary_colors.map((complementary, index) => {
              // This creates an object structure compatible with the addComparisonColor function
              const complementaryColor = {
                hex: complementary,
                rgb: {
                  r: parseInt(complementary.slice(1, 3), 16),
                  g: parseInt(complementary.slice(3, 5), 16),
                  b: parseInt(complementary.slice(5, 7), 16)
                },
                hsl: {
                  h: 0, // These would need proper calculation
                  s: 0,
                  l: 0
                }
              };
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-12 h-12 rounded-md border border-gray-200" 
                    style={{ backgroundColor: complementary }}
                  ></div>
                  <p className="text-xs mt-1">{complementary}</p>
                  <button
                    className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                    onClick={() => addComparisonColor(complementaryColor)}
                  >
                    Add to comparison
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ColorAnalysis;
