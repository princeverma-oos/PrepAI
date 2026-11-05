from pathlib import Path
from datetime import date
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
OUT = ROOT / "PrepAI_Technical_and_Product_Documentation.docx"
ASSETS.mkdir(parents=True, exist_ok=True)

NAVY = "#13213C"
BLUE = "#1F4E79"
CYAN = "#00A6A6"
TEAL = "#146C94"
LIGHT_BLUE = "#EAF3F8"
LIGHT_GRAY = "#F3F5F7"
MID_GRAY = "#D9D9D9"
DARK = "#1D1D1D"
WHITE = "#FFFFFF"

def font(size, bold=False):
    for candidate in ("Aptos", "Arial", "DejaVuSans"):
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default()

def rounded(draw, box, fill, outline=None, radius=20, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def centered(draw, box, text, fnt, fill, max_width=None, gap=5):
    x1, y1, x2, y2 = box
    words = text.split()
    max_width = max_width or (x2 - x1 - 24)
    lines, line = [], ""
    for word in words:
        test = (line + " " + word).strip()
        if draw.textbbox((0, 0), test, font=fnt)[2] <= max_width:
            line = test
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    line_h = draw.textbbox((0, 0), "Ag", font=fnt)[3] + gap
    total_h = len(lines) * line_h
    y = y1 + ((y2 - y1 - total_h) / 2)
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=fnt)
        draw.text(((x1 + x2 - (bbox[2] - bbox[0])) / 2, y), line, font=fnt, fill=fill)
        y += line_h

def arrow(draw, start, end, color=NAVY, width=5):
    import math
    draw.line([start, end], fill=color, width=width)
    ang = math.atan2(end[1] - start[1], end[0] - start[0])
    size = 14
    p1 = (end[0] - size * math.cos(ang - 0.5), end[1] - size * math.sin(ang - 0.5))
    p2 = (end[0] - size * math.cos(ang + 0.5), end[1] - size * math.sin(ang + 0.5))
    draw.polygon([end, p1, p2], fill=color)

def diagram_base(title, subtitle, h=900):
    im = Image.new("RGB", (1600, h), "white")
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 1600, 115), fill=NAVY)
    d.text((52, 28), title, font=font(42, True), fill="white")
    d.text((55, 79), subtitle, font=font(20), fill="#D8E7F1")
    return im, d

def save_architecture():
    im, d = diagram_base("PrepAI application architecture", "Browser-native React application with local resilience and optional cloud synchronization")
    layers = [(145, "Presentation layer", "Hero, landing content, navigation, authenticated user menu, and modal orchestration"),
              (360, "Feature and engine layer", "Roadmap generation, resume parsing, coding evaluation, question catalog, and auth event bus"),
              (575, "Persistence and integration layer", "Dexie IndexedDB, localStorage recovery, and optional Supabase PostgreSQL"),
              (790, "Feedback layer", "Assessment scorecards, readiness reports, animated experiences, and chart-driven progress views")]
    colors = ["#EAF3F8", "#EAF7F6", "#F3F5F7", "#EEF0F7"]
    for (y, label, body), fill in zip(layers, colors):
        rounded(d, (75, y, 1525, y + 150), fill, BLUE, 24, 3)
        d.text((110, y + 25), label, font=font(28, True), fill=NAVY)
        centered(d, (425, y + 20, 1475, y + 130), body, font(24), DARK)
    for y in [295, 510, 725]:
        arrow(d, (800, y), (800, y + 55), TEAL)
    p = ASSETS / "architecture.png"; im.save(p); return p

