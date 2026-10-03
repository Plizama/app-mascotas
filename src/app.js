import * as views from './views/views.js';
import {nav,esc} from './components/ui.js';
import {helpOptions} from './data/catalog.js';
import {loadState,saveState,resetState} from './services/repository.js';
import {animalById,addEvent,confirmTransfer} from './services/store.js';
import {
  mountMap,
  destroyMap,
  locateUser,
  showExamples,
  findNearbyUrgentAnimal
} from './services/map.js';
let state=loadState(), query='',selected=null,historyType='Todo',reportDraft=null;
let initialLocationRequested = false;

// Actualizar solo la zona de los animales de demostración.
// No elimina sus fichas, comentarios ni historiales.
const recoletaDemoIds = new Set([
  'grecia',
  'canelo',
  'rocco',
  'mora',
  'chocolate',
  'luna',
  'firulais',
  'manchita',
  'plaza'
]);

let demoZoneChanged = false;

state.animals.forEach(animal => {
  if (!recoletaDemoIds.has(animal.id)) return;

  const zone = 'Recoleta · ubicación de demostración';

  if (animal.zone !== zone) {
    animal.zone = zone;
    demoZoneChanged = true;
  }
});

// Cambiar también la zona inicial del perfil.
if (state.user.zone === 'Ñuñoa') {
  state.user.zone = 'Recoleta';
  demoZoneChanged = true;
}

