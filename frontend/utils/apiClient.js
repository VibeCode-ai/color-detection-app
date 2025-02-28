// Determine API base URL based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production'
    ? 'https://your-backend-api-url.com/api' // Replace with your production backend URL
    : '/api');

export const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Error uploading image');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const analyzeColor = async (hexColor) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ color: hexColor }),
    });
    
    if (!response.ok) throw new Error('Error analyzing color');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const calculateColorDistance = async (color1, color2) => {
  try {
    const response = await fetch(`${API_BASE_URL}/color-distance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ color1, color2 }),
    });
    
    if (!response.ok) throw new Error('Error calculating color distance');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
