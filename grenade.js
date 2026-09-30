import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {DecalGeometry} from 'three/addons/geometries/DecalGeometry.js';

// Stylized exterior display prop. All geometry is visual-only.
export function createGrenade(renderer){
 const group=new THREE.Group();group.rotation.z=-.12;
 const green=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.24,metalness:.14,transmission:.17,thickness:.3,clearcoat:1,clearcoatRoughness:.2});
 const silver=new THREE.MeshStandardMaterial({color:0xb9bcb3,metalness:.86,roughness:.29});
 const orange=new THREE.MeshPhysicalMaterial({color:0xff7104,roughness:.3,metalness:.08,clearcoat:.8});
 const dark=new THREE.MeshStandardMaterial({color:0x202c23,roughness:.4,metalness:.4});
 function add(g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);group.add(o);return o;}
 function box(w,h,d,r,m,x,y,z){return add(new RoundedBoxGeometry(w,h,d,3,r),m,x,y,z);}
 function tex(draw,w=1024,h=1024){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
 let seed=37;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const paint=tex((c,w,h)=>{c.fillStyle='#294632';c.fillRect(0,0,w,h);for(let i=0;i<2500;i++){const v=40+rand()*60;c.fillStyle=`rgba(${v},${v+20},${v},.18)`;c.fillRect(rand()*w,rand()*h,2+rand()*18,1+rand()*4);}for(let i=0;i<65;i++){const x=rand()*w,y=rand()*h;c.fillStyle=['#ffb900','#ef1683','#00bbb0'][i%3];for(let j=0;j<24;j++){const a=rand()*6.28,r=rand()*45;c.beginPath();c.ellipse(x+Math.cos(a)*r,y+Math.sin(a)*r,1+rand()*5,1+rand()*9,rand()*3,0,6.28);c.fill();}}});
 green.map=paint;
 const curve=new THREE.SplineCurve([new THREE.Vector2(.07,-1.36),new THREE.Vector2(.43,-1.24),new THREE.Vector2(.69,-.97),new THREE.Vector2(.83,-.55),new THREE.Vector2(.85,-.2),new THREE.Vector2(.77,.15),new THREE.Vector2(.59,.48),new THREE.Vector2(.37,.73)]);
 const points=curve.getPoints(100);const body=add(new THREE.LatheGeometry(points,96),dark);body.updateMatrixWorld(true);
 // Slightly raised curved shell panels; narrow vertical and horizontal channels.
 const rows=5,cols=10;
 for(let row=0;row<rows;row++){const segment=[];for(let j=0;j<=22;j++){const p=curve.getPoint((row+(j/22)*.96+.02)/rows);segment.push(new THREE.Vector2(p.x+.025,p.y));}for(let col=0;col<cols;col++){const geo=new THREE.LatheGeometry(segment,14,col*2*Math.PI/cols+.024,2*Math.PI/cols-.048);const uv=geo.attributes.uv,pos=geo.attributes.position;for(let k=0;k<uv.count;k++){const u=uv.getX(k),v=uv.getY(k);const lip=.035*Math.sin(Math.min(1,Math.min(u,1-u,v,1-v)/.13)*Math.PI/2);const r=Math.hypot(pos.getX(k),pos.getZ(k));pos.setXYZ(k,pos.getX(k)*(1+lip/r),pos.getY(k),pos.getZ(k)*(1+lip/r));uv.setXY(k,(col+u)/cols,(row+v)/rows);}geo.computeVertexNormals();const panel=add(geo,green);panel.userData.shell=true;}}
 add(new THREE.CylinderGeometry(.31,.4,.27,48),green,0,.76,0);
 box(.79,.27,.57,.055,dark,-.03,.99,0);
 // Bent top plate and long orange side lever.
 function extrude(points,depth,mat,z){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:4,bevelSize:.035,bevelThickness:.035,steps:1});g.translate(0,0,-depth/2);return add(g,mat,0,0,z);}
 const lever=[[-.53,1.44],[.38,1.44],[.61,1.36],[.80,1.14],[.94,.82],[1.13,.18],[1.23,-.65],[1.19,-.89],[1.04,-.96],[.96,-.86],[.91,-.20],[.73,.58],[.56,.98],[.36,1.14],[-.53,1.14]];
 extrude(lever,.36,silver,-.01);
 extrude([[-.48,1.47],[.39,1.47],[.64,1.36],[.85,1.04],[1.00,.62],[1.20,-.19],[1.27,-.79],[1.22,-.94],[1.09,-.98],[1.03,-.88],[.98,-.22],[.78,.63],[.59,1.05],[.36,1.25],[-.48,1.25]],.37,orange,.05);
 // Front metal cheek under the orange lever.
 extrude([[-.53,1.39],[.34,1.39],[.54,1.29],[.73,1.02],[.76,.73],[.56,.73],[.39,1.12],[-.53,1.12]],.05,silver,.239);
 const pink=new THREE.MeshStandardMaterial({color:0xfe3e91,roughness:.4});box(.29,.025,.37,.005,pink,-.30,1.50,-.045);
 for(const [x,y] of [[-.48,1.22],[.56,.80]]){const bolt=add(new THREE.CylinderGeometry(.077,.077,.06,32),silver,x,y,.301);bolt.rotation.x=Math.PI/2;const center=add(new THREE.CylinderGeometry(.039,.039,.067,24),dark,x,y,.307);center.rotation.x=Math.PI/2;}
 // Decorative exterior attachment: visible mount, short support and interlinked eye.
 // Display geometry only; no internal mechanism.
 const mount=add(new THREE.CylinderGeometry(.106,.12,.09,48),silver,.20,1.13,.301);mount.rotation.x=Math.PI/2;
 const inset=add(new THREE.TorusGeometry(.076,.012,12,48),dark,.20,1.13,.35);
 const support=add(new THREE.CylinderGeometry(.039,.053,.365,32),silver,.20,1.13,.526);support.rotation.x=Math.PI/2;
 const collar=add(new THREE.CylinderGeometry(.065,.065,.07,32),silver,.20,1.13,.39);collar.rotation.x=Math.PI/2;
 const ring=add(new THREE.TorusGeometry(.39,.035,16,96),silver,.20,.69,.91);ring.scale.y=1.16;ring.rotation.y=.15;
 const loop=add(new THREE.TorusGeometry(.12,.025,16,64),silver,.20,1.13,.825);loop.rotation.y=Math.PI/2;
 // Decals projected onto a slightly expanded continuous surface over the panels.
 const decalSurface=new THREE.Mesh(new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(p.x+.064,p.y)),96));decalSurface.updateMatrixWorld(true);
 function skin(texture,x,y,z,w,h,roll=0){const angle=Math.atan2(x,z);const d=new THREE.Mesh(new DecalGeometry(decalSurface,new THREE.Vector3(x,y,z),new THREE.Euler(0,angle,roll),new THREE.Vector3(w,h,.32)),new THREE.MeshStandardMaterial({map:texture,transparent:true,roughness:.52,polygonOffset:true,polygonOffsetFactor:-4,depthWrite:false}));group.add(d);}
 const boom=tex((c,w,h)=>{c.translate(w/2,h/2);c.beginPath();for(let i=0;i<24;i++){let a=i/24*Math.PI*2,r=i%2?300:470;c.lineTo(Math.cos(a)*r,Math.sin(a)*r*.78);}c.closePath();c.fillStyle='#eee7cf';c.fill();c.strokeStyle='#29312a';c.lineWidth=18;c.stroke();c.scale(.86,.86);c.fillStyle='#f46027';c.fill();c.strokeStyle='#f4e9c9';c.lineWidth=14;c.stroke();c.rotate(-.10);c.textAlign='center';c.font='900 225px Impact,Arial Black,sans-serif';c.strokeStyle='#28362d';c.lineWidth=20;c.strokeText('BOOM!',0,76);c.fillStyle='#fff4cf';c.fillText('BOOM!',0,76);});
 skin(boom,-.43,-.30,.70,.99,.79,-.15);
 const caution=tex((c,w,h)=>{c.fillStyle='#f5ce0b';c.fillRect(0,0,w,h);c.fillStyle='#243b2c';for(let i=-1;i<9;i++){c.beginPath();c.moveTo(i*150,20);c.lineTo(i*150+75,20);c.lineTo(i*150+28,100);c.lineTo(i*150-47,100);c.fill();c.fillRect(i*150,h-80,80,55);}c.textAlign='center';c.font='900 135px Arial';c.fillText('HANDLE',w/2,255);c.font='bold 107px Arial';c.fillText('WITH CARE',w/2,380);},1024,512);
 skin(caution,.39,.12,.68,.73,.46,.16);
 const lightning=tex((c,w,h)=>{c.fillStyle='#00bab7';c.beginPath();c.arc(w/2,h/2,w*.46,0,7);c.fill();c.strokeStyle='#45dfc3';c.lineWidth=15;c.stroke();c.fillStyle='#13352e';c.beginPath();c.moveTo(270,78);c.lineTo(167,275);c.lineTo(248,261);c.lineTo(212,430);c.lineTo(358,202);c.lineTo(274,214);c.lineTo(323,78);c.fill();},512,512);
 skin(lightning,.44,-.47,.71,.43,.46,-.08);
 const barcode=tex((c,w,h)=>{c.fillStyle='#e4dfc5';c.fillRect(0,0,w,h);c.fillStyle='#e42153';c.fillRect(0,0,w,105);c.fillStyle='#fff6d0';c.textAlign='center';c.font='bold 68px Arial';c.fillText('EXPLOSIVE',w/2,80);c.fillStyle='#17271f';for(let i=0;i<78;i++)if(i%3!==1)c.fillRect(20+i*6,125,2+i%3,180);c.font='32px monospace';c.fillText('ART TOY / 002',w/2,352);},512,384);
 skin(barcode,-.24,-1.01,.57,.54,.30,-.20);
 const patch=tex((c,w,h)=>{c.fillStyle='#db146f';c.beginPath();c.roundRect(25,25,w-50,h-50,70);c.fill();c.strokeStyle='#f0c4bc';c.lineWidth=12;c.stroke();c.fillStyle='#00a790';for(let i=0;i<6;i++)c.fillRect(110+i*32,95-i%2*22,42,100);},512,280);
 skin(patch,.40,-.94,.49,.39,.26,.05);
 function flat(tex,w,h,x,y,z,rotation=0){const d=add(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,transparent:true,roughness:.5}),x,y,z);d.rotation.z=rotation;}
 const drop=tex((c,w,h)=>{c.fillStyle='#078cdc';c.beginPath();c.moveTo(0,0);c.lineTo(w,0);c.lineTo(w/2,h);c.fill();c.fillStyle='white';c.textAlign='center';c.font='bold 70px Arial';c.fillText('DROP',w/2,95);c.font='bold 120px Arial';c.fillText('↓',w/2,206);},320,300);flat(drop,.32,.31,-.10,1.12,.285,-.13);
 const up=tex((c,w,h)=>{c.fillStyle='#fff6dc';c.beginPath();c.moveTo(w*.5,15);c.lineTo(w*.91,h*.39);c.lineTo(w*.65,h*.39);c.lineTo(w*.65,h*.92);c.lineTo(w*.34,h*.92);c.lineTo(w*.34,h*.39);c.lineTo(w*.09,h*.39);c.fill();},256,512);flat(up,.20,.44,1.025,-.05,.275,.20);
 return {group,setGlass(on){green.transmission=on?.57:.17;green.roughness=on?.15:.24;}};
}
