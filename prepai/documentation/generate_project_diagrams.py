from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent / "diagrams"
OUT.mkdir(parents=True, exist_ok=True)

NAVY = "#10253F"; BLUE = "#176B87"; TEAL = "#1A8C82"; LIGHT = "#EDF5F8"; MINT = "#ECF8F3"; GRAY = "#F4F6F7"; TEXT = "#18212B"; WHITE = "#FFFFFF"; LINE = "#7C8B97"

def f(size, bold=False):
    names = ["C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf", "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"]
    for name in names:
        try: return ImageFont.truetype(name, size)
        except OSError: pass
    return ImageFont.load_default()

def multiline(draw, box, text, font, color=TEXT, pad=18, spacing=6):
    x1,y1,x2,y2=box; words=text.split(); lines=[]; current=""; limit=x2-x1-pad*2
    for word in words:
        trial=(current+" "+word).strip()
        if draw.textbbox((0,0),trial,font=font)[2] <= limit: current=trial
        else: lines.append(current); current=word
    if current: lines.append(current)
    lh=draw.textbbox((0,0),"Ag",font=font)[3]+spacing; y=y1+(y2-y1-len(lines)*lh)/2
    for line in lines:
        w=draw.textbbox((0,0),line,font=font)[2]; draw.text((x1+(x2-x1-w)/2,y),line,font=font,fill=color); y+=lh

def arrow(draw, a, b, color=LINE, width=4):
    import math
    draw.line((a,b),fill=color,width=width)
    theta=math.atan2(b[1]-a[1],b[0]-a[0]); s=15
    draw.polygon([b,(b[0]-s*math.cos(theta-.45),b[1]-s*math.sin(theta-.45)),(b[0]-s*math.cos(theta+.45),b[1]-s*math.sin(theta+.45))],fill=color)

def entity(draw, box, title, fields, fill=LIGHT):
    x1,y1,x2,y2=box
    draw.rounded_rectangle(box,radius=18,fill=fill,outline=BLUE,width=3)
    draw.rounded_rectangle((x1+2,y1+2,x2-2,y1+55),radius=15,fill=BLUE)
    draw.rectangle((x1+2,y1+35,x2-2,y1+57),fill=BLUE)
    multiline(draw,(x1+12,y1+5,x2-12,y1+52),title,f(24,True),WHITE,8,2)
    y=y1+76
    for field in fields:
        draw.text((x1+22,y),field,font=f(19),fill=TEXT); y+=31

def er_diagram():
    im=Image.new("RGB",(2000,1300),WHITE); d=ImageDraw.Draw(im)
    d.rectangle((0,0,2000,128),fill=NAVY); d.text((60,35),"PrepAI Entity Relationship Diagram",font=f(46,True),fill=WHITE); d.text((63,91),"Cloud PostgreSQL tables and their application-level reporting relationships",font=f(22),fill="#D7E7F0")
    entities=[
        ((90,220,505,510),"profiles",["PK  id UUID","target_role TEXT","days_available INT","skills TEXT[]","seniority TEXT","created_at TIMESTAMPTZ"],LIGHT),
        ((760,220,1240,545),"roadmaps",["PK  id UUID","target_role TEXT","target_company TEXT","days_count INT","daily_plans JSONB","created_at TIMESTAMPTZ"],MINT),
        ((1490,220,1910,575),"assessments",["PK  id UUID","question_title TEXT","overall_score NUMERIC","scorecard JSONB","test_results JSONB","candidate_code TEXT","execution_time_ms INT","created_at TIMESTAMPTZ"],LIGHT),
        ((760,800,1240,1085),"reports",["PK  id UUID","overall_readiness NUMERIC","radar_scores JSONB","strengths TEXT[]","growth_areas TEXT[]","created_at TIMESTAMPTZ"],MINT),
    ]
    for b,t,fields,fill in entities: entity(d,b,t,fields,fill)
    arrow(d,(505,365),(760,365),TEAL,5); arrow(d,(1240,365),(1490,365),TEAL,5); arrow(d,(1700,575),(1240,800),TEAL,5); arrow(d,(1000,545),(1000,800),TEAL,5)
    labels=[((565,320),"preparation context informs"),((1295,320),"scheduled practice produces"),((1325,690),"assessment history aggregates into"),((1040,650),"roadmap progress contributes to")]
    for pos,txt in labels: d.text(pos,txt,font=f(18,True),fill=TEAL)
    d.rounded_rectangle((90,1160,1910,1235),radius=12,fill=GRAY,outline="#D6DEE3",width=2)
    multiline(d,(110,1170,1890,1225),"Implementation note: the supplied schema stores independent snapshots. The current tables do not include explicit foreign-key columns or user ownership fields; arrows represent product-level relationships rather than enforced database constraints.",f(19),TEXT,10,3)
    path=OUT/"prepai-er-diagram.png"; im.save(path); return path

