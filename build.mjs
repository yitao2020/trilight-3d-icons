import {build} from 'esbuild';
import {mkdir,readFile,writeFile,copyFile,cp,access} from 'node:fs/promises';
import path from 'node:path';
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
await build({entryPoints:['main.js'],outfile:'dist/app.js',bundle:true,minify:true,format:'esm',target:'es2022',legalComments:'eof'});
let html=await readFile('index.html','utf8');html=html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'').replace('./main.js','./app.js');
await writeFile('dist/index.html',html);await copyFile('models.json','dist/models.json');
for(const model of catalog)for(const file of [model.thumbnail,...(model.type==='glb'?[model.src]:[])]){await mkdir(path.dirname(path.join('dist',file)),{recursive:true});await copyFile(file,path.join('dist',file));}
await copyFile('node_modules/three/LICENSE','dist/THREE-LICENSE.txt');
await writeFile('dist/.nojekyll','');console.log('Built '+catalog.length+' models into dist/');
