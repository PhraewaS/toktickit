from pathlib import Path
import re, json, html
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether, Flowable
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image as PILImage
from pypdf import PdfReader

ROOT=Path.cwd(); E=ROOT/'artifacts/lab-04/evidence/final-main'; V=E/'visual'
OUT=ROOT/'output/pdf/toktickit-final-main-review.pdf'; OUT.parent.mkdir(parents=True,exist_ok=True)
(ROOT/'tmp/pdfs').mkdir(parents=True,exist_ok=True)
SHA='e1fa72f9fa1ad26ead74f82cf1de6bbf09de6384'; REPO='https://github.com/PhraewaS/toktickit'
S=json.loads((E/'validated-summary.json').read_text(encoding='utf-8'))
R=json.loads((ROOT/'docs/lab-04/review-history-final-main.json').read_text(encoding='utf-8'))
VR=json.loads((V/'results.json').read_text(encoding='utf-8'))
assert S['revision']==SHA and VR['revision']==SHA and not VR['failed']
pdfmetrics.registerFont(TTFont('Body','C:/Windows/Fonts/tahoma.ttf'))
pdfmetrics.registerFont(TTFont('Bold','C:/Windows/Fonts/tahomabd.ttf'))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold',italic='Body',boldItalic='Bold')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyX',fontName='Body',fontSize=10,leading=14,spaceAfter=6,textColor=colors.HexColor('#223c30')))
styles.add(ParagraphStyle(name='SmallX',parent=styles['BodyX'],fontSize=8.3,leading=11,spaceAfter=3))
styles.add(ParagraphStyle(name='HeadingX',fontName='Bold',fontSize=22,leading=27,spaceAfter=12,textColor=colors.HexColor('#006b3c')))
styles.add(ParagraphStyle(name='SubX',fontName='Bold',fontSize=13,leading=17,spaceBefore=8,spaceAfter=6,textColor=colors.HexColor('#004c2b')))
styles.add(ParagraphStyle(name='ThaiX',parent=styles['BodyX'],wordWrap='CJK',fontSize=10,leading=16))
styles.add(ParagraphStyle(name='SourceX',parent=styles['BodyX'],fontSize=9.2,leading=11.5,spaceAfter=4))
W,H=landscape(A4); usable=W-72; story=[]
def esc(t): return html.escape(str(t))
def p(t,style='BodyX'):return Paragraph(t,styles[style])
def add(t):story.append(p(t))
def sub(t):story.append(p(esc(t),'SubX'))
def link(label,url):return '<a href="'+html.escape(url,quote=True)+'" color="#006b3c">'+esc(label)+'</a>'
def doclink(name):return link('Full '+name,REPO+'/blob/codex/lab4-final-verification-evidence/docs/lab-04/'+name)
def part(n,subtitle):
    if story:story.append(PageBreak())
    story.append(p('Answer Part '+str(n),'HeadingX'));story.append(p(esc(subtitle),'SubX'))
def table(rows,widths=None):
    cells=[[p(esc(x) if not str(x).startswith('<') else x,'SmallX') for x in row] for row in rows]
    t=Table(cells,colWidths=widths or [usable/len(rows[0])]*len(rows[0]),repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e2f0e8')),('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.35,colors.HexColor('#c7d2cc')),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]));story.append(t);story.append(Spacer(1,8))
def mdtext(s):
    s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',lambda m:link(m[1],m[2] if m[2].startswith('http') else REPO+'/blob/codex/lab4-final-verification-evidence/docs/lab-04/'+m[2]),s)
    s=re.sub(r'`([^`]+)`',r'<b>\1</b>',s);s=re.sub(r'\*\*([^*]+)\*\*',r'<b>\1</b>',s)
    return s.replace('& ','&amp; ')
def source_bullets(file,prefix):
    for line in (ROOT/'docs/lab-04'/file).read_text(encoding='utf-8').splitlines():
        if line.startswith('- '+prefix):story.append(p(mdtext(line[2:]),'SourceX'))
def source_section(file,start,end):
    text=(ROOT/'docs/lab-04'/file).read_text(encoding='utf-8').split(start,1)[1].split(end,1)[0]
    for line in text.strip().splitlines():
        if line.strip() and not line.startswith('|') and not line.startswith('#'):story.append(p(mdtext(line.lstrip('- ')),'SourceX'))
