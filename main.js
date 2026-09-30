import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {createGrenade} from './grenade.js';
import {createWatergun} from './watergun.js';

const catalogResponse=await fetch(typeof __CATALOG_URL__==='undefined'?'./models.json':__CATALOG_URL__);
if(!catalogResponse.ok)throw Error('Cannot load models.json');
const catalog=await catalogResponse.json();
const stage=document.querySelector('#stage');
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.82;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#0b0c0d');
RectAreaLightUniformsLib.init();
const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
const env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.65;room.dispose();pmrem.dispose();
const camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.1,100);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=4.5;controls.maxDistance=12;controls.autoRotate=false;controls.autoRotateSpeed=.65;controls.target.set(0,.1,0);
const object=new THREE.Group();scene.add(object);object.rotation.z=.20;
const amber=new THREE.MeshPhysicalMaterial({color:0xff7800,roughness:.19,metalness:0,transmission:.48,thickness:.65,ior:1.46,clearcoat:1,clearcoatRoughness:.16,attenuationColor:new THREE.Color('#ff9000'),attenuationDistance:.85});
const rim=amber.clone();rim.transmission=.18;rim.roughness=.19;
const dark=new THREE.MeshStandardMaterial({color:0x252522,roughness:.48,metalness:.32});
const ink=new THREE.MeshStandardMaterial({color:0x111713,roughness:.65});
const metal=new THREE.MeshStandardMaterial({color:0x989080,roughness:.35,metalness:.85});
function mesh(geometry,material,x=0,y=0,z=0,parent=object){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(w,h,d,r,material,x,y,z,parent=object){return mesh(new RoundedBoxGeometry(w,h,d,4,r),material,x,y,z,parent);}
// Contoured injection-molded shell: stepped shoulders, bevels and bottom lugs.
function profile(points,depth,bevel,material,z=0){const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:12});g.translate(0,0,-depth/2);return mesh(g,material,0,0,z);}
profile([[-.89,-1.02],[.86,-1.02],[.95,-.88],[.90,.44],[.77,.78],[.58,.94],[-.82,.94],[-1.03,.80],[-1.03,.57],[-.88,.41]],.70,.065,amber);
profile([[-1.00,-.87],[-.96,-1.09],[-.74,-1.16],[-.54,-1.16],[-.48,-1.10],[.70,-1.10],[.89,-1.06],[1.00,-.93],[.96,-.84]],.84,.045,rim);
// Raised upper collar follows the shoulders rather than a horizontal shelf.
profile([[-1.05,.55],[-1.05,.76],[-.89,.88],[.66,.88],[.83,.71],[.91,.49],[.85,.43],[-.84,.43]],.80,.035,rim);
for(const x of [-.81,.83])box(.07,1.22,.07,.019,rim,x,-.23,.394);
box(1.43,.07,.07,.02,rim,.025,-.94,.405);
// Short slanted carry tab, behind the neck; genuine triangular cutout.
const s=new THREE.Shape();s.moveTo(.10,.88);s.lineTo(.24,1.37);s.quadraticCurveTo(.25,1.43,.33,1.43);s.lineTo(.81,1.43);s.quadraticCurveTo(.89,1.43,.90,1.35);s.lineTo(.94,.82);s.closePath();
const hole=new THREE.Path();hole.moveTo(.43,1.10);hole.lineTo(.75,1.10);hole.lineTo(.70,1.33);hole.quadraticCurveTo(.69,1.36,.65,1.33);hole.lineTo(.43,1.17);hole.closePath();s.holes.push(hole);
const handle=mesh(new THREE.ExtrudeGeometry(s,{depth:.22,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:16}),rim);handle.position.set(0,-.20,-.12);
// Neck and cap, with individually modeled grip ribs.
mesh(new THREE.CylinderGeometry(.42,.44,.21,64),rim,-.47,1.00,0);
const cap=new THREE.Group();cap.position.set(-.47,1.25,0);object.add(cap);
mesh(new THREE.CylinderGeometry(.455,.455,.35,80),dark,0,0,0,cap);
mesh(new THREE.CylinderGeometry(.423,.423,.025,80),metal,0,.179,0,cap);
mesh(new THREE.CylinderGeometry(.397,.397,.03,80),dark,0,.194,0,cap);
for(let i=0;i<64;i++){const a=i/64*Math.PI*2;const rib=box(.022,.27,.021,.006,dark,Math.sin(a)*.455,0,Math.cos(a)*.455,cap);rib.rotation.y=a;}
const ring=mesh(new THREE.TorusGeometry(.443,.019,8,80),dark,0,-.151,0,cap);ring.rotation.x=Math.PI/2;
// All label artwork is authored as canvas textures, not the reference photograph.
function texture(draw,w=1024,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
function cloud(ctx,x,y,scale,color){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle=color;for(let i=0;i<10;i++){const h=18+Math.sin(i/9*Math.PI)*37;ctx.fillRect(i*7,62-h,4,h);}ctx.beginPath();ctx.arc(95,32,29,0,Math.PI*2);ctx.arc(120,44,19,0,Math.PI*2);ctx.rect(70,34,52,29);ctx.fill();ctx.restore();}
const front=texture((c,w,h)=>{c.fillStyle='#111713';c.beginPath();c.moveTo(0,0);c.lineTo(w*.91,0);c.lineTo(w,h*.18);c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fill();cloud(c,345,65,2.3,'#f4770c');c.textAlign='center';c.fillStyle='#d7893f';c.font='bold 42px Arial';c.fillText('SOUNDCLOUD',w/2,350);});
function label(w,h,x,y,z,tex,angle=0,parent=object){const m=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.65,metalness:0,transparent:true,polygonOffset:true,polygonOffsetFactor:-2}),x,y,z,parent);m.rotation.z=angle;return m;}
label(1.51,.65,.025,-.40,.424,front);
const strip=texture((c,w,h)=>{c.fillStyle='#ed7424';c.fillRect(0,0,w,h);c.fillStyle='#fff0ba';c.font='italic bold 55px Arial';c.textAlign='center';c.fillText('PLAY ON SOUNDCLOUD',w/2,91);},1024,128);
label(1.16,.13,-.22,.18,.426,strip);
const open=texture((c,w,h)=>{c.fillStyle='#ddd397';c.beginPath();c.ellipse(w/2,h/2,w*.46,h*.47,0,0,Math.PI*2);c.fill();c.fillStyle='#233124';c.beginPath();c.ellipse(w/2,h/2,w*.40,h*.41,0,0,Math.PI*2);c.fill();c.fillStyle='#f8d36e';c.textAlign='center';c.font='bold 58px Arial';c.fillText('OPEN',w/2,116);c.fillText('HERE',w/2,178);c.font='34px Arial';c.fillText('↗',w/2,226);},256,280);
label(.34,.44,-.53,.56,.449,open,-.18);
const warning=texture((c,w,h)=>{c.fillStyle='#f6e9c1';c.fillRect(0,0,w,h);c.fillStyle='#f44425';c.fillRect(12,12,w-24,55);c.fillStyle='#fff5d3';c.font='bold 42px Arial';c.textAlign='center';c.fillText('WARNING',w/2,54);c.fillStyle='#252a20';c.font='bold 40px Arial';c.fillText('KEEP OUT',w/2,118);c.strokeStyle='#252a20';c.lineWidth=5;c.strokeRect(5,5,w-10,h-10);},350,150);
label(.57,.28,-.055,.61,.453,warning,.48);
const arrow=texture((c,w,h)=>{c.fillStyle='#f04a1d';c.beginPath();c.arc(128,128,117,0,Math.PI*2);c.fill();c.fillStyle='#fff2be';c.beginPath();c.moveTo(59,78);c.lineTo(194,107);c.lineTo(134,195);c.lineTo(120,132);c.closePath();c.fill();},256,256);
label(.39,.43,.61,.38,.457,arrow,-.12);
const barcode=texture((c,w,h)=>{c.fillStyle='#e8dfb1';c.fillRect(0,0,w,h);c.fillStyle='#33392e';for(let i=0;i<46;i++)if(i%3!==1)c.fillRect(20+i*4,24,1+(i%3),h-67);c.font='16px monospace';c.fillText('TL / 001 / AUDIO',18,h-17);},230,400);
const side=label(.48,.81,-.954,-.38,0,barcode);side.rotation.y=-Math.PI/2;
const back=label(1.25,.85,0,-.12,-.422,front);back.rotation.y=Math.PI;
const top=texture((c,w,h)=>{c.fillStyle='#3a3b33';c.fillRect(0,0,w,h);cloud(c,64,104,2.5,'#ecc66b');},512,512);
const topLabel=mesh(new THREE.CircleGeometry(.33,64),new THREE.MeshStandardMaterial({map:top,roughness:.75}),0,.212,0,cap);topLabel.rotation.x=-Math.PI/2;
// Studio lighting and soft grounding shadow.
scene.add(new THREE.HemisphereLight(0xcfe7ff,0x5b330e,.55));
function area(color,power,w,h,x,y,z){const l=new THREE.RectAreaLight(color,power,w,h);l.position.set(x,y,z);l.lookAt(0,0,0);scene.add(l);}
area(0xfff0d8,3,4,5,-3,5,4);area(0xffffff,2.3,2,5,4,2,-2);area(0xffa32c,1.4,3,2,0,-1,-4);
const key=new THREE.DirectionalLight(0xffe8c6,1.25);key.position.set(-3,5,4);scene.add(key);
const shadowTexture=texture((c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h);},256,256);
const shadow=mesh(new THREE.PlaneGeometry(4.5,3),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}),0,-1.65,0,scene);shadow.rotation.x=-Math.PI/2;
const grenade=createGrenade(renderer);scene.add(grenade.group);grenade.group.visible=false;
const watergun=createWatergun(renderer);scene.add(watergun.group);watergun.group.visible=false;
let activeModel='amber';
const models=new Map([['amber',{group:object}],['grenade',grenade],['watergun',watergun]]);
let selectionVersion=0;
function reset(){controls.autoRotate=false;const btn=document.querySelector('#rotate');btn.textContent='\u81ea\u52a8\u65cb\u8f6c';btn.setAttribute('aria-pressed','false');camera.position.set(...(catalog.find(m=>m.id===activeModel)?.camera||[-2.35,1.7,8.3]));controls.target.set(0,.1,0);controls.update();}reset();
function layout(){const {width:w,height:h}=stage.getBoundingClientRect();if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.clearViewOffset();camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad((innerWidth<=1199?28:34)/2))/Math.min(1,(w/h)/.8)));if(innerWidth>1199&&innerHeight>600)camera.setViewOffset(w,h,-w*.11,0,w,h);camera.updateProjectionMatrix();document.querySelector('.hint').textContent=matchMedia('(pointer:coarse)').matches?'\u5355\u6307\u65cb\u8f6c \u00b7 \u53cc\u6307\u7f29\u653e \u00b7 \u53cc\u51fb\u590d\u4f4d':'\u62d6\u62fd\u65cb\u8f6c \u00b7 \u6eda\u8f6e\u7f29\u653e \u00b7 \u53cc\u51fb\u590d\u4f4d';}layout();new ResizeObserver(layout).observe(stage);addEventListener('resize',layout);
const rotate=document.querySelector('#rotate');rotate.onclick=()=>{controls.autoRotate=!controls.autoRotate;rotate.textContent=controls.autoRotate?'暂停旋转':'自动旋转';rotate.setAttribute('aria-pressed',controls.autoRotate);};
document.querySelector('#reset').onclick=reset;renderer.domElement.addEventListener('dblclick',reset);
function glass(on){document.querySelector('#glass').setAttribute('aria-pressed',on);if(activeModel==='amber'){amber.transmission=on?.78:.48;amber.roughness=on?.12:.19;rim.transmission=on?.52:.18;}else models.get(activeModel)?.setGlass?.(on);}
document.querySelector('#glass').onclick=e=>glass(e.target.getAttribute('aria-pressed')!=='true');
async function selectModel(id){
 const data=catalog.find(m=>m.id===id);if(!data)return;
 const version=++selectionVersion;const status=document.querySelector('.status');
 try{
  if(!models.has(id)){
   if(data.type!=='glb')throw Error('Unknown built-in model: '+id);
   status.textContent='LOADING...';
   const gltf=await new GLTFLoader().loadAsync(data.src);const root=new THREE.Group();root.add(gltf.scene);
   const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
   gltf.scene.position.sub(center);root.scale.setScalar(2.8/Math.max(size.x,size.y,size.z,.001));
   if(data.rotation)root.rotation.set(...data.rotation);root.visible=false;scene.add(root);models.set(id,{group:root});
  }
  if(version!==selectionVersion)return;
  activeModel=id;models.forEach((m,key)=>m.group.visible=key===id);
  const title=document.querySelector('h1');title.replaceChildren();data.title.forEach((line,i)=>{if(i)title.append(document.createElement('br'));const part=document.createElement('span');part.textContent=line;title.append(part);});
  const desc=document.querySelector('.info p');desc.replaceChildren();(data.description||[]).forEach((line,i)=>{if(i)desc.append(document.createElement('br'));desc.append(document.createTextNode(line));});
  document.querySelector('.edition').textContent='OBJECT STUDY / '+String(catalog.indexOf(data)+1).padStart(3,'0')+' / TRILIGHTLAB';
  document.querySelectorAll('[data-model]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.model===id));
  document.querySelector('[data-model="'+id+'"]')?.scrollIntoView({block:'nearest',inline:'nearest'});
  document.querySelector('#glass').disabled=data.type==='glb';glass(false);reset();status.textContent='LIVE 3D';
 }catch(error){if(version===selectionVersion)status.textContent='加载失败，请重试';console.error(error);}
}
const shelf=document.querySelector('.showcase-items');shelf.replaceChildren();
document.querySelector('.showcase-title').textContent='COLLECTION / '+String(catalog.length).padStart(2,'0');
for(const [index,data] of catalog.entries()){
 const button=document.createElement('button');button.dataset.model=data.id;button.setAttribute('aria-label','切换 '+data.title.join(' '));button.setAttribute('aria-pressed','false');
 const img=document.createElement('img');img.src=data.thumbnail;img.alt=data.title.join(' ');const label=document.createElement('span');label.textContent=String(index+1).padStart(2,'0')+' / '+(data.label||data.id).toUpperCase();button.append(img,label);button.onclick=()=>selectModel(data.id);shelf.append(button);
}
selectModel(catalog.find(m=>m.id==='watergun')?.id||catalog[0].id);
document.querySelector('#clean').onclick=e=>{const on=document.body.classList.toggle('clean');e.target.setAttribute('aria-pressed',on);e.target.textContent=on?'显示界面':'纯净展示';};
document.querySelector('#save').onclick=()=>{renderer.render(scene,camera);const a=document.createElement('a');a.download='trilight-'+activeModel+'.png';a.href=renderer.domElement.toDataURL('image/png');a.click();};
const clock=new THREE.Clock();renderer.setAnimationLoop(()=>{const t=clock.getElapsedTime();const current=models.get(activeModel).group;current.position.y=controls.autoRotate?Math.sin(t*.8)*.035:0;controls.update();renderer.render(scene,camera);});
window.addEventListener('error',e=>{const el=document.querySelector('#error');el.hidden=false;el.textContent='3D 加载失败：'+e.message;});
