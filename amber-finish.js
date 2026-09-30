import * as THREE from 'three';
import {DecalGeometry} from 'three/addons/geometries/DecalGeometry.js';

// Reversible material study: keep the original materials for exact A/B comparison.
export function createAmberFinish(group, sources, renderer) {
 let enabled=false, glass=false, replacements;
 const bindings=[];
 group.traverse(mesh=>{if(mesh.isMesh)bindings.push({mesh,original:mesh.material});});
 const details=new THREE.Group();details.visible=false;group.add(details);
 let seed=98421;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 function detailMap(edgeWear=false){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d');
  if(edgeWear){
   // Broken abrasion, concentrated along exposed lips rather than uniform dirt.
   for(let i=0;i<650;i++){const x=random()*512,y=240+(random()-.5)*32;ctx.fillStyle=`rgba(255,216,148,${.12+random()*.48})`;ctx.fillRect(x,y,1+random()*9,.5+random()*2);}
  }else{
   for(let i=0;i<65;i++){const x=random()*512,y=random()*512,length=5+random()*38;
    ctx.strokeStyle=`rgba(255,231,181,${.18+random()*.28})`;ctx.lineWidth=.6+random()*.7;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+length,y-length*.3);ctx.stroke();
    ctx.strokeStyle='rgba(100,54,15,.18)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x,y+1.2);ctx.lineTo(x+length,y-length*.3+1.2);ctx.stroke();
   }
  }
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return map;
 }
 function decal(host,map,position,size){
  const surface=new THREE.Mesh(host.geometry);surface.position.copy(host.position);surface.quaternion.copy(host.quaternion);surface.scale.copy(host.scale);surface.updateMatrixWorld(true);
  const geometry=new DecalGeometry(surface,new THREE.Vector3(...position),new THREE.Euler(),new THREE.Vector3(...size));
  const p=geometry.attributes.position,n=geometry.attributes.normal;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)+n.getX(i)*.0015,p.getY(i)+n.getY(i)*.0015,p.getZ(i)+n.getZ(i)*.0015);
  const material=new THREE.MeshStandardMaterial({map,transparent:true,roughness:.82,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  const mesh=new THREE.Mesh(geometry,material);mesh.renderOrder=1;details.add(mesh);
 }
 function buildDetails(){
  const body=bindings.find(item=>item.original===sources.amber).mesh;
  decal(body,detailMap(),[0,0,.415],[2.15,2.35,.15]);
  const wear=detailMap(true);
  const bottom=bindings.find(item=>item.original===sources.rim).mesh;
  decal(bottom,wear,[0,-1.035,.48],[1.95,.16,.2]);
  const collar=bindings.filter(item=>item.original===sources.rim)[1].mesh;
  decal(collar,wear,[0,.76,.44],[1.8,.10,.2]);
  // Actual molding parting line around the shell's mid-depth perimeter.
  const points=[[-.89,-1.02],[.86,-1.02],[.95,-.88],[.90,.44],[.77,.78],[.58,.94],[-.82,.94],[-1.03,.80],[-1.03,.57],[-.88,.41]];
  const expanded=points.map((p,i)=>{const prev=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length];const a=new THREE.Vector2(p[1]-prev[1],prev[0]-p[0]).normalize(),b=new THREE.Vector2(next[1]-p[1],p[0]-next[0]).normalize(),m=a.clone().add(b).normalize();return new THREE.Vector3(p[0]+m.x*.068/Math.max(.4,m.dot(a)),p[1]+m.y*.068/Math.max(.4,m.dot(a)),0);});
  const path=new THREE.CurvePath();expanded.forEach((p,i)=>path.add(new THREE.LineCurve3(p,expanded[(i+1)%expanded.length])));
  details.add(new THREE.Mesh(new THREE.TubeGeometry(path,160,.0045,5,true),new THREE.MeshStandardMaterial({color:'#9b561e',roughness:.75})));
  const capSeam=new THREE.Mesh(new THREE.TorusGeometry(.456,.004,6,80),new THREE.MeshStandardMaterial({color:'#737469',roughness:.85}));capSeam.rotation.x=Math.PI/2;capSeam.position.set(-.47,1.12,0);details.add(capSeam);
 }
 function surfaceTexture(scratches=false){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(256,256);
  let seed=8231;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<pixels.data.length;i+=4){const value=175+Math.floor(random()*65);pixels.data.set([value,value,value,255],i);}
  ctx.putImageData(pixels,0,0);
  if(scratches)for(let i=0;i<32;i++){const x=random()*256,y=random()*256;ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+4+random()*24,y+random()*5);ctx.stroke();}
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(scratches?1:2,scratches?1:2);texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return texture;
 }
 function prepare(){
  const grain=surfaceTexture(),wear=surfaceTexture(true);replacements=new Map();
  for(const {original} of bindings){
   if(replacements.has(original))continue;
   const material=original.isMeshPhysicalMaterial?original.clone():new THREE.MeshPhysicalMaterial();
   if(!original.isMeshPhysicalMaterial)THREE.MeshStandardMaterial.prototype.copy.call(material,original);
   material.defines={STANDARD:'',PHYSICAL:''};
   if(original===sources.amber||original===sources.rim){
    material.color.set(original===sources.amber?'#ff9c28':'#ef8918');
    material.roughness=.46;material.roughnessMap=wear;material.bumpMap=grain;material.bumpScale=.009;
    material.ior=1.49;material.thickness=original===sources.amber?1.15:.45;
    material.attenuationColor.set('#ffb547');material.attenuationDistance=1.4;
    material.clearcoat=.38;material.clearcoatRoughness=.32;material.envMapIntensity=1.25;
   }else if(original===sources.dark){
    material.color.set('#232725');material.metalness=.03;material.roughness=.72;
    material.roughnessMap=grain;material.bumpMap=grain;material.bumpScale=.012;
    material.clearcoat=.12;material.clearcoatRoughness=.55;
   }else if(original===sources.metal){
    material.color.set('#b9b7ad');material.metalness=.92;material.roughness=.32;
    material.roughnessMap=wear;material.bumpMap=wear;material.bumpScale=.0008;
   }else if(original.map){
    material.roughness=.36;material.metalness=0;material.clearcoat=.8;material.clearcoatRoughness=.22;
    material.roughnessMap=grain;material.bumpMap=grain;material.bumpScale=.0006;
   }
   replacements.set(original,material);
  }
  buildDetails();
 }
 function updateGlass(){
  if(!replacements)return;
  replacements.get(sources.amber).transmission=glass?.86:.64;
  replacements.get(sources.rim).transmission=glass?.65:.32;
 }
 return {
  get enabled(){return enabled;},
  setEnabled(on){enabled=on;if(on&&!replacements)prepare();updateGlass();details.visible=on;for(const {mesh,original} of bindings)mesh.material=on?replacements.get(original):original;},
  setGlass(on){glass=on;updateGlass();}
 };
}