class RegionImage(Flowable):
    def __init__(self,file,width,height,align='top'):
        super().__init__();self.file=file;self.iw,self.ih=PILImage.open(file).size;self.width=width;self.scale=width/self.iw;self.height=min(height,self.ih*self.scale);self.align=align;self.offset=None
        if 'actions-validation' in file.name:
            pixels=PILImage.open(file).convert('RGB');hits=[]
            for y in range(pixels.height):
                count=sum(1 for x in range(pixels.width) if (lambda rgb: rgb[0]>120 and rgb[1]<100 and rgb[2]<100)(pixels.getpixel((x,y))))
                if count>pixels.width*.5:hits.append(y)
            if hits:self.offset=max(0,hits[0]-45)
        elif 'refresh-failure' in file.name:self.offset=0
    def draw(self):
        c=self.canv;c.saveState();clip=c.beginPath();clip.rect(0,0,self.width,self.height);c.clipPath(clip,stroke=0,fill=0)
        y=0 if self.align=='bottom' else self.height-self.ih*self.scale
        if self.offset is not None:y=self.height-self.ih*self.scale+self.offset*self.scale
        c.drawImage(str(self.file),0,y,width=self.width,height=self.ih*self.scale);c.restoreState()
def image(name,width=usable,height=410):
    f=V/name;w,h=PILImage.open(f).size
    if h*width/w<=height:return Image(str(f),width,h*width/w)
    return RegionImage(f,width,height,'bottom' if 'actions-' in name and 'panel' not in name else 'top')
def image_page(title,files,widths=None,height=430):
    story.append(PageBreak());sub(title)
    add('Actual released product '+SHA[:7]+'. Full-page originals, state provenance and horizontal-fit checks: '+link('visual evidence gallery',REPO+'/tree/codex/lab4-final-verification-evidence/artifacts/lab-04/evidence/final-main/visual')+'.')
    if len(files)==1:story.append(image(files[0],height=height))
    else:
        widths=widths or [usable/len(files)]*len(files)
        t=Table([[image(f,w-10,height) for f,w in zip(files,widths)]],colWidths=widths);t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP')]));story.append(t)
    story.append(Spacer(1,6));story.append(p('Selected readable image regions; full originals are linked in the gallery. '+' / '.join(files),'SmallX'))
def screenshot_link(name):return link(name,REPO+'/blob/codex/lab4-final-verification-evidence/artifacts/lab-04/evidence/final-main/visual/'+name)

part(1,'Engineering workflow and peer review')
add('<b>Peer-review candidate - not yet a completed submission.</b> Released product tested on '+SHA+'. Final-evidence approval/merge, final Kanban Done and submission acceptance remain human gates; no approval is invented.')
add('Student: Phraewa Saphanont, 67070507213 (@PhraewaS). Peer: Natthawadee Phukhema, 67070507201 (@guluJa). Official Thai names and original quotations: '+doclink('reviewer.md')+'.')
add('Feature branches -> lab4-staging -> approved release '+link('#63',REPO+'/pull/63')+' -> main '+link(SHA[:7],REPO+'/commit/'+SHA)+' -> codex/lab4-final-verification-evidence -> reviewed evidence PR -> main -> final acceptance. Product code is unchanged by this evidence branch.')
rows=[['Own PR / scope','Reviewed head / approval','Actual merge / branch target']]
for r in sorted([r for r in R['pullRequests'] if r['owner']=='PhraewaS'],key=lambda r:r['number']):
    a=[x for x in r['events'] if x['kind']=='review' and x['author']=='guluJa' and x['state']=='APPROVED'][-1]
    rows.append([link('#'+str(r['number']),r['url'])+' '+esc(r['title']),link(a['commit'][:7]+' APPROVED',a['url']),link(r['mergeCommit'][:7],REPO+'/commit/'+r['mergeCommit'])+' / '+esc(r['base'])])
table(rows,[315,215,usable-530])
add('All #55-#60 features and #61/#62/#64/#65 maintenance were individually approved before staging merge. Release #63: formal approval 2026-10-14 14:38:54 UTC, merge 14:39:03 UTC. The contract #55 preceded completion of #56-#60.')
story.append(PageBreak());sub('Rendered reviewer record: both directions and original review receipt')
rows=[['Friend PR reviewed by @PhraewaS','Approval / actual merge']]
for r in sorted([r for r in R['pullRequests'] if r['owner']=='guluJa'],key=lambda r:r['number']):
    a=[x for x in r['events'] if x['kind']=='review' and x['author']=='PhraewaS' and x['state']=='APPROVED'][-1]
    rows.append([link('#'+str(r['number'])+' '+r['title'],r['url']),link('APPROVED '+a['commit'][:7],a['url'])+' / '+esc(r['mergeCommit'][:7])])