def save_ui_hierarchy():
    im, d = diagram_base("UI composition and modal orchestration", "App.jsx controls the active modal and passes feature callbacks into the landing experience", 980)
    root = (590, 145, 1010, 235); rounded(d, root, "#DCECF7", BLUE, 24, 3); centered(d, root, "App.jsx Root Controller", font(28, True), NAVY)
    boxes = [
        (80, 350, 375, 455, "Hero\nNavigation and CTAs"), (425, 350, 720, 455, "About\nValue proposition"),
        (770, 350, 1065, 455, "Features\nModule entry points"), (1115, 350, 1510, 455, "Auth modal\nLogin registration reset"),
        (80, 655, 375, 760, "Roadmap builder\nResume to daily plan"), (425, 655, 720, 760, "Mock interview\nTimer, chat, scorecard"),
        (770, 655, 1065, 760, "DSA practice\nCatalog and test runner"), (1115, 655, 1510, 760, "Review and reports\nResume, analytics, report")]
    for x1, y1, x2, y2, text in boxes:
        rounded(d, (x1, y1, x2, y2), "#F3F5F7", "#5D6D7E", 18, 2); centered(d, (x1, y1, x2, y2), text, font(21, True), NAVY)
        arrow(d, (800, 235), ((x1+x2)//2, y1), TEAL, 3)
    d.text((120, 870), "Shared building blocks: AnimatedText, CodeEditor, UserMenu, Lucide icons, Framer Motion", font=font(23), fill=DARK)
    p = ASSETS / "ui_hierarchy.png"; im.save(p); return p

def save_roadmap_workflow():
    im, d = diagram_base("Resume to adaptive roadmap workflow", "Candidate input is analyzed in the browser before a multi-tier persistence attempt", 980)
    steps = ["Upload or paste resume", "Parse file and extract competencies", "Add target job description and schedule", "Generate constrained 2 to 30 day plan", "Persist profile and roadmap", "Track tasks and launch practice rounds"]
    x, y = 85, 200
    for i, text in enumerate(steps):
        w = 410 if i % 2 == 0 else 480
        rounded(d, (x, y, x+w, y+112), "#EAF3F8" if i < 4 else "#EAF7F6", BLUE if i < 4 else TEAL, 18, 3)
        d.ellipse((x+18, y+28, x+70, y+80), fill=BLUE if i < 4 else TEAL)
        centered(d, (x+18, y+28, x+70, y+80), str(i+1), font(22, True), WHITE)
        centered(d, (x+85, y+12, x+w-12, y+100), text, font(22, True), NAVY)
        if i < len(steps)-1:
            if i % 2 == 0:
                arrow(d, (x+w+12, y+55), (x+w+78, y+55), TEAL, 4); x = x+w+95
            else:
                y += 190; x = 85
    d.text((94, 820), "Key decision points", font=font(29, True), fill=NAVY)
    for i, t in enumerate(["PDF and text inputs follow different parser paths.", "Skill matching combines extracted resume terms with job-description signals.", "The final day is always a comprehensive mock and readiness calibration."]):
        d.text((120, 870 + i*34), "- " + t, font=font(20), fill=DARK)
    p = ASSETS / "roadmap_workflow.png"; im.save(p); return p

def save_storage():
    im, d = diagram_base("Persistence behavior and graceful degradation", "Each domain record has cloud, IndexedDB, and localStorage paths", 920)
    app = (560, 150, 1040, 245); rounded(d, app, "#DCECF7", BLUE, 22, 3); centered(d, app, "db.js unified database functions", font(28, True), NAVY)
    stores = [(90, 440, 490, 600, "Supabase PostgreSQL\nOptional cloud synchronization\nprofiles, roadmaps, assessments, reports", "#EAF7F6", TEAL),
              (600, 440, 1000, 600, "Dexie IndexedDB\nPrimary browser persistence\nPrepAIDatabaseV3", "#EAF3F8", BLUE),
              (1110, 440, 1510, 600, "localStorage\nSynchronous fallback mirrors\nactive roadmap and history", "#F3F5F7", "#5D6D7E")]
    for x1,y1,x2,y2,txt,fill,border in stores:
        rounded(d,(x1,y1,x2,y2),fill,border,20,3); centered(d,(x1,y1,x2,y2),txt,font(23,True),NAVY); arrow(d,(800,245),((x1+x2)//2,y1),border,4)
    d.text((95, 735), "Read order", font=font(29, True), fill=NAVY)
    d.text((95, 780), "1. Latest cloud record when Supabase is configured  2. Latest IndexedDB record  3. Browser fallback value", font=font(22), fill=DARK)
    d.text((95, 835), "Write behavior", font=font(29, True), fill=NAVY)
    d.text((95, 875), "Cloud failures are caught; local persistence continues so the user can work while offline.", font=font(22), fill=DARK)
    p = ASSETS / "persistence.png"; im.save(p); return p

def save_execution():
    im, d = diagram_base("Coding run and evaluation sequence", "JavaScript receives direct execution; non-JavaScript tracks are interface simulations in this implementation", 1000)
    actors = [(80,"Candidate"),(350,"CodeEditor"),(620,"codeRunner"),(890,"Function closure"),(1160,"Test matrix"),(1400,"Scorecard")]
    for x,label in actors:
        rounded(d,(x,145,x+145,225),"#EAF3F8",BLUE,16,2); centered(d,(x,145,x+145,225),label,font(18,True),NAVY)
        d.line((x+72,225,x+72,920),fill="#B9C7D3",width=2)
    seq=[(270,80,422,"Write solution"),(365,422,692,"Run code"),(465,692,962,"Create callable function"),(565,962,1232,"Evaluate cases"),(680,1232,692,"Result details"),(785,692,1472,"Generate weighted scorecard"),(880,1472,152,"Display feedback")]
    for y,x1,x2,label in seq:
        arrow(d,(x1,y),(x2,y),TEAL,3); d.text(((x1+x2)//2-70,y-27),label,font=font(16),fill=DARK)
    d.text((90,940),"Error route: syntax or runtime exceptions return a visible failure result rather than crashing the modal.",font=font(20),fill=DARK)
    p = ASSETS / "code_execution.png"; im.save(p); return p

def save_data_model():
    im, d = diagram_base("Domain data model", "The cloud schema and local stores use corresponding profile, roadmap, assessment, and report concepts", 1050)
    entities = [
        (75,180,415,405,"profiles","id, target_role, days_available, skills, seniority, created_at"),
        (455,180,795,405,"roadmaps","id, target_role, target_company, days_count, daily_plans, created_at"),
        (835,180,1175,405,"assessments","id, question_title, overall_score, scorecard, test_results, code, execution time"),
        (1215,180,1555,405,"reports","id, overall_readiness, radar_scores, strengths, growth_areas, created_at")]
    for x1,y1,x2,y2,name,fields in entities:
        rounded(d,(x1,y1,x2,y2),"#F3F5F7",BLUE,18,3); d.rectangle((x1+3,y1+3,x2-3,y1+58),fill=BLUE); centered(d,(x1,y1,x2,y1+58),name,font(23,True),WHITE); centered(d,(x1+20,y1+75,x2-20,y2-15),fields,font(19),DARK)
    arrows=[((415,292),(455,292)),((795,292),(835,292)),((1175,292),(1215,292))]
    for a,b in arrows: arrow(d,a,b,TEAL,4)
    d.text((100,525),"Local Dexie stores",font=font(31,True),fill=NAVY)
    d.text((100,580),"users | profiles | roadmaps | assessments | reports",font=font(26),fill=DARK)
    d.text((100,700),"Ownership and reporting perspective",font=font(31,True),fill=NAVY)
    text="A roadmap is generated from a profile-like input. Practice produces assessments. Assessments and roadmap progress are aggregated into a readiness report. The application currently treats records as independently saved snapshots rather than enforcing foreign-key relationships in the browser."
    centered(d,(100,755,1500,970),text,font(26),DARK)
    p = ASSETS / "data_model.png"; im.save(p); return p

def save_security():
    im, d = diagram_base("Security and privacy boundaries", "This diagram distinguishes browser-resident processing from optional cloud persistence", 950)
    rounded(d,(80,155,760,760),"#EAF3F8",BLUE,25,4); d.text((115,190),"Browser boundary",font=font(32,True),fill=NAVY)
    browser=["Resume file reading and heuristic skill extraction","Candidate code entry and direct JavaScript execution","Dexie database and localStorage recovery","Client-side demonstration authentication state"]
    for i,t in enumerate(browser):
        rounded(d,(120,270+i*105,710,350+i*105),"#FFFFFF","#8BA8BC",14,2); centered(d,(135,275+i*105,695,345+i*105),t,font(19),DARK)
    rounded(d,(930,155,1520,760),"#EAF7F6",TEAL,25,4); d.text((965,190),"Optional Supabase boundary",font=font(29,True),fill=NAVY)
    cloud=["PostgreSQL tables for profiles, roadmaps, assessments, reports","Public Vite environment variables configure the client","Row-level-security policies exist in the supplied SQL schema","No custom application server is present in this repository"]
    for i,t in enumerate(cloud):
        rounded(d,(970,270+i*105,1470,350+i*105),"#FFFFFF","#78A9A5",14,2); centered(d,(985,275+i*105,1455,345+i*105),t,font(18),DARK)
    arrow(d,(760,455),(930,455),TEAL,5); d.text((786,412),"optional sync",font=font(20,True),fill=TEAL)
    d.text((100,840),"Production attention: replace client-side demonstration credentials and unrestricted policies with a real identity provider and user-scoped RLS before handling production user data.",font=font(19),fill=DARK)
    p = ASSETS / "security_boundaries.png"; im.save(p); return p

def set_cell_shading(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr(); shd = OxmlElement('w:shd'); shd.set(qn('w:fill'), fill.lstrip('#')); tcPr.append(shd)

def set_cell_margins(cell, top=100, start=120, bottom=100, end=120):
    tc = cell._tc; tcPr = tc.get_or_add_tcPr(); tcMar = tcPr.first_child_found_in('w:tcMar')
    if tcMar is None:
        tcMar = OxmlElement('w:tcMar'); tcPr.append(tcMar)
    for m,v in [('top',top),('start',start),('bottom',bottom),('end',end)]:
        node = tcMar.find(qn(f'w:{m}'))
        if node is None: node = OxmlElement(f'w:{m}'); tcMar.append(node)
        node.set(qn('w:w'),str(v)); node.set(qn('w:type'),'dxa')

def set_table_borders(table, color=MID_GRAY):
    tblPr = table._tbl.tblPr; borders = tblPr.first_child_found_in('w:tblBorders')
    if borders is None: borders = OxmlElement('w:tblBorders'); tblPr.append(borders)
    for edge in ('top','left','bottom','right','insideH','insideV'):
        tag = qn(f'w:{edge}'); el = borders.find(tag)
        if el is None: el=OxmlElement(f'w:{edge}'); borders.append(el)
        el.set(qn('w:val'),'single'); el.set(qn('w:sz'),'6'); el.set(qn('w:color'),color.lstrip('#'))

def add_page_field(paragraph):
    run=paragraph.add_run(); fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); run._r.addnext(fld)

def add_image(doc, path, caption):
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run().add_picture(str(path),width=Inches(6.65))
    cap=doc.add_paragraph(caption); cap.alignment=WD_ALIGN_PARAGRAPH.CENTER; cap.style='Caption'

def add_para(doc, text, bold_lead=None):
    p=doc.add_paragraph()
    p.paragraph_format.space_after=Pt(7)
    p.paragraph_format.line_spacing=1.12
    if bold_lead and text.startswith(bold_lead):
        p.add_run(bold_lead).bold=True; p.add_run(text[len(bold_lead):])
    else: p.add_run(text)
    return p

def add_bullets(doc, items):
    for item in items:
        p=doc.add_paragraph(style='List Bullet'); p.paragraph_format.space_after=Pt(3); p.add_run(item)

def add_table(doc, headers, rows, widths=None):
    table=doc.add_table(rows=1, cols=len(headers)); table.alignment=WD_TABLE_ALIGNMENT.CENTER; table.style='Table Grid'; set_table_borders(table)
    for i,h in enumerate(headers):
        cell=table.rows[0].cells[i]; set_cell_shading(cell,NAVY); set_cell_margins(cell); cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
        r=cell.paragraphs[0].add_run(h); r.bold=True; r.font.color.rgb=RGBColor(255,255,255); r.font.size=Pt(8.5)
    for idx,row in enumerate(rows):
        cells=table.add_row().cells
        for i,val in enumerate(row):
            set_cell_margins(cells[i]); cells[i].vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if idx%2: set_cell_shading(cells[i],LIGHT_BLUE)
            p=cells[i].paragraphs[0]; p.paragraph_format.space_after=Pt(0); rr=p.add_run(str(val)); rr.font.size=Pt(8.4)
    if widths:
        for row in table.rows:
            for cell,width in zip(row.cells,widths): cell.width=Inches(width)
    doc.add_paragraph().paragraph_format.space_after=Pt(2)
    return table

def heading(doc, text, level=1):
    p=doc.add_heading(text,level=level); p.paragraph_format.space_before=Pt(16 if level==1 else 10); p.paragraph_format.space_after=Pt(7); return p

def build():
    diagrams=[save_architecture(),save_ui_hierarchy(),save_roadmap_workflow(),save_storage(),save_execution(),save_data_model(),save_security()]
    doc=Document()
    sec=doc.sections[0]; sec.top_margin=Inches(.65); sec.bottom_margin=Inches(.65); sec.left_margin=Inches(.72); sec.right_margin=Inches(.72)
    styles=doc.styles
    styles['Normal'].font.name='Aptos'; styles['Normal'].font.size=Pt(10.2); styles['Normal']._element.rPr.rFonts.set(qn('w:ascii'),'Aptos'); styles['Normal']._element.rPr.rFonts.set(qn('w:hAnsi'),'Aptos')
    styles['Title'].font.name='Aptos Display'; styles['Title'].font.size=Pt(28); styles['Title'].font.color.rgb=RGBColor(0,0,0)
    for st,size in [('Heading 1',17),('Heading 2',13),('Heading 3',11)]:
        styles[st].font.name='Aptos Display'; styles[st].font.size=Pt(size); styles[st].font.color.rgb=RGBColor(0,0,0)
    styles['Caption'].font.size=Pt(8.5); styles['Caption'].font.italic=True; styles['Caption'].font.color.rgb=RGBColor(70,70,70)
    footer=sec.footer.paragraphs[0]; footer.alignment=WD_ALIGN_PARAGRAPH.CENTER; footer.add_run('PrepAI Technical and Product Documentation   |   Page '); add_page_field(footer)

    p=doc.add_paragraph(style='Title'); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run('PrepAI Technical and Product Documentation')
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run('Architecture Product Workflows Data Design Security and Engineering Guide').italic=True
    doc.add_paragraph()
    add_para(doc,'This document explains how the PrepAI interview preparation platform is structured, how candidates move through its experience, how data is generated and persisted, and how the supplied design and decision records map to the implementation. It is written for product owners, designers, developers, reviewers, and future maintainers.')
    add_para(doc,'PrepAI is a Vite-powered React single-page application that keeps the core interview-preparation experience inside the browser. It combines resume interpretation, schedule generation, coding exercises, assessment feedback, offline browser storage, and an optional Supabase synchronization path. The implementation prioritizes demonstrable workflow coverage and local resilience over a server-managed product platform.')
    add_table(doc,['Document property','Value'],[['System','PrepAI AI powered interview preparation platform'],['Primary audience','Product, design, engineering, and technical review teams'],['Repository scope','prepai source tree plus design and decision documentation'],['Generated','11 October 2026'],['Document type','Technical product architecture and maintenance guide']], [1.8,4.8])
    heading(doc,'Reading guide',1)
    add_bullets(doc,['Sections 1 through 4 establish the product, stack, and architecture.','Sections 5 through 10 explain the user experience, engine behavior, data model, and security boundaries.','Sections 11 through 15 provide operations, decisions, quality observations, and a future delivery plan.','Appendices provide a practical source map, configuration reference, data definitions, and maintenance checklists.'])
    doc.add_page_break()

    heading(doc,'Contents',1)
    contents=['1 Product overview and scope','2 Technology stack and runtime','3 System architecture','4 Codebase map and application bootstrap','5 Experience design and component guide','6 Candidate workflows','7 Engines and algorithms','8 Data persistence and data model','9 Authentication and session behavior','10 Security privacy and limitations','11 Development operations and environment setup','12 Architectural decisions and trade offs','13 Implementation alignment and technical observations','14 Product roadmap and recommended delivery phases','15 Maintenance and extension guide','Appendix A Component inventory','Appendix B Data contracts and question catalog','Appendix C Configuration and deployment checklist','Appendix D Glossary']
    for item in contents: add_para(doc,item)
    doc.add_page_break()

    heading(doc,'1 Product overview and scope',1)
    add_para(doc,'PrepAI is an interview-preparation workspace for software-engineering candidates. It is organized around a simple loop: understand the candidate profile, produce a time-bounded preparation plan, practice under interview-like conditions, store the resulting evidence, and turn that evidence into an interpretable readiness report.')
    heading(doc,'Primary product capabilities',2)
    add_table(doc,['Capability','Candidate outcome','Implementation anchor'],[
        ['Resume and job-description analysis','A candidate can upload or paste career material and identify skills, seniority signals, and preparation gaps.','resumeParser.js, RoadmapBuilderModal.jsx'],
        ['Adaptive roadmap generation','A constrained 2 to 30 day preparation schedule is generated with daily tasks, study guides, and practice links.','roadmapGenerator.js'],
        ['Mock interview workspace','A timed coding experience presents a question, proctor-like interaction, code editor, test runs, and scorecard.','MockInterviewModal.jsx, CodeEditor.jsx'],
        ['DSA practice arena','Candidates browse selected challenges, edit starter code, run cases, and inspect theory.','DsaPracticeModal.jsx, questionsData.js'],
        ['Resume review and analytics','The interface surfaces keyword gaps, seniority cues, historic performance, and readiness indicators.','ResumeReviewModal.jsx, AnalyticsModal.jsx'],
        ['Persistence and reports','Roadmaps, attempts, and reports remain available through browser storage and can synchronize when configured.','db.js, PerformanceReportModal.jsx']
    ],[1.55,2.55,2.65])
    heading(doc,'Product boundary',2)
    add_para(doc,'The repository is a client-side application rather than a complete production service. It has no API server, background workers, server-owned identity provider, or true multi-language runtime. Where the interface presents an AI-like or external-service capability, the implementation uses local heuristics, curated response data, browser APIs, or simulations. This distinction is important for product claims, security review, and future roadmap planning.')
    heading(doc,'Design principles represented in the repository',2)
    add_bullets(doc,['Offline-first continuity: browser storage keeps the core journey usable when cloud synchronization is absent or unavailable.','Focused modal workspaces: the landing page remains stable while high-attention work happens in dedicated overlays.','Professional dark interface: black and charcoal surfaces, warm light text, and a primary accent produce an interview-studio aesthetic.','Fast feedback: a candidate moves from input to plan, from code to test result, and from assessment to report without a queue or round trip to a custom backend.','Progressive enhancement: Supabase adds cloud persistence without making it a prerequisite for the local demo experience.'])

    heading(doc,'2 Technology stack and runtime',1)
    add_para(doc,'The application is built as a Vite React client. The package declaration uses ES modules and exposes development, build, and preview scripts. The stack is intentionally browser-centric: it relies on browser files, IndexedDB, Web Storage, performance timing, canvas-based charts, and animated component lifecycle behavior.')
    add_table(doc,['Layer','Technology','Role in PrepAI','Reason for fit'],[
        ['Application','React 19','Functional UI composition, state, effects, conditional modal mounting.','Strong ecosystem for the interaction-heavy single-page experience.'],
        ['Build and local runtime','Vite 8 and React plugin','Development server and optimized client build.','Fast iteration with minimal project overhead.'],
        ['Styling','Tailwind CSS 3 plus index CSS','Responsive layout, dark surfaces, visual utilities, custom effects.','Utility composition supports the dense but consistent modal library.'],
        ['Motion','Framer Motion','Entrance, exit, and in-view animated presentation.','Supports conditional modal transitions and scroll-driven content.'],
        ['Cloud integration','Supabase JavaScript client','Optional PostgreSQL reads and writes.','Offers a lightweight path to hosted persistence without a custom API.'],
        ['Local data','Dexie over IndexedDB','Offline browser records for users, roadmaps, assessments, reports.','Indexed storage is better suited than only key-value storage for historical records.'],
        ['Charts','Chart.js and react-chartjs-2','Readiness and performance visualization.','Radar-chart support matches the readiness model.'],
        ['Icons','Lucide React and React Icons','Consistent accessible interface glyphs.','Small composable icon primitives.'],
        ['Document parsing','Browser FileReader and PDF byte scan','Text and basic PDF ingestion.','Keeps input processing local to the browser.']
    ],[1.25,1.55,2.25,1.95])
    heading(doc,'Build outputs and operational notes',2)
    add_para(doc,'The production build completes successfully with Vite. The build reports a large JavaScript bundle warning after minification, which is expected from the rich component graph and client libraries. Dynamic import boundaries around heavyweight modals, PDF processing, and charting would be a sensible later optimization. The current Vite configuration remains intentionally small: it installs the React plugin and otherwise relies on Vite defaults.')
    doc.add_page_break()

    heading(doc,'3 System architecture',1)
    add_para(doc,'The architecture is best understood as four cooperating layers. The presentation layer renders the landing experience and conditionally mounted modal workspaces. The feature and engine layer interprets inputs, builds roadmaps, evaluates code, manages questions, and updates authentication state. The persistence layer persists snapshots locally and may synchronize them to Supabase. The feedback layer turns user work into visible progress, scorecards, and reports.')
    add_image(doc,diagrams[0],'Figure 1. Layered browser-first architecture.')
    heading(doc,'Architecture responsibilities',2)
    add_table(doc,['Layer','Responsibilities','Key source areas'],[
        ['Presentation','Landing composition, navigation actions, modal open state, Escape-key close behavior.','App.jsx; Hero.jsx; About.jsx; Features.jsx'],
        ['Workspaces','Roadmap, interview, practice, review, analytics, report, and auth experiences.','src/components directory'],
        ['Engines','Parsing, competency heuristics, schedule generation, test evaluation, score generation.','src/utils directory'],
        ['Persistence','Schema declaration, cloud normalization, local fallback behavior.','src/db directory'],
        ['Data definition','Curated mock questions, starter code, theory, sample resumes.','questionsData.js'],
    ],[1.2,3.2,2.6])
    heading(doc,'Application orchestration',2)
    add_para(doc,'App.jsx owns activeModal, selectedQuestionId, authMode, and currentUser state. It passes modal-opening callbacks downward and mounts individual modals against a shared main page. An Escape listener closes the active modal. This centralized approach makes the demo easy to follow and avoids a router dependency for the core workflow, although it also means modal state is not represented in a shareable URL.')
    add_image(doc,diagrams[1],'Figure 2. UI hierarchy and callback routing.')

    heading(doc,'4 Codebase map and application bootstrap',1)
    add_para(doc,'The project is organized as a conventional Vite client application. main.jsx renders App into the browser root and loads global CSS. The root controller imports all main landing and modal components. Components call utilities for domain work and db functions for persistence. Public assets include interface imagery and SVG assets, while dist contains the generated build output.')
    add_table(doc,['Path','Purpose','Maintenance expectation'],[
        ['src/main.jsx','Client entry point that renders App.','Keep startup lean; import only global foundations.'],
        ['src/App.jsx','Global modal controller and auth subscription.','Use as the source of truth for top-level interface transitions.'],
        ['src/components','Landing and modal UI components.','Keep feature logic close to its workspace; extract reusable behavior deliberately.'],
        ['src/utils','Pure or mostly pure feature utilities and local service behavior.','Add automated unit tests for engine rules as they mature.'],
        ['src/db','Dexie schema, storage functions, and Supabase configuration.','Treat payload mapping and fallback order as data-contract code.'],
        ['public','Static SVG, favicon, and background assets.','Use for assets that should not be bundled by module imports.'],
        ['supabase-schema.sql','Cloud schema and policies.','Review with security changes; deploy through controlled migrations.'],
        ['package.json','Scripts and dependency contract.','Keep aligned with lockfile and supported runtime.']
    ],[1.35,2.6,3.05])
    heading(doc,'Bootstrap path',2)
    add_bullets(doc,['The browser loads index.html and the main entry module.','main.jsx mounts the React root and imports global styles.','App initializes current user state from authService and subscribes to subsequent changes.','The landing experience receives callbacks that identify the desired modal key.','The selected modal receives the state and its close callback; modal-specific logic loads or saves domain data as needed.'])

    heading(doc,'5 Experience design and component guide',1)
    add_para(doc,'The supplied design material describes an interview-studio visual identity. In the implementation, the palette is predominantly black and charcoal with warm off-white text and a primary accent supplied through Tailwind configuration. Rounded frames, backdrop blur, bordered dark panels, soft hover changes, deliberate type scale, and motion-driven reveals create a premium but practical environment.')
    heading(doc,'Landing experience',2)
    add_table(doc,['Component','Purpose','Notable behavior'],[
        ['Hero','Sets the product proposition and provides direct entry points.','Background video, responsive oversized title, modal-based navigation, user menu.'],
        ['About','Explains the product value proposition.','Scroll-aware animation helpers.'],
        ['Features','Exposes the major modules as card entry points.','Video and image-backed feature cards with action routing.'],
        ['AnimatedText','Reusable motion primitives for word and character reveal.','Uses Framer Motion in-view behavior.'],
        ['UserMenu','Reflects the current client session.','Sign in, report access, demo switching, outside-click closure, sign out.'],
        ['CodeEditor','Provides a lightweight code-entry surface.','Language selector, copy, reset, run action, line-number gutter.']
    ],[1.4,2.4,3.2])
    heading(doc,'Modal workspaces',2)
    add_table(doc,['Workspace','User goal','Inputs','Outputs'],[
        ['Roadmap Builder','Turn profile and role intent into a schedule.','Resume file or text, job description, role, company, day count.','Roadmap object, task completion state, saved profile snapshot.'],
        ['Mock Interview','Practice one timed question with feedback.','Question, selected language, code, conversation interactions, elapsed duration.','Test outcomes, scorecard, assessment record.'],
        ['DSA Practice','Practice from a curated catalog.','Question selection, code, language.','Test feedback and optional mock handoff.'],
        ['Resume Review','Inspect profile-to-role fit.','Selected sample or candidate text.','Skill-gap and improvement-oriented presentation.'],
        ['Analytics','Review performance direction.','Stored assessment history.','Readiness visualization and practice calls to action.'],
        ['Performance Report','Produce a compact candidate report.','Assessment and roadmap data.','Aggregated readiness data and persisted report.'],
        ['Authentication','Sign in, create account, use demo access, or reset a local credential.','Name, email, password, role, company.','Local or session browser session plus subscriber notification.']
    ],[1.3,2.1,2.0,1.6])
    heading(doc,'Responsive and accessibility practices',2)
    add_bullets(doc,['Responsive Tailwind breakpoints are applied throughout the landing composition and modal sizing.','Buttons use semantic button elements and many controls include accessible labels or titles.','The root controller supports Escape-based modal dismissal.','The code editor exposes its input with an aria label and does not rely on a third-party inaccessible editor surface.','Further production work should add focus trapping, initial focus placement, return-focus behavior, semantic dialog roles, and full keyboard tests for every modal.'])
    doc.add_page_break()

    heading(doc,'6 Candidate workflows',1)
    add_para(doc,'The product is designed around connected journeys rather than isolated screens. The roadmap path is the central journey: a user starts with career context, receives a plan, acts on individual tasks, and enters targeted practice. The mock session converts practice into measurable evidence, and reporting turns evidence into a decision aid.')
    add_image(doc,diagrams[2],'Figure 3. Resume-to-roadmap workflow.')
    heading(doc,'Workflow A Roadmap generation',2)
    add_bullets(doc,['The user opens the Roadmap Builder from the hero or navigation.','When the modal opens, it attempts to load the most recent saved roadmap. If none is available, it synthesizes and saves a default roadmap so the experience is never blank.','The user can upload a supported file or edit the resume text, provide a job description, select a role and company, and choose a day count.','parseResumeFile reads text directly or applies the PDF byte-based extraction path.','generateAdaptiveRoadmap derives skills and seniority, looks for job-description signals, constrains the requested time frame, and assembles daily plan objects.','The modal persists profile context and the generated plan. Users can toggle individual task completion and launch the target practice question.'])
    heading(doc,'Workflow B Mock interview and assessment',2)
    add_image(doc,diagrams[4],'Figure 4. Candidate coding run and evaluation sequence.')
    add_bullets(doc,['A mock question and timer establish the interview context.','The candidate writes code in CodeEditor and selects JavaScript or Python from the interface.','The runner evaluates JavaScript using a dynamically created function and a question-specific test route. For other languages, the current implementation returns simulated run outcomes based on a basic code-length condition.','A scorecard combines code structure, complexity, communication activity, and problem-solving with weighted random ranges.','The resulting assessment is stored through the persistence layer and contributes to later reporting.'])
    heading(doc,'Workflow C Authentication',2)
    add_bullets(doc,['AuthModal supports local sign-in, registration, a demo-user path, simulated social login, and a simulated password reset flow.','initializeUsers seeds browser data with demo users when no users are present.','login validates input, resolves a local stored user, creates a browser session record, and emits a notification to registered subscribers.','App and UserMenu use the session state to adapt the interface.','logout clears the local and session variants of the current-user key and broadcasts a null user.'])
    heading(doc,'Workflow D Reporting',2)
    add_bullets(doc,['PerformanceReportModal loads assessment history and the current roadmap.','The report derives readiness content from available work and persists the resulting report snapshot.','AnalyticsModal provides a progress-oriented interface that can direct the user into additional mock practice.','The report is designed as a candidate-facing narrative rather than a compliance-grade credential in the current implementation.'])

    heading(doc,'7 Engines and algorithms',1)
    heading(doc,'Resume parsing and competency extraction',2)
    add_para(doc,'parseResumeFile distinguishes text-like files from PDF files. Text formats use FileReader.readAsText. PDFs are read into an ArrayBuffer and scanned for printable ASCII within the first 150,000 bytes; PDF-like token noise is removed and the remaining text is normalized. Other formats follow a text fallback. This is a lightweight local extraction strategy rather than a fully faithful DOCX or PDF layout parser.')
    add_para(doc,'extractCompetencies lowercases the input and checks a curated list of technology, platform, and engineering-practice terms. It returns the matched skills, a seniority band inferred from common senior, staff, principal, lead, intern, and experience-year signals, and a word count. If no skills are found, it supplies a broad default skills set so downstream roadmap generation remains usable.')
    heading(doc,'Adaptive roadmap generation',2)
    add_para(doc,'generateAdaptiveRoadmap receives resume text, job description, days available, target company, and target role. The algorithm clamps daysAvailable to an inclusive 2 through 30 range. It detects system-design, concurrency, and full-stack signals and calculates a direct overlap between extracted resume skills and job-description text. It then compares against a fixed missing-skill set and composes daily plan items from a five-module curriculum.')
    add_table(doc,['Generated field','Meaning','Operational behavior'],[
        ['candidateSeniority','Heuristic career band.','Feeds design interpretation and context.'],
        ['skillsExtracted','Recognized resume terms.','Used for direct JD overlap.'],
        ['matchedSkills','Recognized skills also present in JD text.','Feeds match percentage.'],
        ['missingSkills','Fixed capability targets not found in the extracted resume skills.','Guides visible emphasis rather than a full semantic gap model.'],
        ['dailyPlans','Daily study guide, tasks, question ID, estimated hours, scheduled round.','Cycles across a fixed curriculum; final day becomes a mock calibration.'],
        ['matchPercentage','Bounded calculated score.','Clamped to 68 to 95 in the present implementation.']
    ],[1.4,2.1,3.2])
    heading(doc,'Coding evaluator and scorecard',2)
    add_para(doc,'executeCode is intentionally a small in-browser evaluator. It wraps submitted JavaScript in a Function constructor and returns a known symbol if the code defines one of the catalog targets. The Two Sum route executes actual test cases and checks either valid index ordering. Other catalog tracks currently return structural simulated results. Syntax and runtime errors return a structured failure object with measured elapsed time.')
    add_para(doc,'generateScorecard computes code-quality, complexity, communication, and problem-solving values. Code length and conversation-log length influence selected scores, while random ranges make the demo feel variable. The weighted output is mapped to Strong Hire, Hire, or Needs Practice. This is useful as a demonstrator of report flow, but it is not a deterministic or validated interview evaluation model.')
    heading(doc,'Question catalog',2)
    add_para(doc,'questionsData.js centralizes mock questions, starters, test cases, theory notes, and proctor responses. The catalog includes algorithmic and system-design shaped tracks, including Two Sum, LRU Cache, a distributed rate limiter, and behavioral-response material. The catalog is the right extension point for new practice material because both DSA practice and mock interview features import it.')

    heading(doc,'8 Data persistence and data model',1)
    add_image(doc,diagrams[3],'Figure 5. Multi-tier persistence and fallback behavior.')
    add_para(doc,'The database module creates a Dexie database named PrepAIDatabaseV3 with users, profiles, roadmaps, assessments, and reports stores. Each domain save function uses a cloud-first attempt when Supabase configuration is valid, a local IndexedDB attempt, and a localStorage mirror or fallback. Read functions similarly try cloud, then IndexedDB, then a browser fallback key.')
    add_image(doc,diagrams[5],'Figure 6. Domain data concepts and their reporting relationship.')
    heading(doc,'Cloud schema summary',2)
    add_table(doc,['Table','Key fields','Purpose'],[
        ['profiles','target_role, days_available, skills, seniority','Candidate preparation context.'],
        ['roadmaps','target_role, target_company, days_count, daily_plans','Serialized day-by-day plan.'],
        ['assessments','question_title, overall_score, scorecard, test_results, candidate_code, execution_time_ms','Practice and mock evidence.'],
        ['reports','overall_readiness, radar_scores, strengths, growth_areas','Readiness snapshot suitable for display.']
    ],[1.4,3.9,1.5])
    heading(doc,'Data behavior considerations',2)
    add_bullets(doc,['Cloud rows and local records are snapshots; the code does not reconcile divergent versions or attach them to a durable authenticated user identity.','The current read policy selects the most recent cloud record when cloud is configured, so shared public rows could influence another user experience if cloud policies remain broad.','Browser storage preserves the interaction story but must not be treated as a secure account store.','The supplied cloud schema is appropriate as a functional prototype schema. A production release should introduce ownership fields, user-scoped queries, controlled schema migrations, validation, and conflict-resolution rules.'])

    heading(doc,'9 Authentication and session behavior',1)
    add_para(doc,'Authentication is a local demonstration service. It maintains user records in Dexie when possible and localStorage when not. It uses browser localStorage or sessionStorage for the current session according to the remember-me choice. An in-memory subscriber set lets mounted components react to state updates without introducing a global state library.')
    add_table(doc,['Action','Validation or behavior','Persistence effect'],[
        ['Sign in','Checks email shape and password against locally stored user data.','Stores a session-like user object in localStorage or sessionStorage.'],
        ['Register','Checks name, email shape, password length, confirmation, and duplicate email.','Adds a local user then signs in automatically.'],
        ['Demo login','Uses pre-seeded browser demo accounts.','Creates a normal local remembered session.'],
        ['Social login','Creates a simulated provider identity.','Stores a synthetic local profile, no OAuth exchange.'],
        ['Password reset','Generates a displayable verification code in the application.','Updates local credential records after simulated confirmation.'],
        ['Sign out','Clears current session keys and broadcasts null.','Leaves user records and historical data intact.']
    ],[1.3,3.1,2.4])
    add_para(doc,'The code deliberately supports demo flows, but its client-side credential handling is not appropriate for production authentication. Password values and account records are browser-accessible, social sign-in does not perform provider verification, and session tokens are illustrative strings. A production version should use Supabase Auth or another identity provider, HTTP-only session handling where relevant, server-side password storage, user-scoped RLS, rate limiting, and reset tokens delivered through a trusted channel.')

    heading(doc,'10 Security privacy and limitations',1)
    add_image(doc,diagrams[6],'Figure 7. Browser and optional cloud security boundaries.')
    heading(doc,'Privacy posture',2)
    add_para(doc,'The strongest privacy property in the current design is that resume parsing and coding evaluation happen in the browser. A resume file is read by browser APIs and transformed locally. The application may still persist derived profile information, roadmaps, assessment content, and reports when cloud synchronization is configured. Teams should make the exact cloud payload clear to users and align it with the relevant data-retention and deletion requirements.')
    heading(doc,'Security limitations to address before production',2)
    add_table(doc,['Area','Current implementation','Recommended production treatment'],[
        ['Authentication','Local records, client-visible passwords, simulated token and provider flow.','Managed authentication, verified identity, secure password handling, email verification, session controls.'],
        ['Authorization','Supplied SQL uses broad public policies.','User identifiers, scoped Row Level Security, least-privilege roles, audited service operations.'],
        ['Code execution','Function constructor executes JavaScript in the page context.','Dedicated sandboxed worker or isolated runner, execution limits, memory limits, CSP, abuse testing.'],
        ['File parsing','PDF scan extracts printable bytes rather than a complete parser.','Hardened file-size constraints, format validation, safe parser library, user-visible extraction quality feedback.'],
        ['Data reconciliation','Best-effort parallel writes without conflict logic.','Record ownership, version IDs, offline queue, retry policy, conflict UI.'],
        ['Reports','Heuristic and random scoring in a candidate-facing presentation.','Transparent rubric, determinism, calibration, audit trail, human review pathways.']
    ],[1.2,2.9,2.7])
    heading(doc,'Threat-model framing',2)
    add_bullets(doc,['Assume browser storage can be inspected by the browser user and any script that gains same-origin execution.','Assume arbitrary submitted JavaScript can attempt to consume time or manipulate globals if not isolated.','Assume anonymous cloud keys and broad table policies can be abused if exposed with writable schemas.','Assume resumes can include sensitive personal data and should receive data-minimization, retention, and deletion controls.','Assume assessment outcomes should not be represented as validated hiring decisions without rubric governance.'])
    doc.add_page_break()

    heading(doc,'11 Development operations and environment setup',1)
    add_para(doc,'The project has a direct local workflow. Dependencies are declared in package.json, a lockfile is present, and the development server is provided by Vite. The application also includes a production-build command that bundles the client for static deployment.')
    heading(doc,'Local development sequence',2)
    add_table(doc,['Step','Command or action','Expected result'],[
        ['1','Open the prepai project directory.','The directory contains package.json, src, public, and configuration files.'],
        ['2','Install dependencies when node_modules is not present: npm install.','The lockfile determines the installed package set.'],
        ['3','Copy .env.example to .env and set optional Supabase variables.','The application uses cloud synchronization only when non-placeholder values are available.'],
        ['4','Run npm run dev.','Vite starts a local development server with hot updates.'],
        ['5','Run npm run build before release.','Vite writes a production build to dist.'],
        ['6','Deploy dist to a compatible static host.','The browser application loads without a custom server.']
    ],[.55,3.3,2.95])
    heading(doc,'Configuration',2)
    add_table(doc,['Variable','Purpose','Behavior when absent or placeholder'],[
        ['VITE_SUPABASE_URL','Supabase project URL.','Cloud client remains disabled.'],
        ['VITE_SUPABASE_ANON_KEY','Public Supabase client key.','Cloud client remains disabled.'],
        ['NEXT_PUBLIC_SUPABASE_URL','Secondary compatibility lookup.','Used only if the Vite-specific URL is absent.'],
        ['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY','Secondary key compatibility lookup.','Used only if the standard anon key is absent.']
    ],[2.2,2.1,2.5])
    heading(doc,'Deployment considerations',2)
    add_bullets(doc,['The current product is static-host compatible because there is no required custom backend.','Enable a Content Security Policy and restrict dynamic code execution before production; the present Function-based evaluator may require a redesign to satisfy strict CSP.','Treat every VITE_ value as public client configuration. Never put server secrets in a Vite environment variable.','If deployment serves the app from a subpath, verify Vite base configuration and asset links.','Plan for cache headers on immutable build assets and monitoring around user-visible errors, cloud synchronization, and client performance.'])

    heading(doc,'12 Architectural decisions and trade offs',1)
    add_para(doc,'The decision records consistently favor local speed, low backend overhead, and offline resilience. Those choices produce a compelling product demonstration, but they also establish clear boundaries that should be revisited as the application moves toward real users and sensitive data.')
    add_table(doc,['Decision','Benefits','Trade off','Next decision'],[
        ['React SPA instead of SSR app','Browser APIs work naturally; static deployment is simple.','No server-owned runtime or private execution tier.','Add service boundaries only where server authority is needed.'],
        ['Vite as build tool','Fast development loop and simple production output.','Chunking defaults need attention as client bundle grows.','Introduce route or feature-level lazy loading.'],
        ['Dexie IndexedDB plus localStorage','Offline continuity and local history.','No robust cross-device conflict model.','Add synchronization metadata and offline queue.'],
        ['Supabase integration','PostgreSQL and hosted data API without custom service.','Client policy design becomes critical.','Adopt user-scoped schema and real identity.'],
        ['Heuristic analysis','Instant, private, low-cost behavior.','Limited semantic quality and possible false matches.','Offer optional model-backed review with explicit consent.'],
        ['Browser code runner','Immediate feedback and no worker cost.','Direct execution needs containment and supports only a narrow real evaluator.','Move evaluation into isolated, bounded runtimes.'],
        ['Modal-first navigation','Preserves landing context and focuses the task.','Weak deep-linking and browser-history semantics.','Add routes or URL state per workflow.']
    ],[1.55,1.9,1.9,1.65])
    heading(doc,'Decision record summary',2)
    add_bullets(doc,['The stack justification selects modern JavaScript and React to match browser-native code execution and a rich UI ecosystem.','The storage design selects Supabase, Dexie, and localStorage to combine durable cloud data with offline resilience.','The workflow documentation treats the roadmap and assessment paths as the core candidate experience.','The roadmap document identifies optional LLM, voice, WebAssembly, and verified credential capabilities as future evolutions.'])

    heading(doc,'13 Implementation alignment and technical observations',1)
    add_para(doc,'The project includes design specifications and architectural decision records that describe a rich target experience. The source code implements much of this workflow but also contains several prototype-oriented boundaries. The following observations distinguish implemented behavior from design intent so future maintainers can plan improvements without confusing a demonstrator with a production-grade system.')
    add_table(doc,['Observation','Evidence in implementation','Impact and recommended action'],[
        ['Roadmap days field naming','The generator returns daysAvailable while saveRoadmap maps daysCount to the cloud payload.','Verify and normalize the contract so cloud day counts are not undefined or stale.'],
        ['Roadmap data inference','requiresSystemDesign, requiresConcurrency, and requiresFullstack are calculated but not used to vary curriculum output.','Use these signals to alter module weighting, task choices, and report rationale.'],
        ['Code evaluator scope','Only the Two Sum route performs a direct result check; other complex tracks report simulated success.','Label simulated paths clearly or implement per-question runners in isolated execution contexts.'],
        ['Python support','The UI offers Python but the evaluator uses a basic simulated result condition.','Use Pyodide or a server/worker runner for real Python execution.'],
        ['Auth model','Credentials and reset flow live in browser storage.','Keep as demo-only and migrate to real authentication before user onboarding.'],
        ['Cloud policy scope','The supplied SQL defines broad public access policies.','Restrict tables to the authenticated owner and audit query paths.'],
        ['RLS design versus anonymous use','The architecture prose frames policies as safe client access, but unrestricted all-row policies are not tenant isolation.','Treat RLS as incomplete until ownership predicates exist.'],
        ['External media','Hero and feature presentation load remote media URLs.','Provide local fallbacks, consent-aware asset governance, and performance budgets.'],
        ['Bundle size','Build reports a JavaScript asset above the default Vite chunk warning.','Split heavyweight modal/chart/PDF modules and monitor real-device startup.']
    ],[1.45,2.65,2.95])
    heading(doc,'Quality-strength summary',2)
    add_bullets(doc,['The application offers a coherent end-to-end candidate story rather than disconnected components.','The local-first persistence strategy makes the demo resilient when credentials are missing.','Source areas are clearly separated into components, utilities, database functions, and static assets.','The curated question catalog and sample resume data make the interface demonstrable without external dependencies.','The design system is consistently applied across dark panels, rounded controls, concise labels, and motion-based transitions.'])

    heading(doc,'14 Product roadmap and recommended delivery phases',1)
    add_para(doc,'The supplied roadmap describes generative proctoring, voice interaction, WebAssembly language runtimes, and verifiable credentials. A practical delivery plan should first strengthen identity, data isolation, deterministic evaluation, and instrumentation before adding higher-risk intelligence features.')
    add_table(doc,['Phase','Primary objective','Representative deliverables','Exit criteria'],[
        ['Foundation','Turn prototype workflows into trustworthy product foundations.','Real authentication, scoped RLS, data model ownership, error telemetry, privacy notice, migration process.','A user only sees and changes their own records; basic security review passes.'],
        ['Evaluation','Make practice outcomes accurate and transparent.','Question-specific test runners, isolated execution, deterministic scoring, rubric explanations, replayable result data.','Score output is reproducible and clearly distinguishes automation from evaluator judgment.'],
        ['Personalization','Increase relevance while preserving user control.','Structured resume parsing, editable skills model, JD taxonomy, adaptive plan weighting, consented AI assistance.','A user can understand and override the basis of each recommendation.'],
        ['Interview realism','Add richer interaction safely.','Voice input and synthesis, scenario branching, approved model gateway, moderation and cost controls.','Sessions are resilient, consented, observable, and accessible.'],
        ['Credentialing','Offer externally verifiable achievements.','Signed reports, share controls, revocation model, reviewer view, retention rules.','Claims are auditable, privacy-respecting, and cannot be forged casually.']
    ],[1.05,1.8,2.6,1.6])
    heading(doc,'Prioritized backlog',2)
    add_bullets(doc,['P0: Replace local credentials and public-all cloud policies with an authenticated, user-scoped data path.','P0: Replace Function-constructor execution with a bounded isolated runner before treating submitted code as untrusted.','P1: Resolve the roadmap day-count data contract and add persistence tests.','P1: Implement real per-question validation or clearly label every simulated evaluation.','P1: Introduce lazy loading for high-cost modules and collect frontend performance measurements.','P2: Add URL-addressable workflow state, focus management, and full keyboard tests.','P2: Formalize resume extraction quality, data retention, deletion, and export behavior.'])

    heading(doc,'15 Maintenance and extension guide',1)
    heading(doc,'Adding a new coding question',2)
    add_bullets(doc,['Add a catalog record in questionsData.js with a stable ID, title, category, difficulty, starter code, cases, theory content, and proctor response material.','Add a runner strategy that can actually validate the new question or label it as a structured simulation.','Verify the question appears in both DSA practice and mock interview selection paths.','Add a regression test for its expected input and result representation.','Confirm the roadmap can point to the new ID where appropriate.'])
    heading(doc,'Expanding the skills model',2)
    add_bullets(doc,['Extend the keyword list in extractCompetencies with normalized canonical terms and expected aliases.','Avoid ambiguous raw substring matches where a term could appear in unrelated contexts.','Decide whether the new skill should count toward direct JD matching, missing-skill analysis, or both.','Add example resumes and job descriptions that demonstrate positive and negative matches.','Use structured taxonomies if skill coverage grows beyond a compact curated list.'])
    heading(doc,'Changing persistence',2)
    add_bullets(doc,['Update the Supabase SQL schema and the db.js cloud mapping together.','Preserve migration compatibility for existing Dexie data or increment the Dexie version with a migration path.','Define ownership, versioning, retry, and conflict behavior before adding editable cross-device records.','Keep local fallback behavior intentional; do not silently make cloud availability a requirement.','Test cloud-off, IndexedDB-off, and localStorage-off failure modes.'])
    heading(doc,'Release checklist',2)
    add_bullets(doc,['Run npm run build and resolve new production warnings.','Verify .env does not contain unintended secrets and that only public client values use the VITE prefix.','Exercise the roadmap, mock, DSA, auth, report, and offline fallback paths.','Review all cloud policies and confirm user-scoped access.','Test keyboard flow, focus behavior, reduced motion, small screens, and high-contrast readability.','Confirm external assets have fallbacks and meet performance and licensing requirements.'])
    doc.add_page_break()

    heading(doc,'Appendix A Component inventory',1)
    add_table(doc,['Component or module','Responsibility','Important dependencies'],[
        ['App.jsx','Top-level state and modal orchestration.','React hooks, authService, all feature modal components.'],
        ['Hero.jsx','Hero media, navigation, primary CTA buttons.','Framer Motion, AnimatedText, UserMenu.'],
        ['About.jsx and Features.jsx','Marketing and feature-discovery sections.','Framer Motion, animated typography, remote media.'],
        ['RoadmapBuilderModal.jsx','Input wizard, generated schedule, progress state.','resumeParser, roadmapGenerator, db functions, sample resumes.'],
        ['MockInterviewModal.jsx','Timed interview simulation and final submission flow.','CodeEditor, question catalog, code runner.'],
        ['DsaPracticeModal.jsx','Catalog-driven practice environment.','CodeEditor, question catalog, code runner.'],
        ['ResumeReviewModal.jsx','Candidate-fit and improvement presentation.','Sample resume data.'],
        ['AnalyticsModal.jsx','Progress and readiness visualization.','Stored assessments, chart libraries.'],
        ['PerformanceReportModal.jsx','Aggregated printable-style readiness report.','db assessment, roadmap, and report functions.'],
        ['AuthModal.jsx','Local account, demo, and reset experience.','authService.'],
        ['UserMenu.jsx','Session display and quick user actions.','authService, browser events.'],
        ['CodeEditor.jsx','Textarea-based editor shell.','Lucide icons, Clipboard API.'],
        ['AnimatedText.jsx','Character and word animation primitives.','Framer Motion.'],
        ['RoadmapModal.jsx','Additional static roadmap modal implementation.','Framer Motion and icon set.']
    ],[1.75,2.65,2.2])

    heading(doc,'Appendix B Data contracts and question catalog',1)
    add_para(doc,'A roadmap record includes a generated identifier, timestamp, target role and company, days available, inferred seniority, extracted and matched skill lists, a missing-skill list, a match percentage, a daily-plan array, and a summary. Each daily plan includes day number, phase, title, category, estimated hours, study guide, question ID, task objects, and scheduled round details.')
    add_table(doc,['Question track','Learning focus','Evaluation status in current engine'],[
        ['Two Sum','Arrays, hash maps, and time-space trade-offs.','Direct JavaScript execution and index-order tolerant validation.'],
        ['LRU Cache','Map and doubly-linked list design, cache eviction.','Structured simulated evaluation in generic route.'],
        ['Distributed Rate Limiter','Token-bucket and distributed systems reasoning.','Structured simulated evaluation in generic route.'],
        ['Behavioral conflict response','STAR storytelling and technical leadership communication.','Catalog-driven conversation and feedback presentation.']
    ],[1.7,2.9,2.0])
    add_para(doc,'Assessment records are persisted as question title, overall score, scorecard, test results, candidate code, execution time, and creation time. Reports store a readiness score, radar scores, strengths, growth areas, and timestamp. These payloads should remain versioned if reporting becomes externally shared or subject to analytics migration.')

    heading(doc,'Appendix C Configuration and deployment checklist',1)
    add_table(doc,['Area','Checklist'],[
        ['Runtime','Use a currently supported Node runtime and the lockfile-defined dependencies.'],
        ['Environment','Set non-placeholder public Supabase URL and anon key only when cloud mode is intended.'],
        ['Database','Run reviewed SQL migrations; replace broad policies with identity-scoped policies.'],
        ['Static host','Publish dist and verify asset paths, cache behavior, and browser fallback handling.'],
        ['Monitoring','Collect client errors, route or modal failures, storage failures, and cloud-sync errors.'],
        ['Privacy','Document what is stored locally and remotely; provide deletion and export behavior.'],
        ['Security','Remove demo credentials, isolate code execution, use CSP, and complete dependency review.'],
        ['Performance','Split expensive features, optimize media, and test initial load on constrained devices.']
    ],[1.45,5.15])

    heading(doc,'Appendix D Glossary',1)
    glossary=[
        ('Adaptive roadmap','A generated multi-day preparation plan with study tasks, question links, and scheduled practice rounds.'),
        ('Assessment','A saved record of a coding or mock-interview submission and its calculated feedback.'),
        ('Dexie','A JavaScript library that simplifies IndexedDB schema and query operations.'),
        ('IndexedDB','A browser database for structured local records and larger client-side data than localStorage typically supports.'),
        ('JD','Job description; the target role specification used for direct term matching and planning context.'),
        ('RLS','Row Level Security; database rules intended to limit which rows a user can read or change.'),
        ('Scorecard','A structured output containing overall score, metric breakdown, recommendation, strengths, and improvements.'),
        ('Supabase','A hosted platform used here for optional PostgreSQL persistence through a browser JavaScript client.'),
        ('Vite','The project build tool and local development server.'),
    ]
    add_table(doc,['Term','Meaning'],glossary,[1.35,5.25])
    doc.add_paragraph()
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run('End of documentation'); r.italic=True; r.font.color.rgb=RGBColor(90,90,90)
    doc.core_properties.title='PrepAI Technical and Product Documentation'; doc.core_properties.subject='Architecture product workflow and maintenance guide'; doc.core_properties.author='PrepAI Project Team'; doc.core_properties.comments='Generated from the supplied PrepAI source tree, design documents, and decision records.'
    doc.save(OUT)
    print(OUT)

if __name__ == '__main__': build()