if (demoZoneChanged) {
  try {
    saveState(state);
  } catch {
    console.warn(
      'La zona se actualizó en esta sesión, pero no pudo guardarse.'
    );
  }
}
const app=document.querySelector('#app');
const route = () => {
  const path = location.hash.replace(/^#\/?/, '');
  return (path || 'map').split('/');
};
const go=r=>{if(location.hash==='#/'+r)render();else location.hash='/'+r;};
function persist(){try{saveState(state);return true;}catch{toast('No se pudo guardar: el almacenamiento puede estar lleno. Exporta tus datos o usa fotos más pequeñas.');return false;}}
function toast(message){const t=document.querySelector('#toast');t.textContent=message;t.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('visible'),4500);}
function permission(a){return a.manager===state.user.name||a.owner===state.user.name;}
function render(){const [page='map',id]=route();let html;let active='map';switch(page){
 case 'map':html=views.map(state,query,selected);break;
 case 'filters':html=views.filters(state);break;
 case 'animal':html=views.animalDetail(state,id);break;
 case 'history':html=views.history(state,id,historyType);break;
 case 'publish':html=views.publish();active='publish';break;
 case 'report-start':html=views.reportStart();active='publish';break;
 case 'duplicates':html=views.duplicates(state,reportDraft);active='publish';break;
 case 'report-new':html=reportDraft?views.reportNew(reportDraft):views.reportStart();active='publish';break;
 case 'sighting':html=views.sighting(state,id);break;
 case 'help':html=views.help(state,id);break;
 case 'interest':html=views.interest(state,id);break;
 case 'rescue':html=views.rescue(state,id);break;
 case 'transfer':html=views.transfer(state,id);active='profile';break;
 case 'animals':html=views.animals(state,id||'all');active='profile';break;
 case 'choose-lost':html=views.animals(state,'all','lost');active='publish';break;
 case 'choose-adoption':html=views.animals(state,'all','adoption');active='publish';break;
 case 'update':case 'edit':html=views.update(state,id,page==='edit');active='profile';break;
 case 'social':html=views.social(state);active='social';break;
 case 'social-profile':html=views.socialProfile(state,id);active='social';break;
 case 'social-new':html=views.socialNew(state);active='social';break;
 case 'social-switch':html=views.socialSwitch(state);active='social';break;
 case 'messages':html=views.messages(state);active='messages';break;
 case 'profile':html=views.profile(state);active='profile';break;
 default:html=views.missing();
 }
 const hasMessages = views.incomingMessageThreads(state).length > 0;
 const sidebarNav = nav(active, 'sidebar', hasMessages);
 const mobileNav = nav(active, 'mobile', hasMessages);
 destroyMap();
 app.innerHTML=`
  <div class="app-shell">
   <aside class="sidebar">
    <a class="brand" href="#/map"><span>♧</span> App mascotas</a>
    <p class="tagline">Una ficha,<br>toda su historia.</p>
    ${sidebarNav}
    <div class="sidebar-foot"><span class="demo-dot"></span> Versión local · demo<br><small>${esc(state.user.name)} · ${esc(state.user.zone)}</small></div>
   </aside>
   <main class="main ${page==='map'?'map-main':''}" id="content">
    <div class="mobile-brand"><a href="#/map">♧ App mascotas</a><a href="#/profile">${esc(state.user.name)}</a></div>
    <div class="content ${page==='map'?'map-content':''}">${html}</div>
   </main>
   <div class="mobile-nav">${mobileNav}</div>
  </div>`;
 if (page === 'map') {
  mountMap({
    state,
    query,
    selected,

    onSelect: animalId => {
      selected = animalId;
      render();
    },

    onClose: () => {
      if (selected === null) return;

      selected = null;
      render();
    },

    notify: toast,

    onLocationUpdate: (point, hasLocation) => {
      const alert = document.querySelector('#urgent-alert');

      if (alert) {
        const animal = point
          ? findNearbyUrgentAnimal(state.animals, point)
          : null;

        alert.innerHTML = views.urgentAlert(animal, hasLocation);
      }
    }
  });

  if (!initialLocationRequested) {
    initialLocationRequested = true;
    locateUser(toast);
  }
}
 document.title='App mascotas · '+(document.querySelector('h1')?.textContent||'Mapa');
}
window.addEventListener('hashchange', () => {
  historyType = 'Todo';
  selected = null;

  render();
  window.scrollTo(0, 0);
});
app.addEventListener('input',e=>{if(e.target.id==='map-search'){query=e.target.value;const position=e.target.selectionStart;render();const input=document.querySelector('#map-search');input.focus();input.setSelectionRange(position,position);}});
app.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action;const id=b.dataset.id;const a=animalById(state,id);switch(action){
case 'select-animal':
  selected = id;
  render();
  return;

case 'close-animal':
  selected = null;
  render();
  return;

case 'map-locate':
  locateUser(toast);
  return;

case 'map-examples':
  showExamples(toast);
  return;
 case 'map-chip':{const v=b.dataset.value,f=state.filters.situations;state.filters.situations=f.includes(v)?f.filter(x=>x!==v):[...f,v];persist();render();return;}
 case 'clear-filters':state.filters={situations:[],health:[],species:[],distance:5000,recent:720};persist();go('map');return;
 case 'history-filter':historyType=b.dataset.value;render();return;
 case 'edit-animal':go('edit/'+id);return;
 case 'lost':case 'found':case 'adoption':case 'rescued':{
  if(!a||!permission(a)){toast('Esta acción requiere ser responsable del animal.');return;}
  if(['lost','found'].includes(action)&&a.owner!==state.user.name){toast('Solo su responsable permanente puede hacerlo.');return;}
  a.situation={lost:'Perdido',found:'Mi mascota',adoption:'En adopción',rescued:'Rescatado'}[action];
  addEvent(a,'situación',`${state.user.name}: ${a.situation}`);persist();go('animal/'+id);toast('Situación actualizada; el historial se conserva.');return;}
 case 'found-with-me':a.comments.push({by:state.user.name,text:'Lo tengo conmigo. Solicito contacto con su responsable.'});addEvent(a,'avistamiento',state.user.name+' informa que lo tiene consigo');persist();go('rescue/'+id);toast('Aviso registrado en el caso local.');return;
 case 'accept-carer':if(!permission(a))return;a.roles.push({name:a.pendingCarer,role:'Cuidador'});addEvent(a,'ayuda','Cuidador aceptado: '+a.pendingCarer);a.pendingCarer=null;persist();render();toast('Cuidador aceptado.');return;
 case 'take-task':a.tasks??=helpOptions.slice(0,5).map(name=>({name,person:''}));if(a.tasks[b.dataset.index].person)return;a.tasks[b.dataset.index].person=state.user.name;addEvent(a,'ayuda',state.user.name+' asume '+a.tasks[b.dataset.index].name);persist();render();toast('Tarea asumida.');return;
 case 'transfer-receive':try{if(a.transfer?.candidate!==state.user.name)throw Error('Debe confirmar la persona adoptante.');confirmTransfer(a);persist();render();toast('Adopción completada. Misma ficha, nuevo responsable.');}catch(err){toast(err.message);}return;
 case 'like':{const p=state.posts.find(p=>p.id===id);p.liked=!p.liked;p.likes+=p.liked?1:-1;persist();render();return;}
 case 'friend':{const n=b.dataset.value;state.friends=state.friends.includes(n)?state.friends.filter(x=>x!==n):[...state.friends,n];persist();render();return;}
 case 'reset':if(confirm('¿Restablecer todos los datos de prueba? Se eliminarán los cambios de esta sesión.')){state=resetState();query='';go('map');toast('Demo restablecida.');}return;
 case 'export':{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='app-mascotas-datos.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
 case 'geolocate':if(!navigator.geolocation){toast('Tu navegador no ofrece ubicación. Escribe el lugar manualmente.');return;}navigator.geolocation.getCurrentPosition(p=>{b.closest('form').elements.place.value=`${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`;toast('Ubicación agregada. No cambia el mapa esquemático.');},()=>toast('No se pudo acceder a la ubicación. Escribe el lugar manualmente.'),{timeout:10000});return;
}});
app.addEventListener('submit',async e=>{const form=e.target;if(!form.dataset.form)return;e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form),id=form.dataset.id,a=animalById(state,id),get=n=>String(data.get(n)||''),all=n=>data.getAll(n).map(String);const submit=form.querySelector('button:not([type="button"])');if(submit)submit.disabled=true;try{switch(form.dataset.form){
 case 'filters':state.filters={situations:all('situations'),health:all('health'),species:all('species'),distance:Number(get('distance')),recent:Number(get('recent'))};persist();go('map');break;
 case 'report-start':{const place=get('place');reportDraft={place,...parseCoordinates(place),species:get('species'),description:get('description'),photo:await photo(data.get('photo'))};go('duplicates');break;}
 case 'report-new':{if(!reportDraft)throw Error('Primero completa el paso 1.');const uid='animal-'+Date.now();const created={id:uid,number:'A-'+Date.now().toString().slice(-6),name:get('name'),species:reportDraft.species,sex:get('sex'),age:'No se sabe',size:get('size'),situation:'Callejero',health:get('health'),signals:all('signals'),color:'#948779',zone:reportDraft.place,...parseCoordinates(reportDraft.place),distance:300,lastSeen:0,x:40,y:40,sterilized:'No se sabe',vaccines:'No se sabe',coat:'No registrado',description:reportDraft.description,photo:reportDraft.photo,owner:null,manager:data.has('manager')?state.user.name:null,roles:[{name:state.user.name,role:'Reportó'},...(data.has('manager')?[{name:state.user.name,role:'Responsable del caso'}]:[])],sightings:[],comments:[],events:[],offers:[],interests:[]};addEvent(created,'situación','Animal reportado por '+state.user.name);state.animals.push(created);persist();reportDraft=null;go('animal/'+uid);toast('Ficha creada. Apareces como reportante.');break;}
 case 'sighting':{const picture=await photo(data.get('photo')),at=new Date(get('when')).toLocaleString('es-CL');if(new Date(get('when'))>new Date())throw Error('La hora del avistamiento no puede estar en el futuro.');a.sightings.unshift({at,place:get('place'),by:state.user.name,health:get('health'),signals:all('signals'),message:get('message'),photo:picture});a.sightingCount=(a.sightingCount||0)+1;a.lastSeen=0;a.health=get('health');a.signals=all('signals');addEvent(a,'avistamiento',state.user.name+' lo vio en '+get('place')+(get('message')?' · '+get('message'):''),at);if(picture)a.events[0].photo=picture;persist();go('animal/'+id);toast('Avistamiento agregado a la misma ficha.');break;}
 case 'help':if(!all('help').length)throw Error('Elige al menos una forma de ayuda.');a.offers.push({by:state.user.name,types:all('help'),when:get('when'),message:get('message')});a.comments.push({by:state.user.name,text:'Ofrezco '+all('help').join(', ')+' · '+get('when')+'. '+get('message')});addEvent(a,'ayuda',state.user.name+' ofrece '+all('help').join(', '));persist();go('rescue/'+id);toast('Oferta registrada.');break;
 case 'interest':a.interests.push({by:state.user.name,receive:get('receive'),home:get('home'),household:all('household'),message:get('message')});a.comments.push({by:state.user.name,text:'Me interesa adoptarlo. '+get('message')});addEvent(a,'ayuda',state.user.name+' manifiesta interés en adoptar');a.transfer??={accepted:false,received:false,candidate:state.user.name};persist();go('rescue/'+id);toast('Interés enviado. La propiedad sigue sin cambios.');break;
 case 'comment':a.comments.push({by:state.user.name,text:get('message')});persist();render();toast('Comentario agregado.');break;
 case 'transfer-accept':if(!permission(a))throw Error('Solo la responsable actual puede aceptar.');if(get('candidate')===state.user.name)throw Error('Selecciona otra persona como adoptante.');if(a.transfer?.received)throw Error('Esta adopción ya terminó.');a.transfer={candidate:get('candidate'),accepted:true,received:false};addEvent(a,'situación','Adopción aceptada por '+state.user.name+' para '+get('candidate'));persist();render();toast('Aceptada. Falta confirmar recepción como adoptante.');break;
 case 'update':case 'edit':{const editing=form.dataset.form==='edit';const caregiver=a.roles.some(r=>r.name===state.user.name&&/Cuidad|temporal/.test(r.role));if(!permission(a)&&(!caregiver||editing))throw Error('No tienes permiso para esta acción.');if(editing){a.name=get('name');a.description=get('description');a.coat=get('coat');a.sterilized=get('sterilized');a.vaccines=get('vaccines');addEvent(a,'situación','Ficha actualizada por '+state.user.name);}else{addEvent(a,get('type')==='Salud'?'salud':'ayuda',get('type')+' · '+get('message')+' · '+state.user.name);const picture=await photo(data.get('photo'));if(picture)a.events[0].photo=picture;}if(data.has('situation')&&permission(a)&&get('situation')!==a.situation){a.situation=get('situation');addEvent(a,'situación',state.user.name+' cambia situación a '+a.situation);}a.health=get('health');persist();go('animal/'+id);toast('Cambios guardados.');break;}
 case 'social-new':{const aid=get('animal'),pet=animalById(state,aid);if(!pet||!(pet.owner===state.user.name||pet.roles.some(r=>r.name===state.user.name&&/Cuidad|Responsable|temporal/.test(r.role))))throw Error('No administras este perfil.');const picture=await photo(data.get('photo'));if(!picture)throw Error('Agrega una foto.');state.posts.unshift({id:'p'+Date.now(),animal:aid,by:state.user.name,photo:picture,text:get('text'),likes:0,liked:false,comments:[]});persist();go('social');toast('Publicación creada.');break;}
 case 'social-comment':state.posts.find(p=>p.id===id).comments.push({by:animalById(state,state.activePet)?.name||state.user.name,text:get('message')});persist();render();toast('Comentario agregado.');break;
 case 'social-switch':state.activePet=get('animal');persist();go('social');break;
 case 'profile':{const profilePhoto=data.get('photo');state.user.name=get('name');state.user.email=get('email');state.user.zone=get('zone');if(profilePhoto?.size)state.user.photo=await photo(profilePhoto);const eligible=state.animals.find(a=>a.owner===state.user.name||a.manager===state.user.name);if(eligible)state.activePet=eligible.id;persist();render();toast('Perfil actualizado.');break;}
}}catch(err){toast(err.message);}finally{if(submit)submit.disabled=false;}});
function parseCoordinates(value){const match=String(value).trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);if(!match)return {};const lat=Number(match[1]),lng=Number(match[2]);return Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180?{lat,lng}:{};}
async function photo(file){if(!file?.size)return null;if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type))throw Error('Usa una imagen JPG, PNG, WebP o GIF.');if(file.size>8*1024*1024)throw Error('La imagen debe pesar menos de 8 MB.');const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');const ratio=Math.min(1,1000/Math.max(bitmap.width,bitmap.height));canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();return canvas.toDataURL('image/jpeg',0.8);}
render();
