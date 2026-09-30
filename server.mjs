import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.css':'text/css'};
http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname); const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;} const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404).end('Not found');}}).listen(Number(process.env.PORT||4174),'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4174'));
