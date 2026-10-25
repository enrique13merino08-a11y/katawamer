const pages=[
 ['index','Inicio'],
 ['nosotros','Nosotros'],
 ['carta','Carta'],
 ['checkout','Pedir'],
 ['galeria','Galería'],
 ['contacto','Contacto']
];
const cur=document.body.dataset.page;
document.addEventListener('dragstart',event=>{
 if(event.target instanceof HTMLImageElement)event.preventDefault();
});
document.addEventListener('contextmenu',event=>event.preventDefault());
document.querySelectorAll('img').forEach(image=>{image.draggable=false});
const CART_ICON='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 1.9-1.4L22 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/></svg>';
const cartNav=cur==='checkout'?'':`<a class="nav-cart" href="checkout.html" aria-label="Abrir carrito"><span>Carrito</span><b class="cart-count">0</b>${CART_ICON}</a>`;
const mobileCart=cur==='checkout'?'':`<a class="mobile-cart" href="checkout.html" aria-label="Abrir carrito"><span>Carrito</span><b class="cart-count">0</b>${CART_ICON}</a>`;
document.getElementById('nav').outerHTML=`<header class="nav"><a class="nav-brand" href="index.html" aria-label="Recreo Katawa, inicio"><img src="assets/logo.png" alt=""><span class="nav-brand-copy"><b>RECREO KATAWA</b><small>SATIPO · SELVA CENTRAL</small></span></a><ul>${pages.map(page=>`<li><a href="${page[0]}.html" class="${page[0]===cur?'on':''}">${page[1]}</a></li>`).join('')}</ul><div class="nav-actions"><a class="btn main nav-cta" href="contacto.html">Reserva tu visita</a>${cartNav}</div></header>`;
document.querySelector('.nav').insertAdjacentHTML('beforebegin',`<div class="mobile-topbar"><a class="mobile-brand" href="index.html" aria-label="Recreo Katawa, volver al inicio"><img src="assets/logo.png" alt=""><span><b>Recreo Katawa</b><small>Sabores y momentos para compartir</small></span></a>${mobileCart}</div>`);
document.getElementById('foot').outerHTML=`<footer><img src="assets/logo.png" alt="Recreo Katawa"><b>Recreo Katawa</b><div>Satipo · Subida a la Base Militar, camino a Mazamari</div><a class="footer-whatsapp" href="https://wa.me/51939017959" target="_blank" rel="noopener noreferrer">WhatsApp · 939 017 959</a><small>Demo local: pedidos y reservas no se envían por correo y no generan cobros. © 2026 Recreo Katawa</small></footer>`;
function showPageIntro(){
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.documentElement.classList.remove('intro-pending');
  window.clearTimeout(window.katawaIntroFallback);
  return;
 }
 const intro=document.createElement('div');
 intro.className='site-intro';
 intro.setAttribute('aria-hidden','true');
 intro.innerHTML='<img src="assets/logo.png" alt=""><span>Recreo Katawa</span>';
 intro.addEventListener('animationend',event=>{
  if(event.target!==intro)return;
  intro.remove();
  document.documentElement.classList.remove('intro-pending');
  window.clearTimeout(window.katawaIntroFallback);
 });
 document.body.appendChild(intro);
}
showPageIntro();
window.addEventListener('pageshow',event=>{
 if(!event.persisted)return;
 document.documentElement.classList.add('intro-pending');
 showPageIntro();
});

