// ================= MICRO-SCENE ENGINE =================
const lo2=null;let tickFn=null;const FX=[];
const glowTex=ctex(64,64,(c)=>{const g=c.createRadialGradient(32,32,1,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64)});glowTex.wrapS=glowTex.wrapT=THREE.ClampToEdgeWrapping;
const smokeTex=ctex(64,64,(c)=>{const g=c.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(60,60,60,.85)');g.addColorStop(1,'rgba(60,60,60,0)');c.fillStyle=g;c.fillRect(0,0,64,64)});smokeTex.wrapS=smokeTex.wrapT=THREE.ClampToEdgeWrapping;
function flameSprite(col,s){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.set(s,s,1);return sp}
function addSmoke(group,x,y,z,rate,dark){FX.push({type:'smoke',group,x,y,z,rate,acc:0,dark,parts:[]})}
S.urgent=()=>{for(let i=0;i<9;i++){tone(560,.11,'square',.07,i*.19);tone(700,.11,'square',.05,i*.19)}};
S.distress=()=>{for(let i=0;i<3;i++){tone(311,1.25,'sawtooth',.07,i*1.5);tone(392,1.25,'sawtooth',.05,i*1.5)}};
S.whistle=()=>{tone(2300,.35,'sine',.06);tone(2300,.5,'sine',.06,.45)};
S.ring=()=>{for(let i=0;i<3;i++){tone(880,.35,'sine',.05,i*.9);tone(1100,.35,'sine',.04,i*.9+.05)}};
S.siren=()=>{for(let i=0;i<4;i++)tone(600,.5,'square',.05,i*.55,900)};
S.radio=()=>{tone(1400,.05,'square',.03);tone(900,.08,'square',.03,.06)};

// camera content sits higher so the bottom sheet doesn't cover it
function viewOff(){camera.setViewOffset(innerWidth,innerHeight,0,innerHeight*.17,innerWidth,innerHeight)}
addEventListener('resize',viewOff);viewOff();

const HEMI=scene.children.find(o=>o.isHemisphereLight);const SKY=scene.background;
let extras=new THREE.Group();scene.add(extras);
const tmpPeople=[];
mate.visible=false;lookout.visible=false;coss.visible=false;
[upTrain,dnTrain].forEach(t=>t.visible=false);

// ---------- props ----------
function plate(lines,o={}){const w=o.w||1.2,h=o.h||.8;const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);const x=c.getContext('2d');x.fillStyle=o.bg||'#fff';x.fillRect(0,0,c.width,c.height);if(o.border){x.strokeStyle=o.border;x.lineWidth=c.width*.06;x.strokeRect(x.lineWidth/2,x.lineWidth/2,c.width-x.lineWidth,c.height-x.lineWidth)}x.fillStyle=o.fg||'#111';x.textAlign='center';x.textBaseline='middle';const n=lines.length;lines.forEach((t,i)=>{let f=(o.fs||(c.height*.62/n));x.font=`900 ${f}px system-ui,sans-serif`;while(x.measureText(t).width>c.width*.86){f-=2;x.font=`900 ${f}px system-ui,sans-serif`}x.fillText(t,c.width/2,c.height*(i+.5)/n+c.height*.02)});const t=new THREE.CanvasTexture(c);t.anisotropy=8;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}))}
const P={
  add(o){extras.add(o);return o},
  box(x,y,z,w,h,d,col){const m=new THREE.Mesh(bx(w,h,d),lm(col));m.position.set(x,y,z);return P.add(m)},
  sign(x,z,lines,o={}){const g=new THREE.Group();const y=o.y||1.6;if(!o.wall){const p=new THREE.Mesh(bx(.08,y,.08),lm(0x333333));p.position.y=y/2;g.add(p)}const pl=plate(lines,o);pl.position.y=y+(o.h||.8)/2-.05;pl.rotation.y=o.face!=null?o.face:-Math.PI/2;g.add(pl);g.position.set(x,0,z);return P.add(g)},
  bag(x,z,col=0xff7a00){const g=new THREE.Group();const b=new THREE.Mesh(bx(.7,.4,.35),lm(col));b.position.y=.2;g.add(b);const h=new THREE.Mesh(bx(.5,.06,.06),lm(0x222222));h.position.y=.45;g.add(h);g.position.set(x,.3,z);return P.add(g)},
  tool(x,z,lean){const g=new THREE.Group();const s=new THREE.Mesh(bx(.05,1.3,.05),lm(0x8a5a2b));s.position.y=.65;g.add(s);const bl=new THREE.Mesh(bx(.25,.3,.03),lm(0x666a70));bl.position.y=.1;g.add(bl);g.position.set(x,.3,z);if(lean)g.rotation.x=lean;return P.add(g)},
  barrier(type,x0,x1,z){const g=new THREE.Group();const len=x1-x0;
    if(type==='rigid'){for(let x=x0;x<=x1;x+=1.5){const p=new THREE.Mesh(bx(.08,1.1,.08),lm(0xf5d000));p.position.set(x,.85,z);g.add(p)}for(const y of[.8,1.3]){const r=new THREE.Mesh(bx(len,.08,.06),lm(0xf5d000));r.position.set(x0+len/2,y,z);g.add(r)}const s=new THREE.Mesh(bx(len,.05,.065),basic(0x222222));s.position.set(x0+len/2,1.3,z);s.scale.set(1,.5,1);g.add(s)}
    if(type==='net'){for(let x=x0;x<=x1;x+=2){const p=new THREE.Mesh(bx(.06,1.2,.06),lm(0x444444));p.position.set(x,.9,z);g.add(p)}const tx=ctex(64,64,(c)=>{c.clearRect(0,0,64,64);c.strokeStyle='#ff7a00';c.lineWidth=4;for(let i=0;i<64;i+=16){c.beginPath();c.moveTo(i,0);c.lineTo(i,64);c.stroke();c.beginPath();c.moveTo(0,i);c.lineTo(64,i);c.stroke()}},len,2);const n=new THREE.Mesh(new THREE.PlaneGeometry(len,1.1),new THREE.MeshBasicMaterial({map:tx,transparent:true,side:THREE.DoubleSide}));n.position.set(x0+len/2,.88,z);g.add(n)}
    if(type==='tape'){for(let x=x0;x<=x1;x+=2.5){const p=new THREE.Mesh(bx(.05,1.0,.05),lm(0x444444));p.position.set(x,.8,z);g.add(p)}const tx=ctex(64,8,(c)=>{for(let i=0;i<8;i++){c.fillStyle=i%2?'#fff':'#e02020';c.fillRect(i*8,0,8,8)}},len*2,1);const t=new THREE.Mesh(new THREE.PlaneGeometry(len,.08),new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide}));t.position.set(x0+len/2,1.2,z);g.add(t)}
    return P.add(g)},
  gate(x,open){const g=new THREE.Group();for(const dx of[0,3.2]){const p=new THREE.Mesh(bx(.15,1.6,.15),lm(0x2a2d30));p.position.set(x+dx,.8,4.9);g.add(p)}const panel=new THREE.Group();const f=new THREE.Mesh(bx(3,1.2,.06),lm(0x6b7280));f.position.set(1.5,.75,0);panel.add(f);const in2=new THREE.Mesh(bx(2.6,.85,.07),lm(0x3a3f46));in2.position.set(1.5,.75,0);panel.add(in2);panel.position.set(x+.1,0,4.9);if(open)panel.rotation.y=1.25;g.add(panel);return P.add(g)},
  gap(x){const g=new THREE.Group();const w=new THREE.Mesh(bx(.08,1.4,3),lm(0x3a3d40));w.position.set(x,.35,5.6);w.rotation.x=-1.2;g.add(w);const m=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.3),basic(0x6f8a4a));m.position.set(x,.7,4.95);g.add(m);return P.add(g)},
  fire(x,y,z,n=5){const g=new THREE.Group();g.position.set(x,y,z);const fl=[];for(let i=0;i<n;i++){const s=flameSprite(i%2?0xff7a00:0xffc030,1.2);s.position.set((Math.random()-.5)*1.4,.4+Math.random()*.6,(Math.random()-.5)*1.2);g.add(s);fl.push(s)}P.add(g);addSmoke(extras,x,y+1,z,6,true);anims.push(()=>fl.forEach(s=>{s.scale.setScalar(.9+Math.random()*1.1);s.material.opacity=.6+Math.random()*.4}));return g},
  water(x,z,w,d){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x3b6fa0,transparent:true,opacity:.85}));m.position.set(x,.36,z);anims.push(()=>{m.material.opacity=.75+Math.sin(T*3)*.1});return P.add(m)},
  tree(x,z){const g=new THREE.Group();const t=new THREE.Mesh(new THREE.CylinderGeometry(.35,.45,9,8).rotateX(Math.PI/2),lm(0x5a3a22));t.position.set(0,.85,0);t.rotation.y=.35;g.add(t);for(let i=0;i<5;i++){const f=new THREE.Mesh(new THREE.IcosahedronGeometry(1+Math.random()*.6,0),lm(0x3f6a35));f.position.set((Math.random()-.5)*2,1.2,-4+Math.random()*2);g.add(f)}g.position.set(x,0,z);return P.add(g)},
  ole(x0,x1){for(let x=x0;x<=x1;x+=40){P.box(x,3.4,2.3,.3,6.8,.3,0x8a8f96);P.box(x,6.6,.4,.15,.15,4.2,0x8a8f96);P.box(x,3.4,-5.6,.3,6.8,.3,0x8a8f96);P.box(x,6.6,-3.6,.15,.15,4.2,0x8a8f96)}for(const z of[0,-3.4]){P.box((x0+x1)/2,5.6,z,x1-x0,.03,.03,0x222222);P.box((x0+x1)/2,6.4,z,x1-x0,.03,.03,0x222222)}},
  platform(x0,x1){const len=x1-x0;P.box(x0+len/2,.5,-8.3,len,1.0,6.0,0xb5b0a6);P.box(x0+len/2,1.01,-5.55,len,.02,.5,0xd9d4ca);const l=new THREE.Mesh(new THREE.PlaneGeometry(len,.1).rotateX(-Math.PI/2),basic(0xf5d000));l.position.set(x0+len/2,1.02,-6.4);P.add(l)},
  measure(x,z0,z1,txt,y=.4){const m=new THREE.Mesh(bx(.05,.05,Math.abs(z1-z0)),basic(0xffb020));m.position.set(x,y,(z0+z1)/2);P.add(m);for(const z of[z0,z1]){const e=new THREE.Mesh(bx(.05,.35,.05),basic(0xffb020));e.position.set(x,y,z);P.add(e)}const l=label(txt,'#ffb020','#111',1.6);l.position.set(x,y+.45,(z0+z1)/2);P.add(l)},
  hornUnit(x,z){const g=new THREE.Group();const p=new THREE.Mesh(bx(.06,1.3,.06),lm(0x333333));p.position.y=.65;g.add(p);const h=new THREE.Mesh(new THREE.CylinderGeometry(.08,.22,.4,10).rotateZ(Math.PI/2),lm(0xf5d000));h.position.set(.15,1.35,0);g.add(h);const b=new THREE.Mesh(bx(.3,.3,.2),lm(0xf5d000));b.position.set(-.1,1.35,0);g.add(b);g.position.set(x,0,z);return P.add(g)},
  spoil(x,z){const m=new THREE.Mesh(new THREE.ConeGeometry(1.8,1.4,9),lm(0x5b4632));m.position.set(x,.7,z);return P.add(m)},
  rails(x,z){const g=new THREE.Group();for(let i=0;i<4;i++){const r=new THREE.Mesh(bx(12,.16,.14),lm(0x6d5a4a));r.position.set(0,.4+Math.floor(i/2)*.17,(i%2)*.3-.15+(i>1?.15:0));g.add(r)}g.position.set(x,0,z);g.scale.set(1,1,1.5);return P.add(g)},
  points(x){const g=new THREE.Group();for(const s of[-1,1]){const r=new THREE.Mesh(bx(9,.12,.07),lm(0xa8a5a0));r.position.set(x+4.5,.5,s*.55);r.rotation.y=s*.025;g.add(r)}const sb=new THREE.Mesh(bx(.12,.08,1.6),lm(0x555555));sb.position.set(x+.6,.45,0);g.add(sb);for(let i=0;i<3;i++){const r=new THREE.Mesh(bx(9,.12,.07),lm(0x8d8a85));r.position.set(x+5+i*.0,.5,1.4+i*.0);r.rotation.y=-.09;if(i)break;g.add(r)}const l=label('POINTS','#111','#ffb020',1.6);l.position.set(x+3,1.6,0);g.add(l);return P.add(g)},
  van(x,z){const g=new THREE.Group();const b=new THREE.Mesh(bx(4.6,2,2),lm(0xf0f0f0));b.position.y=1.3;g.add(b);const c=new THREE.Mesh(bx(.1,.8,1.8),lm(0x1b1d22));c.position.set(-2.32,1.75,0);g.add(c);const s=new THREE.Mesh(bx(4.62,.25,2.02),lm(0xff7a00));s.position.y=1.0;g.add(s);for(const dx of[-1.5,1.5])for(const dz of[-1,1]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.25,12).rotateX(Math.PI/2),lm(0x222222));w.position.set(dx,.38,dz);g.add(w)}g.position.set(x,0,z);return P.add(g)},
  tank(x,z,derail){const g=new THREE.Group();const t=new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.35,11,18).rotateZ(Math.PI/2),lm(0x2b2e33));t.position.y=2.45;g.add(t);const f=new THREE.Mesh(bx(12,.4,2.4),lm(0x1e1f22));f.position.y=1.05;g.add(f);for(const dx of[-4,4])for(const dz of[-.72,.72]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.12,12).rotateX(Math.PI/2),lm(0x3a3a3a));w.position.set(dx,.6,dz);g.add(w)}
    const c=document.createElement('canvas');c.width=256;c.height=192;const x2=c.getContext('2d');x2.fillStyle='#ff8a00';x2.fillRect(0,0,256,192);x2.strokeStyle='#111';x2.lineWidth=10;x2.strokeRect(5,5,246,182);x2.beginPath();x2.moveTo(0,96);x2.lineTo(256,96);x2.stroke();x2.fillStyle='#111';x2.font='900 64px system-ui';x2.textAlign='center';x2.fillText('33',128,72);x2.fillText('1203',128,166);const pt=new THREE.Mesh(new THREE.PlaneGeometry(1.0,.75),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}));pt.position.set(0,2.4,1.37);g.add(pt);
    g.position.set(x,0,z);if(derail){g.rotation.z=.07;g.rotation.y=-.12;g.position.z+=.7;g.position.y=-.15}return P.add(g)},
  bridge(x){P.box(x,6.1,0,5,.9,22,0x8c8576);P.box(x,6.9,0,5,.6,.3,0x6b665c);P.box(x,3,3.0,5,6,1.4,0x9a9284);P.box(x,3,-7,5,6,2,0x9a9284)},
  poles(x){for(const z of[8,-10]){P.box(x,4,z,.3,8,.3,0x6b4a2b);P.box(x,7.6,z,.1,.1,1.6,0x6b4a2b)}const w=new THREE.Mesh(bx(.04,.04,18),basic(0x111111));w.position.set(x,7.6,-1);w.visible=false;P.add(w);
    const pts=[];for(let i=0;i<=20;i++){const k=i/20;pts.push(new THREE.Vector3(x,7.6-7.1*Math.pow(k,1.6),8-8*k))}const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.03,5,false);P.add(new THREE.Mesh(geo,basic(0x111111)));
    const sp=flameSprite(0x9fd0ff,1.2);sp.position.set(x,.6,0);P.add(sp);anims.push(()=>{sp.visible=Math.random()<.5;sp.scale.setScalar(.6+Math.random()*1.4)})},
  trolley(x){const g=new THREE.Group();const d=new THREE.Mesh(bx(2.4,.12,1.8),lm(0xf5d000));d.position.y=.85;g.add(d);for(const dx of[-.9,.9])for(const dz of[-.72,.72]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.08,12).rotateX(Math.PI/2),lm(0x333333));w.position.set(dx,.68,dz);g.add(w)}g.position.set(x,0,0);return P.add(g)},
  windsock(x,z){P.box(x,1.6,z,.08,3.2,.08,0x555555);const s=new THREE.Mesh(new THREE.ConeGeometry(.3,1.6,10).rotateZ(Math.PI/2),lm(0xff7a00));s.position.set(x+.85,3.1,z);P.add(s);anims.push(()=>{s.rotation.y=Math.sin(T*5)*.12});const l=label('WIND →','#fff','#111',2);l.position.set(x+.5,3.9,z);P.add(l)},
  mound(x,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(3.5,5,1.2,14),lm(0x6f8a4a));m.position.set(x,.6,z);return P.add(m)},
  ditch(x,z){const m=new THREE.Mesh(new THREE.PlaneGeometry(7,1.8).rotateX(-Math.PI/2),basic(0x2f3a22));m.position.set(x,.03,z);P.add(m);const l=label('DITCH','#111','#fff',1.4);l.position.set(x,.8,z);P.add(l)},
  freight(o={}){const g=new THREE.Group();const loco=new THREE.Mesh(bx(20,3.2,2.8),lm(0x2f5a8c));loco.position.set(10,2.4,0);g.add(loco);const nose=new THREE.Mesh(bx(.5,1.6,2.8),lm(0xf5d000));nose.position.set(-.1,1.8,0);g.add(nose);for(const s of[-.85,.85]){const hl=new THREE.Mesh(bx(.08,.22,.42),basic(0xfff4c8));hl.position.set(-.38,1.4,s);g.add(hl)}
    let len=20.5;for(let i=0;i<7;i++){const cx=len+7;const f=new THREE.Mesh(bx(13.6,.45,2.5),lm(0x2a2a2a));f.position.set(cx,1.15,0);g.add(f);for(const dx of[-4.8,4.8])for(const dz of[-.72,.72]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.12,12).rotateX(Math.PI/2),lm(0x3a3a3a));w.position.set(cx+dx,.6,dz);g.add(w)}
      const ct=new THREE.Mesh(bx(12,2.6,2.44),lm([0xb33a2a,0x2a6a8c,0x6a6f75,0x2d6b3a][i%4]));ct.position.set(cx,2.7,0);g.add(ct);
      if(o.shifted&&i===2){ct.rotation.y=.18;ct.position.z=.6;const tarp=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.6),new THREE.MeshLambertMaterial({color:0x1d4a8a,side:THREE.DoubleSide}));tarp.position.set(cx-5,3.4,1.9);g.add(tarp);g.userData.tarp=tarp}
      len+=14}
    if(o.tail!==false){const l=new THREE.Mesh(bx(.1,.3,.3),basic(0xff2020));l.position.set(len+.1,1.4,0);g.add(l);const s=flameSprite(0xff2020,1);s.position.set(len+.2,1.4,0);g.add(s)}
    g.userData.len=len;g.visible=false;return P.add(g)},
  kid(x,z,col){const p=makePerson(col,0x2a2a2a,0xd9a27a,null);p.scale.setScalar(.72);return W.addGuy(p,x,z,0)}
};
const anims=[];