table(rows,[470,usable-470])
add('Current paginated snapshot: 21 PRs, 111 events (61 conversation comments, 50 submitted reviews, 0 inline comments). Every original quotation is preserved in the repository; approval is checked against the reviewed head and merge time. Historical snapshots remain unchanged.')
release=next(x for x in R['pullRequests'] if x['owner']=='PhraewaS' and x['number']==63)
accepted=[x for x in release['events'] if x['author']=='guluJa' and x['body'] and x['kind']=='review' and x['commit']==release['headSha']][-1]
story.append(p(esc(accepted['body']),'ThaiX'));add(link('Original peer review',accepted['url'])+'; the empty-body APPROVED event is recorded as a state, not a fabricated quotation.')
reply=next(x for x in release['events'] if x['id']==6170887146)
story.append(p('<b>Author response - exact final paragraph excerpt:</b> '+esc(reply['body'].split('\r\n\r\n')[-1]),'ThaiX'));add(link('Complete original response including quoted review',reply['url'])+'. Full rounds and corrective responses for all PRs remain rendered in reviewer.md.')
sub('Repository and Project evidence')
add(link('README',REPO+'/blob/'+SHA+'/README.md')+' records setup, migration/seed, suite/build/E2E commands and six-phase main verification. '+link('.gitignore',REPO+'/blob/'+SHA+'/.gitignore')+' excludes .env, dependencies, builds, local attachment bytes and transient output.')
add('Tracked tree: server/{src,tests,prisma}; client/{src,tests}; e2e/lab-04; docs/lab-04/{specification,tests,ui-spec,api-spec,reviewer,ai-use}.md; artifacts/lab-04/{screenshots,evidence}; scripts/.')
story.append(p(link('Project / Kanban', 'https://github.com/users/PhraewaS/projects/2')+': #48-#53 Done; #54 open pending final acceptance. Capture all-Done only afterwards.','SmallX'))

part(2,'Rendered specification: requirements, rules and design')
add(doclink('specification.md')+' and '+doclink('api-spec.md')+'. Scope: operational Actions under existing Tickets, resolution evidence gate, backend-calculated role dashboards; no additional Action assignment/status/delete workflow.')
source_bullets('specification.md','FR-')
story.append(PageBreak());sub('Business rules - rendered specification')
source_bullets('specification.md','BR-')
story.append(PageBreak());sub('Status transitions, calculations and database decisions')
table([['Current','Permitted next','Additional rule'],['NEW','OPEN','IT Staff only'],['OPEN','IN_PROGRESS / WAITING_FOR_REQUESTER / CANCELLED','IT Staff only'],['IN_PROGRESS / WAITING_FOR_REQUESTER','WAITING_FOR_REQUESTER or IN_PROGRESS / RESOLVED / CANCELLED','No no-op; RESOLVED requires a persisted Action'],['RESOLVED','CLOSED / REOPENED','Requester indication is advisory only'],['CLOSED','REOPENED','Administrator cannot perform formal status/assignment writes'],['REOPENED / CANCELLED','None','Unlisted/no-op transition: 409']],[210,310,usable-520])
add('Active = NEW, OPEN, IN_PROGRESS, WAITING_FOR_REQUESTER, REOPENED. Recent = inclusive updatedAt/actionDateTime >= one captured server UTC now minus 30 days; no upper bound. Requester counts are owned only. Staff unassigned/owned/urgent count active Tickets; myActionsTaken counts all actor Actions. Counts are not capped; recent lists are capped at 10 with deterministic time/id tie-breaks.')
add('Normalized ActionTaken has restricted Ticket/actor FKs, TIMESTAMPTZ(3), description/result VARCHAR(5000), conditional note VARCHAR(5000), optional attachment note VARCHAR(2000), createdAt/updatedAt, nullable legacy UUID create key and SHA-256 fingerprint. Chronology indexes plus unique key. Two additive migrations create the child table and retry-key columns; no historical Ticket/action fabrication.')
add('Design decisions: normalized child separates Owner from performer; restricted FKs preserve history; mandatory update token prevents stale writes; unique key+fingerprint makes create retry safe; authoritative queries avoid duplicate/cached aggregates. Seed demonstrates zero, one and multiple Actions and is repeatable. Recovery is isolated, not destructive rollback on user data.')
story.append(PageBreak());sub('Acceptance criteria and Product Definition of Done')
source_bullets('specification.md','AC-')
add('Executed product gates: six documents, additive migration/seed/recovery, full suites/builds/E2E, role/error/stale/retry cases, metric comparison, responsive focus/visual capture on released main. Submission gates still require human final-evidence approval, accepted PDF and final Project Done. Specification history: '+link('#55 approval',REPO+'/pull/55#pullrequestreview-5353383942')+'.')

