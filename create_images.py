from PIL import Image, ImageDraw, ImageFont
import os

# Create output directory
output_dir = r"c:\CURSOR\ClothStore\online-clothing-store\backend\public\images\products"
os.makedirs(output_dir, exist_ok=True)

# Define product images with their names and colors
products = [
    ("prod-1773149846401.png", "Blue T-Shirt", "#3b82f6", "#ffffff"),
    ("prod-1773150584271.png", "Cotton Shirt", "#9ca3af", "#ffffff"),
    ("black-jeans.jpg", "Black Jeans", "#1f2937", "#ffffff"),
    ("summer-dress.jpg", "Summer Dress", "#fbbf24", "#000000"),
    ("white-tee.jpg", "White Tee", "#f3f4f6", "#000000"),
    ("polo-shirt.jpg", "Polo Shirt", "#6366f1", "#ffffff"),
    ("womens-blazer.jpg", "Women Blazer", "#8b5cf6", "#ffffff"),
    ("blue-shorts.jpg", "Blue Shorts", "#0ea5e9", "#ffffff"),
]

for filename, text, bg_color, text_color in products:
    # Create image
    img = Image.new('RGB', (400, 400), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a default font, fallback to default
    try:
        font = ImageFont.truetype("arial.ttf", 36)
    except:
        font = ImageFont.load_default()
    
    # Calculate text position to center it
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (400 - text_width) / 2
    y = (400 - text_height) / 2
    
    # Draw text
    draw.text((x, y), text, fill=text_color, font=font)
    
    # Save image
    filepath = os.path.join(output_dir, filename)
    img.save(filepath)
    print(f"Created: {filename}")

print("\nAll product images created successfully!")
print(f"Location: {output_dir}")
