import math
import numpy as np
from utils.color_utils import hex_to_rgb


def calculate_color_distance(color1, color2):
    """Calculate various color distance metrics between two colors.

    Args:
        color1: First color in RGB format {'r': int, 'g': int, 'b': int} or HEX string
        color2: Second color in RGB format {'r': int, 'g': int, 'b': int} or HEX string

    Returns:
        Dictionary with different color distance metrics
    """
    # If colors are provided as hex strings, convert to RGB dict
    if isinstance(color1, str):
        rgb1 = hex_to_rgb(color1)
        color1 = {"r": rgb1[0], "g": rgb1[1], "b": rgb1[2]}

    if isinstance(color2, str):
        rgb2 = hex_to_rgb(color2)
        color2 = {"r": rgb2[0], "g": rgb2[1], "b": rgb2[2]}

    # Extract RGB values
    r1, g1, b1 = color1["r"], color1["g"], color1["b"]
    r2, g2, b2 = color2["r"], color2["g"], color2["b"]

    # Euclidean distance (RGB space)
    euclidean = math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)

    # Delta E calculation (CIE76)
    # Convert RGB to Lab space for more accurate calculations
    # This is a simplified implementation
    lab1 = rgb_to_lab(r1, g1, b1)
    lab2 = rgb_to_lab(r2, g2, b2)

    delta_e = math.sqrt(
        (lab1[0] - lab2[0]) ** 2 + (lab1[1] - lab2[1]) ** 2 + (lab1[2] - lab2[2]) ** 2
    )

    # Delta E calculation (CIE94)
    # In a real app, this would use proper color space conversion
    delta_e94 = calculate_delta_e94(lab1, lab2)

    # Delta E calculation (CIEDE2000)
    # In a real app, this would use proper color space conversion
    delta_e2000 = calculate_delta_e2000(lab1, lab2)

    return {
        "euclidean": round(euclidean, 2),
        "deltaE76": round(delta_e, 2),
        "deltaE94": round(delta_e94, 2),
        "deltaE2000": round(delta_e2000, 2),
    }


def rgb_to_lab(r, g, b):
    """Convert RGB color to LAB color space.

    This is a simplified implementation.
    """
    # Convert RGB to XYZ
    r, g, b = r / 255.0, g / 255.0, b / 255.0

    # Apply gamma correction
    r = r**2.2 if r > 0.04045 else r / 12.92
    g = g**2.2 if g > 0.04045 else g / 12.92
    b = b**2.2 if b > 0.04045 else b / 12.92

    # Convert to XYZ using standard matrix
    x = r * 0.4124 + g * 0.3576 + b * 0.1805
    y = r * 0.2126 + g * 0.7152 + b * 0.0722
    z = r * 0.0193 + g * 0.1192 + b * 0.9505

    # Convert XYZ to Lab
    # Reference white point
    xn, yn, zn = 0.95047, 1.0, 1.08883

    x, y, z = x / xn, y / yn, z / zn

    # Apply cube root transformation
    fx = x ** (1 / 3) if x > 0.008856 else 7.787 * x + 16 / 116
    fy = y ** (1 / 3) if y > 0.008856 else 7.787 * y + 16 / 116
    fz = z ** (1 / 3) if z > 0.008856 else 7.787 * z + 16 / 116

    # Calculate Lab values
    L = 116 * fy - 16
    a = 500 * (fx - fy)
    b_val = 200 * (fy - fz)

    return [L, a, b_val]


def calculate_delta_e94(lab1, lab2):
    """Calculate CIE94 color difference.

    This is a simplified implementation.
    """
    # CIE94 constants
    kL, K1, K2 = 1, 0.045, 0.015

    # Extract Lab values
    L1, a1, b1 = lab1
    L2, a2, b2 = lab2

    # Calculate differences
    dL = L1 - L2
    C1 = math.sqrt(a1**2 + b1**2)
    C2 = math.sqrt(a2**2 + b2**2)
    dC = C1 - C2
    da = a1 - a2
    db = b1 - b2
    dH = math.sqrt(max(0, da**2 + db**2 - dC**2))

    # Calculate factors
    SL = 1
    SC = 1 + K1 * C1
    SH = 1 + K2 * C1

    # Calculate color difference
    term1 = (dL / (kL * SL)) ** 2
    term2 = (dC / SC) ** 2
    term3 = (dH / SH) ** 2

    return math.sqrt(term1 + term2 + term3)


def calculate_delta_e2000(lab1, lab2):
    """Calculate CIEDE2000 color difference.

    This is a simplified implementation of the CIEDE2000 algorithm.
    In a production environment, use a specialized color science library.
    """
    # Simplified CIEDE2000 calculation
    # This implementation uses approximation instead of the full formula

    # Extract Lab values
    L1, a1, b1 = lab1
    L2, a2, b2 = lab2

    # Calculate C1, C2 (Chroma values)
    C1 = math.sqrt(a1**2 + b1**2)
    C2 = math.sqrt(a2**2 + b2**2)

    # Calculate mean C
    Cmean = (C1 + C2) / 2

    # Calculate G
    G = 0.5 * (1 - math.sqrt(Cmean**7 / (Cmean**7 + 25**7)))

    # Calculate a' values
    aPrime1 = a1 * (1 + G)
    aPrime2 = a2 * (1 + G)

    # Calculate C' values
    CPrime1 = math.sqrt(aPrime1**2 + b1**2)
    CPrime2 = math.sqrt(aPrime2**2 + b2**2)

    # Calculate h' values (in degrees)
    hPrime1 = math.atan2(b1, aPrime1) * 180 / math.pi
    if hPrime1 < 0:
        hPrime1 += 360

    hPrime2 = math.atan2(b2, aPrime2) * 180 / math.pi
    if hPrime2 < 0:
        hPrime2 += 360

    # Calculate ΔL', ΔC', ΔH'
    deltaLPrime = L2 - L1
    deltaCPrime = CPrime2 - CPrime1

    # Calculate ΔH'
    if C1 * C2 == 0:
        deltaHPrime = 0
    else:
        if abs(hPrime2 - hPrime1) <= 180:
            deltaHPrime = hPrime2 - hPrime1
        elif hPrime2 - hPrime1 > 180:
            deltaHPrime = hPrime2 - hPrime1 - 360
        else:
            deltaHPrime = hPrime2 - hPrime1 + 360

    deltaHPrime = (
        2 * math.sqrt(CPrime1 * CPrime2) * math.sin(deltaHPrime * math.pi / 360)
    )

    # Calculate CIEDE2000 using simplified formula
    # In a real implementation, more factors and weights should be considered

    # Simplification: using fixed weights instead of adaptive weights
    kL, kC, kH = 1, 1, 1

    # Lightness, Chroma, and Hue weighting functions
    SL = 1
    SC = 1 + 0.045 * Cmean
    SH = 1 + 0.015 * Cmean

    # No rotation term in this simplified version

    # Final delta E calculation
    term1 = (deltaLPrime / (kL * SL)) ** 2
    term2 = (deltaCPrime / (kC * SC)) ** 2
    term3 = (deltaHPrime / (kH * SH)) ** 2

    return math.sqrt(term1 + term2 + term3)
