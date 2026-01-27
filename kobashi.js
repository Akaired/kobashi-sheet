(async()=>{
/* ===========================
   INIT + INTRO (INTOCCATO)
=========================== */
const mount=document.getElementById("kb-stage");
if(!mount) return;
if(mount.dataset.kobashiInit==="1") return;
mount.dataset.kobashiInit="1";
if(mount.querySelector("canvas")) return;

const W=720,H=720;
const IMG_A="https://i.imgur.com/WBM4T7S.png";
const IMG_B="https://i.imgur.com/tFFXneb.png";
const IMG_PAGE="https://i.imgur.com/mynccVj.png";
const JSON_URL="https://akaired.github.io/kobashi-sheet/diary.json";

if(document.fonts?.ready) await document.fonts.ready;
if(typeof PIXI==="undefined"){console.error("PIXI non caricato");return;}

const app=new PIXI.Application();
await app.init({width:W,height:H,backgroundAlpha:0,antialias:true,autoDensity:true});
mount.appendChild(app.canvas);

const stage=new PIXI.Container();
app.stage.addChild(stage);

const sceneIntro=new PIXI.Container();
const sceneDiary=new PIXI.Container();
sceneDiary.visible=false;
stage.addChild(sceneIntro,sceneDiary);

/* ---------- INTRO ---------- */
const root=new PIXI.Container();
const scene=new PIXI.Container();
const overlay=new PIXI.Container();
const fog=new PIXI.Container();
const textFX=new PIXI.Container();
sceneIntro.addChild(root);
root.addChild(scene,overlay,fog,textFX);

scene.addChild(new PIXI.Graphics().rect(0,0,W,H).fill(0x050505));

const texA=await PIXI.Assets.load(IMG_A);
const texB=await PIXI.Assets.load(IMG_B);
const spriteA=new PIXI.Sprite(texA);
const spriteB=new PIXI.Sprite(texB);

function fitCover(s){
  s.anchor.set(.5);
  s.x=W/2; s.y=H/2;
  const sc=Math.max(W/s.texture.width,H/s.texture.height);
  s.scale.set(sc);
}
fitCover(spriteA); fitCover(spriteB);
spriteA.alpha=1; spriteB.alpha=0;
scene.addChild(spriteA,spriteB);

let hover=false;
mount.addEventListener("mouseenter",()=>hover=true);
mount.addEventListener("mouseleave",()=>hover=false);

const sf=W/1024;
const box={x1:357*sf,y1:560*sf,x2:580*sf,y2:825*sf};
const inside=(x,y)=>x>=box.x1&&x<=box.x2&&y>=box.y1&&y<=box.y2;

/* effetti flash + nebbia + sigillo */
const flash=new PIXI.Graphics().rect(0,0,W,H).fill(0xFFFFFF);
flash.alpha=0;
overlay.addChild(flash);

const fog1=new PIXI.Graphics(),fog2=new PIXI.Graphics();
function drawFog(g){
  g.clear().beginFill(0xFFFFFF,.09);
  for(let i=0;i<30;i++)
    g.drawCircle(Math.random()*W,Math.random()*H,40+Math.random()*80);
  g.endFill();
}
drawFog(fog1); drawFog(fog2);
fog1.filters=[new PIXI.BlurFilter({strength:8})];
fog2.filters=[new PIXI.BlurFilter({strength:14})];
fog.addChild(fog1,fog2);

/* ticker intro */
let t=0;
app.ticker.add(()=>{
  t+=.05;
  if(hover){
    spriteB.alpha=Math.min(1,spriteB.alpha+.08);
    spriteA.alpha=Math.max(0,spriteA.alpha-.08);
  }else{
    spriteB.alpha=Math.max(0,spriteB.alpha-.08);
    spriteA.alpha=Math.min(1,spriteA.alpha+.08);
  }
  flash.alpha*=.9;
});

/* ===========================
   DIARY (A BLOCCHI)
=========================== */

function toDiaryScene(){
  sceneIntro.visible=false;
  sceneDiary.visible=true;
}
function toIntroScene(){
  sceneDiary.visible=false;
  sceneIntro.visible=true;
}

/* ---------- DATA ---------- */
let diaryData=null;
async function loadDiary(){
  if(diaryData) return diaryData;
  const r=await fetch(JSON_URL,{cache:"no-store"});
  diaryData=await r.json();
  diaryData.chapters.sort((a,b)=>a.order-b.order);
  return diaryData;
}

/* ---------- UI ---------- */
const diaryRoot=new PIXI.Container();
sceneDiary.addChild(diaryRoot);

const pageTex=await PIXI.Assets.load(IMG_PAGE);
const pageSpr=new PIXI.Sprite(pageTex);
fitCover(pageSpr);
diaryRoot.addChild(pageSpr);

const ui=new PIXI.Container();
diaryRoot.addChild(ui);

const titleText=new PIXI.Text({
  text:"",
  style:{fontFamily:"Cormorant Garamond",fontSize:34,fontWeight:"700",fill:"#2b1b12"}
});
titleText.x=220; titleText.y=86;
ui.addChild(titleText);

const bodyText=new PIXI.Text({
  text:"",
  style:{fontFamily:"Cormorant Garamond",fontSize:22,fill:"#2b1b12",wordWrap:true,wordWrapWidth:420,lineHeight:28}
});
bodyText.x=220; bodyText.y=140;
ui.addChild(bodyText);

/* ---------- STATE A 3 LIVELLI ---------- */
let state={chapter:0,page:0,block:0};

/* ---------- RENDER BLOCCO ---------- */
function render(){
  const ch=diaryData.chapters[state.chapter];
  const pg=ch.pages[state.page];
  const blk=pg.content[state.block];

  titleText.text=pg.title || ch.tabLabel;

  if(!blk){ bodyText.text=""; return; }

  if(blk.type==="h1") bodyText.text=blk.text.toUpperCase();
  else if(blk.type==="p") bodyText.text=blk.text;
  else if(blk.type==="list") bodyText.text=blk.items.map(i=>"• "+i).join("\n");
}

/* ---------- NAV ---------- */
function next(){
  const ch=diaryData.chapters[state.chapter];
  const pg=ch.pages[state.page];

  if(state.block < pg.content.length-1){
    state.block++;
  }else if(state.page < ch.pages.length-1){
    state.page++; state.block=0;
  }else if(state.chapter < diaryData.chapters.length-1){
    state.chapter++; state.page=0; state.block=0;
  }
  render();
}

function prev(){
  if(state.block>0){
    state.block--;
  }else if(state.page>0){
    state.page--; 
    state.block=diaryData.chapters[state.chapter].pages[state.page].content.length-1;
  }else if(state.chapter>0){
    state.chapter--;
    state.page=diaryData.chapters[state.chapter].pages.length-1;
    state.block=diaryData.chapters[state.chapter].pages[state.page].content.length-1;
  }
  render();
}

/* ---------- BUTTONS ---------- */
const mkBtn=(x,y,txt,fn)=>{
  const g=new PIXI.Graphics().roundRect(0,0,62,40,10).fill(0x2b1b12);
  g.x=x; g.y=y; g.alpha=.2;
  g.eventMode="static"; g.cursor="pointer";
  g.on("pointerdown",fn);
  ui.addChild(g);

  const t=new PIXI.Text({text:txt,style:{fontSize:26,fill:"#f0e1c8"}});
  t.x=x+22; t.y=y+6;
  ui.addChild(t);
};

mkBtn(300,H-78,"◀",prev);
mkBtn(W-300-62,H-78,"▶",next);
mkBtn(W-90,36,"✕",toIntroScene);

/* ---------- OPEN ---------- */
async function openDiary(){
  await loadDiary();
  state={chapter:0,page:0,block:0};
  render();
  toDiaryScene();
}

/* ---------- CLICK INTRO ---------- */
mount.addEventListener("click",e=>{
  if(sceneDiary.visible) return;
  const r=mount.getBoundingClientRect();
  const mx=(e.clientX-r.left)*(W/r.width);
  const my=(e.clientY-r.top)*(H/r.height);
  if(hover && inside(mx,my)) openDiary();
});

})();
