import pymupdf
import re

doc = pymupdf.open('outputs/RIVORA_Website_Development_Specification.pdf')
full_text = '\n'.join(page.get_text() for page in doc)

emails = set(re.findall(r'[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}', full_text))
print("Emails found:")
for e in sorted(emails):
    print("  ", e)

urls = set(re.findall(r'https?://[^\s\"\'<>]+', full_text))
print("\nURLs found:")
for u in sorted(urls):
    print("  ", u)