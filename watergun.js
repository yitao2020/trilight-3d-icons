import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createWatergun(renderer){
 const group=new THREE.Group();group.rotation.z=.11;group.scale.setScalar(.84);
 const plastic=color=>new THREE.MeshPhysicalMaterial({color,roughness:.28,metalness:0,clearcoat:.8,clearcoatRoughness:.22});
 const blue=plastic(0x0065ee),edge=plastic(0x168cff),yellow=plastic(0xffd500),orange=plastic(0xff6700),green=plastic(0x30d51c),cream=plastic(0xfff3d9),deep=plastic(0x123d81);
 const metal=new THREE.MeshStandardMaterial({color:0xb6bab2,metalness:.65,roughness:.35});
 const materials=[blue,edge,yellow,orange,green];
 function add(g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);group.add(o);return o;}
 function box(w,h,d,r,m,x,y,z){return add(new RoundedBoxGeometry(w,h,d,4,r),m,x,y,z);}
 function cylinder(r,len,m,x,y,z,axis='x',r2=r){const o=add(new THREE.CylinderGeometry(r,r2,len,64),m,x,y,z);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o;}
 function shape(points,depth,m,z=0,holes=[]){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();for(const pts of holes){const hole=new THREE.Path();pts.forEach(([x,y],i)=>i?hole.lineTo(x,y):hole.moveTo(x,y));hole.closePath();s.holes.push(hole);}const geo=new THREE.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:true,bevelSize:.055,bevelThickness:.055,bevelSegments:4});geo.translate(0,0,-depth/2);return add(geo,m,0,0,z);}
 function line(points,r,m){return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),32,r,8,false),m);}
 // Main molded body and raised casing panels.
 shape([[-1.05,-.45],[-.96,.30],[-.65,.48],[1.17,.48],[1.31,.30],[1.20,.02],[.52,-.30],[-.77,-.53]],.57,blue);
 shape([[.64,.00],[1.07,-.12],[1.42,-1.17],[1.05,-1.43],[.80,-1.36],[.38,-.30]],.49,blue);
 shape([[-.12,-.25],[.62,-.20],[.74,-.89],[.38,-1.08],[-.17,-.96],[-.35,-.73]],.34,blue,0,[[[-.15,-.39],[-.17,-.71],[.03,-.85],[.39,-.83],[.49,-.69],[.39,-.38]]]);
 shape([[.10,-.34],[.29,-.34],[.42,-.62],[.31,-.79],[.23,-.72],[.27,-.61]],.18,orange,.01);
 for(const z of [-.325,.325]){
  shape([[-.95,-.42],[-.67,-.06],[.94,.21],[1.15,.38],[1.14,.11],[.45,-.22],[-.74,-.48]],.015,edge,z);
  line([[-.79,-.32,z*1.11],[-.54,-.11,z*1.11],[.67,.16,z*1.11]],.016,blue);
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
 cylinder(.335,.14,cream,-1.17,.31,0);
 cylinder(.278,.53,orange,-1.49,.31,0);
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const rib=box(.45,.047,.05,.01,orange,-1.47,.31+Math.sin(a)*.279,Math.cos(a)*.279);rib.rotation.x=-a;}
 cylinder(.287,.14,cream,-1.81,.31,0);
 cylinder(.21,.34,orange,-2.01,.31,0);
 cylinder(.228,.12,cream,-2.23,.31,0);
 cylinder(.213,.15,green,-2.35,.31,0,'x',.19);
 const tip=add(new THREE.SphereGeometry(.19,48,24),green,-2.43,.31,0);tip.scale.x=.47;
 cylinder(.058,.005,deep,-2.521,.31,0);const lip=add(new THREE.TorusGeometry(.067,.013,12,40),green,-2.529,.31,0);lip.rotation.y=Math.PI/2;
 for(const [x,r] of [[-1.81,.29],[-2.23,.23]])for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const rib=box(.065,.017,.029,.004,cream,x,.31+Math.sin(a)*r,Math.cos(a)*r);rib.rotation.x=-a;}
 // Sliding lower handle, exposed connector and ribbed grip.
 cylinder(.076,.95,metal,-.98,-.80,0);
 cylinder(.16,.76,green,-1.58,-.80,0);
 cylinder(.22,.12,green,-1.97,-.80,0);
 const end=add(new THREE.TorusGeometry(.155,.05,12,48),green,-2.045,-.80,0);end.rotation.y=Math.PI/2;
 cylinder(.103,.012,deep,-2.03,-.80,0);
 for(let i=0;i<9;i++){const r=add(new THREE.TorusGeometry(.161,.013,8,40),green,-1.90+i*.08,-.80,0);r.rotation.y=Math.PI/2;}
 box(.25,.21,.35,.045,blue,-.43,-.69,0);
 // Artwork is drawn locally, with layered printed-label edges.
 function tex(draw,w=768,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
 function sticker(t,w,h,x,y,z,angle=0){const p=add(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),x,y,z);p.rotation.z=angle;return p;}
 const aqua=tex((c,w,h)=>{c.fillStyle='#00bbd6';for(const [x,y,r] of [[520,60,50],[580,120,58],[610,185,45],[480,130,62],[420,78,30]]){c.beginPath();c.arc(x,y,r,0,7);c.fill();c.strokeStyle='#fff6c5';c.lineWidth=9;c.stroke();}c.beginPath();c.roundRect(90,160,560,305,45);c.fillStyle='#064678';c.fill();c.strokeStyle='#fff2c1';c.lineWidth=15;c.stroke();c.textAlign='center';c.font='900 143px Arial Black,Arial';c.fillStyle='#fff6dd';c.fillText('AQUA',365,292);c.fillStyle='#ffdb00';c.fillText('BLAST',375,423);});
 sticker(aqua,.90,.69,.60,1.04,.475,.04);
 const soak=tex((c,w,h)=>{c.beginPath();c.ellipse(w/2,h/2,w*.46,h*.40,-.12,0,7);c.fillStyle='#70356d';c.fill();c.strokeStyle='#f5deb0';c.lineWidth=12;c.stroke();c.fillStyle='#fff0c7';c.textAlign='center';c.font='bold 76px Arial';c.fillText('SOAK',w/2,140);c.font='bold 55px Arial';c.fillText('TEAM',w/2,205);},512,300);sticker(soak,.37,.24,1.14,.79,.393,.14);
 const water=tex((c,w,h)=>{c.fillStyle='#f67e14';c.fillRect(0,0,w,h);c.strokeStyle='#e7efd9';c.lineWidth=24;c.strokeRect(0,0,w,h);c.font='900 168px Arial';c.fillStyle='#fff';c.strokeStyle='#164870';c.lineWidth=10;c.strokeText('H₂O',40,190);c.fillText('H₂O',40,190);c.fillStyle='#fff12f';for(let i=0;i<5;i++)c.fillRect(430+i*50,25,27,215);c.fillStyle='#00aeba';c.beginPath();c.moveTo(363,35);c.bezierCurveTo(220,215,465,260,363,35);c.fill();},768,260);sticker(water,.80,.24,-.02,-.19,.401,.18);
 const smile=tex((c,w,h)=>{c.strokeStyle='#fff4bb';c.lineWidth=14;c.fillStyle='#00b7c4';c.beginPath();c.moveTo(205,295);c.bezierCurveTo(-20,235,72,160,205,230);c.bezierCurveTo(15,60,165,40,250,192);c.bezierCurveTo(167,-40,305,-25,290,172);c.bezierCurveTo(367,50,431,110,340,259);c.bezierCurveTo(512,198,512,362,386,390);c.lineTo(180,435);c.closePath();c.fill();c.stroke();c.fillStyle='#ffda00';c.beginPath();c.ellipse(286,351,110,104,-.12,0,7);c.fill();c.stroke();c.fillStyle='#174943';c.beginPath();c.ellipse(249,322,10,22,0,0,7);c.ellipse(315,310,10,22,0,0,7);c.fill();c.strokeStyle='#174943';c.lineWidth=9;c.beginPath();c.arc(287,344,62,.15,2.7);c.stroke();},512,512);sticker(smile,.49,.59,1.03,-.83,.316,.15);
 const drop=tex((c)=>{c.fillStyle='#08b7c4';c.strokeStyle='#fff3dc';c.lineWidth=16;for(const [x,y,r] of [[130,160,80],[330,270,55]]){c.beginPath();c.moveTo(x,y-r);c.bezierCurveTo(x-r,y+r,x+r,y+r,x,y-r);c.fill();c.stroke();}},512,512);sticker(drop,.21,.25,-1.12,.45,.324,0);
 // A small barcode printed below the reservoir label.
 const barcode=tex((c,w,h)=>{c.fillStyle='#f4e9bb';c.fillRect(0,0,w,h);c.fillStyle='#40553e';for(let i=0;i<65;i++)if(i%3!==1)c.fillRect(12+i*7,8,2+i%4,h-16);},512,90);sticker(barcode,.50,.09,.58,.63,.447,.02);
 return {group,setGlass(on){for(const m of materials){m.transmission=on?.32:0;m.thickness=.22;m.needsUpdate=true;}}};
}
