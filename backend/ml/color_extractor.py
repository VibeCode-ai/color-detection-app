import numpy as np
from sklearn.cluster import KMeans
from PIL import Image
import io
import base64
import requests
from urllib.parse import urlparse


class ColorExtractor:
    def __init__(self, n_colors=5):
        """
        Initialize the color extractor with the number of colors to extract

        Args:
            n_colors (int): Number of dominant colors to extract
        """
        self.n_colors = n_colors
        self.model = KMeans(n_clusters=n_colors, random_state=42)

    def load_image(self, image_source):
        """
        Load an image from various sources (file, URL, base64)

        Args:
            image_source (str): Path, URL, or base64 string of the image

        Returns:
            PIL.Image: Loaded image
        """
        # Check if it's a URL
        if image_source.startswith("http"):
            response = requests.get(image_source, stream=True)
            response.raise_for_status()
            img = Image.open(io.BytesIO(response.content))

        # Check if it's a base64 string
        elif image_source.startswith("data:image"):
            format, imgstr = image_source.split(";base64,")
            img = Image.open(io.BytesIO(base64.b64decode(imgstr)))

        # Otherwise, treat as a file path
        else:
            img = Image.open(image_source)

        return img

    def extract_colors(self, image_source):
        """
        Extract dominant colors from an image

        Args:
            image_source (str): Path, URL, or base64 string of the image

        Returns:
            list: List of dictionaries containing RGB values and percentages
        """
        try:
            # Load image
            img = self.load_image(image_source)

            # Resize image to speed up processing
            img = img.copy()
            img.thumbnail((200, 200))

            # Convert to RGB if necessary
            if img.mode != "RGB":
                img = img.convert("RGB")

            # Reshape image data for clustering
            pixels = np.array(img).reshape(-1, 3)

            # Fit model to pixels
            self.model.fit(pixels)

            # Get cluster centers (colors)
            colors = self.model.cluster_centers_.astype(int)

            # Count pixels in each cluster
            labels = self.model.labels_
            counts = np.bincount(labels)

            # Calculate percentages
            percentages = counts / len(pixels) * 100

            # Create results
            results = []
            for i, (color, percentage) in enumerate(zip(colors, percentages)):
                results.append(
                    {
                        "r": int(color[0]),
                        "g": int(color[1]),
                        "b": int(color[2]),
                        "percentage": float(percentage),
                    }
                )

            # Sort by percentage (descending)
            results.sort(key=lambda x: x["percentage"], reverse=True)

            return results

        except Exception as e:
            raise Exception(f"Error extracting colors: {str(e)}")

    def get_color_palette(self, image_source):
        """
        Extract a color palette from an image

        Args:
            image_source (str): Path, URL, or base64 string of the image

        Returns:
            dict: Color palette information including dominant colors
        """
        colors = self.extract_colors(image_source)

        return {
            "colors": colors,
            "palette_type": "dominant",
            "total_colors": len(colors),
        }


# Example usage
if __name__ == "__main__":
    extractor = ColorExtractor(n_colors=5)
    palette = extractor.get_color_palette("sample_image.jpg")
    print(palette)
