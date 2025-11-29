#!/usr/bin/env python3
"""
Convert SheepAI presentation HTML to PDF
Each slide is rendered at 1920x1080 resolution
"""

import asyncio
import os
import sys
from pathlib import Path

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("Installing playwright...")
    os.system(f"{sys.executable} -m pip install playwright")
    os.system(f"{sys.executable} -m playwright install chromium")
    from playwright.async_api import async_playwright

try:
    from PIL import Image
except ImportError:
    print("Installing Pillow...")
    os.system(f"{sys.executable} -m pip install Pillow")
    from PIL import Image

try:
    from reportlab.lib.pagesizes import landscape
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import inch
except ImportError:
    print("Installing reportlab...")
    os.system(f"{sys.executable} -m pip install reportlab")
    from reportlab.lib.pagesizes import landscape
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import inch


# Constants
SLIDE_WIDTH = 1920
SLIDE_HEIGHT = 1080
TOTAL_SLIDES = 8


async def capture_slides(html_path: str, output_dir: str) -> list[str]:
    """Capture each slide as a PNG image."""
    
    screenshots = []
    
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        
        # Create page with exact slide dimensions
        page = await browser.new_page(
            viewport={"width": SLIDE_WIDTH, "height": SLIDE_HEIGHT},
            device_scale_factor=1
        )
        
        # Load the HTML file
        file_url = f"file://{html_path}"
        await page.goto(file_url, wait_until="networkidle")
        
        print(f"📊 Capturing {TOTAL_SLIDES} slides at {SLIDE_WIDTH}x{SLIDE_HEIGHT}...")
        
        for slide_num in range(1, TOTAL_SLIDES + 1):
            # Navigate to slide using JavaScript
            await page.evaluate(f"showSlide({slide_num})")
            
            # Wait for any animations
            await asyncio.sleep(0.5)
            
            # Take screenshot of the slide
            screenshot_path = os.path.join(output_dir, f"slide_{slide_num:02d}.png")
            
            # Find the active slide and screenshot it
            slide = page.locator(f"#slide-{slide_num}")
            await slide.screenshot(path=screenshot_path)
            
            screenshots.append(screenshot_path)
            print(f"  ✓ Slide {slide_num}/{TOTAL_SLIDES}")
        
        await browser.close()
    
    return screenshots


def create_pdf(screenshots: list[str], output_path: str):
    """Combine screenshots into a PDF."""
    
    # PDF page size: 1920x1080 in points (72 points = 1 inch)
    # At 96 DPI: 1920px = 20 inches = 1440 points
    # At 72 DPI: 1920px = 26.67 inches = 1920 points
    page_width = SLIDE_WIDTH
    page_height = SLIDE_HEIGHT
    
    print(f"\n📄 Creating PDF: {output_path}")
    
    c = canvas.Canvas(output_path, pagesize=(page_width, page_height))
    
    for i, screenshot_path in enumerate(screenshots):
        if i > 0:
            c.showPage()
        
        # Draw the image to fill the page
        c.drawImage(
            screenshot_path,
            0, 0,
            width=page_width,
            height=page_height,
            preserveAspectRatio=True
        )
        print(f"  ✓ Added slide {i + 1}/{len(screenshots)}")
    
    c.save()
    print(f"\n✅ PDF saved: {output_path}")


def cleanup_screenshots(screenshots: list[str]):
    """Remove temporary screenshot files."""
    for path in screenshots:
        try:
            os.remove(path)
        except:
            pass


async def main():
    # Paths
    script_dir = Path(__file__).parent
    html_path = script_dir / "presentation.html"
    output_dir = script_dir
    pdf_path = script_dir / "SheepAI_Presentation.pdf"
    
    # Validate HTML exists
    if not html_path.exists():
        print(f"❌ Error: {html_path} not found")
        sys.exit(1)
    
    html_path = str(html_path.resolve())
    output_dir = str(output_dir.resolve())
    pdf_path = str(pdf_path.resolve())
    
    print("🐑 SheepAI Presentation to PDF Converter")
    print("=" * 50)
    print(f"📁 Input:  {html_path}")
    print(f"📁 Output: {pdf_path}")
    print(f"📐 Size:   {SLIDE_WIDTH}x{SLIDE_HEIGHT}")
    print("=" * 50)
    
    try:
        # Capture slides
        screenshots = await capture_slides(html_path, output_dir)
        
        # Create PDF
        create_pdf(screenshots, pdf_path)
        
        # Cleanup
        cleanup_screenshots(screenshots)
        
        print("\n🎉 Done! Open SheepAI_Presentation.pdf to view.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())

