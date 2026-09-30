import * as THREE from 'three';
import {DecalGeometry} from 'three/addons/geometries/DecalGeometry.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createWatergun(renderer){
 const group=new THREE.Group();group.rotation.z=.11;group.scale.setScalar(.84);
 const plastic=color=>new THREE.MeshPhysicalMaterial({color,roughness:.28,metalness:0,envMapIntensity:.6,clearcoat:.8,clearcoatRoughness:.22});
 const blue=plastic(0x003bd8),edge=plastic(0x0878e9),yellow=plastic(0xffc500),orange=plastic(0xff5700),green=plastic(0x13ba08),cream=plastic(0xfff3d9),deep=plastic(0x123d81);
 const materials=[blue,edge,yellow,orange,green];
 function add(g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);group.add(o);return o;}
 function box(w,h,d,r,m,x,y,z){return add(new RoundedBoxGeometry(w,h,d,4,r),m,x,y,z);}
 function cylinder(r,len,m,x,y,z,axis='x',r2=r){const o=add(new THREE.CylinderGeometry(r,r2,len,64),m,x,y,z);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o;}
 function shape(points,depth,m,z=0,holes=[]){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();for(const pts of holes){const hole=new THREE.Path();pts.forEach(([x,y],i)=>i?hole.lineTo(x,y):hole.moveTo(x,y));hole.closePath();s.holes.push(hole);}const geo=new THREE.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:true,bevelSize:.055,bevelThickness:.055,bevelSegments:4});geo.translate(0,0,-depth/2);return add(geo,m,0,0,z);}
 function line(points,r,m){return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),32,r,8,false),m);}
 // Main molded body and raised casing panels.
 const bodyShell=shape([[-1.26,-.65],[-1.05,-.20],[-.95,.06],[-.93,.36],[-.67,.49],[1.17,.48],[1.28,.30],[1.16,.08],[.51,-.28],[-.86,-.74]],.47,blue);
 const gripShell=shape([[.63,.04],[1.03,-.10],[1.10,-.39],[1.47,-1.06],[1.28,-1.25],[.98,-1.43],[.82,-1.37],[.43,-.33]],.43,blue);
 shape([[-.25,-.36],[.58,-.22],[.75,-.89],[.43,-1.10],[-.08,-1.05],[-.28,-.92],[-.39,-.59]],.32,blue,0,[[[-.18,-.46],[-.21,-.72],[-.10,-.88],[.31,-.91],[.49,-.75],[.38,-.39]]]);
 shape([[.10,-.34],[.29,-.34],[.42,-.62],[.31,-.79],[.23,-.72],[.27,-.61]],.18,orange,.01);
 let frontPanel;
 for(const z of [-.274,.274]){
  const panel=shape([[-1.14,-.62],[-.95,-.24],[-.62,-.18],[.95,.25],[1.13,.36],[1.11,.13],[.44,-.24],[-.85,-.65]],.008,blue,z);if(z>0)frontPanel=panel;
  line([[-1.11,-.59,z*1.22],[-.88,-.55,z*1.22],[-.57,-.23,z*1.22],[.68,.16,z*1.22]],.012,edge);
  shape([[-.98,-.34],[-.82,-.03],[-.62,.04],[-.51,-.07],[-.70,-.28]],.006,edge,z*1.10);
  for(let i=0;i<5;i++){const rib=box(.04,.18,.024,.007,edge,.81+i*.067,.27,z*1.04);rib.rotation.z=-.15;}
 }
 for(let i=0;i<7;i++){const y=-.46-i*.10,x=.94-i*-.038;const r=box(.32,.03,.51,.009,edge,x,y,0);r.rotation.z=.33;}
 // Tank saddle, bright capsule reservoir and its wide retaining band.
 box(1.93,.16,.55,.04,deep,.36,.47,0);
 const tank=add(new THREE.CapsuleGeometry(.46,1.25,12,64),yellow,.37,1.00,0);tank.rotation.z=Math.PI/2;
 cylinder(.475,.32,orange,-.09,1.00,0);
 cylinder(.28,.10,orange,-.09,1.48,0,'y');cylinder(.29,.15,green,-.09,1.59,0,'y');
 for(let i=0;i<32;i++){const a=i/32*Math.PI*2;const rib=box(.025,.115,.035,.005,green,-.09+Math.sin(a)*.291,1.59,Math.cos(a)*.291);rib.rotation.y=a;}
 cylinder(.258,.021,green,-.09,1.678,0,'y');
 // Blue receiver, stepped orange barrel and cream collars.
 cylinder(.38,.52,blue,-.85,.31,0);
 box(.52,.075,.45,.025,edge,-.91,.70,0);
 for(let i=0;i<5;i++)box(.035,.17,.035,.006,edge,-1.035+i*.082,.43,.353);
 const collar=cylinder(.335,.14,cream,-1.17,.31,0);
 cylinder(.278,.53,orange,-1.49,.31,0);
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const rib=box(.45,.047,.05,.01,orange,-1.47,.31+Math.sin(a)*.279,Math.cos(a)*.279);rib.rotation.x=-a;}
 cylinder(.287,.14,cream,-1.81,.31,0);
 cylinder(.21,.34,orange,-2.01,.31,0);
 cylinder(.228,.12,cream,-2.23,.31,0);
 cylinder(.213,.15,green,-2.35,.31,0,'x',.19);
 const tip=add(new THREE.SphereGeometry(.19,48,24),green,-2.43,.31,0);tip.scale.x=.47;
 cylinder(.058,.005,deep,-2.521,.31,0);const lip=add(new THREE.TorusGeometry(.067,.013,12,40),green,-2.529,.31,0);lip.rotation.y=Math.PI/2;
 for(const [x,r] of [[-1.81,.29],[-2.23,.23]])for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const rib=box(.065,.017,.029,.004,cream,x,.31+Math.sin(a)*r,Math.cos(a)*r);rib.rotation.x=-a;}
 // Artwork is drawn locally, with layered printed-label edges.
 function tex(draw,w=768,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
 function sticker(host,t,w,h,x,y,z,angle=0){
  // Project in model-local coordinates, before the display group's scale/rotation.
  const surface=new THREE.Mesh(host.geometry);surface.position.copy(host.position);surface.quaternion.copy(host.quaternion);surface.scale.copy(host.scale);surface.updateMatrixWorld(true);
  const geometry=new DecalGeometry(surface,new THREE.Vector3(x,y,z),new THREE.Euler(0,0,angle),new THREE.Vector3(w,h,.64));
  const pos=geometry.attributes.position,norm=geometry.attributes.normal;
  for(let i=0;i<pos.count;i++){pos.setXYZ(i,pos.getX(i)+norm.getX(i)*.001,pos.getY(i)+norm.getY(i)*.001,pos.getZ(i)+norm.getZ(i)*.001);}
  const material=new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.48,metalness:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  const p=add(geometry,material);p.renderOrder=2;p.userData.decal=true;p.userData.surface=host.uuid;return p;
 }
 const aqua=tex((c,w,h)=>{c.fillStyle='#00bbd6';for(const [x,y,r] of [[520,60,50],[580,120,58],[610,185,45],[480,130,62],[420,78,30]]){c.beginPath();c.arc(x,y,r,0,7);c.fill();c.strokeStyle='#fff6c5';c.lineWidth=9;c.stroke();}c.beginPath();c.roundRect(90,160,560,305,45);c.fillStyle='#064678';c.fill();c.strokeStyle='#fff2c1';c.lineWidth=15;c.stroke();c.textAlign='center';c.font='900 143px Arial Black,Arial';c.fillStyle='#fff6dd';c.fillText('AQUA',365,292);c.fillStyle='#ffdb00';c.fillText('BLAST',375,423);});
 sticker(tank,aqua,.90,.69,.60,1.04,.475,.04);
 const soak=tex((c,w,h)=>{c.beginPath();c.ellipse(w/2,h/2,w*.46,h*.40,-.12,0,7);c.fillStyle='#70356d';c.fill();c.strokeStyle='#f5deb0';c.lineWidth=12;c.stroke();c.fillStyle='#fff0c7';c.textAlign='center';c.font='bold 76px Arial';c.fillText('SOAK',w/2,140);c.font='bold 55px Arial';c.fillText('TEAM',w/2,205);},512,300);sticker(tank,soak,.37,.24,1.14,.79,.393,.14);
 const water=tex((c,w,h)=>{c.fillStyle='#f67e14';c.fillRect(0,0,w,h);c.strokeStyle='#e7efd9';c.lineWidth=24;c.strokeRect(0,0,w,h);c.font='900 168px Arial';c.fillStyle='#fff';c.strokeStyle='#164870';c.lineWidth=10;c.strokeText('H₂O',40,190);c.fillText('H₂O',40,190);c.fillStyle='#fff12f';for(let i=0;i<5;i++)c.fillRect(430+i*50,25,27,215);c.fillStyle='#00aeba';c.beginPath();c.moveTo(363,35);c.bezierCurveTo(220,215,465,260,363,35);c.fill();},768,260);sticker(frontPanel,water,.70,.19,-.08,-.22,.333,.32);
 const smile=tex((c,w,h)=>{c.strokeStyle='#fff4bb';c.lineWidth=14;c.fillStyle='#00b7c4';c.beginPath();c.moveTo(205,295);c.bezierCurveTo(-20,235,72,160,205,230);c.bezierCurveTo(15,60,165,40,250,192);c.bezierCurveTo(167,-40,305,-25,290,172);c.bezierCurveTo(367,50,431,110,340,259);c.bezierCurveTo(512,198,512,362,386,390);c.lineTo(180,435);c.closePath();c.fill();c.stroke();c.fillStyle='#ffda00';c.beginPath();c.ellipse(286,351,110,104,-.12,0,7);c.fill();c.stroke();c.fillStyle='#174943';c.beginPath();c.ellipse(249,322,10,22,0,0,7);c.ellipse(315,310,10,22,0,0,7);c.fill();c.strokeStyle='#174943';c.lineWidth=9;c.beginPath();c.arc(287,344,62,.15,2.7);c.stroke();},512,512);sticker(gripShell,smile,.49,.59,1.03,-.83,.273,.15);
 const drop=tex((c)=>{c.fillStyle='#08b7c4';c.strokeStyle='#fff3dc';c.lineWidth=16;for(const [x,y,r] of [[130,160,80],[330,270,55]]){c.beginPath();c.moveTo(x,y-r);c.bezierCurveTo(x-r,y+r,x+r,y+r,x,y-r);c.fill();c.stroke();}},512,512);sticker(collar,drop,.115,.23,-1.17,.42,.31,0);
 // A small barcode printed below the reservoir label.
 const barcode=tex((c,w,h)=>{c.fillStyle='#f4e9bb';c.fillRect(0,0,w,h);c.fillStyle='#40553e';for(let i=0;i<65;i++)if(i%3!==1)c.fillRect(12+i*7,8,2+i%4,h-16);},512,90);sticker(tank,barcode,.47,.065,.58,.69,.36,.02);
 for(const child of group.children){child.position.x+=.54;child.position.y-=.10;}
 return {group,setGlass(on){for(const m of materials){m.transmission=on?.32:0;m.thickness=.22;m.needsUpdate=true;}}};
}
