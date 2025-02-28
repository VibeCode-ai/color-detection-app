from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from ml.color_extractor import extract_dominant_colors
from ml.color_classifier import classify_color
from ml.complementary_colors import get_complementary_colors
from utils.image_processor import process_image
from utils.color_distance import calculate_color_distance

app = Flask(__name__)
CORS(app)


@app.route("/api/upload", methods=["POST"])
def upload_image():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files["image"]
    img = process_image(image_file)

    # Process the image and return dominant colors
    dominant_colors = extract_dominant_colors(img)

    return jsonify({"dominant_colors": dominant_colors})


@app.route("/api/analyze", methods=["POST"])
def analyze_color():
    data = request.json
    if "color" not in data:
        return jsonify({"error": "No color provided"}), 400

    color = data["color"]  # Hex color code

    # Analyze the color
    color_name = classify_color(color)
    complementary_colors = get_complementary_colors(color)

    return jsonify(
        {"color_name": color_name, "complementary_colors": complementary_colors}
    )


@app.route("/api/color-distance", methods=["POST"])
def color_distance():
    data = request.json
    if "color1" not in data or "color2" not in data:
        return jsonify({"error": "Two colors are required"}), 400

    color1 = data["color1"]
    color2 = data["color2"]

    distance = calculate_color_distance(color1, color2)

    return jsonify({"distance": distance})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
