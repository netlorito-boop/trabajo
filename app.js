const center=[7.8939,-72.5078];
const examples=[
{id:1,title:"Construir un baño pequeño",category:"Albañilería",budget:1800000,neighborhood:"La Riviera",lat:7.9005,lng:-72.4965,description:"Construcción de un baño desde cero. Incluir enchape, sanitario y ducha. Presupuesto aproximado.",contact:"Contacto de demostración",created:Date.now()-10000},
{id:2,title:"Pintar fachada de una casa",category:"Pintura",budget:450000,neighborhood:"Caobos",lat:7.8854,lng:-72.501,description:"Pintura exterior para fachada de vivienda de dos pisos.",contact:"",created:Date.now()-20000},
{id:3,title:"Reparar fuga de agua",category:"Plomería",budget:160000,neighborhood:"San Luis",lat:7.8765,lng:-72.485,description:"Revisar fuga en tubería del patio y realizar reparación.",contact:"",created:Date.now()-30000},
{id:4,title:"Arreglar techo y cambiar tejas",category:"Techos",budget:620000,neighborhood:"Atalaya",lat:7.913,lng:-72.54,description:"Revisión y arreglo de varias tejas deterioradas.",contact:"",created:Date.now()-40000},
{id:5,title:"Instalar puntos eléctricos",category:"Electricidad",budget:300000,neighborhood:"Prados del Este",lat:7.881,lng:-72.474,description:"Instalación de tres tomacorrientes y revisión de cableado.",contact:"",created:Date.now()-50000}
];
let jobs;try{jobs=JSON.parse(localStorage.getItem('obracerca_jobs_v2'))||examples}catch{jobs=examples}
const map=L.map('map',{zoomControl:true}).setView(center,13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
const markers=new Map();const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const redIcon=L.divIcon({className:'',html:'<div class="red-marker"></div>',iconSize:[19,19],iconAnchor:[9,9]});
function popup(j){return `<div class="pop-title">${esc(j.title)}</div><div class="pop-category">${esc(j.category)} · ${esc(j.neighborhood)}</div><div class="pop-price">${money(j.budget)}</div><div class="pop-detail">${esc(j.description||'Sin descripción adicional.')}</div>${j.contact?`<div class="pop-contact">Contacto: ${esc(j.contact)}</div>`:''}<div class="pop-category" style="margin-top:8px">Publicado: ${new Date(j.created).toLocaleString('es-CO')}</div>`}
function render(){const term=$('searchInput').value.toLowerCase().trim(),cat=$('categoryFilter').value;const visible=jobs.filter(j=>(cat==='Todos'||j.category===cat)&&(!term||[j.title,j.category,j.neighborhood,j.description].join(' ').toLowerCase().includes(term)));$('counter').textContent=`${visible.length} ${visible.length===1?'solicitud visible':'solicitudes visibles'}`;
 for(const j of visible){let m=markers.get(j.id);if(!m){m=L.marker([j.lat,j.lng],{icon:redIcon}).addTo(map);m.bindPopup(popup(j));markers.set(j.id,m)}else{m.setLatLng([j.lat,j.lng]).setPopupContent(popup(j));if(!map.hasLayer(m))m.addTo(map)}}
 for(const [id,m] of markers){if(!visible.some(j=>String(j.id)===String(id))&&map.hasLayer(m))map.removeLayer(m)}
}
$('searchInput').addEventListener('input',render);$('categoryFilter').addEventListener('change',render);
const dialog=$('jobDialog');let picking=false;
$('openForm').onclick=()=>{picking=false;$('chosenLocation').textContent='Cúcuta (ubicación inicial)';$('lat').value=center[0];$('lng').value=center[1];dialog.showModal()};
$('closeForm').onclick=$('cancelForm').onclick=()=>dialog.close();
$('pickLocation').onclick=()=>{picking=true;dialog.close();$('chosenLocation').textContent='Ahora toca el mapa para colocar el punto rojo';$('map').style.cursor='crosshair';$('formMessage').textContent='Toca el lugar aproximado en el mapa.'};
map.on('click',e=>{if(!picking)return;picking=false;$('map').style.cursor='';$('lat').value=e.latlng.lat;$('lng').value=e.latlng.lng;$('chosenLocation').textContent=`Ubicación seleccionada: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;$('formMessage').textContent='Ubicación seleccionada. Completa el formulario y publica.';dialog.showModal()});
$('jobForm').addEventListener('submit',e=>{e.preventDefault();const budget=Number($('budget').value),lat=Number($('lat').value),lng=Number($('lng').value);if(budget<10000||!Number.isFinite(lat)||!Number.isFinite(lng)){ $('formMessage').textContent='Revisa el presupuesto y la ubicación.';return}
const j={id:Date.now(),title:$('title').value.trim(),category:$('category').value,budget,neighborhood:$('neighborhood').value.trim(),description:$('description').value.trim(),contact:$('contact').value.trim(),lat,lng,created:Date.now()};jobs.unshift(j);localStorage.setItem('obracerca_jobs_v2',JSON.stringify(jobs));render();dialog.close();$('jobForm').reset();map.setView([lat,lng],16);markers.get(j.id).openPopup()});
$('locateBtn').onclick=()=>{if(!navigator.geolocation)return alert('Este navegador no permite obtener ubicación.');navigator.geolocation.getCurrentPosition(p=>{const ll=[p.coords.latitude,p.coords.longitude];map.setView(ll,16);L.circleMarker(ll,{radius:7,color:'#fff',weight:3,fillColor:'#2775d8',fillOpacity:1}).addTo(map).bindPopup('Tu ubicación').openPopup()},()=>alert('No se pudo obtener tu ubicación. Revisa los permisos del navegador.'))};
render();
