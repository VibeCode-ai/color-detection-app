# Color Detection App

AI-powered application for color detection and analysis.

## Features

- Image upload and display
- Color picking from uploaded images
- Dominant color extraction
- Color classification
- Complementary color suggestions
- Color distance calculation

## Tech Stack

### Frontend
- Next.js
- React
- Axios for API requests

### Backend
- Flask
- OpenCV
- scikit-learn for color classification
- NumPy for numerical operations

## Project Structure

```
color-detection-app/
├── frontend/                 # Next.js frontend
│   ├── pages/
│   │   ├── index.js          # Main application page
│   │   ├── _app.js           # App wrapper
│   │   └── api/              # API routes for serverless functions
│   ├── components/
│   │   ├── ImageUploader.js  # Image upload component
│   │   ├── ColorPicker.js    # Interactive color picker
│   │   ├── ColorAnalysis.js  # Color analysis display
│   │   ├── DominantColors.js # Dominant colors display
│   │   └── ColorDistance.js  # Color distance calculator
│   ├── styles/
│   │   └── globals.css       # Global styles
│   ├── utils/
│   │   ├── colorUtils.js     # Color utility functions
│   │   └── apiClient.js      # API client for backend
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   └── next.config.js        # Next.js configuration
├── backend/                  # Flask backend
│   ├── app.py                # Main Flask application
│   ├── ml/
│   │   ├── color_extractor.py # Color extraction module
│   │   ├── color_classifier.py # Color classification model
│   │   └── complementary_colors.py # Complementary color prediction
│   ├── utils/
│   │   ├── image_processor.py # Image processing utilities
│   │   └── color_distance.py  # Color distance calculations
│   └── requirements.txt      # Backend dependencies
```

## Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The API will be available at http://localhost:5000

## License

MIT
