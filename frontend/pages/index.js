import { useState } from 'react';
import Head from 'next/head';
import ImageUploader from '../components/ImageUploader';
import ColorPicker from '../components/ColorPicker';
import ColorAnalysis from '../components/ColorAnalysis';
import ColorDistance from '../components/ColorDistance';

export default function Home() {
  const [imageData, setImageData] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [comparisonColors, setComparisonColors] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handleImageUpload = async (file) => {
    setIsAnalyzing(true);
    
    try {
      // Create a URL for the uploaded image file
      const imageUrl = URL.createObjectURL(file);
      
      // Set image data with URL and dimensions
      const img = new Image();
      img.onload = () => {
        setImageData({
          url: imageUrl,
          file: file,
          width: img.width,
          height: img.height
        });
        setIsAnalyzing(false);
      };
      img.src = imageUrl;
    } catch (err) {
      console.error('Error processing image:', err);
      setIsAnalyzing(false);
    }
  };
  
  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };
  
  const addComparisonColor = (color) => {
    // Don't add duplicate colors
    if (comparisonColors.some(c => c.hex === color.hex)) {
      return;
    }
    setComparisonColors([...comparisonColors, color]);
  };
  
  const removeComparisonColor = (index) => {
    const newColors = [...comparisonColors];
    newColors.splice(index, 1);
    setComparisonColors(newColors);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Color Detection App</title>
        <meta name="description" content="Analyze and compare colors from images" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Color Detection App
        </h1>
        
        <div className="mb-8">
          <ImageUploader onImageUpload={handleImageUpload} isAnalyzing={isAnalyzing} />
        </div>
        
        {imageData && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Pick a Color
            </h2>
            <ColorPicker 
              imageData={imageData} 
              onColorSelect={handleColorSelect}
              addComparisonColor={addComparisonColor}
            />
          </div>
        )}
        
        {selectedColor && (
          <div className="mb-8">
            <ColorAnalysis color={selectedColor} addComparisonColor={addComparisonColor} />
          </div>
        )}
        
        {comparisonColors.length > 0 && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Color Comparisons ({comparisonColors.length})
              </h2>
              
              <div className="flex flex-wrap gap-4">
                {comparisonColors.map((color, index) => (
                  <div key={index} className="relative group">
                    <div 
                      className="w-16 h-16 rounded-md border border-gray-200"
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <div className="text-xs mt-1 text-center">{color.hex}</div>
                    <button
                      onClick={() => removeComparisonColor(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove color"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <ColorDistance colors={comparisonColors} />
          </div>
        )}
      </main>
      
      <footer className="mt-12 py-6 bg-gray-800 text-white text-center">
        <p>Color Detection App - Analyze and compare colors from images</p>
      </footer>
    </div>
  );
}
