color-detection-app/
├── .github/                  # GitHub configuration
│   └── workflows/            # GitHub Actions workflows
│       ├── deploy.yml        # Deployment workflow
│       └── deploy-docker.yml # Docker deployment workflow
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
│   ├── .dockerignore         # Docker ignore for frontend
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
│   ├── .dockerignore         # Docker ignore for backend
│   ├── requirements.txt      # Backend dependencies
│   └── Dockerfile            # For containerization
├── docker-compose.yml        # Base Docker Compose configuration
├── docker-compose.dev.yml    # Development environment overrides
├── docker-compose.prod.yml   # Production environment overrides
├── setup.sh                  # Project setup script
├── .gitignore                # Git ignore file
└── README.md                 # Project documentation
