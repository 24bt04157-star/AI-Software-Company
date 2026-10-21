
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
const here=path.dirname(fileURLToPath(import.meta.url));
const file=path.resolve(here,'../data/db.json');
let mongo=false, db={users:[],projects:[]};
const User=mongoose.models.User||mongoose.model('User',new mongoose.Schema({name:String,email:{type:String,unique:true,lowercase:true},passwordHash:String},{timestamps:true}));
const Project=mongoose.models.Project||mongoose.model('Project',new mongoose.Schema({ownerId:String,title:String,idea:String,platform:String,status:String,requirements:Object,conversation:Array,artifacts:Array,tasks:Array,bugs:Array},{timestamps:true}));
async function save(){await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(db,null,2));}
export async function initStore(){
 if(process.env.MONGODB_URI){try{await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:5000});mongo=true;console.log('MongoDB connected');return}catch(e){console.warn('MongoDB unavailable; using local JSON:',e.message)}}
 try{db=JSON.parse(await fs.readFile(file,'utf8'))}catch{await save()}
 console.log('Using local JSON persistence');
}
export const storageMode=()=>mongo?'mongodb':'local-json';
export async function findUserByEmail(email){return mongo?User.findOne({email:email.toLowerCase()}).lean():db.users.find(u=>u.email===email.toLowerCase())||null}
export async function findUserById(id){return mongo?User.findById(id).lean():db.users.find(u=>u.id===id)||null}
export async function createUser(u){if(mongo)return (await User.create(u)).toObject();db.users.push(u);await save();return u}
const clean=p=>p?({...p,id:String(p._id||p.id),_id:undefined,__v:undefined}):null;
export async function listProjects(ownerId){return mongo?(await Project.find({ownerId}).sort({updatedAt:-1}).lean()).map(clean):db.projects.filter(p=>p.ownerId===ownerId).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt))}
export async function getProject(id,ownerId){if(mongo){if(!mongoose.isValidObjectId(id))return null;return clean(await Project.findOne({_id:id,ownerId}).lean())}return db.projects.find(p=>p.id===id&&p.ownerId===ownerId)||null}
export async function createProject(p){const now=new Date().toISOString();const x={...p,createdAt:now,updatedAt:now,conversation:[],artifacts:[],tasks:[],bugs:[]};if(mongo)return clean(await Project.create(x));x.id=crypto.randomUUID();db.projects.push(x);await save();return x}
export async function updateProject(id,ownerId,updates){if(mongo){if(!mongoose.isValidObjectId(id))return null;return clean(await Project.findOneAndUpdate({_id:id,ownerId},{$set:{...updates,updatedAt:new Date()}},{new:true}).lean())}const p=db.projects.find(p=>p.id===id&&p.ownerId===ownerId);if(!p)return null;Object.assign(p,updates,{updatedAt:new Date().toISOString()});await save();return p}
export async function deleteProject(id,ownerId){if(mongo){if(!mongoose.isValidObjectId(id))return false;return (await Project.deleteOne({_id:id,ownerId})).deletedCount>0}const n=db.projects.length;db.projects=db.projects.filter(p=>!(p.id===id&&p.ownerId===ownerId));if(n!==db.projects.length)await save();return n!==db.projects.length}
export async function findProjectContainingArrayItem(ownerId,key,itemId){for(const p of await listProjects(ownerId)){const item=(p[key]||[]).find(x=>x.id===itemId);if(item)return {project:p,item}}return null}
