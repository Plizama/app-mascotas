import {createSeed} from '../data/seed.js';

export const STORAGE_KEY='app-mascotas-session-v1';

export function loadState(storage=globalThis.sessionStorage){
 try{
  const saved=JSON.parse(storage.getItem(STORAGE_KEY));
  if(saved?.version===1 && Array.isArray(saved.animals)&&Array.isArray(saved.posts))return saved;
 }catch{}
 return createSeed();
}

export function saveState(state,storage=globalThis.sessionStorage){
 storage.setItem(STORAGE_KEY,JSON.stringify(state));
}

export function resetState(storage=globalThis.sessionStorage){
 const state=createSeed();
 saveState(state,storage);
 return state;
}