const DEMO_ACCESS_KEY='katawa.demo.access.v1';
let resumeBookingAfterLogin=false;
function getDemoAccess(){
 try{return JSON.parse(sessionStorage.getItem(DEMO_ACCESS_KEY)||'null')}
 catch(error){console.error('No se pudo leer el acceso demo.',error);return null}
}
function showDemoAccess(needsAccount=false){
 let overlay=document.querySelector('.demo-access-overlay');
 if(!overlay){
  overlay=document.createElement('section');
  overlay.className='demo-access-overlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-labelledby','demo-access-title');
  overlay.innerHTML=`<div class="demo-access-card"><img src="assets/logo.png" alt="" class="demo-access-logo"><p class="kicker">Acceso de demostración</p><h2 id="demo-access-title">Bienvenido a Recreo Katawa</h2><p class="demo-access-copy">Puedes entrar con datos de prueba o explorar como invitado. Este acceso no se conecta a Google ni verifica cuentas o contraseñas.</p><button class="btn demo-google-button" type="button" data-demo-google><span aria-hidden="true">G</span> Continuar con Google (demo)</button><div class="demo-access-divider"><span>o con correo</span></div><form class="demo-login-form" data-demo-login><label>Correo electrónico<input name="email" type="email" autocomplete="email" placeholder="tu@correo.com" required></label><label>Contraseña<input name="password" type="password" autocomplete="current-password" placeholder="Contraseña de demostración" required></label><button class="btn main" type="submit">Entrar con correo (demo)</button></form><button class="demo-guest-button" type="button" data-demo-guest>Explorar como invitado</button><p class="demo-access-notice" role="status" aria-live="polite">No hay registro de cuentas, pagos ni reservas reales en esta versión.</p></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('[data-demo-google]').addEventListener('click',()=>finishDemoAccess({mode:'account',email:'visitante.google@demo.invalid',name:'Visitante Google'}));
  overlay.querySelector('[data-demo-login]').addEventListener('submit',event=>{
   event.preventDefault();
   const data=new FormData(event.currentTarget),email=String(data.get('email')).trim();
   finishDemoAccess({mode:'account',email,name:email.split('@')[0]||'Visitante'});
   event.currentTarget.reset();
  });
  overlay.querySelector('[data-demo-guest]').addEventListener('click',()=>{
   if(overlay.dataset.requiresAccount==='true'){
    overlay.querySelector('.demo-access-notice').textContent='Para enviar una solicitud demo, elige el acceso por correo o Google demo. No se validan credenciales.';
    overlay.querySelector('[data-demo-login] input[name="email"]').focus();
    return;
   }
   finishDemoAccess({mode:'guest',email:'',name:'Invitado'});
  });
 }
 overlay.dataset.requiresAccount=String(needsAccount);
 overlay.querySelector('[data-demo-guest]').hidden=needsAccount;
 overlay.querySelector('.demo-access-notice').textContent=needsAccount
  ?'Para continuar con esta solicitud demo, entra con correo o Google demo. No se verifican credenciales, pagos ni disponibilidad.'
  :'No hay registro de cuentas, pagos ni reservas reales en esta versión.';
 overlay.hidden=false;
 overlay.querySelector(needsAccount?'[data-demo-login] input[name="email"]':'[data-demo-google]').focus();
}
function finishDemoAccess(access){
 try{sessionStorage.setItem(DEMO_ACCESS_KEY,JSON.stringify(access))}
 catch(error){
  console.error('No se pudo guardar la sesión demo.',error);
  const notice=document.querySelector('.demo-access-notice');
  if(notice)notice.textContent='No se pudo guardar este acceso demo en la pestaña. Revisa la configuración de privacidad del navegador e inténtalo de nuevo.';
  return;
 }
 const bookingName=document.querySelector('#booking-form [name="n"]');
 const bookingEmail=document.querySelector('#booking-form [name="email"]');
 if(bookingName&&!bookingName.value)bookingName.value=access.name;
 if(bookingEmail&&!bookingEmail.value&&access.email)bookingEmail.value=access.email;
 document.querySelector('.demo-access-overlay')?.remove();
 if(resumeBookingAfterLogin){
  resumeBookingAfterLogin=false;
  document.querySelector('#booking-form')?.requestSubmit();
 }
}
if(!getDemoAccess())showDemoAccess();

const KATAWA_CART_KEY='katawa.cart.v1';
const KATAWA_MENU=[
 {id:'pescado-frito',name:'Pescado Frito',category:'p',categoryName:'Pescados',tag:'Favorito de la casa',description:'Filete dorado al momento, acompañado de patacones crocantes, ensalada fresca y limón.',detail:'1 porción de pescado, patacones y ensalada',price:25,image:'plato1.jpg',alt:'Pescado dorado servido con ensalada fresca'},
 {id:'pollo-brasa',name:'Pollo a la Brasa',category:'c',categoryName:'Carnes',tag:'Clásico de la casa',description:'Pollo sazonado y asado, servido con papas doradas y una ensalada fresca.',detail:'1 porción de pollo, papas y ensalada',price:20,image:'plato4.jpg',alt:'Pollo a la brasa con papas y guarnición'},
 {id:'lomo-saltado',name:'Lomo Saltado',category:'c',categoryName:'Carnes',tag:'Salteado al momento',description:'Trozos de carne salteados con cebolla y tomate, con el toque de la casa.',detail:'Arroz blanco y papas fritas',price:22,image:'plato2.jpg',alt:'Lomo saltado con arroz y papas'},
 {id:'ceviche-pescado',name:'Ceviche de Pescado',category:'m',categoryName:'Ceviches',tag:'Preparado al momento',description:'Pescado marinado en limón con cebolla, cilantro y el punto de ají de tu preferencia.',detail:'Camote, choclo y cancha',price:18,image:'plato3.jpg',alt:'Ceviche de pescado con camote y choclo'},
 {id:'pescado-parrilla',name:'Pescado a la Parrilla',category:'p',categoryName:'Pescados',tag:'A la parrilla',description:'Pescado sazonado y asado, con vegetales frescos y patacones para acompañar.',detail:'1 porción de pescado con guarnición',price:28,image:'plato1.jpg',alt:'Pescado a la parrilla con guarnición'},
 {id:'cecina-regional',name:'Cecina Regional',category:'c',categoryName:'Carnes',tag:'Sabor regional',description:'Cecina dorada a la plancha, acompañada de yuca y ensalada criolla.',detail:'1 porción de cecina con guarnición',price:24,image:'plato2.jpg',alt:'Cecina regional servida con guarnición'},
 {id:'ceviche-mixto',name:'Ceviche Mixto',category:'m',categoryName:'Ceviches',tag:'Selección marina',description:'Selección marina marinada en limón, con cebolla, cilantro y ají al gusto.',detail:'Camote, choclo y cancha',price:26,image:'plato3.jpg',alt:'Ceviche mixto con sus acompañamientos'},
 {id:'arroz-pollo',name:'Arroz con Pollo',category:'c',categoryName:'Carnes',tag:'Receta casera',description:'Arroz sazonado con cilantro y pollo, servido con ensalada fresca.',detail:'1 porción individual',price:19,image:'plato4.jpg',alt:'Arroz con pollo acompañado de ensalada'},
 {id:'juane-gallina',name:'Juane de Gallina',category:'r',categoryName:'Regionales',tag:'Receta amazónica',description:'Arroz sazonado con gallina y especias, envuelto en hoja y cocido lentamente.',detail:'1 juane individual',price:18,image:'plato4.jpg',alt:'Juane de gallina, receta amazónica'},
 {id:'tacacho-cecina',name:'Tacacho con Cecina',category:'r',categoryName:'Regionales',tag:'Sabor amazónico',description:'Plátano verde majado y dorado, servido con cecina regional.',detail:'Tacacho y 1 porción de cecina',price:22,image:'plato2.jpg',alt:'Tacacho con cecina regional'},
 {id:'trucha-plancha',name:'Trucha a la Plancha',category:'p',categoryName:'Pescados',tag:'A la plancha',description:'Trucha dorada con limón y hierbas, acompañada de papas y ensalada.',detail:'1 porción de trucha con guarnición',price:30,image:'plato1.jpg',alt:'Trucha a la plancha con papas y ensalada'},
 {id:'jugo-maracuya',name:'Jugo de Maracuyá',category:'b',categoryName:'Bebidas',tag:'Natural',description:'Maracuyá licuado al momento, frío y refrescante.',detail:'Vaso personal',price:6,image:'plato5.jpg',alt:'Jugo natural de maracuyá servido frío'},
 {id:'limonada',name:'Limonada',category:'b',categoryName:'Bebidas',tag:'Refrescante',description:'Limón exprimido al momento, servido frío.',detail:'Vaso personal',price:5,image:'plato5.jpg',alt:'Limonada natural servida fría'},
 {id:'chicha-morada',name:'Chicha Morada',category:'b',categoryName:'Bebidas',tag:'Bebida de la casa',description:'Bebida tradicional de maíz morado con frutas y especias.',detail:'Vaso personal',price:5,image:'plato5.jpg',alt:'Chicha morada servida fría'},
 {id:'dulce-cocona',name:'Dulce de Cocona',category:'d',categoryName:'Postres',tag:'Dulce regional',description:'Postre de cocona cocida con un toque dulce, servido frío.',detail:'Porción individual',price:8,image:'plato5.jpg',alt:'Postre regional de cocona'}
];
const KATAWA_PRODUCT_IDS=KATAWA_MENU.map(product=>product.id);

function cartCount(){
 try{return Object.values(JSON.parse(localStorage.getItem(KATAWA_CART_KEY)||'{}')).reduce((sum,quantity)=>sum+(Number.isInteger(quantity)?quantity:0),0)}
 catch(error){console.error('No se pudo leer el carrito.',error);return 0}
}
function updateCartLinks(){
 const count=cartCount();
 document.querySelectorAll('.cart-count').forEach(badge=>{badge.textContent=String(count)});
 document.querySelectorAll('.nav-cart,.mobile-cart').forEach(link=>link.setAttribute('aria-label',`Abrir carrito, ${count} productos`));
}
updateCartLinks();
window.addEventListener('storage',event=>{if(event.key===KATAWA_CART_KEY)updateCartLinks()});

function renderDishCard(id){
 const product=KATAWA_MENU.find(item=>item.id===id);
 if(!product)return '';
 return `<article class="glass item dish-card rv" data-c="${product.category}" data-name="${product.name.toLocaleLowerCase('es')}"><div class="dish-image-wrap"><img class="food-photo" src="assets/${product.image}" alt="${product.alt}" loading="lazy" draggable="false"><span class="dish-category">${product.categoryName}</span></div><div class="item-copy"><span class="item-tag">${product.tag}</span><h3>${product.name}</h3><p class="item-description">${product.description}</p><p class="item-detail"><b>Incluye</b> · ${product.detail}</p></div><div class="item-footer"><span class="price">S/ ${product.price.toFixed(2)}</span><button class="btn add-to-cart" type="button" data-product="${product.id}" aria-label="Agregar ${product.name} al carrito">${CART_ICON}<span>Agregar<br>al carrito</span></button></div></article>`;
}

document.querySelectorAll('[data-menu-showcase]').forEach(container=>{
 container.innerHTML=container.dataset.menuShowcase.split(',').map(renderDishCard).join('');
});
const menuGrid=document.getElementById('menu-grid');
if(menuGrid)menuGrid.innerHTML=KATAWA_MENU.map(product=>renderDishCard(product.id)).join('');

if(cur!=='checkout'){
 document.addEventListener('click',event=>{
  const button=event.target.closest('.add-to-cart');
  if(!button)return;
  const id=button.dataset.product;
  try{
   const cart=JSON.parse(localStorage.getItem(KATAWA_CART_KEY)||'{}');
   if(!id||!KATAWA_PRODUCT_IDS.includes(id))throw new Error('El producto seleccionado no es válido.');
   if((cart[id]||0)>=20)throw new Error('El máximo permitido por plato es 20.');
   cart[id]=(cart[id]||0)+1;
   localStorage.setItem(KATAWA_CART_KEY,JSON.stringify(cart));
   updateCartLinks();
   const label=button.querySelector('span'),original=label?.innerHTML||'Agregar<br>al carrito';
   if(label)label.textContent='Agregado';
   setTimeout(()=>{if(label.isConnected)label.innerHTML=original},1000);
  }catch(error){console.error('No se pudo agregar el plato al carrito.',error);const label=button.querySelector('span');if(label)label.textContent=error.message}
 });
}

const revealElements=[...document.querySelectorAll('.rv')];
if(document.visibilityState==='hidden'||typeof IntersectionObserver==='undefined'){
 revealElements.forEach(element=>element.classList.add('in'));
}else{
 const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('in');io.unobserve(entry.target)}
 }),{threshold:.12});
 revealElements.forEach((element,index)=>{
  element.style.transitionDelay=(index%4)*65+'ms';
  io.observe(element);
 });
 document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden')revealElements.forEach(element=>element.classList.add('in'));
 });
}
const nav=document.querySelector('.nav');
addEventListener('scroll',()=>{
 nav.classList.toggle('small',scrollY>40);
},{passive:true});
document.querySelectorAll('[data-n]').forEach(element=>new IntersectionObserver(([entry],observer)=>{
 if(!entry.isIntersecting)return;
 observer.disconnect();
 const target=Number(element.dataset.n);let number=0;
 const timer=setInterval(()=>{
  number+=Math.ceil(target/40);
  if(number>=target){number=target;clearInterval(timer)}
  element.textContent=number+'+';
 },35);
}).observe(element));

const menuItems=[...document.querySelectorAll('.menu-grid .item')],menuSearch=document.getElementById('menu-search'),menuCount=document.getElementById('menu-result-count'),menuEmpty=document.getElementById('menu-empty');
let activeMenuFilter='all';
function filterMenu(){
 const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
 const query=normalize(menuSearch?.value||'').trim();
 let visible=0;
 menuItems.forEach(item=>{
  const matchesCategory=activeMenuFilter==='all'||item.dataset.c===activeMenuFilter;
  const matchesSearch=!query||normalize(item.dataset.name).includes(query);
  const show=matchesCategory&&matchesSearch;
  item.classList.toggle('hide',!show);
  if(show)visible++;
 });
 if(menuCount)menuCount.textContent=`${visible} ${visible===1?'plato disponible':'platos disponibles'}`;
 if(menuEmpty)menuEmpty.hidden=visible>0;
}
document.querySelectorAll('.chip[data-f]').forEach(chip=>chip.addEventListener('click',()=>{
 activeMenuFilter=chip.dataset.f;
 document.querySelectorAll('.chip[data-f]').forEach(item=>{
  const selected=item===chip;
  item.classList.toggle('on',selected);
  item.setAttribute('aria-pressed',String(selected));
 });
 filterMenu();
}));
menuSearch?.addEventListener('input',filterMenu);
if(menuItems.length)filterMenu();

const bookingForm=document.getElementById('booking-form');
if(bookingForm)bookingForm.addEventListener('submit',event=>{
 event.preventDefault();
 const access=getDemoAccess();
 if(access?.mode!=='account'){
  resumeBookingAfterLogin=true;
  showDemoAccess(true);
  return;
 }
 const data=new FormData(bookingForm),key='katawa.shared.v1',status=document.getElementById('booking-status');
 try{
  const saved=localStorage.getItem(key),shared=saved?JSON.parse(saved):{};
  const state=shared&&typeof shared==='object'?shared:{};
  if(!Array.isArray(state.reservations))state.reservations=[];
  state.reservations.unshift({id:globalThis.crypto?.randomUUID?.()||`res-${Date.now()}`,name:String(data.get('n')).trim(),email:String(data.get('email')).trim(),date:String(data.get('date')),time:String(data.get('time')),guests:Number(data.get('p')),type:String(data.get('t')),note:String(data.get('m')).trim(),status:'Demo · no confirmada',paymentStatus:'No realizado · demo',createdAt:new Date().toISOString()});
  localStorage.setItem(key,JSON.stringify(state));
  bookingForm.reset();
  status.textContent='Solicitud demo guardada solo en este navegador. No se realizó ni verificó un pago; la reserva no está confirmada y no se asignó una mesa.';
 }catch(error){
  console.error('No se pudo guardar la solicitud de reserva.',error);
  status.textContent='No se pudo guardar la reserva. Comprueba el almacenamiento del navegador e inténtalo de nuevo.';
 }
});
