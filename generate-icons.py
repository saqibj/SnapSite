#!/usr/bin/env python3
"""
Generate placeholder PNG icons for the Chrome extension.
Requires: pip install pillow
"""

import os
from PIL import Image, ImageDraw

def create_icon(size, filename):
    """Create a simple camera icon."""
    # Create image with gradient background
    img = Image.new('RGB', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)
    
    # Calculate proportional dimensions
    center = size // 2
    camera_width = int(size * 0.5)
    camera_height = int(size * 0.4)
    camera_x = (size - camera_width) // 2
    camera_y = int(size * 0.35)
    
    lens_radius = int(size * 0.15)
    flash_size = int(size * 0.08)
    
    # Draw camera body (white rectangle)
    draw.rounded_rectangle(
        [camera_x, camera_y, camera_x + camera_width, camera_y + camera_height],
        radius=size // 20,
        fill='white'
    )
    
    # Draw lens (circle)
    lens_y = int(size * 0.55)
    draw.ellipse(
        [center - lens_radius, lens_y - lens_radius, 
         center + lens_radius, lens_y + lens_radius],
        fill='#764ba2'
    )
    
    # Draw flash/viewfinder (small rectangle)
    flash_x = int(size * 0.65)
    flash_y = int(size * 0.3)
    draw.rounded_rectangle(
        [flash_x, flash_y, flash_x + flash_size, flash_y + flash_size],
        radius=size // 40,
        fill='#ffeb3b'
    )
    
    # Save the image
    img.save(filename, 'PNG')
    print(f'✓ Created {filename}')

def main():
    # Create icons directory
    icons_dir = 'icons'
    os.makedirs(icons_dir, exist_ok=True)
    
    # Generate all required sizes
    sizes = [16, 32, 48, 128]
    
    print('📸 Generating PNG icons...\n')
    
    for size in sizes:
        filename = os.path.join(icons_dir, f'icon{size}.png')
        create_icon(size, filename)
    
    print('\n✨ All icons generated successfully!')
    print(f'Icons saved to: {os.path.abspath(icons_dir)}/')

if __name__ == '__main__':
    try:
        main()
    except ImportError:
        print('❌ Error: Pillow library not found')
        print('Install it with: pip install pillow')
        print('\nOr create icons manually using any image editor:')
        print('  - Create 4 PNG images: 16x16, 32x32, 48x48, 128x128')
        print('  - Simple camera/screenshot icon')
        print('  - Save in icons/ folder')
