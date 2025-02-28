from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from ml.color_extractor import extract_dominant_colors
from ml.color_classifier import classify_color
from ml.complementary_colors import get_complementary_colors
from utils.image_processor import process_image, allowed_file
from utils.color_distance import calculate_color_distance
from backend.utils.color_utils import rgb_to_hex, rgb_to_hsl, hex_to_rgb

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max upload


@app.route("/api/upload", methods=["POST"])
def upload_image():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files["image"]

    # Check if file is empty
    if image_file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Check file extension
    if not allowed_file(image_file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    img = process_image(image_file)

    # Process the image and return dominant colors
    dominant_colors = extract_dominant_colors(img)

    return jsonify({"dominant_colors": dominant_colors})


@app.route("/api/analyze", methods=["POST"])
def analyze_image():
    # Check if image was uploaded
    if "image" not in request.files:
        return jsonify({"error": "No image part"}), 400

    file = request.files["image"]

    # Check if file is empty
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Check file extension
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    # Save file
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    try:
        # Extract dominant colors
        dominant_colors = extract_dominant_colors(file_path)

        # Get image dimensions
        height, width = process_image(file_path, get_dimensions_only=True)

        # Prepare response
        response = {"dominantColors": dominant_colors, "width": width, "height": height}

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # Clean up - remove uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)


@app.route("/api/analyze-color", methods=["POST"])
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
def color_distance_api():
    data = request.json

    if not data or "color1" not in data or "color2" not in data:
        return jsonify({"error": "Missing color data"}), 400

    color1 = data["color1"]
    color2 = data["color2"]

    distance_metrics = calculate_color_distance(color1, color2)

    return jsonify(distance_metrics)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
