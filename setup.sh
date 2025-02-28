#!/bin/bash

# Create main directories
mkdir -p frontend/pages/api
mkdir -p frontend/components
mkdir -p frontend/styles
mkdir -p frontend/utils
mkdir -p frontend/public
mkdir -p backend/ml
mkdir -p backend/utils

# Create frontend files
touch frontend/pages/index.js
touch frontend/pages/_app.js
touch frontend/components/ImageUploader.js
touch frontend/components/ColorPicker.js
touch frontend/components/ColorAnalysis.js
touch frontend/components/DominantColors.js
touch frontend/components/ColorDistance.js
touch frontend/styles/globals.css
touch frontend/utils/colorUtils.js
touch frontend/utils/apiClient.js
touch frontend/package.json
touch frontend/next.config.js

# Create backend files
touch backend/app.py
touch backend/ml/color_extractor.py
touch backend/ml/color_classifier.py
touch backend/ml/complementary_colors.py
touch backend/utils/image_processor.py
touch backend/utils/color_distance.py
touch backend/requirements.txt
touch backend/Dockerfile

# Create README
touch README.md

echo "Project structure created successfully!"
