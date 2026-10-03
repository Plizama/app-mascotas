import {esc,link,button,pill,pet,note,section,title,field,textarea,select,checks,animalCard} from '../components/ui.js';
import {healthOptions,signals,helpOptions,situations,screens} from '../data/catalog.js';
import {animalById,visibleAnimals} from '../services/store.js';
export function map(state, query = '', selected = null) {
  const list = visibleAnimals(state, query);
  const animal = list.find(a => a.id === selected);

  return `
    <div class="map-layout">
      <div class="map-canvas">

        <div
          id="real-map"
          aria-label="Mapa de animales en Recoleta"
        ></div>

        <div class="map-tools">
          <div class="searchbar">
            <input
              id="map-search"
              aria-label="Buscar por nombre o zona"
              placeholder="Buscar animal o zona"
              value="${esc(query)}"
            >

            ${link('☷ Filtros', 'filters', 'button small')}
          </div>

          <div class="chips">
            ${[
              'En adopción',
              'Perdido',
              'Callejero',
              'Animal comunitario'
            ].map(s => button(
              s,
              'map-chip',
              `chip ${
                state.filters.situations.includes(s)
                  ? 'selected'
                  : ''
              }`,
              `data-value="${s}"
               aria-pressed="${state.filters.situations.includes(s)}"`
            )).join('')}
          </div>

          <div class="map-location-actions">
            ${button(
              '⌖ Mi ubicación',
              'map-locate',
              'button small'
            )}

            ${button(
              'Ver ejemplos · Recoleta',
              'map-examples',
              'button small'
            )}
          </div>

          ${!list.length ? note(
            'No hay animales con estos filtros.'
          ) : ''}
        </div>

        ${animal ? `
          <div class="selected-card">
            <div class="map-card-header">
              <span>Ejemplo de demostración · Recoleta</span>

              <button
                type="button"
                class="map-card-close"
                data-action="close-animal"
                aria-label="Cerrar tarjeta del animal"
              >
                ×
              </button>
            </div>

            ${animalCard(
              animal,
              `${pill(animal.health, true)}
               <p>
                 ${animal.sightingCount || animal.sightings.length}
                 avistamientos de ejemplo
               </p>`
            )}

            <div class="actions">
              ${link('Lo vi', 'sighting/' + animal.id)}

              ${link(
                'Ver ficha',
                'animal/' + animal.id,
                'button primary'
              )}
            </div>
          </div>
        ` : ''}

        <div class="map-bottom-band">
          <a class="map-add-pet" href="#/publish">
            <span aria-hidden="true">＋</span>
            <strong>Agregar mascota</strong>
          </a>
          <div id="urgent-alert" class="urgent-alert" aria-live="polite">
            ${urgentAlert(null, false, true)}
          </div>
        </div>

      </div>
    </div>
  `;
}
export function filters(state){const f=state.filters;return `${title('Filtros del mapa')}<form data-form="filters">${section('Qué quieres ver',checks('situations',['En adopción','Perdido','Callejero','Animal comunitario','Hogar temporal','Rescate en coordinación','Rescatado','En seguimiento'],f.situations))}${section('Salud aparente',checks('health',healthOptions,f.health))}${section('Especie',checks('species',['Perro','Gato','Otro'],f.species))}${select('distance','Distancia',['500','1000','3000','5000'],String(f.distance))}<p class="muted">Distancia en metros</p>${select('recent','Actividad reciente',['24','168','720'],String(f.recent))}<p class="muted">Horas: 24 h, 7 días o 30 días</p><div class="actions">${button('Limpiar','clear-filters')}<button class="button primary">Aplicar filtros</button></div></form>`;}
export function animalDetail(state,id){const a=animalById(state,id);if(!a)return missing();const own=a.owner===state.user.name,manager=a.manager===state.user.name;
 const roles=a.roles.map(r=>`<div class="person"><span class="avatar">${esc(r.name.split(' ').map(n=>n[0]).slice(0,2).join(''))}</span><div><strong>${esc(r.name)}</strong><p>${esc(r.role)}</p></div></div>`).join('');
 const events=a.events.slice(0,3).map(e=>`<div class="event"><small>${esc(e.at)}</small><strong>${esc(e.text)}</strong></div>`).join('');
 return `${title(a.situation==='Perdido'?a.name+' está perdido':a.name,'Ficha '+a.number)}<div class="detail-grid"><div class="pet-hero">${a.photo?`<img src="${esc(a.photo)}" alt="${esc(a.name)}">`:pet(a,true)}<span class="hero-caption">${esc(a.species)} · ${esc(a.sex)} · ${esc(a.age)} · ${esc(a.size)}</span></div><div class="identity">${section('Situación',pill(a.situation))}${section('Salud aparente',`${pill(a.health,true)}<div class="tags">${a.signals.map(s=>pill(s,true)).join('')}</div>${a.signals.length?note('Señales observadas por la comunidad. No es un diagnóstico veterinario.'):''}`)}${a.situation==='Perdido'?note('La mascota sigue vinculada a su responsable mientras la comunidad ayuda a encontrarla.'):''}${a.id==='chocolate'&&a.pendingCarer&&manager?note(a.pendingCarer+' pidió ser cuidador')+button('Aceptar cuidador','accept-carer','button primary',`data-id="${a.id}"`):''}</div></div>
 ${section('Su recorrido en esta ficha',`<div class="journey">${['Callejero','Rescatado','Hogar temporal','En adopción','Adoptado'].map(s=>`<span class="${a.situation===s?'current':''}">${esc(s)}</span>`).join('')}</div>`)}
 ${section('Quién lo acompaña',roles+(a.owner?'':note('Las personas aparecen según su rol. Reportar o cuidar a este animal no te convierte en su dueño.')))}
 ${section(a.situation==='Perdido'?'Cómo reconocerlo':'Sobre '+a.name,`<p>${esc(a.description)}</p><dl><dt>Esterilización</dt><dd>${esc(a.sterilized)}</dd><dt>Vacunas</dt><dd>${esc(a.vaccines)}</dd><dt>Pelaje</dt><dd>${esc(a.coat)}</dd></dl>`)}
 ${a.requirements?section('Lo que pide su responsable',`<ul>${a.requirements.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>`):''}
 ${a.needs?section('Necesita',`<div class="tags">${a.needs.map(r=>pill(r)).join('')}</div>`):''}
 ${section('Ubicación aproximada',`<div class="mini-map">⌖ ${esc(a.zone)}</div>`)}
 ${a.sightings.length?section('Avistamientos',a.sightings.map(s=>`<div class="event"><small>${esc(s.at)} · ${esc(s.place)}</small><strong>${esc(s.by)}</strong>${pill(s.health,true)}</div>`).join('')):''}
 ${section('Historial',events||'<p>Aún no hay eventos.</p>',link('Ver todo','history/'+id,'text-button'))}
 ${section('Comentarios del caso',a.comments.map(c=>`<div class="comment"><strong>${esc(c.by)}</strong><p>${esc(c.text)}</p></div>`).join('')+`<form data-form="comment" data-id="${id}">${textarea('message','Agregar comentario','','required maxlength="500"')}<button class="button secondary">Comentar</button></form>`,link('Ir a coordinación','rescue/'+id,'text-button'))}
 ${manager||own?section('Administrar ficha',`${button('Editar ficha','edit-animal','button secondary',`data-id="${id}"`)} ${link('Registrar novedad','update/'+id)} ${own?button(a.situation==='Perdido'?'Marcar como encontrada':'Marcar como perdida',a.situation==='Perdido'?'found':'lost','button secondary',`data-id="${id}"`)+button('Dar en adopción','adoption','button secondary',`data-id="${id}"`):''}`):''}
 ${a.id==='chocolate'?section('Chocolate en PetSocial',link('Ver perfil comunitario','social-profile/chocolate')):''}
 <div class="sticky-actions">${link('Lo vi','sighting/'+id)}${link('Quiero ayudar','help/'+id)}${a.situation==='Perdido'?button('Lo tengo conmigo','found-with-me','button primary',`data-id="${id}"`):!own?link('Me interesa adoptarlo','interest/'+id,'button primary'):''}</div>`;
}
export function history(state,id,type='Todo'){const a=animalById(state,id);if(!a)return missing();return `${title('Historial · '+a.name)}${pill(a.situation)}${note('Una sola ficha. Todo lo que pasó se conserva, incluso después de la adopción. Los eventos iniciales reproducen el ejemplo del diseño; no son fechas reales.')}<div class="chips">${['Todo','situación','avistamiento','ayuda','salud'].map(t=>button(t,'history-filter',`chip ${type===t?'selected':''}`,`data-value="${t}"`)).join('')}</div>${a.events.filter(e=>type==='Todo'||e.type===type).map(e=>`<div class="event"><small>${esc(e.at)} · ${esc(e.type)}</small><strong>${esc(e.text)}</strong>${e.photo?`<img class="event-photo" src="${esc(e.photo)}" alt="Foto registrada">`:''}</div>`).join('')||note('No hay eventos para este filtro.')}${link('Volver a la ficha','animal/'+id)}`;}
export function publish(){return `${title('¿Qué quieres publicar?')}<div class="publish-options">${[['Reportar un animal en la calle','Callejero, herido o que necesita ayuda','report-start','⌖'],['Mi mascota se perdió','Elige una de tus mascotas','choose-lost','◎'],['Dar en adopción','Una mascota o un animal que cuidas','choose-adoption','♧'],['Publicar en PetSocial','Una foto y un texto de tu mascota','social-new','♡']].map(([h,p,r,icon])=>`<a href="#/${r}" class="publish-option"><span>${icon}</span><div><h2>${h}</h2><p>${p}</p></div><b>→</b></a>`).join('')}</div>${note('Reportar un animal no te convierte en su dueño. Aparecerás como quien lo reportó.')}${link('Ya está en el mapa · registrar avistamiento','map')}`;}
export function reportStart(){return `${title('Reportar animal','Paso 1 de 3')}${note('Primero comprobaremos si ya tiene ficha cerca de esta ubicación.')}<form data-form="report-start">${field('place','Dónde está','text','Av. Grecia','required')}${button('Usar mi ubicación','geolocate','button small')}${select('species','Especie',['Perro','Gato','Otro'],'Perro')}${textarea('description','Cómo reconocerlo','','required maxlength="500"')}${field('photo','Foto (opcional)','file','','accept="image/*"')}<button class="button primary">Buscar posibles coincidencias</button></form>`;}
export function duplicates(state,draft){return `${title('¿Puede ser alguno de estos?','Reportar · paso 2 de 3')}${note('Si es el mismo, suma tu avistamiento a su ficha. Así su historia queda en un solo lugar. Esta comparación usa especie y cercanía de los datos de demostración, sin reconocimiento de imágenes.')}<p>${esc(draft?.description||'Perro negro, mediano, cojea')} · ${esc(draft?.place||'Av. Grecia')}</p>${state.animals.filter(a=>(!draft||a.species===draft.species)&&['Callejero','Animal comunitario','En seguimiento'].includes(a.situation)).slice(0,4).map(a=>animalCard(a,`<div class="actions">${link('Ver ficha','animal/'+a.id)}${link('Es este · Lo vi','sighting/'+a.id,'button primary')}</div>`)).join('')}${link('No, es otro animal · crear ficha','report-new','button primary full')}`;}
export function reportNew(draft){return `${title('Crear ficha','Paso 3 de 3')}<form data-form="report-new">${field('name','Nombre o referencia','text','','required maxlength="80"')}${select('sex','Sexo',['No se sabe','Hembra','Macho'],'No se sabe')}${select('size','Tamaño',['Pequeño','Mediano','Grande'],'Mediano')}${select('health','Salud aparente',healthOptions,'No se puede determinar')}${checks('signals',signals)}${field('manager','¿Quieres coordinar la ayuda?','checkbox')}${note('Puedes ser reportante sin asumir el rol de responsable del caso.')}<button class="button primary">Crear ficha del animal</button></form>`;}
export function sighting(state,id){const a=animalById(state,id);if(!a)return missing();return `${title('Registrar avistamiento')}${animalCard(a)}<form data-form="sighting" data-id="${id}">${field('place','¿Dónde lo viste?','text','Av. Grecia','required')}${button('Usar mi ubicación','geolocate')}${field('when','¿Cuándo?','datetime-local',localDate(),'required')}${field('photo','Foto (opcional)','file','','accept="image/*"')}${select('health','¿Cómo se veía?',healthOptions,a.health)}${section('Señales que notaste (opcional)',checks('signals',signals))}${textarea('message','Comentario (opcional)','','maxlength="500"')}<button class="button primary full">Registrar avistamiento</button></form>`;}
export function help(state,id){const a=animalById(state,id);if(!a)return missing();return `${title('Quiero ayudar a '+a.name,'Elige una o varias formas')}<form data-form="help" data-id="${id}">${checks('help',helpOptions)}${select('when','¿Cuándo puedes?',['Hoy','Este fin de semana','Entre semana','Cuando se necesite'])}${textarea('message','Detalles de tu ayuda','','maxlength="500"')}${note(`${a.manager||'La comunidad'} recibirá tu oferta en la conversación de este caso local.`)}<button class="button primary full">Ofrecer ayuda</button></form>`;}
export function interest(state,id){const a=animalById(state,id);if(!a)return missing();return `${title('Me interesa adoptarlo')}${animalCard(a)}${note(a.situation==='Callejero'?'Todavía está en la calle. Tu interés no lo convierte en tu mascota. Saber que existe un posible hogar ayuda a planificar el rescate.':'Tu interés inicia una conversación. La adopción requiere aceptación y confirmación de recepción.')}<form data-form="interest" data-id="${id}">${select('receive','¿Cómo lo recibirías?',['Puedo recibirlo tras el rescate','Necesitaría un hogar temporal antes'])}${select('home','Vivo en',['Casa con patio','Casa','Departamento'])}${section('En mi hogar',checks('household',['Tengo perros','Tengo gatos','Niños en casa']))}${textarea('message','Mensaje para '+(a.manager||'el caso'),'','required maxlength="1000"')}<button class="button primary full">Enviar mi interés</button></form>`;}
export function rescue(state,id){const a=animalById(state,id);if(!a)return missing();const tasks=a.tasks||helpOptions.slice(0,5).map(name=>({name,person:''}));return `${title('Coordinación de rescate',a.name+' · Ficha '+a.number)}${pill(a.situation)}<p>Coordina: ${esc(a.manager||'Sin responsable aún')}</p>${note('Escenario de demostración · sábado 10:00, Av. Grecia con Lo Encalada. Después: veterinaria y hogar temporal.')}${section('Quién hace qué',tasks.map((t,i)=>`<div class="task"><div><strong>${esc(t.name)}</strong><p>${esc(t.person||'Falta alguien')}</p></div>${!t.person?button('Asumir','take-task','button small',`data-id="${id}" data-index="${i}"`):''}</div>`).join(''))}<p>${a.interests.length} interesados en adoptar · ${a.offers.length} ofertas de ayuda</p>${section('Conversación del caso',a.comments.map(c=>`<div class="comment"><strong>${esc(c.by)}</strong><p>${esc(c.text)}</p></div>`).join('')+`<form data-form="comment" data-id="${id}">${textarea('message','Mensaje','','required maxlength="500"')}<button class="button primary">Enviar mensaje</button></form>`)}${a.manager===state.user.name?button('Marcar como rescatado','rescued','button primary full',`data-id="${id}"`):note('Solo la responsable del caso puede cambiar la situación. En Perfil puedes cambiar el rol de demostración para probar sus acciones.')}${link('Volver a la ficha','animal/'+id)}`;}
export function transfer(state,id){const a=animalById(state,id);if(!a)return missing();const t=a.transfer||{};const manager=a.manager===state.user.name,adopter=t.candidate===state.user.name;return `${title('Adopción de '+a.name,'Doble confirmación')}${section('Responsable actual',`<p>${esc(a.manager)}</p>${pill(t.accepted?'Aceptó':'Pendiente')}`)}${section('Nueva persona responsable',`<p>${esc(t.candidate||'Sin adoptante seleccionado')}</p>${pill(t.received?'Recepción confirmada':'Falta confirmación')}`)}${note('La misma ficha pasa al nuevo responsable. Su historial completo se conserva. La transferencia solo se completa cuando ambas personas aceptan.')}${!t.received?`${manager?`<form data-form="transfer-accept" data-id="${id}">${select('candidate','Persona adoptante',['Pamela A.','Carolina M.','Sofía L.','Andrés P.','Pedro R.','Javiera S.'].filter(n=>n!==state.user.name),t.candidate||'Sofía L.')}<button class="button primary full" ${t.accepted?'disabled':''}>Aceptar adopción como responsable</button></form>`:''}${adopter?button('Confirmo que recibí a '+a.name,'transfer-receive','button primary full',`data-id="${id}" ${!t.accepted?'disabled':''}`):note('Usa el selector de persona en Perfil para probar primero la aceptación y luego la recepción.')} ${link('Aún no lo recibo · volver','animal/'+id)}`:link('Ver en Mis mascotas','animals/own','button primary full')}`;}
export function animals(state,tab='all',choice=''){const own=state.animals.filter(a=>a.owner===state.user.name),care=state.animals.filter(a=>!a.owner&&(a.manager===state.user.name||a.roles.some(r=>r.name===state.user.name&&/Cuidad|temporal/.test(r.role)))),lists=choice?state.animals.filter(a=>a.owner===state.user.name||(choice==='adoption'&&a.manager===state.user.name)):null;return `${title(choice==='lost'?'Elige tu mascota perdida':choice==='adoption'?'Elige animal para adopción':'Mis animales')}<div class="chips">${link('Todos','animals','chip '+(tab==='all'?'selected':''))}${link('Mis mascotas · '+own.length,'animals/own','chip '+(tab==='own'?'selected':''))}${link('Que cuido · '+care.length,'animals/care','chip '+(tab==='care'?'selected':''))}</div>${choice?lists.map(a=>animalCard(a,button('Seleccionar',choice==='lost'?'lost':'adoption','button primary',`data-id="${a.id}"`))).join('')||note('Esta persona no tiene animales disponibles. Cambia a Pamela A. en Perfil.'):`${tab!=='care'?section('Mis mascotas',`<p>Soy su responsable permanente</p><div class="cards-grid">${own.map(a=>animalCard(a,`<div class="actions">${button(a.situation==='Perdido'?'Encontrada':'Marcar como perdida',a.situation==='Perdido'?'found':'lost','text-button',`data-id="${a.id}"`)}${button('Dar en adopción','adoption','text-button',`data-id="${a.id}"`)}${link('PetSocial','social-profile/'+a.id,'text-button')}</div>`)).join('')||note('Aún no tienes mascotas.')}</div>`):''}${tab!=='own'?section('Animales que cuido',note('Colaboro con ellos, pero no son de mi propiedad.')+`<div class="cards-grid care-cards">${care.map(a=>animalCard(a,`<div class="tags">${pill(a.roles.find(r=>r.name===state.user.name)?.role||'Hogar temporal')}</div><div class="actions">${link('Registrar','update/'+a.id,'text-button')}${link('Quiero adoptarlo yo','interest/'+a.id,'text-button')}${a.manager===state.user.name?link('Gestionar adopción','transfer/'+a.id,'text-button'):''}</div>`)).join('')}</div>`):''}`}`;}
export function update(state,id,edit=false){const a=animalById(state,id);if(!a)return missing();if(a.manager!==state.user.name&&a.owner!==state.user.name&&!a.roles.some(r=>r.name===state.user.name&&/Cuidad|temporal/.test(r.role)))return note('No tienes permiso para editar esta ficha.')+link('Volver','animal/'+id);return `${title(edit?'Editar ficha':'Registrar novedad',a.name)}<form data-form="${edit?'edit':'update'}" data-id="${id}">${edit?`${field('name','Nombre','text',a.name,'required')}${textarea('description','Descripción',a.description,'maxlength="1000"')}${field('coat','Pelaje','text',a.coat)}${select('sterilized','Esterilización',['No se sabe','Sí','No'],a.sterilized)}${field('vaccines','Vacunas','text',a.vaccines)}`:`${select('type','Tipo de novedad',['Alimentación','Foto','Necesidad','Salud'])}${textarea('message','Detalle','','required maxlength="500"')}${field('photo','Foto (opcional)','file','','accept="image/*"')}`}${a.manager===state.user.name||a.owner===state.user.name?select('situation','Situación',situations.filter(s=>s!=='Adoptado'),a.situation):''}${select('health','Salud aparente',healthOptions,a.health)}<button class="button primary">Guardar</button></form>`;}
export function social(state){const active=animalById(state,state.activePet)||state.animals[0];return `${title('PetSocial') }<div class="social-toolbar">${link('Publicando como '+active.name,'social-switch')}${link('＋ Publicación','social-new','button primary')}</div>${state.posts.map(p=>{const a=animalById(state,p.animal);return `<article class="post"><header>${pet(a)}<div>${link(a.name,'social-profile/'+a.id,'card-name')}<p>${esc(p.by)}${a.situation==='Animal comunitario'?' · cuidador comunitario':''}</p></div></header><div class="post-image">${p.photo?`<img src="${esc(p.photo)}" alt="Foto de ${esc(a.name)}">`:pet(a,true)}</div><div class="post-body">${button((p.liked?'♥':'♡')+' '+p.likes,'like','text-button',`data-id="${p.id}" aria-pressed="${p.liked}"`)}<p><strong>${esc(a.name)}</strong> ${esc(p.text)}</p><details><summary>${p.comments.length} comentarios</summary>${p.comments.map(c=>`<p><strong>${esc(c.by)}</strong> ${esc(c.text)}</p>`).join('')}<form data-form="social-comment" data-id="${p.id}">${field('message','Comentar como '+active.name,'text','','required maxlength="280"')}<button class="button secondary">Comentar</button></form></details></div></article>`}).join('')}${section('Mascotas cerca de ti',`<div class="chips">${['Kira','Tomás','Nube','Oreo'].map(n=>button(state.friends.includes(n)?'✓ '+n:'Ser amigos · '+n,'friend','chip',`data-value="${n}"`)).join('')}</div>`)}`;}
export function socialProfile(state,id){const a=animalById(state,id);if(!a)return missing();return `${title(a.name)}<div class="social-profile">${pet(a,true)}<h1>${esc(a.name)}</h1><p>${esc(a.species)} · ${esc(a.age)} · ${esc(a.zone)}</p><div class="profile-stats"><b>${state.posts.filter(p=>p.animal===id).length} publicaciones</b><b>${state.friends.length} amigos añadidos</b></div><p>${esc(a.description)}</p>${link('Ver su ficha','animal/'+id)} ${a.manager===state.user.name?button('Editar perfil','edit-animal','button secondary',`data-id="${id}"`):''}</div><div class="photo-grid">${state.posts.filter(p=>p.animal===id).map(p=>p.photo?`<img src="${esc(p.photo)}" alt="Publicación de ${esc(a.name)}">`:pet(a)).join('')||note('Todavía no tiene publicaciones.')}</div>${link('Volver al feed','social')}`;}
export function socialNew(state){const eligible=state.animals.filter(a=>a.owner===state.user.name||a.roles.some(r=>r.name===state.user.name&&/Cuidad|Responsable|temporal/.test(r.role)));return `${title('Nueva publicación')}<form data-form="social-new"><label class="field">Publicar como<select name="animal">${eligible.map(a=>`<option value="${a.id}" ${a.id===state.activePet?'selected':''}>${esc(a.name)}</option>`).join('')}</select></label>${field('photo','Foto','file','','required accept="image/*"')}${textarea('text','Texto breve','','required maxlength="280"')}${note('Solo foto y texto. Máximo 280 caracteres.')}<button class="button primary full" ${!eligible.length?'disabled':''}>Publicar</button></form>`;}
export function socialSwitch(state){const eligible=state.animals.filter(a=>a.owner===state.user.name||a.roles.some(r=>r.name===state.user.name&&/Cuidad|Responsable|temporal/.test(r.role)));return `${title('¿Como quién usas PetSocial?')}${note('Publicas y comentas como tu mascota. Los perfiles comunitarios muestran qué cuidador publicó.')}<form data-form="social-switch">${eligible.map(a=>`<label class="animal-card">${pet(a)}<div><strong>${esc(a.name)}</strong><p>${a.owner===state.user.name?'Mi mascota':'Perfil comunitario que cuido'}</p></div><input type="radio" name="animal" value="${a.id}" ${a.id===state.activePet?'checked':''} required></label>`).join('')}<button class="button primary full" ${!eligible.length?'disabled':''}>Listo</button></form>`;}
export function incomingMessageThreads(state){const userName=state.user.name;return state.animals.flatMap(animal=>{const participates=animal.owner===userName||animal.manager===userName||animal.roles.some(role=>role.name===userName);if(!participates)return [];const incoming=animal.comments.filter(comment=>comment.by!==userName);return incoming.length?[{animal,message:incoming[incoming.length-1]}]:[];});}
export function messages(state){const threads=incomingMessageThreads(state);return `${title('Mensajes','Conversaciones de tus casos')}${threads.length?`<div class="message-threads">${threads.map(({animal,message})=>`<a class="message-thread" href="#/rescue/${encodeURIComponent(animal.id)}">${pet(animal)}<span class="message-thread-copy"><strong>${esc(animal.name)} · ${esc(message.by)}</strong><small>${esc(message.text)}</small></span><span class="profile-pet-arrow" aria-hidden="true">→</span></a>`).join('')}</div>`:note('Aún no tienes mensajes nuevos.')}`;}
export function urgentAlert(animal,hasLocation=true,locating=false){if(locating)return '<span class="urgent-alert-empty">Buscando alertas cerca de ti…</span>';if(!hasLocation)return '<span class="urgent-alert-empty">Activa tu ubicación para recibir alertas</span>';if(!animal)return '<span class="urgent-alert-empty">Sin alertas graves cerca</span>';const species=animal.species==='Perro'?'Perro':animal.species.toLowerCase();return `<a class="urgent-alert-link" href="#/animal/${encodeURIComponent(animal.id)}" aria-label="${esc(species)} grave cerca de tu ubicación. Ver ficha de ${esc(animal.name)}"><span class="urgent-alert-mark" aria-hidden="true">!</span><span><strong>${esc(species)} grave cerca de tu ubicación</strong><small>${esc(animal.name)} · ${esc(animal.health)}</small></span></a>`;}
export function profile(state){const initials=state.user.name.split(/\s+/).map(part=>part[0]).slice(0,2).join('');const ownPets=state.animals.filter(animal=>animal.owner===state.user.name);const avatar=state.user.photo?`<img class="profile-photo" src="${esc(state.user.photo)}" alt="Foto de ${esc(state.user.name)}">`:`<div class="profile-photo profile-photo-placeholder" role="img" aria-label="Iniciales de ${esc(state.user.name)}">${esc(initials)}</div>`;return `${title('Mi perfil','Modo de demostración local')}<section class="profile-summary" aria-label="Datos del perfil">${avatar}<div><h2>${esc(state.user.name)}</h2><p>${esc(state.user.email||'Sin correo registrado')}</p></div></section><form data-form="profile">${select('name','Persona activa para probar permisos',['Pamela A.','Carolina M.','Sofía L.','Andrés P.','Pedro R.','Javiera S.'],state.user.name)}${field('email','Correo electrónico','email',state.user.email||'','required')}${field('zone','Zona','text',state.user.zone,'required')}${field('photo','Foto de perfil','file','','accept="image/png,image/jpeg,image/webp,image/gif"')}<button class="button primary">Guardar perfil</button></form>${note('El selector de persona sirve para probar permisos. No hay autenticación real en esta versión.')} ${section('Mis mascotas',ownPets.length?`<div class="profile-pets">${ownPets.map(animal=>`<a class="profile-pet" href="#/animal/${animal.id}" aria-label="Ver ficha de ${esc(animal.name)}">${pet(animal)}<span class="profile-pet-info"><strong>${esc(animal.name)}</strong><small>${esc(animal.species)} · ${esc(animal.situation)}</small></span><span class="profile-pet-arrow" aria-hidden="true">→</span></a>`).join('')}</div>`:note('Todavía no tienes mascotas a tu nombre.'))}${section('Herramientas de demostración',`<div class="actions">${button('Exportar datos de prueba','export')}${button('Restablecer demo','reset','button danger')}</div>`)}${section('Todas las pantallas del documento',`<div class="screen-index">${screens.map(([n,label,r])=>link(n+' · '+label,r,'screen-link')).join('')}</div>`)}`;}
export const missing=()=>`${title('Ficha no encontrada')}${link('Volver al mapa','map')}`;
function localDate(){const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}
