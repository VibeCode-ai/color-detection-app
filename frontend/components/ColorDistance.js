import { useEffect, useState } from 'react';

export default function ColorDistance({ colors = [], color1, color2 }) {
  const [distances, setDistances] = useState(null);
  const [multiDistances, setMultiDistances] = useState([]);
  
  // Handle comparing two specific colors
  useEffect(() => {
    if (!color1 || !color2) return;
    
    // Calculate various color distances
    const calculatedDistances = {
      euclidean: calculateEuclideanDistance(color1.rgb, color2.rgb),
      deltaE76: calculateDeltaE76(color1.rgb, color2.rgb),
      // More sophisticated distance calculations would typically be done on the backend
    };
    
    setDistances(calculatedDistances);
  }, [color1, color2]);
  
  // Handle comparing multiple colors
  useEffect(() => {
    if (colors.length < 2) {
      setMultiDistances([]);
      return;
    }
    
    // Calculate distances between all color pairs
    const newDistances = [];
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const c1 = colors[i];
        const c2 = colors[j];
        
        const euclidean = calculateEuclideanDistance(c1.rgb, c2.rgb);
        const deltaE = calculateDeltaE76(c1.rgb, c2.rgb);
        const similarity = getSimilarityPercentage(euclidean);
        
        newDistances.push({
          color1: c1,
          color2: c2,
          euclidean,
          deltaE,
          similarity,
          description: getSimilarityText(parseFloat(similarity))
        });
      }
    }
    
    setMultiDistances(newDistances);
  }, [colors]);
  
  // Euclidean distance in RGB space
  const calculateEuclideanDistance = (rgb1, rgb2) => {
    const rDiff = rgb1.r - rgb2.r;
    const gDiff = rgb1.g - rgb2.g;
    const bDiff = rgb1.b - rgb2.b;
    
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
  };
  
  // Simple Delta E CIE76 calculation (more complex versions would be implemented on backend)
  const calculateDeltaE76 = (rgb1, rgb2) => {
    // Convert RGB to Lab (simplified)
    const lab1 = rgbToLab(rgb1);
    const lab2 = rgbToLab(rgb2);
    
    // Calculate Euclidean distance in Lab space
    const lDiff = lab1.l - lab2.l;
    const aDiff = lab1.a - lab2.a;
    const bDiff = lab1.b - lab2.b;
    
    return Math.sqrt(lDiff * lDiff + aDiff * aDiff + bDiff * bDiff);
  };
  
  // Simplified RGB to Lab conversion
  const rgbToLab = (rgb) => {
    // Note: This is a simplified conversion for demo purposes
    // In production, use a proper color conversion library
    
    // Normalize RGB values
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;
    
    // Apply gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    
    // Convert to XYZ
    r *= 100;
    g *= 100;
    b *= 100;
    
    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    
    // Convert XYZ to Lab
    const xRef = 95.047;
    const yRef = 100;
    const zRef = 108.883;
    
    const xNorm = x / xRef;
    const yNorm = y / yRef;
    const zNorm = z / zRef;
    
    const fx = xNorm > 0.008856 ? Math.pow(xNorm, 1/3) : (7.787 * xNorm) + (16 / 116);
    const fy = yNorm > 0.008856 ? Math.pow(yNorm, 1/3) : (7.787 * yNorm) + (16 / 116);
    const fz = zNorm > 0.008856 ? Math.pow(zNorm, 1/3) : (7.787 * zNorm) + (16 / 116);
    
    const l = (116 * fy) - 16;
    const a = 500 * (fx - fy);
    const b = 200 * (fy - fz);
    
    return { l, a, b };
  };
  
  // Get percentage similarity based on Euclidean distance
  const getSimilarityPercentage = (euclideanDistance) => {
    // Max possible distance in RGB space is sqrt(255^2 + 255^2 + 255^2) = 441.7
    const maxDistance = 441.7;
    const similarity = Math.max(0, 100 - (euclideanDistance / maxDistance) * 100);
    
    return similarity.toFixed(1);
  };
  
  // Get descriptive similarity text
  const getSimilarityText = (percentage) => {
    if (percentage > 95) return 'Nearly identical';
    if (percentage > 90) return 'Very similar';
    if (percentage > 80) return 'Similar';
    if (percentage > 70) return 'Somewhat similar';
    if (percentage > 50) return 'Moderately different';
    if (percentage > 30) return 'Different';
    return 'Very different';
  };
  
  // Render comparison between two specific colors
  const renderColorPairComparison = () => {
    if (!color1 || !color2 || !distances) return null;
    
    const similarityPercentage = getSimilarityPercentage(distances.euclidean);
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Color Comparison</h3>
        
        <div className="flex items-center space-x-6 mb-6">
          <div className="flex flex-col items-center">
            <div 
              className="w-12 h-12 rounded-md border border-gray-200"
              style={{ backgroundColor: color1.hex }}
            ></div>
            <p className="text-xs mt-1">{color1.hex}</p>
          </div>
          
          <div className="text-gray-400">vs</div>
          
          <div className="flex flex-col items-center">
            <div 
              className="w-12 h-12 rounded-md border border-gray-200"
              style={{ backgroundColor: color2.hex }}
            ></div>
            <p className="text-xs mt-1">{color2.hex}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Similarity</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    {getSimilarityText(parseFloat(similarityPercentage))}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {similarityPercentage}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div 
                  style={{ width: `${similarityPercentage}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Euclidean Distance</h4>
              <p className="text-xl font-bold">{distances.euclidean.toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                sqrt((R1-R2)² + (G1-G2)² + (B1-B2)²)
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Delta E (CIE76)</h4>
              <p className="text-xl font-bold">{distances.deltaE76.toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                Perceptual color difference
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render comparison between multiple colors
  const renderMultiColorComparison = () => {
    if (multiDistances.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Color Distance</h3>
          <p className="text-gray-500">Add at least two colors to compare</p>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Color Distances</h3>
        
        <div className="space-y-4">
          {multiDistances.map((item, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: item.color1.hex }} />
                <span>vs</span>
                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: item.color2.hex }} />
              </div>
              
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Similar</span>
                  <span>Different</span>
                </div>
                
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${item.similarity}%` }}
                  />
                </div>
                
                <div className="mt-2 text-sm">
                  <p><strong>Similarity:</strong> {item.similarity}% ({item.description})</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-1">
                    <p>Euclidean: {item.euclidean.toFixed(2)}</p>
                    <p>Delta E: {item.deltaE.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-600 border-t pt-2">
          <p><strong>About these metrics:</strong></p>
          <ul className="list-disc pl-5 mt-1 text-xs">
            <li>Euclidean distance measures straight-line distance in RGB space (0-441.7)</li>
            <li>Delta E is a measure of perceptual difference between colors (CIE76 standard)</li>
          </ul>
        </div>
      </div>
    );
  };
  
  // Choose which view to render based on provided props
  return (color1 && color2) ? renderColorPairComparison() : renderMultiColorComparison();
}
