import {createRequire} from "node:module";
import {readFile} from "node:fs/promises";
const require=createRequire(new URL("../apps/web/package.json",import.meta.url));
const {chromium,expect}=require("@playwright/test");
const addonRequire=createRequire(require.resolve("@storybook/addon-a11y"));
const axeSource=await readFile(addonRequire.resolve("axe-core/axe.min.js"),"utf8");
const base=process.env.STORYBOOK_URL??"http://127.0.0.1:6006";
const index=await (await fetch(base+"/index.json")).json();
const stories=Object.values(index.entries).filter(e=>e.type==="story"&&e.title.startsWith("Jobs/")&&(!process.argv[2]||new RegExp(process.argv[2]).test(e.id)));
if(!stories.length)throw Error("No matching Jobs stories.");
const browser=await chromium.launch();let passed=0,cursor=0;
const failures=[],tasks=[1440,768,320].flatMap(width=>stories.map(story=>({width,story})));
try{
  async function worker(){while(cursor<tasks.length){
    const {width,story}=tasks[cursor++];
    const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];
    try{
      page.on("pageerror",e=>errors.push(e.message));
      await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story`);
      await page.waitForFunction(()=>["finished","errored"].includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase));
      if(await page.evaluate(()=>window.__STORYBOOK_PREVIEW__.currentRender.phase)!=="finished")throw Error("Story interaction failed");
      if(story.id.endsWith('--drag-review')){
        const board=page.getByRole('region',{name:'Jobs status board',exact:true});
        const card=page.getByRole('article',{name:'J-1038 Kitchen sink repair',exact:true});
        const target=board.getByRole('region',{name:'Scheduled',exact:true});
        if(width<600){await card.getByRole('button',{name:'Move J-1038',exact:true}).click();await page.getByRole('dialog').getByRole('combobox').selectOption('scheduled');}else await card.getByRole('button',{name:'Move J-1038',exact:true}).dragTo(target.locator('header'));
        const dialog=page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('button',{name:'Confirm change'})).toBeDisabled();
        await expect(page.locator('[data-job-status="needs-scheduling"] article[aria-label="J-1038 Kitchen sink repair"]')).toHaveCount(1);
        await dialog.getByRole('button',{name:'Set a work date'}).click();
        await page.getByLabel('Scheduled work date',{exact:true}).fill('2026-10-22');
        await page.getByRole('button',{name:'Save schedule',exact:true}).click();
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(target.getByRole('article',{name:'J-1038 Kitchen sink repair',exact:true})).toHaveCount(1);
        await expect(page.getByRole('status',{name:'Success',exact:true})).toHaveCount(0,{timeout:4000});
      }
      if(errors.length)throw Error(errors.join("\n"));
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error("Horizontal overflow");
      await page.addScriptTag({content:axeSource});
      const violations=await page.evaluate(async()=> (await window.axe.run(document.body,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
      if(violations.length)throw Error(JSON.stringify(violations));
      if(story.id.endsWith("--all-statuses")||['Default','Detail','Table','Review','Warnings'].includes(story.name))await page.screenshot({path:`/private/tmp/${story.id}-${width}.png`,fullPage:true});
      console.log(`PASS ${story.id} ${width}px`);passed++;
    }catch(error){failures.push(`${story.id} ${width}px: ${error.message}`);console.error(`FAIL ${story.id} ${width}px: ${error.message}`);
    }finally{await page.close();}
  }}
  await Promise.all([worker(),worker(),worker()]);
  if(failures.length)throw Error(failures.join('\n'));
  console.log(`PASS ${passed} Jobs interaction/accessibility/layout checks`);
}finally{await browser.close();}
