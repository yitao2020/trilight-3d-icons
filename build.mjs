import {build} from 'esbuild';
import {mkdir,readFile,writeFile,copyFile,cp,access} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const catalog=JSON.parse(await readFile('models.json','utf8'));
const ids=new Set();
for(const model of catalog){
 if(!model.id || ids.has(model.id))throw Error('Missing or duplicate model id');ids.add(model.id);
 if(!['builtin','glb'].includes(model.type))throw Error('Unknown model type: '+model.id);
 if(!Array.isArray(model.title)||!model.title.length)throw Error('Missing title: '+model.id);
 for(const file of [model.thumbnail,...(model.type==='glb'?[model.src]:[])]){
  if(!file || path.isAbsolute(file)||file.split(/[\\/]/).includes('..')||file.includes(':'))throw Error('Use relative local asset paths: '+file);
  await access(file);
 }
}
await mkdir('dist',{recursive:true});
const catalogHash=createHash('sha256').update(JSON.stringify(catalog)).digest('hex').slice(0,12);
const output=await build({entryPoints:['main.js'],outdir:'dist',entryNames:'app-[hash]',bundle:true,minify:true,format:'esm',target:'es2022',legalComments:'eof',metafile:true,define:{__CATALOG_URL__:JSON.stringify('./models.json?v='+catalogHash)}});
const entry=Object.entries(output.metafile.outputs).find(([,v])=>v.entryPoint)?.[0];
let html=await readFile('index.html','utf8');html=html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'').replace('./main.js','./'+path.basename(entry));
await writeFile('dist/index.html',html);await copyFile('models.json','dist/models.json');
const css=await readFile('responsive.css');const cssName='responsive-'+createHash('sha256').update(css).digest('hex').slice(0,12)+'.css';await writeFile(path.join('dist',cssName),css);await writeFile('dist/index.html',html.replace('./responsive.css','./'+cssName));
for(const model of catalog)for(const file of [model.thumbnail,...(model.type==='glb'?[model.src]:[])]){await mkdir(path.dirname(path.join('dist',file)),{recursive:true});await copyFile(file,path.join('dist',file));}
await copyFile('node_modules/three/LICENSE','dist/THREE-LICENSE.txt');
await writeFile('dist/.nojekyll','');console.log('Built '+catalog.length+' models into dist/');
