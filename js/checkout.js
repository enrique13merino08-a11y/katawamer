const CATALOG={
 'pescado-frito':{name:'Pescado Frito',price:25},
 'pollo-brasa':{name:'Pollo a la Brasa',price:20},
 'lomo-saltado':{name:'Lomo Saltado',price:22},
 'ceviche-pescado':{name:'Ceviche de Pescado',price:18},
 'jugo-maracuya':{name:'Jugo de Maracuyá',price:6},
 'pescado-parrilla':{name:'Pescado a la Parrilla',price:28},
 'cecina-regional':{name:'Cecina Regional',price:24},
 'ceviche-mixto':{name:'Ceviche Mixto',price:26},
 'arroz-pollo':{name:'Arroz con Pollo',price:19},
 limonada:{name:'Limonada',price:5},
 'juane-gallina':{name:'Juane de Gallina',price:18},
 'tacacho-cecina':{name:'Tacacho con Cecina',price:22},
 'trucha-plancha':{name:'Trucha a la Plancha',price:30},
 'chicha-morada':{name:'Chicha Morada',price:5},
 'dulce-cocona':{name:'Dulce de Cocona',price:8}
};
const CART_KEY='katawa.cart.v1',SHARED_KEY='katawa.shared.v1',cartNode=document.querySelector('#checkout-items'),totalNode=document.querySelector('#checkout-total'),statusNode=document.querySelector('#checkout-status'),form=document.querySelector('#checkout-form'),resultNode=document.querySelector('#payment-result');
const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function readCart(){try{const value=JSON.parse(localStorage.getItem(CART_KEY)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch(error){console.error('No se pudo leer el carrito.',error);return{}}}
function readShared(){try{const value=JSON.parse(localStorage.getItem(SHARED_KEY)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch(error){console.error('No se pudieron leer los pedidos demo.',error);throw new Error('No se pudieron leer los datos locales de la demostración.')}} 
function writeShared(value){try{localStorage.setItem(SHARED_KEY,JSON.stringify(value))}catch(error){console.error('No se pudo guardar el pedido demo.',error);throw new Error('No se pudo guardar el pedido en este navegador. Revisa el espacio de almacenamiento disponible.')}}
function makeId(){return globalThis.crypto?.randomUUID?.()||`demo-${Date.now()}-${Math.random().toString(36).slice(2,10)}`}
function makeReceiptNumber(){return `DEMO-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,7).toUpperCase()}`}
function renderCart(){
 const cart=readCart();
 const rows=Object.entries(cart).filter(([id,quantity])=>CATALOG[id]&&Number.isInteger(quantity)&&quantity>0);
 const total=rows.reduce((sum,[id,quantity])=>sum+CATALOG[id].price*quantity,0);
 totalNode.textContent=`S/ ${total.toFixed(2)}`;
 cartNode.innerHTML=rows.length?rows.map(([id,quantity])=>`<article class="checkout-item"><div><b>${escapeHtml(CATALOG[id].name)}</b><small>${quantity} × S/ ${CATALOG[id].price.toFixed(2)}</small></div><div class="quantity-control"><button type="button" data-cart-id="${id}" data-delta="-1" aria-label="Quitar una unidad">−</button><span>${quantity}</span><button type="button" data-cart-id="${id}" data-delta="1" aria-label="Agregar una unidad">＋</button></div></article>`).join(''):'<p>Tu carrito está vacío. Vuelve a la carta para agregar platos.</p>';
 form.querySelector('button[type=submit]').disabled=rows.length===0;
}
function showDemoOrder(order){
 resultNode.hidden=false;form.hidden=true;
 const items=(order.items||[]).map(item=>`<li>${escapeHtml(item.quantity)} × ${escapeHtml(item.title)} — S/ ${(Number(item.unit_price)*Number(item.quantity)).toFixed(2)}</li>`).join('');
 const status=order.status||'Recibido';
 resultNode.innerHTML=`<span class="demo-ribbon">PEDIDO DE DEMOSTRACIÓN · NO PAGADO</span><h2>¡Pedido de prueba registrado!</h2><p>La cocina y el panel de demostración pueden ver este pedido en este navegador.</p><div class="demo-receipt"><b>Recibo de muestra ${escapeHtml(order.receipt?.number||'')}</b><span>Cliente: ${escapeHtml(order.name)}</span><span>Estado: <strong>${escapeHtml(status)}</strong></span><ul>${items}</ul><strong>Total referencial: S/ ${Number(order.total).toFixed(2)}</strong></div><p>Este recibo es ficticio: no acredita un pago y no es comprobante tributario.</p><button class="btn main" type="button" data-print-receipt>Imprimir resumen demo</button><a class="btn" href="carta.html">Volver a la carta</a>`;
}
function findDemoOrder(id){const shared=readShared();return(Array.isArray(shared.webOrders)?shared.webOrders:[]).find(order=>order.id===id)}
cartNode.addEventListener('click',event=>{
 const button=event.target.closest('[data-cart-id]');
 if(!button)return;
 const cart=readCart(),id=button.dataset.cartId,next=(cart[id]||0)+Number(button.dataset.delta);
 if(next>20){statusNode.textContent='El máximo por plato es 20 unidades.';return}
 if(next<1)delete cart[id];else cart[id]=next;
 statusNode.textContent='';
 try{localStorage.setItem(CART_KEY,JSON.stringify(cart));renderCart()}catch(error){console.error('No se pudo actualizar el carrito.',error);statusNode.textContent='No se pudo actualizar el carrito en este navegador.'}
});
resultNode.addEventListener('click',event=>{if(event.target.closest('[data-print-receipt]'))window.print()});
form.addEventListener('submit',async event=>{
 event.preventDefault();statusNode.textContent='';
 const button=form.querySelector('button[type=submit]'),data=new FormData(form),rows=Object.entries(readCart()).filter(([id,quantity])=>CATALOG[id]&&Number.isInteger(quantity)&&quantity>0);
 if(!rows.length){statusNode.textContent='Agrega al menos un plato antes de registrar el pedido.';button.disabled=true;return}
 button.disabled=true;
 try{
  if(window.KATAWA_DEMO_MODE){
   const total=rows.reduce((sum,[id,quantity])=>sum+CATALOG[id].price*quantity,0),id=makeId(),createdAt=new Date().toISOString();
   const order={id,name:String(data.get('name')).trim().slice(0,100),email:String(data.get('email')).trim().toLowerCase(),items:rows.map(([productId,quantity])=>({id:productId,title:CATALOG[productId].name,quantity,unit_price:CATALOG[productId].price})),total,currency:'PEN',status:'Recibido',paymentStatus:'Simulado · sin cobro',receipt:{number:makeReceiptNumber(),issuedAt:createdAt,total,currency:'PEN'},createdAt};
   const shared=readShared();shared.webOrders=Array.isArray(shared.webOrders)?shared.webOrders:[];shared.webOrders.unshift(order);writeShared(shared);
   localStorage.setItem('katawa.lastDemoOrder',id);localStorage.removeItem(CART_KEY);renderCart();history.replaceState(null,'',`?demo_order=${encodeURIComponent(id)}`);showDemoOrder(order);return;
  }
  const response=await fetch(`${window.KATAWA_API_BASE||location.origin}/api/checkout`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:data.get('name'),email:data.get('email'),items:rows.map(([id,quantity])=>({id,quantity}))})});
  const result=await response.json();
  if(!response.ok)throw new Error(result.error||'No se pudo iniciar el pago.');
  const checkoutHost=result.checkoutUrl?new URL(result.checkoutUrl).hostname:'';
  if(!result.orderId||!result.checkoutUrl||!/(^|\.)mercadopago\.com(\.pe)?$/.test(checkoutHost))throw new Error('La respuesta de pago no es válida.');
  localStorage.setItem('katawa.lastOrder',result.orderId);localStorage.removeItem(CART_KEY);location.assign(result.checkoutUrl);
 }catch(error){console.error('No se pudo registrar el pedido.',error);statusNode.textContent=error.message;button.disabled=Object.keys(readCart()).length===0}
});
async function showPaidOrder(orderId){
 resultNode.hidden=false;form.hidden=true;
 const api=window.KATAWA_API_BASE||location.origin;
 for(let attempt=0;attempt<30;attempt++){
  try{
   const response=await fetch(`${api}/api/orders/${encodeURIComponent(orderId)}`,{cache:'no-store'}),order=await response.json();
   if(!response.ok)throw new Error(order.error||'No encontramos el pedido.');
   if(order.status==='paid'&&order.receipt){
    resultNode.innerHTML=`<h2>¡Pago confirmado!</h2><p>Recibo de pago <b>${escapeHtml(order.receipt.number)}</b></p><p>Pedido: ${escapeHtml(order.id)}</p><p>Total pagado: <b>S/ ${Number(order.receipt.total).toFixed(2)}</b></p><p>Fecha: ${new Date(order.receipt.issuedAt).toLocaleString('es-PE')}</p><p>Este es un recibo informativo, no un comprobante tributario.</p><button class="btn main" type="button" data-print-receipt>Imprimir recibo</button>`;
    return;
   }
   resultNode.innerHTML=`<h2>Pago pendiente de confirmación</h2><p>Estado: ${escapeHtml(order.status)}</p><p>Estamos verificando la notificación segura de Mercado Pago. Esta página no considera el retorno del navegador como prueba de pago.</p>`;
  }catch(error){console.error('No se pudo consultar el estado del pedido.',error);resultNode.innerHTML=`<h2>Consultando tu pago</h2><p>${escapeHtml(error.message)}</p>`}
  await new Promise(resolve=>setTimeout(resolve,2000));
 }
 resultNode.insertAdjacentHTML('beforeend','<p>La confirmación puede tardar. Conserva el número de pedido y vuelve a consultar en unos minutos.</p>');
}
renderCart();
const params=new URLSearchParams(location.search),demoOrderId=params.get('demo_order'),orderId=params.get('order_id');
if(window.KATAWA_DEMO_MODE&&demoOrderId){const order=findDemoOrder(demoOrderId);if(order)showDemoOrder(order)}
else if(orderId&&/^[0-9a-f-]{36}$/i.test(orderId))showPaidOrder(orderId);
window.addEventListener('storage',event=>{
 if(event.key!==SHARED_KEY||!window.KATAWA_DEMO_MODE)return;
 const order=findDemoOrder(demoOrderId||localStorage.getItem('katawa.lastDemoOrder'));
 if(order)showDemoOrder(order);
});
