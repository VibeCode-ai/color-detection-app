from utils.color_utils import hex_to_rgb
import math

# Basic color name mapping (simplified)
BASIC_COLORS = {
    "red": [255, 0, 0],
    "orange": [255, 165, 0],
    "yellow": [255, 255, 0],
    "green": [0, 128, 0],
    "blue": [0, 0, 255],
    "indigo": [75, 0, 130],
    "violet": [238, 130, 238],
    "black": [0, 0, 0],
    "white": [255, 255, 255],
    "gray": [128, 128, 128],
    "brown": [165, 42, 42],
    "pink": [255, 192, 203],
    "cyan": [0, 255, 255],
    "magenta": [255, 0, 255],
}


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

    # Find closest color
    min_distance = float("inf")
    closest_color = "unknown"

    for color_name, color_rgb in BASIC_COLORS.items():
        # Calculate Euclidean distance
        distance = math.sqrt(
            (r - color_rgb[0]) ** 2 + (g - color_rgb[1]) ** 2 + (b - color_rgb[2]) ** 2
        )

        if distance < min_distance:
            min_distance = distance
            closest_color = color_name

    return closest_color


def get_color_description(hex_color):
    """
    Get a more detailed description of a color

    Args:
        hex_color (str): Hex color code

    Returns:
        dict: Color description with properties
    """
    r, g, b = hex_to_rgb(hex_color)

    # Get basic classification
    base_name = classify_color(hex_color)

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
        "brightness": brightness,
        "saturation": saturation,
        "properties": {"brightness": brightness_desc, "saturation": saturation_desc},
    }
