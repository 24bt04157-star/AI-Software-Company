import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const dir=path.resolve(here,'../data'); const file=path.join(dir,'db.json');
let queue=Promise.resolve();
export async function readDb(){await fs.mkdir(dir,{recursive:true});try{await fs.access(file)}catch{await fs.writeFile(file,JSON.stringify({users:[],projects:[]},null,2))}return JSON.parse(await fs.readFile(file,'utf8'));}
export async function updateDb(fn){const job=queue.then(async()=>{const db=await readDb();const result=await fn(db);const tmp=file+'.tmp';await fs.writeFile(tmp,JSON.stringify(db,null,2));await fs.rename(tmp,file);return result});queue=job.catch(()=>{});return job;}