part(3,'Rendered test plan, traceability and actual main output')
add(doclink('tests.md')+'; '+link('complete phase JSON and raw output',REPO+'/tree/codex/lab4-final-verification-evidence/artifacts/lab-04/evidence/final-main')+'. All six phases ran sequentially on '+SHA+'; localhost PostgreSQL 5433, isolated guarded E2E databases, credentials omitted.')
rows=[['Main check','Actual result','Coverage / limitation'],['Recovery safety','6 passed','Command/target/tool-version safety'],['Prepare / recovery','5 migrations; 9 tables + 5 migration-history rows matched','Temporary database and dump removed; physical attachment bytes not included'],['Server','164 passed; build exit 0','Unit/API/integration/auth/roles/workflow/regression/performance'],['Client','89 passed; build exit 0','Component/UI/style/accessibility/navigation/draft/retry'],['Lab 4 Playwright','11 passed / 10 intentional skips','21 total; 0 failed/flaky; mutation once on desktop, separate responsive suite'],['Lab 3 Playwright','26 passed / 16 intentional skips','42 total; 0 failed/flaky; complete authenticated legacy regression'],['Selected metrics','8 DB = API = UI values','Guarded exact same DB URL; independent query client'],['Keyboard / browser','6 responsive flows passed','Tab/Enter/Space/focus-visible, fit; 0 unexpected HTTP/page errors'],['Performance','40 requests / 0 failures','10 per role-dashboard/action endpoint; all maxima <1000 ms']]
table(rows,[160,215,usable-375])
add('Actual endpoint maxima (ms): '+', '.join(str(x['maxDurationMs']) for x in S['performance']['results'])+'. This is local smoke evidence, not production load testing or a GitHub CI check.')
sub('Executed commands')
add('node --test scripts/postgres-recovery.test.mjs; then node scripts/verify-lab4.mjs prepare|recovery|server|client|lab4|lab3 --env-file [existing untracked file] --output-dir artifacts/lab-04/evidence/final-main. Exact individual commands and exits are retained in summary.md and phase logs; no secret is required in this PDF.')
story.append(PageBreak());sub('All eight ACs: expected outcome, real paths, final product status')
rows=[['AC / test IDs','Expected result and actual test paths','Final product status']]
acrows=[('01 / UNIT-04, API-04, UI-04, E2E-04','Create/list/edit correct actor and fields; server/tests/lab-04/actions-taken.api.test.ts (actions.api.test.ts implementation), client/tests/lab-04/ActionsTaken.test.tsx, e2e/lab-04/actions-taken-flow.spec.ts'),('02 / API-04/05/06, REG-04','Safe body/ID/resource/role/ownership errors and inactive Owner rejection; same Actions tests plus server/tests/lab-03/staff-operations.integration.api.test.ts and users-admin.api.test.ts'),('03 / API-04, UI-04','Missing/invalid updatedAt 400, stale 409 without overwrite; Actions API/component paths above'),('04 / API-06, UI-06, E2E-07','Permitted matrix, resolution evidence, close/cancel and concurrent preconditions; server/tests/lab-04/ticket-workflow.api.test.ts, client/tests/lab-04/TicketWorkflow.test.tsx, e2e/lab-04/ticket-resolution.spec.ts'),('05 / API-05, UI-05, E2E-05/06, PERF-04','Counts/query boundaries/filters and bounded lists; server/tests/lab-04/{requester,staff}-dashboard.api.test.ts; client/tests/lab-04/{Requester,Staff}Dashboard.test.tsx; e2e/lab-04/dashboards.spec.ts; performance-smoke.test.ts'),('06 / RESP-04, STYLE-04','Three widths, labels/readonly/focus/no overflow; e2e/lab-04/responsive.spec.ts plus final visual harness/gallery; manual image inspection supplements, not pixel-diff/axe certification'),('07 / REG-04, E2E-00, RECOVERY-04','Migration/seed/recovery and all previous features; e2e/lab-04/migration-seed.spec.ts; scripts/postgres-recovery.test.mjs; server/client tests lab-01..03 and e2e/lab-03'),('08 / API-04, UI-04','Draft retention, safe exact retries/races, changed-key conflict and unchanged seconds; Actions API/component paths above')]
for ac,description in acrows:rows.append([ac,description,'Passed on e1fa72f; submission acceptance pending'])
table(rows,[150,usable-280,130])
add('Planned expectations and historical feature outcomes are preserved in tests.md. Passing means the named assertion/method ran; deterministic append-only routes and Action tie-break ordering also have explicitly labelled source inspection. Intentional skips are not converted into passes.')
sub('Actual console extracts from main')
for file,patterns in [('server-tests.txt',['Tests','Test Files','PERF-04']),('client-tests.txt',['Tests','Test Files']),('lab4-e2e.txt',['passed','skipped','DASHBOARD-METRICS']),('lab3-e2e.txt',['passed','skipped'])]:
    lines=[x.strip() for x in (E/file).read_text(encoding='utf-8').splitlines() if any(q in x for q in patterns) and not any(q in x for q in ['file:','DASHBOARD-METRICS','PERF-04'])]
    add('<b>'+file+':</b> '+esc(' | '.join(lines[-2:])))

