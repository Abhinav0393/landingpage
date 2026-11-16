import asyncio
from playwright.async_api import async_playwright
from PIL import Image
import io

def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def relative_luminance(rgb):
    r = srgb_to_linear(rgb[0])
    g = srgb_to_linear(rgb[1])
    b = srgb_to_linear(rgb[2])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast_ratio(rgb1, rgb2):
    l1 = relative_luminance(rgb1)
    l2 = relative_luminance(rgb2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

async def measure():
    viewports = [
        {"w": 360, "h": 780, "name": "360px (mobile)"},
        {"w": 768, "h": 1024, "name": "768px (tablet)"},
        {"w": 1440, "h": 900, "name": "1440px (desktop)"}
    ]

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        for vp in viewports:
            print(f"\n=======================================================")
            print(f"MEASURING CONTRAST AT {vp['name']}")
            print(f"=======================================================")
            
            page = await browser.new_page(viewport={"width": vp["w"], "height": vp["h"]})
            await page.goto("http://localhost:4321/", wait_until="networkidle")
            await page.wait_for_timeout(600)

            # --- HERO SECTION ---
            # Measure Hero text contrast
            # 1. Capture background behind text (hide text temporarily)
            hero = page.locator("#hero")
            hero_box = await hero.bounding_box()
            
            # Text elements to measure
            elements = [
                ("Hero Headline", "#hero h1", (251, 250, 247)),       # #FBFAF7
                ("Hero Paragraph", "#hero p", (237, 232, 221)),        # #EDE8DD
                ("Hero CTA (Primary)", "#hero a[href='#contact']", (21, 25, 34)), # Dark text on Gold button
                ("Hero CTA (Secondary)", "#hero a[href='#services']", (251, 250, 247)), # #FBFAF7
                ("Hero Metadata", "#hero .stagger-5", (251, 250, 247)), # #FBFAF7
            ]

            # Get bounding boxes while visible
            boxes = []
            for name, sel, fg_color in elements:
                loc = page.locator(sel)
                if await loc.count() > 0:
                    box = await loc.first.bounding_box()
                    boxes.append((name, sel, fg_color, box))

            # Hide text to measure pure background pixels behind them
            await page.evaluate("""() => {
                const textEls = document.querySelectorAll('#hero h1, #hero p, #hero a, #hero .stagger-5, #hero .stagger-1');
                textEls.forEach(el => el.style.visibility = 'hidden');
            }""")
            await page.wait_for_timeout(200)

            hero_bg_png = await hero.screenshot()
            hero_bg_img = Image.open(io.BytesIO(hero_bg_png)).convert("RGB")

            # Restore visibility
            await page.evaluate("""() => {
                const textEls = document.querySelectorAll('#hero h1, #hero p, #hero a, #hero .stagger-5, #hero .stagger-1');
                textEls.forEach(el => el.style.visibility = '');
            }""")

            print("\n--- HERO TEXT CONTRAST ---")
            for name, sel, fg_color, box in boxes:
                if not box:
                    continue
                # Relative coordinates within hero screenshot
                rx = int(box["x"] - hero_box["x"])
                ry = int(box["y"] - hero_box["y"])
                rw = int(box["width"])
                rh = int(box["height"])

                # Clamp to image dimensions
                rx = max(0, min(rx, hero_bg_img.width - 1))
                ry = max(0, min(ry, hero_bg_img.height - 1))
                rw = max(1, min(rw, hero_bg_img.width - rx))
                rh = max(1, min(rh, hero_bg_img.height - ry))

                crop = hero_bg_img.crop((rx, ry, rx + rw, ry + rh))
                # Sample average background pixel & brightest pixel (worst case for light text)
                pixels = list(crop.getdata())
                avg_r = sum(p[0] for p in pixels) / len(pixels)
                avg_g = sum(p[1] for p in pixels) / len(pixels)
                avg_b = sum(p[2] for p in pixels) / len(pixels)
                avg_bg = (avg_r, avg_g, avg_b)

                # For Primary CTA button, the button background is #A98A50 (169, 138, 80)
                if "Primary" in name:
                    btn_bg = (169, 138, 80)
                    cr = contrast_ratio(fg_color, btn_bg)
                    print(f"  {name:22} | FG: {fg_color} on Gold Button {btn_bg} | CR: {cr:.2f}:1 -> {'PASS (>= 4.5:1)' if cr >= 4.5 else 'FAIL'}")
                else:
                    cr = contrast_ratio(fg_color, avg_bg)
                    # Also worst-case pixel
                    brightest_p = max(pixels, key=lambda p: relative_luminance(p))
                    cr_worst = contrast_ratio(fg_color, brightest_p)
                    print(f"  {name:22} | FG: {fg_color} on BG avg {tuple(int(x) for x in avg_bg)} | CR Avg: {cr:.2f}:1 (Worst: {cr_worst:.2f}:1) -> {'PASS' if cr >= 4.5 else 'FAIL'}")

            # --- SERVICES SECTION ---
            services_panel = page.locator("#slide-0")
            await services_panel.scroll_into_view_if_needed()
            await page.wait_for_timeout(300)
            panel_box = await services_panel.bounding_box()

            svc_elements = [
                ("Services Heading", "#slide-0 h3", (251, 250, 247)),
                ("Services Desc", "#slide-0 p", (237, 232, 221)),
                ("Services Report", "#slide-0 .border-t span", (237, 232, 221)),
                ("Services CTA Link", "#slide-0 .border-t a", (237, 232, 221)),
            ]
            svc_boxes = []
            for name, sel, fg_color in svc_elements:
                loc = page.locator(sel)
                if await loc.count() > 0:
                    box = await loc.first.bounding_box()
                    svc_boxes.append((name, sel, fg_color, box))

            # Hide text on slide 0
            await page.evaluate("""() => {
                const textEls = document.querySelectorAll('#slide-0 h3, #slide-0 p, #slide-0 span, #slide-0 a');
                textEls.forEach(el => el.style.visibility = 'hidden');
            }""")
            await page.wait_for_timeout(200)

            svc_bg_png = await services_panel.screenshot()
            svc_bg_img = Image.open(io.BytesIO(svc_bg_png)).convert("RGB")

            await page.evaluate("""() => {
                const textEls = document.querySelectorAll('#slide-0 h3, #slide-0 p, #slide-0 span, #slide-0 a');
                textEls.forEach(el => el.style.visibility = '');
            }""")

            print("\n--- SERVICES (PRACTICE 01) TEXT CONTRAST ---")
            for name, sel, fg_color, box in svc_boxes:
                if not box or not panel_box:
                    continue
                rx = int(box["x"] - panel_box["x"])
                ry = int(box["y"] - panel_box["y"])
                rw = int(box["width"])
                rh = int(box["height"])

                rx = max(0, min(rx, svc_bg_img.width - 1))
                ry = max(0, min(ry, svc_bg_img.height - 1))
                rw = max(1, min(rw, svc_bg_img.width - rx))
                rh = max(1, min(rh, svc_bg_img.height - ry))

                crop = svc_bg_img.crop((rx, ry, rx + rw, ry + rh))
                pixels = list(crop.getdata())
                avg_r = sum(p[0] for p in pixels) / len(pixels)
                avg_g = sum(p[1] for p in pixels) / len(pixels)
                avg_b = sum(p[2] for p in pixels) / len(pixels)
                avg_bg = (avg_r, avg_g, avg_b)
                brightest_p = max(pixels, key=lambda p: relative_luminance(p))

                cr = contrast_ratio(fg_color, avg_bg)
                cr_worst = contrast_ratio(fg_color, brightest_p)
                print(f"  {name:22} | FG: {fg_color} on BG avg {tuple(int(x) for x in avg_bg)} | CR Avg: {cr:.2f}:1 (Worst: {cr_worst:.2f}:1) -> {'PASS' if cr >= 4.5 else 'FAIL'}")

            await page.close()
        
        await browser.close()

asyncio.run(measure())

