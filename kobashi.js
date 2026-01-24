(async()=>{const mount=document.getElementById("kb-stage");if(!mount)return;const W=720,H=720,IMG_A="https://i.imgur.com/WBM4T7S.png",IMG_B="https://i.imgur.com/tFFXneb.png",IMG_PAGE="https://i.imgur.com/mynccVj.png";if(document.fonts&&document.fonts.ready)await document.fonts.ready;const app=new PIXI.Application();await app.init({width:W,height:H,backgroundAlpha:0,antialias:true,resolution:window.devicePixelRatio||1,autoDensity:true});mount.appendChild(app.canvas);

/* ===== SCENES ===== */
const root=new PIXI.Container();app.stage.addChild(root);
const sceneIntro=new PIXI.Container();
const sceneDiary=new PIXI.Container();
root.addChild(sceneIntro);
root.addChild(sceneDiary);
sceneDiary.visible=false;

function setScene(name){
  if(name==="intro"){sceneIntro.visible=true;sceneDiary.visible=false;}
  if(name==="diary"){sceneIntro.visible=false;sceneDiary.visible=true;}
}

/* ===== INTRO SETUP (tutto quello che avevi) ===== */
const introRoot=new PIXI.Container(),scene=new PIXI.Container(),overlay=new PIXI.Container(),fog=new PIXI.Container(),textFX=new PIXI.Container();
sceneIntro.addChild(introRoot);
introRoot.addChild(scene);
introRoot.addChild(overlay);
introRoot.addChild(fog);
introRoot.addChild(textFX);

scene.addChild(new PIXI.Graphics().rect(0,0,W,H).fill(0x050505));
const texA=await PIXI.Assets.load(IMG_A),texB=await PIXI.Assets.load(IMG_B);
const spriteA=new PIXI.Sprite(texA),spriteB=new PIXI.Sprite(texB);
function fitCover(s){s.anchor.set(.5);s.x=W/2;s.y=H/2;const tw=s.texture.width||1,th=s.texture.height||1,sc=Math.max(W/tw,H/th);s.scale.set(sc);}
fitCover(spriteA);fitCover(spriteB);
spriteA.alpha=1;spriteB.alpha=0;
scene.addChild(spriteA);scene.addChild(spriteB);

let hover=false;const fadeSpeed=.09;
mount.addEventListener("mouseenter",()=>hover=true);
mount.addEventListener("mouseleave",()=>hover=false);

/* ===== HITBOX DIARIO (base 1024 -> scala in 720) ===== */
const sf=W/1024,box={x1:357*sf,y1:560*sf,x2:580*sf,y2:825*sf};
const inside=(x,y)=>x>=box.x1&&x<=box.x2&&y>=box.y1&&y<=box.y2;

/* ===== FX intro ===== */
const flash=new PIXI.Graphics().rect(0,0,W,H).fill(0xFFFFFF);flash.alpha=0;overlay.addChild(flash);
const vig=new PIXI.Graphics().rect(0,0,W,H).fill(0x000000);vig.alpha=.18;vig.blendMode="multiply";overlay.addChild(vig);

const fog1=new PIXI.Graphics(),fog2=new PIXI.Graphics();
function drawFog(g,sx,sy,d){g.clear();g.beginFill(0xFFFFFF,.095);for(let i=0;i<d;i++){const x=(Math.random()*W)+sx,y=(Math.random()*H)+sy,r=40+Math.random()*110;g.drawCircle(x%(W+200)-100,y%(H+200)-100,r);}g.endFill();}
drawFog(fog1,0,0,32);drawFog(fog2,140,80,26);
fog1.alpha=.78;fog2.alpha=.55;
fog1.blendMode="screen";fog2.blendMode="screen";
fog1.filters=[new PIXI.BlurFilter({strength:8,quality:2})];
fog2.filters=[new PIXI.BlurFilter({strength:14,quality:2})];
fog.addChild(fog1);fog.addChild(fog2);

/* ===== testi manga ===== */
const lines=["SANGUE","FAME","CONTROLLO","VENDETTA","SOPRAVVIVENZA","JASHIN","NON E' DOLORE","PIACERE","RESPIRA"],active=[];
function mk(line){const t=new PIXI.Text({text:line,style:{fontFamily:"Mochiy Pop One",fontSize:28,fill:"#fff",stroke:"#000",strokeThickness:6,letterSpacing:2,dropShadow:true,dropShadowColor:"#000",dropShadowBlur:2,dropShadowDistance:2}});t.anchor?.set?.(.5);const m=70;t.x=m+Math.random()*(W-m*2);t.y=m+Math.random()*(H-m*2);t.alpha=0;t.rotation=(Math.random()-.5)*.35;t.scale.set(.85+Math.random()*.6);return{t,life:40+Math.floor(Math.random()*120),age:0};}
function spawn(){if(spriteA.alpha<.92)return;if(Math.random()<.012){const o=mk(lines[(Math.random()*lines.length)|0]);textFX.addChild(o.t);active.push(o);}}
function upd(){for(let i=active.length-1;i>=0;i--){const o=active[i];o.age++;const fi=12,fo=18;o.age<fi?o.t.alpha=o.age/fi:o.age>o.life-fo?o.t.alpha=Math.max(0,(o.life-o.age)/fo):o.t.alpha=1;o.t.x+=(Math.random()-.5)*.5;o.t.y+=(Math.random()-.5)*.5;if(o.age>=o.life){textFX.removeChild(o.t);o.t.destroy();active.splice(i,1);}}}

/* ===== sigillo B ===== */
const sig=new PIXI.Container();sig.x=W/2;sig.y=H/2;textFX.addChild(sig);
const words=["Sangue","Fame","Controllo","Vendetta","Sopravvivenza"],R=265;let ang=0;const sigT=[];
for(let i=0;i<words.length;i++){const tt=new PIXI.Text({text:words[i],style:{fontFamily:"Mochiy Pop One",fontSize:22,fill:"#fff",stroke:"#000",strokeThickness:6,letterSpacing:2}});tt.anchor?.set?.(.5);const a=i/words.length*Math.PI*2;tt.x=Math.cos(a)*R;tt.y=Math.sin(a)*R;tt.rotation=a+Math.PI/2;tt.alpha=0;sig.addChild(tt);sigT.push(tt);}
function sigUpd(){const ta=spriteB.alpha>.9?1:0;for(const tt of sigT)tt.alpha+=(ta-tt.alpha)*.1;if(sigT[0].alpha>.02){ang+=.007;sig.rotation=ang;}}

/* ===== loop intro ===== */
let t=0,sp=0,st=0,ft=0;
const imp=()=>Math.random()<.07?st=.9+Math.random()*1.4:st*=.85;
app.ticker.add(()=>{
  t+=.05;
  if(sceneIntro.visible){
    if(hover){spriteB.alpha=Math.min(1,spriteB.alpha+fadeSpeed);spriteA.alpha=Math.max(0,spriteA.alpha-fadeSpeed);}
    else{spriteB.alpha=Math.max(0,spriteB.alpha-fadeSpeed);spriteA.alpha=Math.min(1,spriteA.alpha+fadeSpeed);}
    imp();sp+=(st-sp)*.12;
    const nx=(Math.random()-.5)*sp,ny=(Math.random()-.5)*sp,snap=Math.random()<.08?(Math.random()-.5)*1.2:0;
    introRoot.x=nx+snap;introRoot.y=ny-snap;
    introRoot.scale.set(1+Math.sin(t*.8)*.006+(Math.random()-.5)*.004);
    ft*=.1;Math.random()<.035&&(ft+=.10+Math.random()*.10);Math.random()<.010&&(ft+=.22+Math.random()*.18);Math.random()<.003&&(ft+=.45+Math.random()*.25);
    hover&&(ft*=1.10);flash.alpha+=(Math.min(.45,ft)-flash.alpha)*.12;
    fog1.x=Math.sin(t*.25)*18;fog1.y=Math.cos(t*.22)*14;
    fog2.x=Math.cos(t*.18)*22;fog2.y=Math.sin(t*.16)*18;
    fog1.alpha=.45+Math.sin(t*.35)*.08;fog2.alpha=.30+Math.cos(t*.28)*.07;
    Math.random()<.02&&drawFog(fog1,Math.random()*200,Math.random()*200,14);
    Math.random()<.015&&drawFog(fog2,Math.random()*200,Math.random()*200,10);
    spawn();upd();sigUpd();
  }
});

/* ===== DIARY SETUP (pagina singola) ===== */
sceneDiary.addChild(new PIXI.Graphics().rect(0,0,W,H).fill(0x050505));
const pageTex=await PIXI.Assets.load(IMG_PAGE);
const pageSprite=new PIXI.Sprite(pageTex);
fitCover(pageSprite);
pageSprite.alpha=1;
sceneDiary.addChild(pageSprite);

/* ===== INPUT ===== */
mount.addEventListener("mousemove",e=>{
  const r=mount.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);
  mount.style.cursor=(sceneIntro.visible&&hover&&inside(mx,my))?"pointer":"default";
});

mount.addEventListener("click",e=>{
  const r=mount.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);
  if(sceneIntro.visible){
    if(!hover)return;
    if(inside(mx,my))setScene("diary");
  }else{
    // per ora: click in diario torna indietro (comodo debug)
    setScene("intro");
  }
});
})();