// ---------- world API for scenes ----------
let speedSign=null;
const W={
  P,
  speed(n){if(speedSign){scene.remove(speedSign);speedSign=null}if(n==null)return;const g=new THREE.Group();const p=new THREE.Mesh(bx(.09,1.7,.09),lm(0x222222));p.position.y=.85;g.add(p);const pl=plate([String(n)],{w:.75,h:.6,bg:'#fff',fg:'#111',border:'#111'});pl.position.y=1.95;pl.rotation.y=-Math.PI/2;g.add(pl);g.position.set(9,0,2.05);scene.add(g);speedSign=g},
  night(on){if(on){scene.background=new THREE.Color(0x142034);scene.fog.color.set(0x142034);scene.fog.near=12;scene.fog.far=95;HEMI.intensity=.55;sun.intensity=.12}else{scene.background=SKY;scene.fog.color.set(0xa9c3d6);scene.fog.near=60;scene.fog.far=260;HEMI.intensity=1.05;sun.intensity=.75}},
  cam(p,l,d=1.1){return camTo(new THREE.Vector3(...p),new THREE.Vector3(...l),d)},
  me(x,z,face=-Math.PI/2,y=.32){player.visible=true;player.position.set(x,y,z);player.rotation.y=face;W.pose(player,null)},
  addGuy(p,x,z,face=0,y=.32){p.position.set(x,y,z);p.rotation.y=face;scene.add(p);people.push(p);tmpPeople.push(p);return p},
  guy(o={}){const p=makePerson(o.vest!=null?o.vest:0xff7a00,o.pants||0x1f2a44,o.skin||[0xf1c9a5,0xa86b45,0x7a4a2c,0xd9a27a][Math.floor(Math.random()*4)],o.helmet===undefined?0xffffff:o.helmet);if(o.coss)armband(p,0x2b5fd6);if(o.tag){const t=label(o.tag,o.tagBg||'#111',o.tagFg||'#ffb020',Math.max(1.3,o.tag.length*.17));t.position.set(0,2.4,0);p.add(t)}if(o.phones){for(const s of[-1,1]){const e=new THREE.Mesh(bx(.06,.16,.16),basic(0x111111));e.position.set(.17*s,1.62,0);p.userData.body.add(e)}const bnd=new THREE.Mesh(bx(.38,.05,.06),basic(0x111111));bnd.position.set(0,1.95,0);p.userData.body.add(bnd)}if(o.hood){const h=new THREE.Mesh(bx(.38,.42,.38),lm(0x2c3440));h.position.set(0,1.66,.03);p.userData.body.add(h)}return W.addGuy(p,o.x||0,o.z||3,o.face!=null?o.face:0,o.y||.32)},
  pose(p,kind){const a=p.userData.arms;if(!a)return;a.forEach(x=>{x.rotation.x=0;x.rotation.z=0});if(kind==='one')a[1].rotation.x=-3.0;if(kind==='two'){a[0].rotation.x=-3.0;a[1].rotation.x=-3.0}if(kind==='out')a[1].rotation.z=1.57;if(kind==='phone'){a[1].rotation.x=-2.3;a[1].rotation.z=.5}},
  say(p,txt,ms=2600){const l=label(txt,'#fff','#111',Math.min(5.2,Math.max(2.2,txt.length*.13)));l.position.set(0,2.85,0);p.add(l);if(ms)setTimeout(()=>p.remove(l),ms);return l},
  walk(p,x,z,s=2.4){return walkTo(p,x,z,s)},
  wait:ms=>wait(ms),
  card(html){const c=$('card');c.innerHTML=html;c.classList.remove('hide')},
  uncard(){$('card').classList.add('hide')},
  zone(id,x,z,w=1.4,d=.7,txt,y){if(y==null)y=(Math.abs(z)<1.1||Math.abs(z+3.4)<1.1)?.6:.36;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffb020,transparent:true,opacity:.45,depthWrite:false}));m.position.set(x,y,z);m.userData.zone=id;anims.push(()=>{m.material.opacity=.3+Math.abs(Math.sin(T*3))*.3});P.add(m);const big=new THREE.Mesh(bx(Math.max(w,1.6),2,Math.max(d,1.2)),new THREE.MeshBasicMaterial());big.visible=false;big.position.set(x,y+1,z);big.userData.hz='zone:'+id;P.add(big);if(txt){const l=label(txt,'#ffb020','#111',txt.length>3?2.6:1.5);l.position.set(x,y+1.5,z);P.add(l)}return m},
  hz(id,x,y,z,w,h,d){const m=new THREE.Mesh(bx(w,h,d),new THREE.MeshBasicMaterial());m.visible=false;m.position.set(x,y,z);m.userData.hz=id;m.userData.spot=1;return P.add(m)},
  hzOn(id,obj,w=1,h=2,d=1){const m=W.hz(id,0,1,0,w,h,d);extras.remove(m);obj.add(m);return m},
  async train(which,o={}){const tr=which==='down'?dnTrain:upTrain;const sp=o.speed||30;const len=62;let from,to;
    if(which==='down'){from=o.from!=null?o.from:-170;to=o.to!=null?o.to:200}else{from=o.from!=null?o.from:170;to=o.to!=null?o.to:-150-len}
    if(o.horn)setTimeout(()=>S.trainHorn(),o.hornAt||600);S.rumble();
    if(o.stopAt!=null){tr.visible=true;tr.position.x=from;await tween(Math.abs(o.stopAt-from)/sp*1.6,k=>{const e=1-Math.pow(1-k,2.2);tr.position.x=from+(o.stopAt-from)*e});return}
    await runTrain(tr,from,to,sp)},
  async freight(o={}){const g=P.freight(o);const from=170,to=-150-g.userData.len,sp=o.speed||22;g.visible=true;g.position.x=from;let t=0;
    const prev=tickFn;tickFn=dt=>{t+=dt;if(g.userData.tarp){g.userData.tarp.rotation.x=Math.sin(t*14)*.7;g.userData.tarp.rotation.y=Math.sin(t*9)*.4}if(o.follow){const rear=g.position.x+g.userData.len;let tx=g.position.x>4?g.position.x:(rear<-6?rear:Math.max(-8,Math.min(8,g.position.x+g.userData.len*.3)));tx=Math.max(-40,Math.min(40,tx));camL.x+=(tx-camL.x)*Math.min(1,dt*3)}};
    S.rumble();if(o.horn)S.trainHorn();await tween((from-to)/sp,k=>{g.position.x=from+(to-from)*k});tickFn=prev;g.visible=false},
};

