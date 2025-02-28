from backend.utils.color_utils import hex_to_rgb, rgb_to_hex, rgb_to_hsl
from ml.color_classifier import ColorClassifier


def get_complementary_colors(hex_color, scheme_type="complementary"):
    """
    Get complementary colors based on color theory

    Args:
        hex_color (str): Hex color code
        scheme_type (str): Type of color scheme (complementary, triadic, etc.)

    Returns:
        list: List of complementary colors in hex format
    """
    r, g, b = hex_to_rgb(hex_color)

    if scheme_type == "complementary":
        # Simple complementary color (opposite on color wheel)
        comp_r = 255 - r
        comp_g = 255 - g
        comp_b = 255 - b

        return [rgb_to_hex((comp_r, comp_g, comp_b))]

    elif scheme_type == "triadic":
        # Triadic colors (120° apart on color wheel)
        # Convert to HSL, rotate hue by 120°, convert back
        hsl = rgb_to_hsl([r, g, b])

        hsl1 = dict(hsl)
        hsl1["h"] = (hsl["h"] + 120) % 360

        hsl2 = dict(hsl)
        hsl2["h"] = (hsl["h"] + 240) % 360

        # We would convert HSL to RGB here, but for simplicity:
        # Using approximation for the purpose of this example
        comp1_r = g
        comp1_g = b
        comp1_b = r

        comp2_r = b
        comp2_g = r
        comp2_b = g

        return [
            rgb_to_hex((comp1_r, comp1_g, comp1_b)),
            rgb_to_hex((comp2_r, comp2_g, comp2_b)),
        ]

    elif scheme_type == "analogous":
        # Analogous colors (30° apart on color wheel)
        # Similar approximation
        comp1_r = (r * 0.9 + g * 0.1) % 256
        comp1_g = (g * 0.9 + b * 0.1) % 256
        comp1_b = (b * 0.9 + r * 0.1) % 256

        comp2_r = (r * 0.8 + g * 0.2) % 256
        comp2_g = (g * 0.8 + b * 0.2) % 256
        comp2_b = (b * 0.8 + r * 0.2) % 256

        return [
            rgb_to_hex((int(comp1_r), int(comp1_g), int(comp1_b))),
            rgb_to_hex((int(comp2_r), int(comp2_g), int(comp2_b))),
        ]

    else:
        # Default to complementary
        comp_r = 255 - r
        comp_g = 255 - g
        comp_b = 255 - b

        return [rgb_to_hex((comp_r, comp_g, comp_b))]


def get_complementary_color_scheme(hex_color):
    """
    Get complementary color schemes for a given hex color

    Args:
        hex_color (str): Hex color code

    Returns:
        dict: Different color schemes based on the input color
    """
    # Convert hex to RGB
    r, g, b = hex_to_rgb(hex_color)

    # Use the classifier to get color schemes
    classifier = ColorClassifier()
    rgb_schemes = classifier.predict_complementary_colors([r, g, b])

    # Convert all RGB values back to hex for API response
    hex_schemes = {
        "complementary": rgb_to_hex(*rgb_schemes["complementary"]),
        "analogous": [rgb_to_hex(*color) for color in rgb_schemes["analogous"]],
        "triadic": [rgb_to_hex(*color) for color in rgb_schemes["triadic"]],
    }

    # Add original color to the result
    hex_schemes["original"] = hex_color

    return hex_schemes
