(async()=>{const mount=document.getElementById("kb-stage");if(!mount)return;if(mount.dataset.kobashiInit==="1")return;mount.dataset.kobashiInit="1";if(mount.querySelector("canvas"))return;
const W=720,H=720,IMG_A="https://i.imgur.com/WBM4T7S.png",IMG_B="https://i.imgur.com/tFFXneb.png",IMG_PAGE="https://i.imgur.com/mynccVj.png",JSON_URL="https://akaired.github.io/kobashi-sheet/diary.json";
try{if(document.fonts&&document.fonts.ready)await document.fonts.ready}catch(e){}
if(typeof PIXI==="undefined"){console.error("PIXI non definito: pixi.js non caricato");return}
const app=new PIXI.Application();await app.init({width:W,height:H,backgroundAlpha:0,antialias:true,resolution:window.devicePixelRatio||1,autoDensity:true});mount.appendChild(app.canvas);

// ===== stage + scenes =====
const stage=new PIXI.Container();app.stage.addChild(stage);
const sceneIntro=new PIXI.Container(),sceneDiary=new PIXI.Container();stage.addChild(sceneIntro);stage.addChild(sceneDiary);sceneDiary.visible=false;

// ===== INTRO (tutto uguale al tuo) =====
const root=new PIXI.Container(),scene=new PIXI.Container(),overlay=new PIXI.Container(),fog=new PIXI.Container(),textFX=new PIXI.Container();
sceneIntro.addChild(root);root.addChild(scene);root.addChild(overlay);root.addChild(fog);root.addChild(textFX);
scene.addChild(new PIXI.Graphics().rect(0,0,W,H).fill(0x050505));

const texA=await PIXI.Assets.load(IMG_A),texB=await PIXI.Assets.load(IMG_B);
const spriteA=new PIXI.Sprite(texA),spriteB=new PIXI.Sprite(texB);

function fitCover(s){s.anchor.set(.5);s.x=W/2;s.y=H/2;const tw=s.texture.width||1,th=s.texture.height||1,sc=Math.max(W/tw,H/th);s.scale.set(sc)}
fitCover(spriteA);fitCover(spriteB);
spriteA.alpha=1;spriteB.alpha=0;scene.addChild(spriteA);scene.addChild(spriteB);

let hover=false;const fadeSpeed=.09;
mount.addEventListener("mouseenter",()=>hover=true);
mount.addEventListener("mouseleave",()=>hover=false);

const sf=W/1024,box={x1:357*sf,y1:560*sf,x2:580*sf,y2:825*sf};
const inside=(x,y)=>x>=box.x1&&x<=box.x2&&y>=box.y1&&y<=box.y2;

const flash=new PIXI.Graphics().rect(0,0,W,H).fill(0xFFFFFF);flash.alpha=0;overlay.addChild(flash);
const vig=new PIXI.Graphics().rect(0,0,W,H).fill(0x000000);vig.alpha=.18;vig.blendMode="multiply";overlay.addChild(vig);

const fog1=new PIXI.Graphics(),fog2=new PIXI.Graphics();
function drawFog(g,sx,sy,d){g.clear();g.beginFill(0xFFFFFF,.095);for(let i=0;i<d;i++){const x=(Math.random()*W)+sx,y=(Math.random()*H)+sy,r=40+Math.random()*110;g.drawCircle(x%(W+200)-100,y%(H+200)-100,r)}g.endFill()}
drawFog(fog1,0,0,32);drawFog(fog2,140,80,26);
fog1.alpha=.78;fog2.alpha=.55;fog1.blendMode="screen";fog2.blendMode="screen";
fog1.filters=[new PIXI.BlurFilter({strength:8,quality:2})];fog2.filters=[new PIXI.BlurFilter({strength:14,quality:2})];
fog.addChild(fog1);fog.addChild(fog2);

const lines=["SANGUE","FAME","CONTROLLO","VENDETTA","SOPRAVVIVENZA","JASHIN","NON È DOLORE","PIACERE","RESPIRA"],active=[];
function mk(line){const tt=new PIXI.Text({text:line,style:{fontFamily:"Mochiy Pop One",fontSize:28,fill:"#ffffff",stroke:"#000000",strokeThickness:6,letterSpacing:2,dropShadow:true,dropShadowColor:"#000000",dropShadowBlur:2,dropShadowDistance:2}});
tt.pivot.set(tt.width/2,tt.height/2);const m=120;tt.x=m+Math.random()*(W-m*2);tt.y=m+Math.random()*(H-m*2);
tt.alpha=0;tt.rotation=(Math.random()-.5)*.35;tt.scale.set(.85+Math.random()*.6);
return{t:tt,life:80+Math.floor(Math.random()*160),age:0}}
function spawn(){if(spriteA.alpha<.92)return;if(active.length>6)return;if(Math.random()<.006){const o=mk(lines[(Math.random()*lines.length)|0]);textFX.addChild(o.t);active.push(o)}}
function upd(){for(let i=active.length-1;i>=0;i--){const o=active[i];o.age++;const fi=14,fo=22;
o.age<fi?o.t.alpha=o.age/fi:o.age>o.life-fo?o.t.alpha=Math.max(0,(o.life-o.age)/fo):o.t.alpha=1;
o.t.x+=(Math.random()-.5)*.35;o.t.y+=(Math.random()-.5)*.35;
if(o.age>=o.life){textFX.removeChild(o.t);o.t.destroy();active.splice(i,1)}}}

const sig=new PIXI.Container();sig.x=W/2;sig.y=H/2;textFX.addChild(sig);
const words=["Sangue","Fame","Controllo","Vendetta","Sopravvivenza"],R=265;let ang=0;const sigT=[];
for(let i=0;i<words.length;i++){const tt=new PIXI.Text({text:words[i],style:{fontFamily:"Mochiy Pop One",fontSize:22,fill:"#ffffff",stroke:"#000000",strokeThickness:6,letterSpacing:2}});
tt.pivot.set(tt.width/2,tt.height/2);const a=i/words.length*Math.PI*2;tt.x=Math.cos(a)*R;tt.y=Math.sin(a)*R;tt.rotation=a+Math.PI/2;tt.alpha=0;sig.addChild(tt);sigT.push(tt)}
function sigUpd(){const ta=spriteB.alpha>.9?1:0;for(const tt of sigT)tt.alpha+=(ta-tt.alpha)*.10;if(sigT[0].alpha>.02){ang+=.007;sig.rotation=ang}}

let t=0,sp=0,st=0,ft=0;const imp=()=>Math.random()<.07?st=.9+Math.random()*1.4:st*=.85;
app.ticker.add(()=>{t+=.05;
if(hover){spriteB.alpha=Math.min(1,spriteB.alpha+fadeSpeed);spriteA.alpha=Math.max(0,spriteA.alpha-fadeSpeed)}
else{spriteB.alpha=Math.max(0,spriteB.alpha-fadeSpeed);spriteA.alpha=Math.min(1,spriteA.alpha+fadeSpeed)}
imp();sp+=(st-sp)*.12;const nx=(Math.random()-.5)*sp,ny=(Math.random()-.5)*sp,snap=Math.random()<.08?(Math.random()-.5)*1.2:0;
root.x=nx+snap;root.y=ny-snap;root.scale.set(1+Math.sin(t*.8)*.006+(Math.random()-.5)*.004);
ft*=.1;Math.random()<.035&&(ft+=.10+Math.random()*.10);Math.random()<.010&&(ft+=.22+Math.random()*.18);Math.random()<.003&&(ft+=.45+Math.random()*.25);
hover&&(ft*=1.10);flash.alpha+=(Math.min(.45,ft)-flash.alpha)*.12;
fog1.x=Math.sin(t*.25)*18;fog1.y=Math.cos(t*.22)*14;fog2.x=Math.cos(t*.18)*22;fog2.y=Math.sin(t*.16)*18;
fog1.alpha=.45+Math.sin(t*.35)*.08;fog2.alpha=.30+Math.cos(t*.28)*.07;
Math.random()<.02&&drawFog(fog1,Math.random()*200,Math.random()*200,14);
Math.random()<.015&&drawFog(fog2,Math.random()*200,Math.random()*200,10);
spawn();upd();sigUpd()
});

// ===== DIARY SCENE =====
function toDiaryScene(){sceneIntro.visible=false;sceneDiary.visible=true;hover=false;mount.style.cursor="default"}

let diaryData=null;
async function loadDiaryJSON(){
  if(diaryData) return diaryData;
  const r=await fetch(JSON_URL,{cache:"no-store"});
  if(!r.ok) throw new Error("JSON non caricato: "+r.status+" "+r.statusText+" ("+JSON_URL+")");
  diaryData=await r.json();
  if(!diaryData || !Array.isArray(diaryData.chapters)) throw new Error("Struttura JSON inattesa: manca chapters[]");
  diaryData.chapters.sort((a,b)=>(a.order??999)-(b.order??999));
  return diaryData;
}

function contentToPlainText(page){
  if(!page || !Array.isArray(page.content)) return "";
  const out=[];
  for(const node of page.content){
    if(!node) continue;
    if(node.type==="h1") out.push(String(node.text||"").toUpperCase());
    else if(node.type==="p") out.push(String(node.text||""));
    else if(node.type==="list" && Array.isArray(node.items)) out.push(node.items.map(x=>"• "+x).join("\n"));
    else if(typeof node.text==="string") out.push(node.text);
  }
  return out.join("\n\n").trim();
}

const diaryRoot=new PIXI.Container();sceneDiary.addChild(diaryRoot);
diaryRoot.addChild(new PIXI.Graphics().rect(0,0,W,H).fill(0x050505));

const pageTex=await PIXI.Assets.load(IMG_PAGE);
const pageSpr=new PIXI.Sprite(pageTex);fitCover(pageSpr);diaryRoot.addChild(pageSpr);

const ui=new PIXI.Container();diaryRoot.addChild(ui);

const TAB_X=26,TAB_Y=78,TAB_W=170,TAB_H=44,TAB_GAP=10;
const tabContainer=new PIXI.Container();ui.addChild(tabContainer);
const tabItems=[];

const contentContainer=new PIXI.Container();ui.addChild(contentContainer);

const titleText=new PIXI.Text({text:"",style:{fontFamily:"Cormorant Garamond",fontSize:34,fontWeight:"700",fill:"#2b1b12",letterSpacing:1}});
titleText.x=220;titleText.y=86;contentContainer.addChild(titleText);

const bodyText=new PIXI.Text({text:"",style:{fontFamily:"Cormorant Garamond",fontSize:22,fontWeight:"400",fill:"#2b1b12",wordWrap:true,wordWrapWidth:420,lineHeight:28}});
bodyText.x=220;bodyText.y=140;contentContainer.addChild(bodyText);

const nav=new PIXI.Container();ui.addChild(nav);
const btnPrev=new PIXI.Graphics().roundRect(0,0,62,40,10).fill(0x2b1b12);btnPrev.alpha=.10;btnPrev.x=230;btnPrev.y=H-78;nav.addChild(btnPrev);
const prevLabel=new PIXI.Text({text:"◀",style:{fontFamily:"Cormorant Garamond",fontSize:26,fontWeight:"700",fill:"#f0e1c8"}});
prevLabel.x=btnPrev.x+22;prevLabel.y=btnPrev.y+6;nav.addChild(prevLabel);

const btnNext=new PIXI.Graphics().roundRect(0,0,62,40,10).fill(0x2b1b12);btnNext.alpha=.10;btnNext.x=W-90;btnNext.y=H-78;nav.addChild(btnNext);
const nextLabel=new PIXI.Text({text:"▶",style:{fontFamily:"Cormorant Garamond",fontSize:26,fontWeight:"700",fill:"#f0e1c8"}});
nextLabel.x=btnNext.x+22;nextLabel.y=btnNext.y+6;nav.addChild(nextLabel);

btnPrev.eventMode="static";btnNext.eventMode="static";
btnPrev.cursor="pointer";btnNext.cursor="pointer";

let state={chapterIndex:0,pageIndex:0};

function setActiveTab(i){
  for(let k=0;k<tabItems.length;k++){
    tabItems[k].bg.alpha=(k===i)?.95:.78;
    tabItems[k].txt.alpha=(k===i)?1:.92;
  }
}

function buildTabs(){
  tabContainer.removeChildren();
  tabItems.length=0;
  for(let i=0;i<diaryData.chapters.length;i++){
    const ch=diaryData.chapters[i];
    const label=ch.tabLabel || ch.title || ("Capitolo "+(i+1));
    const y=TAB_Y+i*(TAB_H+TAB_GAP);

    const bg=new PIXI.Graphics().roundRect(0,0,TAB_W,TAB_H,12).fill(0x5b0f17);
    bg.x=TAB_X;bg.y=y;bg.alpha=.78;bg.eventMode="static";bg.cursor="pointer";

    const txt=new PIXI.Text({text:label,style:{fontFamily:"Mochiy Pop One",fontSize:15,fill:"#f4e7d0",stroke:"#000000",strokeThickness:4,letterSpacing:1}});
    txt.x=TAB_X+16;txt.y=y+11;txt.alpha=.92;

    tabContainer.addChild(bg);tabContainer.addChild(txt);
    bg.on("pointerdown",()=>{state.chapterIndex=i;state.pageIndex=0;renderPage();});
    tabItems.push({bg,txt});
  }
}

function renderPage(){
  const ch=diaryData.chapters[state.chapterIndex];
  const pages=Array.isArray(ch.pages)?ch.pages:[];
  const maxPage=Math.max(0,pages.length-1);
  if(state.pageIndex<0) state.pageIndex=0;
  if(state.pageIndex>maxPage) state.pageIndex=maxPage;

  const page=pages[state.pageIndex]||{};
  titleText.text=page.title || ch.tabLabel || "";
  bodyText.text=contentToPlainText(page);

  setActiveTab(state.chapterIndex);
  btnPrev.alpha=state.pageIndex>0?.22:.10;
  btnNext.alpha=state.pageIndex<maxPage?.22:.10;
}

btnPrev.on("pointerdown",()=>{state.pageIndex--;renderPage();});
btnNext.on("pointerdown",()=>{state.pageIndex++;renderPage();});

async function openDiary(){
  try{
    await loadDiaryJSON();
    buildTabs();
    state.chapterIndex=0;state.pageIndex=0;
    renderPage();
    toDiaryScene();
  }catch(e){
    console.error("[DIARY ERROR]",e);
    alert("Errore caricamento diario JSON");
  }
}

// ===== mouse/click intro only =====
mount.addEventListener("mousemove",e=>{
  if(sceneDiary.visible) return;
  const r=mount.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);
  mount.style.cursor=hover&&inside(mx,my)?"pointer":"default";
});

mount.addEventListener("click",e=>{
  if(sceneDiary.visible) return;
  const r=mount.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);
  if(!hover) return;
  if(inside(mx,my)) openDiary();
});

})();
