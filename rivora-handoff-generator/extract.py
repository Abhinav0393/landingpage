import json, re
from bs4 import BeautifulSoup
s = BeautifulSoup(open('src/code.html', encoding='utf-8').read(), 'lxml')
T = lambda e: re.sub(r'\s+', ' ', e.get_text(' ', strip=True)).replace(' ,', ',').replace(' .', '.').strip()
def txt_no_icons(e):
    e = BeautifulSoup(str(e), 'lxml')
    for i in e.select('.material-symbols-outlined'): i.decompose()
    return T(e)
out = {}
hdr = s.find('header')
out['header'] = {
 'nav': [(txt_no_icons(a), a['href']) for a in hdr.select('nav a')],
 'cta': [(txt_no_icons(a), a['href'], a.get('aria-label','')) for a in hdr.select('div.flex.items-center.gap-3\\.5 a')],
 'brand': [T(x) for x in hdr.select('a[href="#hero"] span')],
}
h = s.find(id='hero')
out['hero'] = {
 'img_alt': h.img['alt'], 'badge': T(h.select_one('.rounded-full span:nth-of-type(2)')),
 'h1': T(h.h1), 'p': T(h.p),
 'buttons': [(txt_no_icons(a), a['href']) for a in h.select('a')],
 'meta': [(T(d.find_all('span')[0]), T(d.find_all('span')[1])) for d in h.select('.grid > div')],
}
m = s.select_one('section.marquee-container')
out['marquee'] = [T(x) for x in m.select('div.shrink-0')[0].select('span.font-medium')]
p = s.find(id='pillars')
out['pillars'] = {
 'kicker': T(p.select('.border-b span')[0]), 'sub': T(p.select('.border-b span')[1]),
 'cards': [{'kicker': T(c.select_one('span.text-\\[11px\\]')), 'title': T(c.h3), 'body': T(c.p)} for c in p.select('.grid > div')],
}
sv = s.find(id='services')
tabs = sv.select('.practice-tab-btn')
slides = sv.select('.practice-slide')
out['services'] = {
 'kicker': T(sv.select_one('span.block.mb-2')), 'h2': T(sv.h2), 'p': T(sv.select_one('h2').find_next('p')),
 'counter': T(sv.find(id='slider-counter')), 'arrows': [b['aria-label'] for b in sv.select('button[aria-label]')],
 'items': [{
   'tab_kicker': T(t.find_all('span')[0]), 'tab_name': T(t.find_all('span')[1]),
   'badge': T(sl.select_one('.rounded-full span:nth-of-type(2)')), 'h3': T(sl.h3), 'p': T(sl.select_one('p')),
   'chips': [T(c) for c in sl.select('.flex-wrap span')], 'footer': T(sl.select('.border-t span')[0]),
   'cta': txt_no_icons(sl.select_one('.border-t a')), 'cta_href': sl.select_one('.border-t a')['href'],
   'img_alt': sl.img['alt'], 'img_src': sl.img['src']} for t, sl in zip(tabs, slides)],
}
out['hero']['img_src'] = h.img['src']
sd = s.find(id='search-depth')
out['search'] = {
 'kicker': T(sd.select_one('span.block')), 'h2': T(sd.h2), 'p': T(sd.h2.find_next('p')),
 'cards': [],
}
for c in sd.select('.grid > div'):
    ribbon = c.select_one('.absolute')
    head = c.select('.border-b span')
    out['search']['cards'].append({
      'ribbon': T(ribbon) if ribbon else '', 'number': T(head[0]), 'label': T(head[1]), 'h3': T(c.h3), 'p': T(c.select_one('p')),
      'bullets': [txt_no_icons(li) for li in c.select('li')],
      'suit_label': T(c.select('.border-t span')[-2]), 'suit_value': T(c.select('.border-t span')[-1])})
pr = s.find(id='process')
out['process'] = {'kicker': T(pr.select_one('span.block')), 'h2': T(pr.h2), 'p': T(pr.h2.find_next('p')), 'stages': []}
for c in pr.select('.grid > div'):
    sp = c.select('span')
    out['process']['stages'].append({'stage': T(sp[0]), 'icon': T(sp[1]), 'h3': T(c.h3), 'p': T(c.select_one('p')),
        'deliv_label': T(c.find_all('div', recursive=False)[-1].find_all('span')[0]), 'deliv': T(c.find_all('div', recursive=False)[-1].find_all('span')[1])})
