def rgb_to_hex(r, g, b):
    """
    Convert RGB values to hex color code

    Args:
        r (int): Red value (0-255)
        g (int): Green value (0-255)
        b (int): Blue value (0-255)

    Returns:
        str: Hex color code with '#' prefix
    """
    return f"#{r:02x}{g:02x}{b:02x}"


def rgb_to_hsl(rgb):
    """Convert RGB values to HSL color space."""
    r, g, b = rgb[0] / 255.0, rgb[1] / 255.0, rgb[2] / 255.0

    cmax = max(r, g, b)
    cmin = min(r, g, b)
    delta = cmax - cmin

    # Calculate hue
    h = 0
    if delta == 0:
        h = 0
    elif cmax == r:
        h = ((g - b) / delta) % 6
    elif cmax == g:
        h = (b - r) / delta + 2
    else:
        h = (r - g) / delta + 4

    h = round(h * 60)
    if h < 0:
        h += 360

    # Calculate lightness
    l = (cmax + cmin) / 2

    # Calculate saturation
    s = 0
    if delta != 0:
        s = delta / (1 - abs(2 * l - 1))

    # Convert to percentages
    s = round(s * 100)
    l = round(l * 100)

    return {"h": h, "s": s, "l": l}


def hex_to_rgb(hex_color):
    """
    Convert hex color code to RGB

    Args:
        hex_color (str): Hex color code (with or without '#')

    Returns:
        tuple: RGB values (r, g, b)
    """
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def color_distance(color1, color2):
    """
    Calculate Euclidean distance between two colors

    Args:
        color1 (tuple): RGB values of first color
        color2 (tuple): RGB values of second color

    Returns:
        float: Euclidean distance between colors
    """
    r1, g1, b1 = color1
    r2, g2, b2 = color2
    return ((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) ** 0.5
