import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const root=process.cwd(),sha='e1fa72f9fa1ad26ead74f82cf1de6bbf09de6384';
assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sha);
const out=path.join(root,'artifacts/lab-04/evidence/final-main/visual');fs.mkdirSync(out,{recursive:true});
const configured={};for(const line of fs.readFileSync(process.argv[2],'utf8').split(/\r?\n/)){const m=line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);if(m)configured[m[1]]=m[2].trim().replace(/^(['"])(.*)\1$/,'$2');}
const url=new URL(configured.E2E_DATABASE_URL||configured.DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(url.hostname)&&url.port==='5433');url.pathname='/toktickit_lab4_e2e';
const seed='Vf54!'+crypto.randomBytes(20).toString('base64url')+'aA9',next='Nf54!'+crypto.randomBytes(20).toString('base64url')+'aA9';
const env={...process.env,DATABASE_URL:url.toString(),E2E_DATABASE_URL:url.toString(),LAB3_SEED_PASSWORD:seed,LAB4_SEED_PASSWORD:seed,LAB4_E2E_DATABASE:'true',LAB4_E2E_RESET_PASSWORDS:'true',LAB3_E2E_DATABASE:'false'};
for(const endpoint of ['http://127.0.0.1:3000/api/health','http://127.0.0.1:5173']){let occupied=false;try{await fetch(endpoint,{signal:AbortSignal.timeout(1500)});occupied=true;}catch{}assert.ok(!occupied,'Refusing to replace existing local server');}
execFileSync(process.env.ComSpec||'cmd.exe',['/d','/s','/c','npm.cmd run prisma:seed'],{cwd:path.join(root,'server'),env,stdio:'pipe'});
const require=createRequire(path.join(root,'e2e/package.json'));const {chromium,expect}=require('@playwright/test');
const children=[],serverLogs=[];let browser;
const result={revision:sha,database:'toktickit_lab4_e2e',databasePort:5433,startedAt:new Date().toISOString(),method:'Chromium on unchanged released product; controlled HTTP visual states are labelled separately from live seed/API states',captures:[]};
function launch(file,args,cwd,extra={}){const child=spawn(process.execPath,[file,...args],{cwd,env:{...env,...extra},windowsHide:true});children.push(child);child.stdout.on('data',x=>serverLogs.push(x.toString()));child.stderr.on('data',x=>serverLogs.push(x.toString()));return child;}
async function ready(endpoint){for(let i=0;i<80;i++){try{const r=await fetch(endpoint);if(r.ok)return;}catch{}await new Promise(r=>setTimeout(r,250));}throw Error('Test server not ready');}
const changed=new Set();
async function login(page,email){await page.goto('http://127.0.0.1:5173');await page.getByLabel('Email address').fill(email);await page.getByLabel('Password').fill(changed.has(email)?next:seed);await page.getByRole('button',{name:'Sign in'}).click();if(!changed.has(email)){await page.getByLabel('New password',{exact:true}).fill(next);await page.getByLabel('Confirm new password',{exact:true}).fill(next);await page.getByRole('button',{name:'Save password'}).click();changed.add(email);}await expect(page.getByRole('heading',{name:'Dashboard',exact:true})).toBeVisible();await expect(page.locator('.metric-card').first()).toBeVisible();}
async function capture(page,viewport,name,source='live seeded API',locator){
  await page.evaluate(()=>document.fonts.ready);
  const layout=await page.evaluate(()=>{const w=document.documentElement.clientWidth;const controls=[...document.querySelectorAll('button,a,input,select,textarea')].map(e=>({tag:e.tagName,box:e.getBoundingClientRect()})).filter(e=>e.box.width>0);return{pageWidth:w,scrollWidth:document.documentElement.scrollWidth,controlCount:controls.length,outside:controls.filter(e=>e.box.left<-1||e.box.right>w+1).length};});
  assert.ok(layout.scrollWidth<=layout.pageWidth&&layout.outside===0,`${viewport}/${name} horizontal fit`);
  const filename=`${viewport}-${name}.png`;if(locator)await locator.screenshot({path:path.join(out,filename)});else await page.screenshot({path:path.join(out,filename),fullPage:true});
  result.captures.push({viewport,name,file:filename,source,layout});console.log('VISUAL '+viewport+' '+name+' PASS');
}
function envelope(code,message,fields){return{error:{code,message,...(fields?{fields}:{})}};}
try{
  launch(path.join(root,'server/dist/src/index.js'),[],path.join(root,'server'));
  launch(path.join(root,'client/node_modules/vite/bin/vite.js'),['--host','127.0.0.1'],path.join(root,'client'),{VITE_API_URL:'http://127.0.0.1:3000'});
  await Promise.all([ready('http://127.0.0.1:3000/api/health'),ready('http://127.0.0.1:5173')]);browser=await chromium.launch();
  for(const [viewport,width,height]of [['desktop',1440,1000],['tablet',834,1112],['mobile',390,844]]){
    for(const role of ['requester','staff']){
      const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage();page.setDefaultTimeout(20000);
      await login(page,role==='staff'?'mali.staff@example.test':'jennifer@example.test');
      await capture(page,viewport,role+'-dashboard-full');
      await capture(page,viewport,role+'-dashboard-metrics','live seeded API',page.locator('.metric-grid'));
      await capture(page,viewport,role+'-dashboard-lists','live seeded API',page.locator('.dashboard-grid'));
      const dashboard=`**/api/dashboard/${role}`;
      for(const state of ['empty','forbidden','failure','loading']){
        let releaseLoading;const wait=new Promise(r=>releaseLoading=r);
        await page.route(dashboard,async route=>{
          if(state==='loading'){await wait;await route.continue();return;}
          if(state==='empty'){const response=await route.fetch();const body=await response.json();for(const k of Object.keys(body.data.metrics))body.data.metrics[k]=0;for(const k of Object.keys(body.data)){if(Array.isArray(body.data[k]))body.data[k]=[];else if(['byStatus','byPriority'].includes(k))for(const n of Object.keys(body.data[k]))body.data[k][n]=0;}await route.fulfill({response,json:body});}
          else await route.fulfill({status:state==='forbidden'?403:500,json:envelope(state==='forbidden'?'ROLE_FORBIDDEN':'INTERNAL_ERROR','A safe verification response. No protected data is included.')});
        });
        await page.reload({waitUntil:'domcontentloaded'});
        await expect(page.getByRole('heading',{name:'Dashboard',exact:true})).toBeVisible();
        if(state==='loading')await expect(page.getByText(role==='staff'?'Loading IT Staff Dashboard…':'Loading Requester Dashboard…')).toBeVisible();
        else if(state==='forbidden')await expect(page.getByText('Dashboard access is unavailable for this account.')).toBeVisible();
        else if(state==='failure')await expect(page.getByText('Could not load Dashboard.')).toBeVisible();
        else await expect(page.locator('.metric-card strong').first()).toHaveText('0');
        await capture(page,viewport,role+'-dashboard-'+state,'controlled HTTP '+state+' visual fixture; backend correctness covered by the unchanged full suites');
        if(state==='loading'){releaseLoading();await expect(page.locator('.metric-card').first()).toBeVisible();}
        await page.unroute(dashboard);
      }
      await page.reload();await expect(page.locator('.metric-card').first()).toBeVisible();
      await page.getByRole('link',{name:role==='staff'?'Ticket Queue':'My Tickets',exact:true}).click();
      const row=page.getByRole('row').filter({hasText:'Laptop cannot connect to VPN'});await row.getByRole('button',{name:role==='staff'?'Open detail':'View details'}).click();
      const panel=page.locator('.actions-panel');await expect(panel.getByRole('heading',{name:'Actions Taken',exact:true})).toBeVisible();await expect(panel.locator('.action-card').first()).toBeVisible();
      await capture(page,viewport,role+'-actions-full');
      await capture(page,viewport,role+'-actions-panel','live seeded API',panel);
      if(role==='requester'){assert.equal(await panel.getByRole('button',{name:'Add Action Taken'}).count(),0);assert.equal(await panel.getByRole('button',{name:/^Edit Action Taken/}).count(),0);}
      else{
        await panel.getByRole('button',{name:'Add Action Taken'}).click();let form=page.getByRole('form',{name:'Create Action Taken'});
        await form.getByLabel('Follow-Up Required?').check();await form.getByLabel(/Follow-Up Note/).fill('Confirm the Requester can reconnect after the VPN policy refresh.');
        await form.getByLabel(/Action Description/).fill(' ');await form.getByLabel(/^Result/).fill('The verification draft is retained safely.');
        await capture(page,viewport,'actions-create-follow-up','live editor, unsubmitted draft',form);
        await form.getByRole('button',{name:'Save Action Taken'}).click();await expect(form.getByLabel(/Action Description/)).toHaveAttribute('aria-invalid','true');
        await capture(page,viewport,'actions-validation','live server 400 for whitespace description; no invalid Action saved',panel);
        await form.getByRole('button',{name:'Discard draft'}).click();await panel.getByRole('button',{name:/^Edit Action Taken from/}).first().click();form=page.getByRole('form',{name:'Edit Action Taken'});
        await form.getByLabel('Follow-Up Required?').check();await form.getByLabel(/Follow-Up Note/).fill('A retained edit draft for verification.');await form.getByLabel(/^Result/).fill('Retained draft result.');
        await capture(page,viewport,'actions-edit-follow-up','live loaded Action, unsubmitted edit',form);
        await page.route('**/api/staff/tickets/*/actions/*',route=>route.request().method()==='PATCH'?route.fulfill({status:409,json:envelope('ACTION_UPDATE_CONFLICT','This Action Taken changed. Refresh before saving.')}):route.continue());
        await form.getByRole('button',{name:'Save Changes'}).click();await expect(panel.getByText('This Action Taken changed elsewhere.')).toBeVisible();
        await capture(page,viewport,'actions-conflict','controlled HTTP 409; actual version/retry behavior verified by API/component suites',panel);
        await page.unroute('**/api/staff/tickets/*/actions/*');
        await page.route('**/api/staff/tickets/*/actions',route=>route.fulfill({status:500,json:envelope('INTERNAL_ERROR','A safe verification load failure.')}));
        await panel.getByRole('button',{name:'Refresh Actions Taken'}).click();await expect(panel.getByText('Could not load Actions Taken.')).toBeVisible();await expect(form.getByLabel(/^Result/)).toHaveValue('Retained draft result.');
        await capture(page,viewport,'actions-refresh-failure-draft','controlled HTTP 500; draft retained and retry visible',panel);
        await page.unroute('**/api/staff/tickets/*/actions');
        await page.route('**/api/staff/tickets/*/actions',route=>route.fulfill({status:403,json:envelope('ROLE_FORBIDDEN','Actions are not available to this account.')}));
        await panel.getByRole('button',{name:'Try again'}).click();await expect(panel.getByText('Actions Taken are not available for this account.')).toBeVisible();assert.equal(await panel.getByRole('form').count(),0);
        await capture(page,viewport,'actions-forbidden','controlled HTTP 403; editor/protected list hidden',panel);
      }
      await context.close();
    }
  }
  result.completedAt=new Date().toISOString();result.failed=false;fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2)+'\n');console.log('PASS '+result.captures.length+' final-main visual state captures');
}catch(error){result.failed=true;result.error=String(error);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2)+'\n');throw error;}
finally{if(browser)await browser.close();for(const child of children)if(child.exitCode===null)child.kill();}