part(4,'Rendered AI use and My Reflection')
add(doclink('ai-use.md')+'. Model: OpenAI Codex, GPT-5-based coding agent in the Codex desktop workspace.')
text=(ROOT/'docs/lab-04/ai-use.md').read_text(encoding='utf-8')
for line in text.split('## Selected key prompts')[1].split('## My Reflection')[0].strip().splitlines():
    if line.strip():add(esc(line))
sub('My Reflection - original document text')
add(esc(text.split('## My Reflection')[1].strip()))
add('Evidence workflow note: suggestions were checked against the handout, product sources, original GitHub peer comments and actual main runs. No agent-generated approval replaces human review.')

part(5,'IT Staff Dashboard: accurate counts and drill-down')
staff=next(x for x in S['metrics'] if x['role']=='staff')
table([['Selected metric','DB','API','UI']]+[[k,str(v),str(staff['api'][k]),str(staff['ui'][k])] for k,v in staff['database'].items()],[360,135,135,usable-630])
add('Unassigned -> ownerId=unassigned &amp; activeOnly=true; My Active -> authenticated owner &amp; activeOnly=true; Urgent -> HIGH &amp; activeOnly=true. Breakdown status/priority buttons apply the exact filter across all statuses. Recent Ticket/Action buttons open Staff Ticket Detail by Ticket ID. Counts are authoritative and not the length of bounded arrays.')
add('Dashboard states are visually distinct at every width. Success images use real seeded API data; zero/forbidden/failure/loading fixtures exercise the released UI with controlled HTTP replies and do not pretend to be live permission failures. Full API/component tests cover those backend outcomes.')
image_page('IT Staff Dashboard - desktop metrics and recent operational lists',['desktop-staff-dashboard-metrics.png','desktop-staff-dashboard-lists.png'],[330,usable-330],390)
image_page('IT Staff Dashboard - tablet and mobile metrics',['tablet-staff-dashboard-metrics.png','mobile-staff-dashboard-metrics.png'],[460,usable-460],405)
add('Full-page breakdown/recent/urgent/My Recent Actions images: '+screenshot_link('desktop-staff-dashboard-full.png')+', '+screenshot_link('tablet-staff-dashboard-full.png')+', '+screenshot_link('mobile-staff-dashboard-full.png')+'.')

