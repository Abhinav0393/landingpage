import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
INK='#151922'; GOLD='#A98A50'; IVORY='#EDE8DD'; BG='#FBFAF7'; STONE='#F2EEE7'; MUTED='#5C6370'; BORDER='#E4DED3'; GI='#77592A'
plt.rcParams['font.family']='DejaVu Sans'

def box(ax,x,y,w,h,fc,ec=BORDER,r=0.012,lw=1):
    ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle=f"round,pad=0,rounding_size={r}",fc=fc,ec=ec,lw=lw))

# ---------- Figure 1: page section map ----------
fig,ax=plt.subplots(figsize=(9,10.2)); ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis('off')
secs=[('Header (sticky)','logo · 7 nav links · CONTACT · mobile menu','#FAF9F5',INK,'#header',0.055),
('01 Hero','full-bleed land/property image · overlay · H1 · 2 CTAs · 3 meta items',INK,IVORY,'#hero',0.10),
('Marquee','7 phrases separated by ✳ · CSS loop · pause control',INK,GOLD,'(no anchor)',0.058),
('02 At a glance — "Core Scrutiny Pillars"','4 pillars · numbered · hover-invert',BG,INK,'#pillars',0.075),
('03 Services — six practice areas','editorial index + detail panel (selected / hover / keyboard / touch)',BG,INK,'#services',0.10),
('04 Search depth — 15 / 30 / 60 years','timeline progression · 30-year benchmark emphasised',STONE,INK,'#search-depth',0.085),
('05 Process — five stages','connected horizontal path (vertical on mobile) · hover-invert',BG,INK,'#process',0.085),
('06 Expertise — "Acquisitions"','editorial 6/6 split · 3 points + illustrative checklist panel',STONE,INK,'#expertise',0.085),
('07 Client reviews','moving testimonial marquee · approved reviews only',BG,INK,'#reviews',0.075),
('08 FAQ','split screen: intro left · accordion right (6 source Q&As)',STONE,INK,'#faq',0.09),
('09 Contact — "Request a consultation"','phone · Call · Copy · WhatsApp · form (PROPOSED)',BG,INK,'#contact',0.095),
('10 Footer','logo · links · phone · 3 regions · © · "Advocates & Associates" (last line)',INK,IVORY,'(footer)',0.085)]
tot=sum(s[5] for s in secs); gap=0.004; scale=(1-0.06-gap*len(secs))/tot
y=0.97
for name,desc,bg,fg,anchor,h in secs:
    hh=h*scale
    box(ax,0.03,y-hh,0.94,hh,bg,ec=GOLD if bg in (INK,) else BORDER,r=0.01)
    ax.text(0.05,y-hh/2+0.008,name,color=fg if bg!=BG and bg!=STONE and bg!='#FAF9F5' else INK,fontsize=10.5,fontweight='bold',va='center')
    ax.text(0.05,y-hh/2-0.012,desc,color=(IVORY if bg==INK else MUTED),fontsize=8,va='center')
    ax.text(0.95,y-hh/2,anchor,color=(GOLD if bg==INK else GI),fontsize=8.5,ha='right',va='center',family='DejaVu Sans Mono')
    y-=hh+gap
ax.text(0.03,0.99,'Page structure and section backgrounds (single-page, top to bottom)',fontsize=11,fontweight='bold',color=INK,va='center')
fig.savefig('build/fig_sections.png',dpi=170,bbox_inches='tight',facecolor='white'); plt.close(fig)

# ---------- Figure 2: architecture & delivery pipeline ----------
fig,ax=plt.subplots(figsize=(9,5.4)); ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis('off')
def node(x,y,w,h,title,sub,fc=BG,tc=INK,ec=BORDER):
    box(ax,x,y,w,h,fc,ec=ec,r=0.02,lw=1.2)
    ax.text(x+w/2,y+h*0.62,title,ha='center',va='center',fontsize=9.5,fontweight='bold',color=tc)
    ax.text(x+w/2,y+h*0.30,sub,ha='center',va='center',fontsize=7.4,color=(IVORY if fc==INK else MUTED))
def arrow(x1,y1,x2,y2,label=None,c=GOLD):
    ax.add_patch(FancyArrowPatch((x1,y1),(x2,y2),arrowstyle='-|>',mutation_scale=12,color=c,lw=1.4))
    if label: ax.text((x1+x2)/2,(y1+y2)/2+0.03,label,ha='center',fontsize=7.2,color=MUTED)
