import { useState } from 'react';
import { rgbToHex } from '../utils/colorUtils';

const DominantColors = ({ imageUrl, addComparisonColor, colors: propColors }) => {
  const [dominantColors, setDominantColors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedInfo, setExpandedInfo] = useState(null);
  
  // Use prop colors if provided, otherwise use extracted colors
  const colors = propColors || dominantColors;

  const extractColors = async () => {
    if (!imageUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/extract-colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract colors');
      }
      
      const data = await response.json();
      setDominantColors(data.colors.map(color => ({
        hex: rgbToHex(color.r, color.g, color.b),
        rgb: { r: color.r, g: color.g, b: color.b },
        percentage: color.percentage,
        hsl: color.hsl,
        name: color.name
      })));
    } catch (err) {
      console.error('Error extracting colors:', err);
      setError('Failed to extract colors from the image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorClick = (color) => {
    if (typeof onColorSelect === 'function') {
      onColorSelect(color);
    } else {
      addComparisonColor(color);
    }
  };
  
  const toggleColorInfo = (index) => {
    if (expandedInfo === index) {
      setExpandedInfo(null);
    } else {
      setExpandedInfo(index);
    }
  };

  // If no image URL and no prop colors, don't render anything
  if (!imageUrl && !propColors) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Dominant Colors</h2>
      
      {/* Extraction button when using imageUrl and no colors yet */}
      {imageUrl && !colors.length && !isLoading && (
        <button
          onClick={extractColors}
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Extract Colors
        </button>
      )}
      
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-500">Extracting colors...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 my-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={extractColors}
            className="mt-2 text-sm text-red-500 hover:text-red-700"
          >
            Try Again
          </button>
        </div>
      )}
      
      {colors.length > 0 && (
        <div className="space-y-3">
          {colors.map((color, index) => (
            <div 
              key={index}
              className="border border-gray-100 rounded-lg overflow-hidden"
            >
              <div className="flex items-center">
                <div 
                  className="w-14 h-14 shrink-0 cursor-pointer"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleColorClick(color)}
                ></div>
                
                <div className="px-4 py-2 flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{color.hex}</p>
                      <p className="text-xs text-gray-500">
                        Coverage: {color.percentage.toFixed(1)}%
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => addComparisonColor(color)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        Compare
                      </button>
                      
                      <button
                        onClick={() => toggleColorInfo(index)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                      >
                        {expandedInfo === index ? 'Less' : 'More'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {expandedInfo === index && (
                <div className="bg-gray-50 p-4 text-sm border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-700 font-medium">RGB</p>
                      <p>
                        R: {color.rgb.r}<br />
                        G: {color.rgb.g}<br />
                        B: {color.rgb.b}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-700 font-medium">HSL</p>
                      <p>
                        H: {Math.round(color.hsl?.h || 0)}<br />
                        S: {Math.round((color.hsl?.s || 0) * 100)}%<br />
                        L: {Math.round((color.hsl?.l || 0) * 100)}%
                      </p>
                    </div>
                  </div>
                  
                  {color.name && (
                    <div className="mt-3">
                      <p className="text-gray-700 font-medium">Closest Named Color</p>
                      <p>{color.name}</p>
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(color.hex);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Copy HEX
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DominantColors;