part(6,'Actions Taken and parent Ticket lifecycle')
add('Actions Taken: list/create/edit, authenticated readonly actor, exact datetime preservation, conditional Follow-Up Note and optional Attachment Notes. A Ticket demonstrates multiple Actions. Requester sees only owned read-only history; Staff/Admin writes are backend-authorized.')
add('Assignment, formal status, complete and cancel apply to the parent Ticket, as approved in #55/#63/#65. Only IT Staff assigns/transitions; active Staff or Administrator may be chosen as Owner. API/regression verifies inactive-assignee rejection. E2E-07 proves evidence-required resolution, RESOLVED -> CLOSED and a separate OPEN -> CANCELLED.')
add('Versioned updates conflict safely; uncertain create reuses UUID/fingerprint; refresh/retry preserves draft until explicit discard/reconciliation. Actual 400 validation capture retains draft; controlled 409/500 visuals separately show conflict and failed-refresh retention. Backend/API/component suites provide actual stale/retry/role guarantees.')
image_page('Actions Taken - desktop create: readable Follow-Up Note and Save controls',['desktop-actions-create-follow-up.png'],height=350)
image_page('Actions Taken - desktop edit: readable Follow-Up Note and Save Changes',['desktop-actions-edit-follow-up.png'],height=350)
image_page('Actions Taken - tablet and mobile create editor regions',['tablet-actions-create-follow-up.png','mobile-actions-create-follow-up.png'],[440,usable-440],350)
image_page('Actions Taken - tablet and mobile edit editor regions',['tablet-actions-edit-follow-up.png','mobile-actions-edit-follow-up.png'],[440,usable-440],350)
add('Validation/conflict/failed-refresh/forbidden are captured at every width; all images and sources are listed in visual/results.json. Readonly actor remains inside viewport; a single-line value may scroll internally, not overflow the page.')

part(7,'Ticket workflow, ordering and communication visibility')
table([['Acceptance','Evidence / outcome'],['Resolution prerequisite','e2e/lab-04/ticket-resolution.spec.ts: reject without Action; record work; resolve/close; cancel separately'],['Permitted matrix / role','server/tests/lab-04/ticket-workflow.api.test.ts and legacy Staff routes; no new Administrator status/assignment right'],['Stale page and read/write race','Client sends expectedCurrentStatus; server conditional write rejects conflict; Refresh Ticket required'],['Deterministic order','Dashboard/Queue assertions use time/id tie-breaks; Action query actionDateTime ASC,id ASC inspected in server/src/actions.ts'],['Append-only communication','Public Comments and Internal Notes list/create routes; no edit/delete; browser/API regression plus source route audit'],['Role visibility','Requester owned Ticket/Action/Public Comment only; Internal Notes staff-private; Administrator boundaries preserved; Actions explicitly editable with version']],[230,usable-230])
add('Ordering/append-only source inspection is not relabelled as a new automated case. Original main product sources: '+link('actions.ts',REPO+'/blob/'+SHA+'/server/src/actions.ts')+', '+link('staff.ts',REPO+'/blob/'+SHA+'/server/src/staff.ts')+', '+link('app.ts',REPO+'/blob/'+SHA+'/server/src/app.ts')+'.')
image_page('Requester read-only Actions - desktop and mobile regions',['desktop-requester-actions-panel.png','mobile-requester-actions-panel.png'],[460,usable-460],350)
add('Tablet read-only capture: '+screenshot_link('tablet-requester-actions-panel.png')+'. No Add/Edit controls on the Requester page; list values and applicable Follow-Up/Attachment Notes remain visible.')

part(8,'Requester Dashboard and final legacy regression')
requester=next(x for x in S['metrics'] if x['role']=='requester')
table([['Selected metric','DB','API','UI']]+[[k,str(v),str(requester['api'][k]),str(requester['ui'][k])] for k,v in requester['database'].items()],[360,135,135,usable-630])
add('Open Tickets -> My Tickets ACTIVE filter; Waiting for Requester -> exact WAITING_FOR_REQUESTER filter. Recent Ticket buttons -> owned Detail. Recently updated/resolved counts are informational; no fabricated recent-window list filter. Zero lists have explicit text and remain distinct from failure.')
add('Lab 3 main regression: 26 passed / 16 intentional viewport skips, 0 failed/flaky. Preserves login/logout/change-password, inactive/revoked access, My Tickets filters/sort/pagination, Create/Detail, attachment upload/download/soft-removal, Public Comments, Staff queue/assignment/priority/status, Internal Notes and Administrator users/edit/activation/password reset. Full Server/Client suites also cover role/ownership denials.')
image_page('Requester Dashboard - desktop metrics and recent/empty lists',['desktop-requester-dashboard-metrics.png','desktop-requester-dashboard-lists.png'],[330,usable-330],390)
image_page('Requester Dashboard - tablet and mobile metrics',['tablet-requester-dashboard-metrics.png','mobile-requester-dashboard-metrics.png'],[460,usable-460],405)
add('Full-page and legacy screen originals remain in final-main/visual and final-main/lab3-screenshots; fresh sanitized Lab 3 HTML report is separate from historical reports.')

