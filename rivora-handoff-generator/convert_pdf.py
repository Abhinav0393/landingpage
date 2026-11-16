import os
import sys
import subprocess
import zipfile
import re
import json

def convert_docx_to_pdf(docx_path, pdf_path):
    docx_path = os.path.abspath(docx_path)
    pdf_path = os.path.abspath(pdf_path)
    outdir = os.path.dirname(pdf_path)
    os.makedirs(outdir, exist_ok=True)

    # 1. Try soffice if in PATH
    try:
        res = subprocess.run(
            ["soffice", "--headless", "--convert-to", "pdf", docx_path, "--outdir", outdir],
            capture_output=True, text=True, timeout=180
        )
        if res.returncode == 0 and os.path.exists(pdf_path):
            print("Converted via soffice")
            return True
    except Exception:
        pass

    # 2. Try Word COM on Windows
    try:
        import win32com.client
        word = win32com.client.Dispatch("Word.Application")
        word.Visible = False
        word.DisplayAlerts = 0
        doc = word.Documents.Open(docx_path, False, True)
        # 17 = wdExportFormatPDF
        doc.ExportAsFixedFormat(pdf_path, 17)
        doc.Close(False)
        word.Quit()
        del doc
        del word
        if os.path.exists(pdf_path):
            print("Converted via Word COM automation")
            return True
    except Exception as e:
        print(f"Word COM error: {e}", file=sys.stderr)

    return False

def clean_docx_zip(docx_path):
    """Drop directory entries from the docx package (equivalent to zip -d file.docx '*/')"""
    docx_path = os.path.abspath(docx_path)
    temp_path = docx_path + ".tmp"
    with zipfile.ZipFile(docx_path, 'r') as zin:
        with zipfile.ZipFile(temp_path, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                if item.filename.endswith('/'):
                    continue
                zout.writestr(item, zin.read(item.filename))
    os.replace(temp_path, docx_path)
    print(f"Cleaned folder entries from {docx_path}")

def find_chapter_pages(pdf_path, toc_items_path, out_pages_path):
    """Find the exact page on which each chapter heading appears in the PDF."""
    import pymupdf
    doc = pymupdf.open(pdf_path)
    with open(toc_items_path, 'r', encoding='utf-8') as f:
        toc_items = json.load(f)

    total_pages = len(doc)
    print(f"Total PDF pages: {total_pages}")

    # Determine TOC pages by checking which pages contain >= 5 chapter titles
    toc_end_page = 1
    for p in range(1, total_pages):
        page_text = doc[p].get_text()
        norm_page = ' '.join(page_text.split())
        toc_matches = sum(1 for it in toc_items if it["text"] in norm_page)
        if toc_matches >= 5:
            toc_end_page = p + 1
            print(f"Page {p+1} is a TOC page (contains {toc_matches} chapter titles)")
        else:
            if p >= 2: # Stop scanning once we're past the initial TOC pages
                break

    print(f"TOC ends on page {toc_end_page}. Chapters begin on page {toc_end_page + 1}.")

    page_map = {}
    for item in toc_items:
        item_id = item["id"]
        exact_text = item["text"].strip()
        matched_page = None

        for p in range(toc_end_page, total_pages):
            page_text = doc[p].get_text()
            norm_page = ' '.join(page_text.split())
            if exact_text in norm_page:
                matched_page = p + 1 # 1-indexed
                break

        if not matched_page:
            for p in range(toc_end_page, total_pages):
                page_text = doc[p].get_text()
                norm_page = ' '.join(page_text.split())
                if item["title"] in norm_page and (item.get("label", "") in norm_page):
                    matched_page = p + 1
                    break

        page_map[item_id] = matched_page or (toc_end_page + 1)
        print(f"  {item['text']} -> Page {page_map[item_id]}")

    with open(out_pages_path, 'w', encoding='utf-8') as f:
        json.dump(page_map, f, indent=2)
    print(f"Saved page mapping to {out_pages_path}")

def render_sample_pages(pdf_path, output_dir):
    """Render key pages as images for visual quality checks."""
    import pymupdf
    doc = pymupdf.open(pdf_path)
    os.makedirs(output_dir, exist_ok=True)
    total_pages = len(doc)

    pages_to_render = [1, 2, 3, 14, 26, 49, 63, 71, 75, total_pages]
    pages_to_render = sorted(list(set(p for p in pages_to_render if 1 <= p <= total_pages)))

    for p in pages_to_render:
        page = doc[p - 1]
        pix = page.get_pixmap(dpi=110)
        img_path = os.path.join(output_dir, f"page_{p:03d}.jpg")
        pix.save(img_path)
        print(f"Rendered Page {p:03d} -> {img_path}")

if __name__ == "__main__":
    action = sys.argv[1]
    if action == "convert":
        docx = sys.argv[2]
        pdf = sys.argv[3]
        if convert_docx_to_pdf(docx, pdf):
            print("OK")
        else:
            print("FAIL", file=sys.stderr)
            sys.exit(1)
    elif action == "clean":
        clean_docx_zip(sys.argv[2])
    elif action == "find_pages":
        find_chapter_pages(sys.argv[2], sys.argv[3], sys.argv[4])
    elif action == "render":
        render_sample_pages(sys.argv[2], sys.argv[3])