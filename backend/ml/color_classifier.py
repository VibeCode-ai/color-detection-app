from backend.utils.color_utils import hex_to_rgb
import math
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
import json
import os

# Basic color name mapping
BASIC_COLORS = {
    "red": [255, 0, 0],
    "green": [0, 255, 0],
    "blue": [0, 0, 255],
    "yellow": [255, 255, 0],
    "cyan": [0, 255, 255],
    "magenta": [255, 0, 255],
    "white": [255, 255, 255],
    "black": [0, 0, 0],
    "gray": [128, 128, 128],
    "orange": [255, 165, 0],
    "purple": [128, 0, 128],
    "brown": [165, 42, 42],
    "pink": [255, 192, 203],
    "lime": [0, 255, 0],
    "navy": [0, 0, 128],
    "teal": [0, 128, 128],
    "indigo": [75, 0, 130],
    "violet": [238, 130, 238],
}


class ColorClassifier:
    def __init__(self):
        self.model = None
        self.color_names = self._load_color_names()
        self._build_model()

    def _load_color_names(self):
        """Load color names database or use a simplified one if not available"""
        try:
            # In a real app, you would load a comprehensive color name database
            with open("color_names.json", "r") as f:
                return json.load(f)
        except:
            # Use our existing BASIC_COLORS
            return BASIC_COLORS

    def _build_model(self):
        """Build a simple neural network for color classification"""
        # In a real app, this would be a pre-trained model loaded from disk
        # For demo purposes, we'll create a simple model structure

        model = models.Sequential(
            [
                layers.Dense(64, activation="relu", input_shape=(3,)),
                layers.Dense(128, activation="relu"),
                layers.Dense(64, activation="relu"),
                layers.Dense(len(self.color_names), activation="softmax"),
            ]
        )

        model.compile(
            optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"]
        )

        self.model = model

    def train(self, epochs=50):
        """Train the model with color data"""
        # In a real app, this would use a comprehensive dataset
        # For demo purposes, we'll use our simple color names

        # Create training data from our color names
        X = np.array([color for color in self.color_names.values()]) / 255.0

        # One-hot encode the labels
        y = np.eye(len(self.color_names))

        # Train the model
        self.model.fit(X, y, epochs=epochs, verbose=0)

    def predict_color_name(self, rgb):
        """Predict the name of a color based on RGB values"""
        # Normalize RGB values
        rgb_normalized = np.array([[rgb[0], rgb[1], rgb[2]]]) / 255.0

        # If model is not trained, use nearest neighbor approach
        if self.model is None:
            return self._nearest_color_name(rgb)

        # Make prediction
        prediction = self.model.predict(rgb_normalized)[0]
        color_index = np.argmax(prediction)

        # Get color name
        color_name = list(self.color_names.keys())[color_index]
        confidence = float(prediction[color_index])

        return {"name": color_name, "confidence": confidence}

    def _nearest_color_name(self, rgb):
        """Find the nearest color name using Euclidean distance"""
        min_distance = float("inf")
        nearest_color = None

        for name, color_rgb in self.color_names.items():
            distance = np.sqrt(
                (rgb[0] - color_rgb[0]) ** 2
                + (rgb[1] - color_rgb[1]) ** 2
                + (rgb[2] - color_rgb[2]) ** 2
            )

            if distance < min_distance:
                min_distance = distance
                nearest_color = name

        # Calculate confidence based on distance
        # Lower distance = higher confidence
        max_possible_distance = 441.7  # sqrt(255^2 + 255^2 + 255^2)
        confidence = 1 - (min_distance / max_possible_distance)

        return {"name": nearest_color, "confidence": float(confidence)}

    def predict_complementary_colors(self, rgb):
        """Predict complementary colors for a given RGB value"""
        # Convert to numpy array
        rgb = np.array(rgb)

        # Complementary color (opposite on color wheel)
        complementary = 255 - rgb

        # Analogous colors (adjacent on color wheel)
        # This is a simplified approach
        analogous1 = np.clip(rgb + [30, -30, -30], 0, 255)
        analogous2 = np.clip(rgb + [-30, 30, 30], 0, 255)

        # Triadic colors (form a triangle on color wheel)
        # Again, simplified
        hue_shift = 120  # 120 degrees on color wheel
        # In a real app, this would use proper HSL conversion and shifting

        # For demo, we'll just create some variations
        triadic1 = np.array([rgb[1], rgb[2], rgb[0]])  # Cycle the values
        triadic2 = np.array([rgb[2], rgb[0], rgb[1]])  # Cycle again

        result = {
            "complementary": complementary.tolist(),
            "analogous": [analogous1.tolist(), analogous2.tolist()],
            "triadic": [triadic1.tolist(), triadic2.tolist()],
        }

        return result


# For backward compatibility with existing code
def classify_color(hex_color):
    """
    Classify a color by finding the closest named color

    Args:
        hex_color (str): Hex color code

    Returns:
        str: Name of the closest color
    """
    # Convert hex to RGB
    r, g, b = hex_to_rgb(hex_color)

    # Use our classifier for more accurate results
    classifier = ColorClassifier()
    result = classifier._nearest_color_name([r, g, b])

    return result["name"]


def get_color_description(hex_color):
    """
    Get a more detailed description of a color

    Args:
        hex_color (str): Hex color code

    Returns:
        dict: Color description with properties
    """
    r, g, b = hex_to_rgb(hex_color)

    # Use classifier for base name and confidence
    classifier = ColorClassifier()
    result = classifier._nearest_color_name([r, g, b])
    base_name = result["name"]
    confidence = result["confidence"]

    # Determine brightness
    brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    # Determine saturation
    max_val = max(r, g, b) / 255
    min_val = min(r, g, b) / 255
    saturation = 0 if max_val == 0 else (max_val - min_val) / max_val

    # Qualitative descriptions
    brightness_desc = (
        "dark" if brightness < 0.4 else "bright" if brightness > 0.7 else "medium"
    )
    saturation_desc = (
        "grayish" if saturation < 0.3 else "vivid" if saturation > 0.8 else ""
    )

    # Combine descriptions
    if saturation_desc:
        full_description = f"{brightness_desc} {saturation_desc} {base_name}"
    else:
        full_description = f"{brightness_desc} {base_name}"

    return {
        "name": base_name,
        "fullDescription": full_description,
        "confidence": confidence,
        "brightness": brightness,
        "saturation": saturation,
        "properties": {"brightness": brightness_desc, "saturation": saturation_desc},
    }


# Usage example
if __name__ == "__main__":
    classifier = ColorClassifier()
    classifier.train(epochs=10)

    # Test prediction
    test_color = [255, 0, 0]  # Red
    color_name = classifier.predict_color_name(test_color)
    comp_colors = classifier.predict_complementary_colors(test_color)

    print(f"Color name: {color_name}")
    print(f"Complementary colors: {comp_colors}")
