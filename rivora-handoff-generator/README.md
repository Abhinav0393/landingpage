# RIVORA handoff document generator (work in progress)

Status: chapters 1-25 are written. Chapters 26-33 (hosting, testing, execution plan,
acceptance criteria, risks, missing info / conflict register / defect list, handover
checklist, URL register) and the assembling build.js (cover, TOC, DOCX + PDF export) are NOT yet written.

Files
- extract.py   : parses src_inputs/code.html into content.json (verbatim content inventory)
- diagrams.py  : draws the three figures in build/ (matplotlib)
- lib.js       : docx-js helpers (headings, tables, callouts, code blocks)
- part1.js ... part4b.js : chapter content (1-7, 8, 9-11, 12-15, 16-20, 21-25)
- content.json : extracted source content

Run (needs node + docx package, python3 + bs4, matplotlib):
  python3 extract.py && python3 diagrams.py
  node -e "const L=require('./lib.js');const X=require('./content.json');L.cnt={};require('./part1.js')(L,X)"