ex = s.find(id='expertise')
cards = ex.select('.space-y-4 > div')
chk = ex.select_one('.rounded-3xl')
rows = chk.select('.space-y-3 > div')
out['expertise'] = {
 'kicker': T(ex.select_one('span.block')), 'h2': T(ex.h2), 'p': T(ex.h2.find_next('p')),
 'points': [{'icon': T(c.select_one('.material-symbols-outlined')), 'h4': T(c.h4), 'p': T(c.p)} for c in cards],
 'checklist': {'kicker': T(chk.select('.border-b span')[0]), 'title': T(chk.select('.border-b span')[1]), 'badge': T(chk.select('.border-b span')[2]),
    'rows': [(T(r.find_all('span')[0]), T(r.find_all('span')[1])) for r in rows],
    'assure_label': T(chk.select_one('.mt-8 span')), 'assure': T(chk.select_one('.mt-8 p'))}}
rv = s.find(id='reviews')
track = rv.select_one('.testimonial-marquee-track')
rc = []
for c in track.find_all('div', recursive=False):
    nm = c.select_one('h5')
    rc.append({'quote': T(c.select_one('p')), 'name': T(nm), 'role': T(nm.find_next('span')), 'dup': c.get('aria-hidden')=='true',
               'badge': T(c.select('span.rounded-full')[0]) if c.select('span.rounded-full') else ''})
out['reviews'] = {'kicker': T(rv.select_one('span.block')), 'h2': T(rv.h2), 'p': T(rv.h2.find_next('p')), 'cards': rc}
fq = s.find(id='faq')
acc = fq.find(id='faq-accordion')
out['faq'] = {
 'badge': T(fq.select_one('.rounded-full span:nth-of-type(2)')), 'h2': T(fq.h2), 'p': T(fq.h2.find_next('p')),
 'cta': T(fq.select_one('a[href="#contact"] span')), 'assure': T(fq.select_one('.text-\\[\\#45474b\\].text-xs span:nth-of-type(2)')) if fq.select_one('.text-\\[\\#45474b\\].text-xs span:nth-of-type(2)') else 'All inquiries reviewed directly by Advocate RK.V & Associates',
 'items': [{'n': T(it.select('button span')[0]), 'q': T(it.select('button span')[1]), 'a': T(it.find_all('div', recursive=False)[-1])} for it in acc.find_all('div', recursive=False)],
}
ct = s.find(id='contact')
out['contact'] = {
 'badge': T(ct.select_one('.rounded-full span:nth-of-type(2)')), 'h2': T(ct.h2), 'p': T(ct.h2.find_next('p')),
 'card_kicker': T(ct.select_one('.border-2 span.block')), 'card_h3': T(ct.select_one('.border-2 h3')),
 'card_sub': T(ct.select_one('.border-2 h3').find_next('p')),
 'status': T(ct.select_one('.animate-pulse').find_next('span')),
 'line_label': 'Direct Counsel Line & Dossier Desk', 'phone': '8099888851',
 'line_sub': 'Direct line to chambers for prospective purchasers and developers',
 'buttons': [('Call Chambers','tel:8099888851'),('Copy Number','button: copyContactNumber'),('WhatsApp Desk','https://wa.me/918099888851')],
 'toast': T(ct.find(id='copy-toast')),
 'juris_label': 'Service Jurisdictions:', 'juris': 'Telangana | Andhra Pradesh | New Delhi', 'assure1': 'Senior Advocate Direct Scrutiny',
 'privilege': T(ct.select('.reveal-item.stagger-2 span')[-1]),
}
f = s.find('footer')
out['footer'] = {
 'desc': T(f.select_one('p.text-xs')), 'line_label': 'Direct Practice Line', 'phone': '8099888851',
 'links': [(T(a), a['href']) for a in f.select('a')], 'juris_label': 'Service Jurisdictions', 'juris': 'Telangana | Andhra Pradesh | New Delhi',
 'copyright': T(f.select('.border-t p.text-xs')[-1]), 'descriptor': 'Advocates & Associates',
}
out['icons'] = sorted({T(i) for i in s.select('.material-symbols-outlined')})
out['title'] = T(s.title)
json.dump(out, open('content.json','w'), ensure_ascii=False, indent=1)
print(json.dumps(out, ensure_ascii=False)[:200])
for k,v in out.items(): print(k, type(v).__name__)
print(len(out['faq']['items']), len(out['services']['items']), len(out['reviews']['cards']), out['icons'])
print(out['faq']['assure'], '|', out['contact']['privilege'], '|', out['footer']['copyright'], '|', out['hero']['badge'])
