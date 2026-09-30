import * as THREE from 'three';

// Reversible material study: keep the original materials for exact A/B comparison.
export function createAmberFinish(group, sources, renderer) {
 let enabled=false, glass=false, replacements;
 const bindings=[];
 group.traverse(mesh=>{if(mesh.isMesh)bindings.push({mesh,original:mesh.material});});
 function surfaceTexture(scratches=false){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(256,256);
  let seed=8231;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<pixels.data.length;i+=4){const value=175+Math.floor(random()*65);pixels.data.set([value,value,value,255],i);}
  ctx.putImageData(pixels,0,0);
  if(scratches)for(let i=0;i<32;i++){const x=random()*256,y=random()*256;ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+4+random()*24,y+random()*5);ctx.stroke();}
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(scratches?3:8,scratches?3:8);texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return texture;
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
    material.roughness=.25;material.roughnessMap=wear;material.bumpMap=wear;material.bumpScale=.0013;
    material.ior=1.49;material.thickness=original===sources.amber?1.15:.45;
    material.attenuationColor.set('#ffb547');material.attenuationDistance=1.4;
    material.clearcoat=.85;material.clearcoatRoughness=.18;material.envMapIntensity=1.25;
   }else if(original===sources.dark){
    material.color.set('#232725');material.metalness=.03;material.roughness=.72;
    material.roughnessMap=grain;material.bumpMap=grain;material.bumpScale=.0025;
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
 }
 function updateGlass(){
  if(!replacements)return;
  replacements.get(sources.amber).transmission=glass?.86:.64;
  replacements.get(sources.rim).transmission=glass?.65:.32;
 }
 return {
  get enabled(){return enabled;},
  setEnabled(on){enabled=on;if(on&&!replacements)prepare();updateGlass();for(const {mesh,original} of bindings)mesh.material=on?replacements.get(original):original;},
  setGlass(on){glass=on;updateGlass();}
 };
}