ax.text(0.02,0.96,'Build-time and run-time architecture',fontsize=11,fontweight='bold',color=INK)
ax.text(0.02,0.90,'BUILD (developer / CI)',fontsize=8.5,color=GI,fontweight='bold')
node(0.02,0.66,0.2,0.18,'Source repo','GitHub · Astro + TS\nTailwind · content data')
node(0.28,0.66,0.2,0.18,'Build','astro build\nAVIF/WebP · CSS · TS',INK,IVORY,GOLD)
node(0.54,0.66,0.2,0.18,'Quality gates','Playwright · axe\nLighthouse CI')
node(0.80,0.66,0.18,0.18,'dist/','static HTML · CSS\nJS · fonts · images')
arrow(0.22,0.75,0.28,0.75); arrow(0.48,0.75,0.54,0.75); arrow(0.74,0.75,0.80,0.75)
ax.text(0.02,0.52,'RUN TIME (visitor)',fontsize=8.5,color=GI,fontweight='bold')
node(0.02,0.27,0.2,0.18,'Browser','Desktop · tablet · phone\nstatic page + ~small TS')
node(0.30,0.27,0.24,0.18,'Static host / CDN','HTTPS · security headers\nHosting provider TBD',INK,IVORY,GOLD)
node(0.62,0.27,0.17,0.18,'POST /api/contact','PHP (if available)\nor serverless fn')
node(0.84,0.27,0.14,0.18,'SMTP','authenticated\nrelay TBD')
arrow(0.22,0.36,0.30,0.36,'GET /'); arrow(0.54,0.36,0.62,0.36,'form POST'); arrow(0.79,0.36,0.84,0.36)
ax.add_patch(FancyArrowPatch((0.89,0.66),(0.42,0.45),connectionstyle='arc3,rad=0.25',arrowstyle='-|>',mutation_scale=12,color=GOLD,lw=1.4))
ax.text(0.78,0.545,'deploy dist/ (+ api/)',fontsize=7.2,color=MUTED,ha='center')
ax.text(0.02,0.14,'Not in scope: database · authentication · CMS · client-side framework · analytics (unless approved).',fontsize=8,color=MUTED)
ax.text(0.02,0.08,'Secrets (SMTP credentials) live only in server environment/secret storage — never in the repository or the browser bundle.',fontsize=8,color=MUTED)
fig.savefig('build/fig_arch.png',dpi=170,bbox_inches='tight',facecolor='white'); plt.close(fig)

# ---------- Figure 3: contact-form flow ----------
fig,ax=plt.subplots(figsize=(9,4.8)); ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis('off')
ax.text(0.02,0.95,'Contact form request flow (PROPOSED)',fontsize=11,fontweight='bold',color=INK)
node(0.02,0.62,0.17,0.2,'1 Client check','required · format\nconsent · honeypot')
node(0.23,0.62,0.17,0.2,'2 POST JSON','same-origin\nfetch (or form POST)')
node(0.44,0.62,0.17,0.2,'3 Server checks','origin · rate limit\nvalidate · sanitise',INK,IVORY,GOLD)
node(0.65,0.62,0.15,0.2,'4 Send mail','SMTP auth\nplain-text body')
node(0.84,0.62,0.14,0.2,'5 Respond','200 JSON\nsuccess state')
for a,b in [(0.19,0.23),(0.40,0.44),(0.61,0.65),(0.80,0.84)]: arrow(a,0.72,b,0.72)
node(0.23,0.22,0.17,0.2,'400 / 422','field errors\ninline messages',BG)
node(0.44,0.22,0.17,0.2,'429','rate limited\n"try again later"',BG)
node(0.65,0.22,0.15,0.2,'500 / 502','mail failure\ncall / WhatsApp fallback',BG)
for x in (0.315,0.525,0.725): arrow(x,0.62,x,0.42,c=MUTED)
ax.text(0.02,0.08,'Nothing is stored in a database. Failures are logged without message bodies. Contact details shown as fallback: telephone and WhatsApp.',fontsize=8,color=MUTED)
fig.savefig('build/fig_form.png',dpi=170,bbox_inches='tight',facecolor='white'); plt.close(fig)
print('ok')