part(9,'Rendered UI specification and visual/accessibility acceptance')
add(doclink('ui-spec.md')+' and '+doclink('responsive-accessibility-checklist.md')+'.')
source_section('ui-spec.md','## Shell and navigation','## Implemented fields')
story.append(PageBreak());sub('Fields, Zen Green rules and completed inspection scope')
source_section('ui-spec.md','## Zen Green style and layout contract','## Review and final demonstration evidence')
rows=[['Check','Executed main evidence / scope'],['All major Lab 4 screens / three widths','Staff/Requester Dashboard, Action readonly/list/create/edit; full page and element captures at 1440x1000, 834x1112, 390x844'],['Feedback / validation','Dashboard success/empty/loading/forbidden/failure; live Action validation; controlled conflict/refresh failure/forbidden. Each HTTP fixture labelled separately'],['Readonly / role','Performer readonly; Requester Add/Edit absent; forbidden hides protected data/editor'],['Keyboard / focus','6 RESP-04 flows: Tab, Enter, Space, focus-visible; dashboard drill-down and editor checkbox/note/Save'],['Horizontal fit','Every supplementary capture asserts document scrollWidth <= clientWidth and all controls within bounds'],['Visual consistency / clipping / overlap','All gallery images manually inspected, including full-page below-fold content; existing Lab 3 captures reviewed for shell/navigation/private-content consistency'],['Browser hygiene','6 E2E browser scans: 0 unexpected HTTP failures/page errors; expected auth/me 401 probes separately counted'],['Limits','Targeted keyboard/semantic/visual checks, not full WCAG/axe certification or measured contrast audit; physical attachment recovery not proved by DB dump']]
table(rows,[225,usable-225])
add('Final peer-review gate: evidence PR approval/merge and accepted final submission remain unchecked. Then capture all Issues Done, record final evidence commit and publish the accepted PDF. The repository/main branch remains the source of truth.')
image_page('Mobile validation and retained draft controls - readable regions',['mobile-actions-validation.png','mobile-actions-refresh-failure-draft.png'],height=350)
add('Left: real server rejects whitespace Description with field-linked validation. Right: controlled refresh 500 leaves submitted edit text intact; retry and explicit discard remain visible. Full originals and provenance are clickable in the gallery.')

def footer(canvas,doc):
    canvas.setStrokeColor(colors.HexColor('#c7d2cc'));canvas.line(36,30,W-36,30)
    canvas.setFont('Body',8);canvas.setFillColor(colors.HexColor('#52665e'));canvas.drawString(36,18,'TokTickIT | main product e1fa72f | peer-review candidate | 14 Oct 2026');canvas.drawRightString(W-36,18,str(doc.page))
document=SimpleDocTemplate(str(OUT),pagesize=(W,H),leftMargin=36,rightMargin=36,topMargin=29,bottomMargin=42,title='TokTickIT - Final Main Verification - Review Candidate',author='PhraewaS',pageCompression=1)
document.build(story,onFirstPage=footer,onLaterPages=footer)
pdf=PdfReader(str(OUT));text='\n'.join(x.extract_text() or '' for x in pdf.pages)
headings=re.findall(r'Answer Part [1-9]\b',text);assert headings==['Answer Part '+str(i) for i in range(1,10)],headings
uris=[str(a.get_object().get('/A',{}).get('/URI','')) for page in pdf.pages for a in page.get('/Annots',[]) if a.get_object().get('/A',{}).get('/URI')]
assert len(uris)>70
(ROOT/'tmp/pdfs/pdf-validation.json').write_text(json.dumps({'pages':len(pdf.pages),'headings':headings,'uriCount':len(uris),'uniqueUris':len(set(uris)),'productRevision':SHA,'status':'review candidate; final peer/submission/Done gates pending'},indent=2)+'\n',encoding='utf-8')
print(json.dumps({'pdf':str(OUT),'pages':len(pdf.pages),'links':len(uris)}))
