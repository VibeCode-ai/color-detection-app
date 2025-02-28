import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { color } = req.body;
    
    if (!color) {
      return res.status(400).json({ message: 'Color is required' });
    }
    
    // Try to use the backend API if available
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const response = await axios.post(`${backendUrl}/api/analyze-color`, { color });
      return res.status(200).json(response.data);
    } catch (backendError) {
      console.error('Backend API error:', backendError);
      
      // Fallback to local calculations if backend fails
      // Extract RGB from hex
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      // Generate complementary color (opposite on color wheel)
      const complementary = `#${(255 - r).toString(16).padStart(2, '0')}${(255 - g).toString(16).padStart(2, '0')}${(255 - b).toString(16).padStart(2, '0')}`;
      
      // Generate analogous colors
      const analogous1 = `#${Math.min(255, Math.max(0, r + 30)).toString(16).padStart(2, '0')}${Math.min(255, Math.max(0, g - 30)).toString(16).padStart(2, '0')}${Math.min(255, Math.max(0, b - 30)).toString(16).padStart(2, '0')}`;
      const analogous2 = `#${Math.min(255, Math.max(0, r - 30)).toString(16).padStart(2, '0')}${Math.min(255, Math.max(0, g + 30)).toString(16).padStart(2, '0')}${Math.min(255, Math.max(0, b + 30)).toString(16).padStart(2, '0')}`;
      
      // Simple color naming
      let colorName = 'Mixed';
      if (r > 200 && g > 200 && b > 200) colorName = 'White';
      else if (r < 50 && g < 50 && b < 50) colorName = 'Black';
      else if (r > 200 && g < 100 && b < 100) colorName = 'Red';
      else if (r < 100 && g > 200 && b < 100) colorName = 'Green';
      else if (r < 100 && g < 100 && b > 200) colorName = 'Blue';
      else if (r > 200 && g > 200 && b < 100) colorName = 'Yellow';
      else if (r > 200 && g < 100 && b > 200) colorName = 'Magenta';
      else if (r < 100 && g > 200 && b > 200) colorName = 'Cyan';
      else if (r > g && r > b) colorName = 'Reddish';
      else if (g > r && g > b) colorName = 'Greenish';
      else if (b > r && b > g) colorName = 'Bluish';
      
      return res.status(200).json({
        color_name: colorName,
        complementary_colors: [complementary, analogous1, analogous2]
      });
    }
  } catch (error) {
    console.error('Error analyzing color:', error);
    return res.status(500).json({ message: 'Error analyzing color', error: error.message });
  }
}