def module(draw, box, title, fields, fill=LIGHT):
    x1,y1,x2,y2=box; draw.rounded_rectangle(box,radius=16,fill=fill,outline=BLUE,width=3); draw.rectangle((x1+2,y1+50,x2-2,y1+52),fill=BLUE)
    multiline(draw,(x1+10,y1+5,x2-10,y1+46),title,f(22,True),NAVY,8,2)
    y=y1+70
    for field in fields:
        draw.text((x1+16,y),field,font=f(16),fill=TEXT); y+=27

def class_diagram():
    im=Image.new("RGB",(2200,1450),WHITE); d=ImageDraw.Draw(im)
    d.rectangle((0,0,2200,128),fill=NAVY); d.text((60,34),"PrepAI Class and Module Diagram",font=f(46,True),fill=WHITE); d.text((63,91),"React components, domain utilities, and persistence services",font=f(22),fill="#D7E7F0")
    modules=[
        ((80,210,470,470),"App.jsx",["activeModal", "selectedQuestionId", "authMode", "currentUser", "+ handleOpenModal()", "+ handleCloseModal()"],LIGHT),
        ((600,190,1050,510),"Feature Modals",["RoadmapBuilderModal", "MockInterviewModal", "DsaPracticeModal", "ResumeReviewModal", "AnalyticsModal", "PerformanceReportModal", "AuthModal"],MINT),
        ((1180,190,1600,510),"Shared Components",["Hero", "Features", "About", "CodeEditor", "UserMenu", "AnimatedText"],LIGHT),
        ((1730,185,2140,530),"Domain Utilities",["resumeParser", "roadmapGenerator", "codeRunner", "questionsData", "authService"],MINT),
        ((605,780,1055,1055),"db.js",["Dexie PrepAIDatabaseV3", "+ saveProfileData()", "+ saveRoadmap()", "+ getActiveRoadmap()", "+ saveAssessmentResult()", "+ savePerformanceReport()"],LIGHT),
        ((1280,800,1730,1025),"supabaseClient.js",["isSupabaseConfigured", "supabase client", "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"],MINT),
        ((300,1160,830,1335),"Browser persistence",["IndexedDB via Dexie", "localStorage fallback", "sessionStorage for temporary session"],GRAY),
        ((1400,1160,1920,1335),"Supabase PostgreSQL",["profiles", "roadmaps", "assessments", "reports"],GRAY),
    ]
    for box,title,fields,fill in modules: module(d,box,title,fields,fill)
    # app interactions
    arrow(d,(470,315),(600,315),TEAL,5); d.text((490,275),"mounts and opens",font=f(16,True),fill=TEAL)
    arrow(d,(1050,330),(1180,330),TEAL,5); d.text((1070,290),"composes",font=f(16,True),fill=TEAL)
    arrow(d,(1600,340),(1730,340),TEAL,5); d.text((1630,300),"calls",font=f(16,True),fill=TEAL)
    arrow(d,(825,510),(825,780),TEAL,5); d.text((845,640),"saves and loads",font=f(16,True),fill=TEAL)
    arrow(d,(1055,920),(1280,920),TEAL,5); d.text((1122,880),"optional cloud client",font=f(16,True),fill=TEAL)
    arrow(d,(830,1245),(830,1055),TEAL,5); d.text((850,1120),"local stores",font=f(16,True),fill=TEAL)
    arrow(d,(1505,1025),(1655,1160),TEAL,5); d.text((1665,1080),"sync",font=f(16,True),fill=TEAL)
    d.rounded_rectangle((90,1360,2110,1430),radius=14,fill="#F9FBFC",outline="#D6DEE3",width=2)
    multiline(d,(115,1368,2085,1423),"Relationship key: App controls modal state. Feature modals consume shared components and domain utilities. db.js is the persistence facade; it writes to Dexie and localStorage locally, and to Supabase when public configuration is valid.",f(18),TEXT,12,3)
    path=OUT/"prepai-class-diagram.png"; im.save(path); return path

if __name__ == "__main__":
    print(er_diagram())
    print(class_diagram())
