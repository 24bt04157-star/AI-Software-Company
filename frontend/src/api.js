
const BASE=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export const token=()=>localStorage.getItem('asc_token');
export const saveToken=t=>t?localStorage.setItem('asc_token',t):localStorage.removeItem('asc_token');
export async function api(path,opts={}){const headers={'Content-Type':'application/json',...(opts.headers||{})};if(token())headers.Authorization=`Bearer ${token()}`;const r=await fetch(BASE+path,{...opts,headers});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||`Request failed (${r.status})`);return d;}
