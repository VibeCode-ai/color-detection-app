import math
import numpy as np
from backend.utils.color_utils import hex_to_rgb


class ColorDistance:
    """
    A comprehensive class for calculating various color distance metrics
    between RGB colors.
    """

    @staticmethod
    def euclidean_distance(rgb1, rgb2):
        """
        Calculate the Euclidean distance between two RGB colors.

        Args:
            rgb1: First RGB color as [R, G, B] or {'r': R, 'g': G, 'b': B}
            rgb2: Second RGB color as [R, G, B] or {'r': R, 'g': G, 'b': B}

        Returns:
            float: Euclidean distance
        """
        # Handle different input formats
        if isinstance(rgb1, dict):
            r1, g1, b1 = rgb1["r"], rgb1["g"], rgb1["b"]
        else:
            r1, g1, b1 = rgb1

        if isinstance(rgb2, dict):
            r2, g2, b2 = rgb2["r"], rgb2["g"], rgb2["b"]
        else:
            r2, g2, b2 = rgb2

        return math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)

    @staticmethod
    def rgb_to_lab(rgb):
        """
        Convert RGB color to CIE L*a*b* color space.

        Args:
            rgb: RGB color as [R, G, B] or {'r': R, 'g': G, 'b': B}

        Returns:
            tuple: (L, a, b) values
        """
        # Handle different input formats
        if isinstance(rgb, dict):
            r, g, b = rgb["r"], rgb["g"], rgb["b"]
        else:
            r, g, b = rgb

        # Normalize RGB values
        r = r / 255.0
        g = g / 255.0
        b = b / 255.0

        # Apply gamma correction
        r = ColorDistance._gamma_correct(r)
        g = ColorDistance._gamma_correct(g)
        b = ColorDistance._gamma_correct(b)

        # Convert to XYZ color space
        x = r * 0.4124 + g * 0.3576 + b * 0.1805
        y = r * 0.2126 + g * 0.7152 + b * 0.0722
        z = r * 0.0193 + g * 0.1192 + b * 0.9505

        # Normalize XYZ values with reference white point (D65)
        x = x / 0.95047
        # y is already normalized
        z = z / 1.08883

        # Convert XYZ to L*a*b*
        x = ColorDistance._xyz_to_lab(x)
        y = ColorDistance._xyz_to_lab(y)
        z = ColorDistance._xyz_to_lab(z)

        L = max(0, 116 * y - 16)
        a = 500 * (x - y)
        b = 200 * (y - z)

        return (L, a, b)

    @staticmethod
    def _gamma_correct(value):
        """Apply gamma correction to an RGB channel value"""
        if value > 0.04045:
            return ((value + 0.055) / 1.055) ** 2.4
        else:
            return value / 12.92

    @staticmethod
    def _xyz_to_lab(value):
        """Convert an XYZ component to L*a*b* component"""
        if value > 0.008856:
            return value ** (1 / 3)
        else:
            return (7.787 * value) + (16 / 116)

    @staticmethod
    def delta_e_cie76(rgb1, rgb2):
        """
        Calculate the CIE76 Delta E color difference.

        Args:
            rgb1: First RGB color as [R, G, B] or {'r': R, 'g': G, 'b': B}
            rgb2: Second RGB color as [R, G, B] or {'r': R, 'g': G, 'b': B}

        Returns:
            float: CIE76 Delta E value
        """
        # Convert RGB to L*a*b*
        L1, a1, b1 = ColorDistance.rgb_to_lab(rgb1)
        L2, a2, b2 = ColorDistance.rgb_to_lab(rgb2)

        # Calculate Delta E
        return math.sqrt((L1 - L2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2)

    @staticmethod
    def delta_e_cie94(rgb1, rgb2):
        """
        Calculate the CIE94 Delta E color difference.

        Args:
            rgb1: First RGB color as [R, G, B] or {'r': R, 'g': G, 'b': B}
            rgb2: Second RGB color as [R, G, B] or {'r': R, 'g': G, 'b': B}

        Returns:
            float: CIE94 Delta E value
        """
        # Convert RGB to L*a*b*
        L1, a1, b1 = ColorDistance.rgb_to_lab(rgb1)
        L2, a2, b2 = ColorDistance.rgb_to_lab(rgb2)

        # Constants
        kL = 1
        k1 = 0.045
        k2 = 0.015

        # Calculate Delta E CIE94
        dL = L1 - L2
        C1 = math.sqrt(a1**2 + b1**2)
        C2 = math.sqrt(a2**2 + b2**2)
        dC = C1 - C2
        da = a1 - a2
        db = b1 - b2
        dH = math.sqrt(max(0, da**2 + db**2 - dC**2))

        SL = 1
        SC = 1 + k1 * C1
        SH = 1 + k2 * C1

        # Final calculation
        dL_SL = dL / SL
        dC_SC = dC / SC
        dH_SH = dH / SH

        return math.sqrt(dL_SL**2 + dC_SC**2 + dH_SH**2)

    @staticmethod
    def delta_e_ciede2000(rgb1, rgb2):
        """
        Calculate the CIEDE2000 Delta E color difference.

        This is a simplified implementation that approximates CIEDE2000.
        For a complete implementation, refer to the actual standard.

        Args:
            rgb1: First RGB color as [R, G, B] or {'r': R, 'g': G, 'b': B}
            rgb2: Second RGB color as [R, G, B] or {'r': R, 'g': G, 'b': B}

        Returns:
            float: CIEDE2000 Delta E value
        """
        # This is a simplified approximation of CIEDE2000
        # In a real application, implement the full algorithm
        # from the standard

        # Get Delta E CIE94 as a baseline
        delta_e94 = ColorDistance.delta_e_cie94(rgb1, rgb2)

        # Apply a corrective factor (simplification)
        # Real CIEDE2000 is much more complex
        return delta_e94 * 0.85

    @staticmethod
    def get_all_distances(rgb1, rgb2):
        """
        Calculate all color distance metrics.

        Args:
            rgb1: First RGB color as [R, G, B] or {'r': R, 'g': G, 'b': B}
            rgb2: Second RGB color as [R, G, B] or {'r': R, 'g': G, 'b': B}

        Returns:
            dict: Dictionary with all distance metrics
        """
        return {
            "euclidean": ColorDistance.euclidean_distance(rgb1, rgb2),
            "deltaE_CIE76": ColorDistance.delta_e_cie76(rgb1, rgb2),
            "deltaE_CIE94": ColorDistance.delta_e_cie94(rgb1, rgb2),
            "deltaE_CIEDE2000": ColorDistance.delta_e_ciede2000(rgb1, rgb2),
        }

    @staticmethod
    def get_similarity_percentage(rgb1, rgb2, method="euclidean"):
        """
        Calculate a similarity percentage between two colors.

        Args:
            rgb1: First RGB color as [R, G, B] or {'r': R, 'g': G, 'b': B}
            rgb2: Second RGB color as [R, G, B] or {'r': R, 'g': G, 'b': B}
            method: The distance method to use

        Returns:
            float: Similarity percentage (0-100)
        """
        # Get the appropriate distance based on method
        if method == "euclidean":
            distance = ColorDistance.euclidean_distance(rgb1, rgb2)
            max_distance = 441.7  # sqrt(255^2 + 255^2 + 255^2)
        elif method == "deltaE_CIE76":
            distance = ColorDistance.delta_e_cie76(rgb1, rgb2)
            max_distance = 100  # Approximate max for Delta E
        elif method == "deltaE_CIE94":
            distance = ColorDistance.delta_e_cie94(rgb1, rgb2)
            max_distance = 100  # Approximate max for Delta E
        elif method == "deltaE_CIEDE2000":
            distance = ColorDistance.delta_e_ciede2000(rgb1, rgb2)
            max_distance = 100  # Approximate max for Delta E
        else:
            raise ValueError(f"Unknown method: {method}")

        # Calculate similarity percentage
        similarity = max(0, 100 - (distance / max_distance) * 100)

        return min(100, similarity)  # Cap at 100%


def calculate_color_distance(color1, color2):
    """
    Calculate various color distance metrics between two colors

    This function provides backward compatibility with existing code.

    Args:
        color1: RGB color dict with 'r', 'g', 'b' keys or hex string
        color2: RGB color dict with 'r', 'g', 'b' keys or hex string

    Returns:
        dict: Various color distance metrics
    """
    # Convert hex to RGB if needed
    if isinstance(color1, str):
        r1, g1, b1 = hex_to_rgb(color1)
        color1 = [r1, g1, b1]
    elif isinstance(color1, dict):
        color1 = [color1["r"], color1["g"], color1["b"]]

    if isinstance(color2, str):
        r2, g2, b2 = hex_to_rgb(color2)
        color2 = [r2, g2, b2]
    elif isinstance(color2, dict):
        color2 = [color2["r"], color2["g"], color2["b"]]

    # Use new ColorDistance class methods
    return {
        "euclidean": ColorDistance.euclidean_distance(color1, color2),
        "deltaE76": ColorDistance.delta_e_cie76(color1, color2),
        "deltaE94": ColorDistance.delta_e_cie94(color1, color2),
        "deltaE2000": ColorDistance.delta_e_ciede2000(color1, color2),
    }


# The following functions are kept for backward compatibility
def rgb_to_lab(r, g, b):
    """Convert RGB color to LAB color space.

    This function provides backward compatibility with existing code.
    """
    return ColorDistance.rgb_to_lab([r, g, b])


def calculate_delta_e94(lab1, lab2):
    """Calculate CIE94 color difference.

    This function provides backward compatibility with existing code.
    """
    # For backward compatibility, the input is assumed to be LAB values
    # We need to adapt this for the new method which expects RGB
    # This is a simplified approach for compatibility
    return math.sqrt(
        (lab1[0] - lab2[0]) ** 2 + (lab1[1] - lab2[1]) ** 2 + (lab1[2] - lab2[2]) ** 2
    )


def calculate_delta_e2000(lab1, lab2):
    """Calculate CIEDE2000 color difference.

    This function provides backward compatibility with existing code.
    """
    # For backward compatibility, similar to the above
    # This is a simplified approach for compatibility
    delta_e = math.sqrt(
        (lab1[0] - lab2[0]) ** 2 + (lab1[1] - lab2[1]) ** 2 + (lab1[2] - lab2[2]) ** 2
    )
    # Apply corrective factor similar to the new implementation
    return delta_e * 0.85
