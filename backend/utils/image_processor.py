import cv2
import numpy as np
import os
import io
from PIL import Image

# Allowed file extensions
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "bmp", "webp"}


def allowed_file(filename):
    """Check if file has an allowed extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def process_image(image_input, get_dimensions_only=False):
    """Process uploaded image file or path.

    Args:
        image_input: Either a file object from request.files or a file path
        get_dimensions_only: If True, only returns dimensions without full processing

    Returns:
        Processed image or dimensions (height, width) if get_dimensions_only is True
    """
    # Handle file object vs. file path
    if isinstance(image_input, str):
        # It's a file path
        image = cv2.imread(image_input)
        if get_dimensions_only:
            height, width = image.shape[:2]
            return height, width
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return image
    else:
        # It's a file object
        in_memory_file = io.BytesIO(image_input.read())
        image_input.seek(0)  # Reset file pointer for potential reuse

        img = Image.open(in_memory_file)
        if get_dimensions_only:
            return img.height, img.width

        # Convert PIL Image to numpy array (OpenCV format)
        image = np.array(img)
        if len(image.shape) == 3 and image.shape[2] == 3:
            # Convert BGR to RGB if needed
            if isinstance(image_input.read(1), bytes):  # Check if it's reading bytes
                image_input.seek(0)
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return image


def resize_image(image, max_size=800):
    """Resize image while maintaining aspect ratio."""
    height, width = image.shape[:2]
    if height > max_size or width > max_size:
        scale = max_size / max(height, width)
        new_width = int(width * scale)
        new_height = int(height * scale)
        return cv2.resize(image, (new_width, new_height))
    return image