function reset(){
  for(const p of tmpPeople){scene.remove(p);const i=people.indexOf(p);if(i>=0)people.splice(i,1)}tmpPeople.length=0;
  scene.remove(extras);extras=new THREE.Group();scene.add(extras);anims.length=0;
  for(const f of FX){f.parts.forEach(p=>f.group.remove(p))}FX.length=0;tickFn=null;
  [upTrain,dnTrain].forEach(t=>t.visible=false);
  [coss,lookout,mate].forEach(p=>{p.visible=false;W.pose(p,null);p.userData.pose='stand'});
  player.children.filter(c=>c.isSprite&&c!==youTag).forEach(c=>player.remove(c));W.me(0,3.0);player.userData.pose='stand';$('sheet').classList.remove('compact');ring.visible=true;youTag.visible=true;
  W.night(false);W.speed(null);W.uncard();stopTimer();banner('');hideSheet();
  $('lookBtn').classList.add('hide');$('lookMeter').classList.add('hide');$('dim').style.opacity=0;
}
function cast(p,x,z,face){p.visible=true;p.position.set(x,.32,z);p.rotation.y=face||0;W.pose(p,null);return p}

// ---------- UI helpers ----------
function shuffleIdx(n){const a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function chatHtml(ch){return ch?`<div class="chat">${ch.map(([w,t])=>`<div class="m ${w==='You'?'me':''}"><i>${w}</i>${t}</div>`).join('')}</div>`:''}
function pickUI(sc,q){return new Promise(res=>{const ord=shuffleIdx(q.o.length);
  sheet(`<h2>${sc.t.toUpperCase()}</h2>${chatHtml(q.chat)}<div class="q">${q.p}</div><div class="opts">${ord.map(i=>`<button class="opt" data-i="${i}">${q.o[i]}</button>`).join('')}</div><div id="fbx"></div>`);
  const btns=[...$('sheet').querySelectorAll('.opt')];
  btns.forEach(b=>b.onclick=()=>{btns.forEach(x=>x.onclick=null);const i=+b.dataset.i;const ok=i===q.a;btns.forEach(x=>{if(+x.dataset.i===q.a)x.classList.add('good')});if(!ok)b.classList.add('bad');res({ok,ans:i})})})}
function multiUI(sc,q){return new Promise(res=>{const ord=shuffleIdx(q.o.length);const sel=new Set();
  sheet(`<h2>${sc.t.toUpperCase()}</h2>${chatHtml(q.chat)}<div class="q">${q.p}</div><div class="hint">Pick all that apply</div><div class="opts">${ord.map(i=>`<button class="opt" data-i="${i}">${q.o[i]}</button>`).join('')}</div><button class="go" id="done">Done</button><div id="fbx"></div>`);
  const btns=[...$('sheet').querySelectorAll('.opt')];
  btns.forEach(b=>b.onclick=()=>{const i=+b.dataset.i;sel.has(i)?sel.delete(i):sel.add(i);b.classList.toggle('sel');S.tick()});
  $('done').onclick=()=>{btns.forEach(b=>b.onclick=null);$('done').remove();let ok=true;btns.forEach(b=>{const i=+b.dataset.i,want=q.a.includes(i),got=sel.has(i);b.classList.remove('sel');if(want)b.classList.add('good');else if(got)b.classList.add('bad');if(want!==got)ok=false});res({ok,ans:[...sel]})}})}
function tapUI(sc,q){return new Promise(res=>{let done=false;
  for(const z of q.z)W.zone(z.id,z.x,z.z,z.w||1.4,z.d||.7,z.l,z.y);
  sheet(`<h2>${sc.t.toUpperCase()}</h2><div class="q">${q.p}</div><div class="zbtns">${q.z.map(z=>`<button class="zb" data-z="${z.id}">${z.l||z.id}</button>`).join('')}</div><div class="hint">Tap a glowing spot in the scene, or a letter</div><div id="fbx"></div>`);
  $('sheet').classList.add('compact');
  const finish=id=>{if(done)return;done=true;pickHandler=null;stopTimer();$('sheet').querySelectorAll('.zb').forEach(b=>{b.onclick=null;const good=[].concat(q.a).includes(b.dataset.z);if(good)b.classList.add('good');else if(b.dataset.z===id)b.classList.add('bad')});res({ok:id!=null&&[].concat(q.a).includes(id),ans:id})};
  $('sheet').querySelectorAll('.zb').forEach(b=>b.onclick=()=>finish(b.dataset.z));
  pickHandler=o=>{if(!o)return;const id=o.userData.zone||(String(o.userData.hz||'').startsWith('zone:')?o.userData.hz.slice(5):null);if(id)finish(id)};
  if(q.time){timer(q.time);setTimeout(()=>{if(!done){pop("TOO SLOW",'#ff5a5a');finish(null)}},q.time*1000)}
})}
function spotUI(sc,q){return new Promise(res=>{const want=[].concat(q.a);const sel=new Set();const marks={};
  sheet(`<h2>${sc.t.toUpperCase()}</h2><div class="q">${q.p}</div><div class="hint">${want.length>1||q.multi?'Tap everything that applies, then Done':'Tap it in the scene'}</div>${want.length>1||q.multi?'<button class="go" id="done">Done</button>':''}<div id="fbx"></div>`);
  $('sheet').classList.add('compact');
  const end=()=>{pickHandler=null;let ok=want.every(w=>sel.has(w))&&[...sel].every(s=>want.includes(s));
    extras.traverse(o=>{if(o.userData&&o.userData.spot&&want.includes(o.userData.hz)){const l=label(q.labels&&q.labels[o.userData.hz]||'THIS','#3ccf7a','#06210f',1.8);const wp=new THREE.Vector3();o.getWorldPosition(wp);l.position.set(wp.x,wp.y+1.4,wp.z);extras.add(l)}});
    const d=$('done');if(d)d.remove();res({ok,ans:[...sel]})};
  pickHandler=o=>{if(!o||!o.userData.spot)return;const id=o.userData.hz;S.tick();
    if(!(want.length>1||q.multi)){sel.add(id);if(!want.includes(id)){const wp=new THREE.Vector3();o.getWorldPosition(wp);const l=label('✗','#ff5a5a','#fff',.8);l.position.set(wp.x,wp.y+1.2,wp.z);extras.add(l)}end();return}
    if(sel.has(id)){sel.delete(id);extras.remove(marks[id]);return}
    sel.add(id);const wp=new THREE.Vector3();o.getWorldPosition(wp);const l=label('✓','#ffb020','#111',.8);l.position.set(wp.x,wp.y+1.1,wp.z);extras.add(l);marks[id]=l};
  const d=$('done');if(d)d.onclick=end;
})}
async function lookUI(sc,q){
  sheet(`<h2>${sc.t.toUpperCase()}</h2><div class="q">${q.p}</div><div class="hint">Your head drops while you walk. Keep tapping LOOK UP.</div>`);$('sheet').classList.add('compact');
  const btn=$('lookBtn');btn.classList.remove('hide');$('lookMeter').classList.remove('hide');let since=0,maxGap=0,t=0;const dim=$('dim');
  btn.onclick=()=>{since=0;S.tick();dim.style.opacity=0};
  W.cam([-7,3.4,7],[2,1,1],.6);
  const walkP=W.walk(player,24,3.0,1.6);
  let trainGo=false;
  tickFn=dt=>{t+=dt;since+=dt;maxGap=Math.max(maxGap,since);$('lookFill').style.width=Math.min(100,since/5*100)+'%';$('lookFill').style.background=since>5?'#ff5a5a':since>3.5?'#ffb020':'#3ccf7a';dim.style.opacity=Math.min(.85,Math.max(0,(since-1.2)/3));camP.x=player.position.x-7;camL.x=player.position.x+4;camL.y=1+Math.max(-1.2,-(since-1)*.35);if(!trainGo&&t>7){trainGo=true;W.train('down',{speed:28})}};
  await walkP;tickFn=null;btn.classList.add('hide');$('lookMeter').classList.add('hide');dim.style.opacity=0;$('lookFill').style.width='0%';
  return {ok:maxGap<=5.3,ans:maxGap};
}

// ---------- feedback / coverage ----------
const COVK='tr_rules';
function covGet(){try{return JSON.parse(localStorage.getItem(COVK)||'{}')}catch(e){return {}}}
function covSet(rules,ok){try{const c=covGet();const now=Date.now();for(const r of rules){const o=c[r]||{n:0,w:0};o.n++;if(!ok)o.w++;o.ok=ok?1:0;o.t=now;c[r]=o}localStorage.setItem(COVK,JSON.stringify(c))}catch(e){}}
function feedback(sc,ok){return new Promise(res=>{const fb=$('fbx')||(()=>{sheet('<div id="fbx"></div>');return $('fbx')})();$('sheet').classList.remove('compact');
  fb.innerHTML=`<div class="fb ${ok?'ok':'no'}"><b>${ok?'✅ Right call':'❌ Not quite'}</b>${sc.why}<div class="ref">📖 ${sc.ref} · rule ${sc.r.join(', ')}</div></div><button class="go">${idx+1<list.length?'Next scene':'See results'}</button>`;
  fb.querySelector('.go').onclick=()=>res();$('sheet').scrollTop=9999})}

// ---------- runner ----------
let list=[],idx=0;const results=[];
function pickList(){const qs=new URLSearchParams(location.search);const ids=(qs.get('ids')||'').split(',').filter(Boolean);
  if(ids.length)return SCENES.filter(s=>ids.includes(s.id)||s.r.some(r=>ids.includes(r)));
  const sec=qs.get('sec');if(sec)return SCENES.filter(s=>s.sec===sec);return SCENES.slice()}
async function playScene(sc){
  reset();stage(`PTS · ${idx+1}/${list.length}`);
  W.cam([-6,3.6,10.5],[2,1,.5],.01);
  if(sc.set)sc.set(W);
  if(sc.play){banner(sc.t);await sc.play(W);banner('')}
  const q=sc.q;let r;
  if(q.t==='pick')r=await pickUI(sc,q);else if(q.t==='multi')r=await multiUI(sc,q);else if(q.t==='tap')r=await tapUI(sc,q);else if(q.t==='spot')r=await spotUI(sc,q);else if(q.t==='look')r=await lookUI(sc,q);
  r.ok?(S.good(),addScore(1)):(S.bad(),flash());
  if(q.t==='tap'&&q.walk&&r.ans){const z=q.z.find(z=>z.id===r.ans);await W.walk(player,z.x,z.z,3)}
  if(sc.after){$('sheet').classList.add('compact');await sc.after(W,r.ok,r.ans)}
  covSet(sc.r,r.ok);results.push({id:sc.id,ok:r.ok,r:sc.r,t:sc.t});
  await feedback(sc,r.ok);
}
async function run(){
  window.__ready=1;
  list=pickList();if(window.__only)list=SCENES.filter(s=>window.__only.includes(s.id));
  W.cam([-6,3.6,10.5],[2,1,.5],.01);
  await info('PTS · SCENE MODE',`<b>${list.length} scene${list.length>1?'s':''}.</b> Each one is a real moment on the track: watch, then make the call. Every scene proves a rule in Handbook 1 (Issue 9).<br><br><span style="opacity:.7">Sound on for horns and warnings. Signs are simplified.</span>`,'Start');
  for(idx=0;idx<list.length;idx++)await playScene(list[idx]);
  reset();player.visible=true;W.cam([-5,3,8],[0,1.2,3]);
  const ok=results.filter(r=>r.ok).length,miss=results.filter(r=>!r.ok);
  const cov=covGet();const proven=Object.keys(RULES).filter(k=>cov[k]&&cov[k].ok).length;
  sheet(`<h2>RESULTS</h2><div class="q">${ok} / ${results.length} right calls</div>
   <div class="body">PTS rules proven so far: <b>${proven} / ${Object.keys(RULES).length}</b></div>
   ${miss.length?`<div class="body"><b>Go over these again:</b><ul class="miss">${miss.map(m=>`<li>${m.r.map(r=>RULES[r]).join('; ')}</li>`).join('')}</ul></div><a class="go" style="display:block;text-align:center;text-decoration:none" href="?ids=${miss.map(m=>m.id).join(',')}">Retry the ${miss.length} I missed</a>`:'<div class="body">Clean sheet. 👏</div>'}
   <a class="go" style="display:block;text-align:center;text-decoration:none;background:#2a3442;color:#fff;box-shadow:none" href="app.html">Back to Track Ready</a>`);
  window.__done=1;
}
window.__dbg={camP,camL,camera,W,P};
