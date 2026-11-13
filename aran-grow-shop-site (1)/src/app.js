/* Aran Grow Shop storefront. BOOT (settings + catalogue) and the shared functions are injected above this file. */
const SHOP=BOOT.shop,LIVE=BOOT.live,BASE=BOOT.base;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Catalogue (comes from the inventory table; written into the page by the server) ---------- */
let ALL=BOOT.items,REVIEWS=BOOT.reviews;
let byId=indexById(ALL);
const shopItems=()=>ALL.filter(p=>p.active!==false&&p.cat!=='pack');
const packItems=()=>ALL.filter(p=>p.active!==false&&p.cat==='pack').sort((a,b)=>(a.sort||0)-(b.sort||0));

/* ---------- Language ---------- */
const EN={
gate_q:"Are you 18 or older?",gate_yes:"Yes, I'm 18+",gate_no:"Not yet",
nope_h:"No, no, no.",nope_p:"Come back once you've blown out 18 candles.",nope_cta:"See my consolation prize",nope_back:"I pressed the wrong button",
nav_shop:"Shop",nav_packs:"Packs",nav_rev:"Reviews",nav_list:"The list",cart:"Cart",
open:"Open · online 24 h",hero_h1:"Premium CBD in the valley.",hero_sub:"Flowers, extracts and oils from HiiCBD and Olympus CBD. Discreet shipping in 24/48 h and pickup in the Val d'Aran.",hero_cta1:"See the shelf",hero_cta2:"I want my 10%",age:"18+ only",dist:"Distributor of",
rev_btn:"Leave my review",rev_note:"We only publish real reviews. These cards are samples until the reviews from the Google profile are loaded.",
shop_h:"The shelf",c_all:"Whole shop",b_all:"Both brands",
empty:"Nothing matches both filters at once. Remove one and look again.",
shop_note:"Flowers and extracts: collectors' and aromatic items, not fit for consumption. Cosmetics: external use. No product is a medicine.",
packs_h:"Money-saving packs",
list_h:"Join the list.",list_p:"Drops and promos before anyone else. Plus 10% as a welcome.",lbl_email:"Your email",lbl_consent:"I'm 18 or older and I agree to receive emails from Aran Grow Shop.",list_btn:"I want my 10%",
ok_p:"You're in. Your code:",ok_apply:"Apply it to my cart",ok_copy:"Copy code",demo_note:"Preview: your email isn't saved yet. Real signup switches on when the site goes live.",
p1_h:"10% off your first order",of_p:"Join the list and the code is yours.",of_no:"Not now",
facts_h:"Aran Grow Shop in facts",fk1:"What it is",fv1:"Grow shop and premium CBD store in the Val d'Aran (Lleida), with a physical shop and online sales.",fk2:"Brands",fv2:"Distributor of HiiCBD and Olympus CBD.",fk3:"What it sells",fv3:"CBD flowers, extracts, full spectrum oils, cosmetics, grow gear and merch.",fk4:"Shipping",fv4:"Discreet parcel in 24/48 h to mainland Spain. Free from €50; €6 below that.",fk5:"Pickup",fv5:"Free at the shop in the Val d'Aran.",fk6:"Age",fv6:"Sold to over-18s only.",
faq_h:"Questions from the counter",
foot_contact:"Contact",foot_legal:"Legal",l1:"Legal notice",l2:"Privacy and cookies",l3:"Shipping and returns",
legal:"Sale to under-18s is prohibited. The products in this shop are not medicines and are not intended to diagnose, treat or cure any disease. Flowers and extracts are sold as collectors' and aromatic items and are not fit for human consumption. THC within the legal limit.",made:"Website by",
cart_h:"Your cart",close:"Close",code_lbl:"Code",code_ph:"Got a code?",code_btn:"Apply",sub:"Subtotal",ship:"Shipping",total:"Total",
m_legend:"Delivery",m_ship:"Home delivery",m_pickup:"Pick up at the shop",age_ok:"I confirm I'm 18 or older.",pay_btn:"Pay by card",wa_btn:"Order on WhatsApp",wa_note:"Secure card payment. If you prefer, send us the order on WhatsApp and we'll confirm it with you.",
prov:"Provisional card: details to be confirmed against the batch lab analysis.",f_rev:"No reviews for this product yet.",add:"Add",
th_h:"Order received",th_p:"Thank you. Your receipt is on its way by email and we'll let you know as soon as your parcel ships.",th_btn:"Keep browsing"
};
Object.assign(EN,BOOT.en||{});
const D={
es:{count:"Te llevamos en {n}…",goal0:"Envío gratis desde {x}.",goal:"Te faltan {x} para el envío gratis.",goalOk:"Envío gratis conseguido.",goalPick:"Recogida en tienda: sin gastos de envío.",cartEmpty:"Tu cesta está vacía.",added:"Añadido a la cesta",max:"No quedan más unidades",free:"Gratis",disc:"Código {c} (−{p} %)",codeOk:"Código aplicado: −{p} %.",codeBad:"Ese código no existe. Revisa que esté bien escrito.",eMail:"Escribe un correo válido, por ejemplo tu@correo.com.",eConsent:"Marca la casilla para confirmar que tienes 18 o más.",eSend:"No hemos podido apuntarte. Comprueba tu conexión y vuelve a intentarlo.",copied:"Código copiado",
eAge:"Marca la casilla para confirmar que tienes 18 años o más.",payDemo:"Vista previa: el pago con tarjeta se activa al conectar la pasarela. De momento puedes enviar el pedido por WhatsApp.",payFail:"No hemos podido abrir el pago. Inténtalo de nuevo o envía el pedido por WhatsApp.",payStock:"Ya no quedan tantas unidades de: {x}. Hemos ajustado tu cesta.",payCancel:"El pago no se completó. Tu cesta sigue aquí.",paying:"Abriendo el pago…",
waHi:"Hola Aran Grow Shop, quiero hacer este pedido:",waCode:"Código",waShip:"Envío",waPick:"Recogida en tienda",waTot:"Total",waAge:"Confirmo que tengo 18 años o más.",less:"Quitar uno",more:"Añadir uno",toEN:"Switch to English",toES:"Cambiar a español",
b:["Envío gratis desde 50 €. ¿Llenamos la cesta?","Los jueves hay drop. ¿Te aviso?","Con los packs ahorras en cada pedido."],
revMsg:"Hola Aran Grow Shop, quiero dejar mi reseña:",
types:{sativa:"Sativa",indica:"Índica",hibrida:"Híbrida",tbc:"Por confirmar"},
f:{fam:"Familia",type:"Tipo",grow:"Cultivo",fmt:"Formato",cbd:"Potencia CBD",thc:"THC",thcVal:"Dentro del límite legal",aroma:"Aroma",tbc:"Por confirmar",stock:"Disponibilidad",inStock:"En stock",out:"Agotado"},
fam:{all:"Toda la tienda, sin filtros.",flores:"Cada flor tiene su ficha: tipo, cultivo y potencia de CBD en estrellas. Toca una para verla.",extractos:"Extracciones, con su potencia de CBD en estrellas.",aceites:"Aceites full spectrum en frasco de 10 ml.",cosmetica:"Cosmética con CBD, de uso externo.",gear:"Para tu cultivo: sustrato, macetas, luz y nutrientes.",merch:"Gorras y sudaderas con el camaleón."}},
en:{count:"Taking you there in {n}…",goal0:"Free shipping from {x}.",goal:"{x} to go for free shipping.",goalOk:"Free shipping unlocked.",goalPick:"Shop pickup: no shipping cost.",cartEmpty:"Your cart is empty.",added:"Added to cart",max:"No more units left",free:"Free",disc:"Code {c} (−{p}%)",codeOk:"Code applied: {p}% off.",codeBad:"That code doesn't exist. Check the spelling.",eMail:"Enter a valid email, for example you@mail.com.",eConsent:"Tick the box to confirm you're 18 or older.",eSend:"We couldn't sign you up. Check your connection and try again.",copied:"Code copied",
eAge:"Tick the box to confirm you're 18 or older.",payDemo:"Preview: card payment switches on once the payment gateway is connected. For now you can send the order on WhatsApp.",payFail:"We couldn't open the payment. Try again or send the order on WhatsApp.",payStock:"There aren't that many units left of: {x}. We've adjusted your cart.",payCancel:"The payment wasn't completed. Your cart is still here.",paying:"Opening payment…",
waHi:"Hi Aran Grow Shop, I'd like to place this order:",waCode:"Code",waShip:"Shipping",waPick:"Shop pickup",waTot:"Total",waAge:"I confirm I'm 18 or older.",less:"Remove one",more:"Add one",toEN:"Switch to English",toES:"Cambiar a español",
b:["Free shipping from €50. Shall we fill the cart?","There's a drop every Thursday. Want a heads-up?","Packs save you money on every order."],
revMsg:"Hi Aran Grow Shop, I'd like to leave my review:",
types:{sativa:"Sativa",indica:"Indica",hibrida:"Hybrid",tbc:"To be confirmed"},
f:{fam:"Family",type:"Type",grow:"Grow",fmt:"Format",cbd:"CBD strength",thc:"THC",thcVal:"Within the legal limit",aroma:"Aroma",tbc:"To be confirmed",stock:"Availability",inStock:"In stock",out:"Sold out"},
fam:{all:"The whole shop, no filters.",flores:"Every flower has a spec card: type, grow and CBD strength in stars. Tap one to open it.",extractos:"Extracts, with CBD strength in stars.",aceites:"Full spectrum oils in 10 ml bottles.",cosmetica:"CBD cosmetics for external use.",gear:"For your grow: substrate, pots, light and nutrients.",merch:"Caps and hoodies with the chameleon."}}
};
const BUDDY_LINKS=['#tienda','#lista','#packs'];
let lang=store.get('ags_lang')==='en'?'en':'es';
const ES={};
$$('[data-i18n]').forEach(el=>{ES[el.dataset.i18n]=el.textContent});
$$('[data-i18n-ph]').forEach(el=>{ES[el.dataset.i18nPh]=el.placeholder});
const T=k=>D[lang][k];
const fmt=c=>money(c,lang);
function setLang(l){
  lang=l;store.set('ags_lang',l);document.documentElement.lang=l;
  $$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;el.textContent=l==='en'&&EN[k]!=null?EN[k]:ES[k]});
  $$('[data-i18n-ph]').forEach(el=>{const k=el.dataset.i18nPh;el.placeholder=l==='en'&&EN[k]!=null?EN[k]:ES[k]});
  const b=$('#langBtn');b.textContent=l==='es'?'EN':'ES';b.setAttribute('aria-label',l==='es'?T('toEN'):T('toES'));
  $('#revBtn').href='https://wa.me/'+SHOP.whatsapp+'?text='+encodeURIComponent(T('revMsg'));
  renderShop();renderReviews();renderCart();
  if(!$('#bubble').hidden)showBubble(bi);
  if(!ficha.hidden)openFicha(fichaId);
}
$('#langBtn').onclick=()=>setLang(lang==='es'?'en':'es');

/* ---------- Age gate ---------- */
const gate=$('#gate');let outTimer;
function enter(){gate.hidden=true;document.body.classList.remove('locked');startPopups()}
$('#gateOut').href=SHOP.underageUrl;
$('#gateYes').onclick=()=>{store.set('ags_age','ok');enter()};
$('#gateNo').onclick=()=>{
  $('#gateAsk').hidden=true;$('#gateNope').hidden=false;$('#gateOut').focus();
  if(window.self===window.top){           // on the real site: redirect by itself after a short countdown
    let n=5;const c=$('#gateCount');c.hidden=false;
    (function tick(){c.textContent=T('count').replace('{n}',n);if(n--<=0){location.href=SHOP.underageUrl}else{outTimer=setTimeout(tick,1000)}})();
  }
};
$('#gateBack').onclick=()=>{clearTimeout(outTimer);$('#gateCount').hidden=true;$('#gateNope').hidden=true;$('#gateAsk').hidden=false;$('#gateYes').focus()};

/* ---------- Shop: families, cards, packs ---------- */
const F={cat:BOOT.cat||'flores',brand:'all'};
function bindTilt(){
  if(calm||!matchMedia('(hover:hover)').matches)return;
  $$('.tilt').forEach(el=>{
    if(el.dataset.tilt)return;el.dataset.tilt='1';
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(800px) rotateX('+(-y*12)+'deg) rotateY('+(x*14)+'deg) translateY(-4px)'});
    el.addEventListener('pointerleave',()=>{el.style.transform=''});
  });
}
function renderShop(){
  byId=indexById(ALL);
  $('#fams').innerHTML=famsHTML(shopItems(),lang,F.cat);
  $('#grid').innerHTML=shopItems().map(p=>cardHTML(p,byId,lang,BASE)).join('');
  $('#packsGrid').innerHTML=packItems().map(p=>packHTML(p,byId,lang,SHOP.freeShip)).join('');
  applyFilters();bindTilt();
}
function applyFilters(){
  let shown=0;
  $$('#grid .card').forEach(c=>{const ok=(F.cat==='all'||c.dataset.cat===F.cat)&&(F.brand==='all'||c.dataset.brand===F.brand);c.hidden=!ok;if(ok)shown++});
  $$('button[data-cat]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.cat===F.cat));
  $$('.chip[data-brand]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.brand===F.brand));
  $('#empty').hidden=shown>0;$('#famDesc').textContent=D[lang].fam[F.cat]||'';
}
document.addEventListener('click',e=>{
  const c=e.target.closest('button[data-cat]');if(c){F.cat=c.dataset.cat;applyFilters();return}
  const b=e.target.closest('.chip[data-brand]');if(b){F.brand=b.dataset.brand;applyFilters();return}
  const g=e.target.closest('[data-go-brand]');if(g){F.brand=g.dataset.goBrand;F.cat='all';applyFilters();$('#tienda').scrollIntoView()}
});
function renderReviews(){
  const real=REVIEWS.filter(r=>!r.sample),list=real.length?real:REVIEWS;
  $('#revs').innerHTML=reviewsHTML(list,lang);$('#revSum').innerHTML=reviewsSummary(list,lang);$('#revNote').hidden=real.length>0;
}

/* ---------- Spec card (ficha) ---------- */
const ficha=$('#ficha');let fichaFocus,fichaId;
function openFicha(id){
  const p=byId[id];if(!p)return;
  if(ficha.hidden)fichaFocus=document.activeElement;fichaId=id;
  $('#fCard').dataset.id=id;
  $('#fArt').innerHTML=picHTML(p,BASE);
  $('#fName').textContent=p.name;$('#fBrand').textContent=p.brand;
  const L=D[lang].f,ty=p.type?D[lang].types[p.type]:'',st=p.stars?starStr(p.stars):'',strain=!!p.type,n=stockOf(p,byId);
  $('#fSpec').innerHTML=(ty?'<span class="type t-'+esc(p.type)+'">'+ty+'</span>':'')+(st?'<span class="stars">'+st+'</span>':'');
  const rows=[],add=(k,v)=>rows.push('<dt>'+k+'</dt><dd>'+esc(v)+'</dd>'),fam=FAMILIES.find(f=>f[0]===p.cat);
  if(fam)add(L.fam,lang==='en'?fam[2]:fam[1]);
  if(ty)add(L.type,ty);
  if(strain)add(L.grow,p['grow_'+lang]||p.grow_es||L.tbc);
  if(p[lang]||p.es)add(L.fmt,p[lang]||p.es);
  if(st)add(L.cbd,p.stars+' / 5');
  if(st)add(L.thc,L.thcVal);
  if(strain)add(L.aroma,p['aroma_'+lang]||p.aroma_es||L.tbc);
  add(L.stock,n<=0?L.out:n<=3?LABELS[lang].left(n):L.inStock);
  $('#fRows').innerHTML=rows.join('');
  $('#fProv').hidden=!!p.confirmed||!p.stars;$('#fRev').hidden=!!p.sample;
  $('#fPrice').textContent=fmt(p.price);
  const a=$('#fCard .add');a.disabled=n<=0;a.textContent=n<=0?LABELS[lang].soldout:LABELS[lang].add;
  ficha.hidden=false;$('#fClose').focus();
}
function closeFicha(){if(ficha.hidden)return;ficha.hidden=true;if(fichaFocus&&fichaFocus.focus)fichaFocus.focus()}
$('#fClose').onclick=closeFicha;ficha.addEventListener('click',e=>{if(e.target===ficha)closeFicha()});
$('#grid').addEventListener('click',e=>{if(e.target.closest('.add'))return;const c=e.target.closest('.card');if(c){e.preventDefault();openFicha(c.dataset.id)}});

/* ---------- Cart and checkout ---------- */
let cart={};try{cart=JSON.parse(store.get('ags_cart')||'{}')||{}}catch(e){cart={}}
let codeOn=store.get('ags_code')==='1';
const method=()=>($('input[name=method]:checked')||{}).value||'ship';
function totals(){
  for(const id of Object.keys(cart)){const p=byId[id],have=p&&p.active!==false?stockOf(p,byId):0;if(cart[id]>have)cart[id]=have;if(!(cart[id]>0))delete cart[id]}
  return cartTotals(cart,byId,{codeOn,method:method(),shop:SHOP});
}
function renderCart(){
  const t=totals();store.set('ags_cart',JSON.stringify(cart));
  $('#cartCount').textContent=t.n;
  $('#items').innerHTML=t.n===0?'<div class="none"><img src="'+BASE+'img/cam11.webp" alt="" width="421" height="317"><p>'+T('cartEmpty')+'</p></div>':t.lines.map(l=>'<div class="item"><div><div class="nm">'+esc(l.name)+'</div><div class="br">'+esc(l.brand)+'</div></div><div class="pr">'+fmt(l.full*l.qty)+'</div><div class="qty"><button data-act="dec" data-id="'+esc(l.id)+'" aria-label="'+T('less')+'">−</button><span>'+l.qty+'</span><button data-act="inc" data-id="'+esc(l.id)+'" aria-label="'+T('more')+'">+</button></div></div>').join('');
  const pick=method()==='pickup';
  $('#goal').textContent=pick?T('goalPick'):t.n===0?T('goal0').replace('{x}',fmt(SHOP.freeShip)):t.after>=SHOP.freeShip?T('goalOk'):T('goal').replace('{x}',fmt(SHOP.freeShip-t.after));
  $('#goalBar').style.width=(pick?100:Math.min(100,t.after/SHOP.freeShip*100))+'%';
  $('#lSub').textContent=fmt(t.sub);
  $('#rDisc').hidden=!codeOn||t.n===0;
  $('#lDiscLbl').textContent=T('disc').replace('{c}',SHOP.code).replace('{p}',SHOP.codePct);
  $('#lDisc').textContent='−'+fmt(t.disc);
  $('#lShip').textContent=t.n===0?'–':t.ship===0?T('free'):fmt(t.ship);
  $('#lTot').textContent=fmt(t.total);
  const lines=t.lines.map(l=>'• '+l.qty+' × '+l.name+' ('+l.brand+') · '+fmt(l.full*l.qty));
  const msg=[T('waHi'),...lines,codeOn?T('waCode')+': '+SHOP.code+' (−'+fmt(t.disc)+')':null,pick?T('waPick'):T('waShip')+': '+(t.ship===0?T('free'):fmt(t.ship)),T('waTot')+': '+fmt(t.total),'',T('waAge')].filter(x=>x!==null).join('\n');
  const wa=$('#waBtn');wa.href='https://wa.me/'+SHOP.whatsapp+'?text='+encodeURIComponent(msg);
  wa.setAttribute('aria-disabled',t.n===0);if(t.n===0){wa.setAttribute('tabindex','-1')}else{wa.removeAttribute('tabindex')}
  $('#payBtn').disabled=t.n===0;
}
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),1800)}
function addToCart(id){
  const p=byId[id];if(!p)return;
  if((cart[id]||0)>=stockOf(p,byId)){toast(T('max'));return}
  cart[id]=(cart[id]||0)+1;renderCart();toast(T('added'));
  const cb=$('#cartBtn');cb.classList.remove('bump');void cb.offsetWidth;cb.classList.add('bump');
}
document.addEventListener('click',e=>{const b=e.target.closest('.add');if(!b||b.disabled)return;const host=b.closest('[data-id]');if(host)addToCart(host.dataset.id)});
$('#items').addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(!b)return;const id=b.dataset.id;if(b.dataset.act==='inc'){addToCart(id)}else{cart[id]=(cart[id]||0)-1;renderCart()}});
$$('input[name=method]').forEach(r=>r.onchange=renderCart);
const drawer=$('#drawer'),scrim=$('#scrim');let lastFocus;
function openCart(){lastFocus=document.activeElement;drawer.classList.add('open');scrim.hidden=false;$('#cartClose').focus()}
function closeCart(){drawer.classList.remove('open');scrim.hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus()}
$('#cartBtn').onclick=openCart;$('#cartClose').onclick=closeCart;scrim.onclick=closeCart;
function tryCode(){
  const v=$('#code').value.trim().toUpperCase(),m=$('#codeMsg');
  if(v===SHOP.code){codeOn=true;store.set('ags_code','1');m.textContent=T('codeOk').replace('{p}',SHOP.codePct);renderCart()}
  else{m.textContent=T('codeBad')}
}
$('#codeBtn').onclick=tryCode;$('#code').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();tryCode()}});
function payErr(m){const e=$('#payErr');e.textContent=m;e.hidden=!m}
$('#payBtn').onclick=async()=>{
  payErr('');
  if(!$('#age2').checked){payErr(T('eAge'));$('#age2').focus();return}
  if(!LIVE){payErr(T('payDemo'));return}
  const btn=$('#payBtn'),label=btn.textContent;btn.disabled=true;btn.textContent=T('paying');
  try{
    const r=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:cart,code:codeOn?SHOP.code:'',method:method(),lang})});
    const d=await r.json().catch(()=>({}));
    if(r.status===409&&d.problems){d.problems.forEach(x=>{if(byId[x.id])byId[x.id].stock=x.have});renderShop();renderCart();payErr(T('payStock').replace('{x}',d.problems.map(x=>x.name).join(', ')));return}
    if(!r.ok||!d.url)throw new Error();
    location.href=d.url;
  }catch(x){payErr(T('payFail'))}
  finally{btn.disabled=false;btn.textContent=label}
};

/* ---------- Mailing list (page form and pop-up share this) ---------- */
$$('.signup').forEach(form=>{
  const err=form.querySelector('.err'),mail=form.querySelector('input[type=email]'),ok=form.querySelector('input[type=checkbox]'),done=form.nextElementSibling;
  const fail=(m,el)=>{err.textContent=m;err.hidden=false;if(el)el.focus()};
  form.addEventListener('submit',async e=>{
    e.preventDefault();err.hidden=true;
    const em=mail.value.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))return fail(T('eMail'),mail);
    if(!ok.checked)return fail(T('eConsent'),ok);
    if(LIVE){
      try{const r=await fetch('/__forms.html',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({'form-name':'lista',email:em,idioma:lang,consentimiento:'si'}).toString()});if(!r.ok)throw new Error()}
      catch(x){return fail(T('eSend'))}
    }
    store.set('ags_offer','done');
    form.hidden=true;done.hidden=false;done.querySelector('.demo').hidden=LIVE;done.querySelector('.applyCode').focus();
  });
});
$$('.codebox').forEach(b=>{b.textContent=SHOP.code});
$$('.copyCode').forEach(b=>b.onclick=()=>{try{navigator.clipboard.writeText(SHOP.code).then(()=>toast(T('copied')),()=>{})}catch(e){}});
$$('.applyCode').forEach(b=>b.onclick=()=>{codeOn=true;store.set('ags_code','1');$('#code').value=SHOP.code;renderCart();$('#codeMsg').textContent=T('codeOk').replace('{p}',SHOP.codePct);closeOffer();openCart()});

/* ---------- Pop-ups: welcome offer, the chameleon's messages, thank-you ---------- */
const offer=$('#offer'),thanks=$('#thanks');let offerFocus;
const busy=()=>!gate.hidden||!offer.hidden||!ficha.hidden||!thanks.hidden||drawer.classList.contains('open');
function openOffer(){if(busy())return;offerFocus=document.activeElement;offer.hidden=false;const f=offer.querySelector('.signup');(f.hidden?offer.querySelector('.applyCode'):$('#email2')).focus()}
function closeOffer(){if(offer.hidden)return;offer.hidden=true;if(!store.get('ags_offer'))store.set('ags_offer','seen');if(offerFocus&&offerFocus.focus)offerFocus.focus()}
$('#offerNo').onclick=closeOffer;offer.addEventListener('click',e=>{if(e.target===offer)closeOffer()});
document.addEventListener('click',e=>{if(e.target.closest('[data-open-offer]'))openOffer()});
$('#thanksClose').onclick=()=>{thanks.hidden=true};
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!offer.hidden)closeOffer();else if(!ficha.hidden)closeFicha();else if(!thanks.hidden)thanks.hidden=true;else if(drawer.classList.contains('open'))closeCart()});
let bi=-1,bubbleT;
function showBubble(i){bi=((i%3)+3)%3;const l=$('#bubbleLink');l.textContent=T('b')[bi];l.href=BUDDY_LINKS[bi];const b=$('#bubble');b.hidden=true;void b.offsetWidth;b.hidden=false}
$('#buddyBtn').onclick=()=>{clearTimeout(bubbleT);showBubble(bi+1)};
$('#bubbleX').onclick=()=>{clearTimeout(bubbleT);$('#bubble').hidden=true};
$('#bubbleLink').onclick=()=>{$('#bubble').hidden=true};
let popupsOn=false;
function startPopups(){
  if(popupsOn)return;popupsOn=true;
  const auto=()=>{if(!store.get('ags_offer'))openOffer()};
  setTimeout(auto,SHOP.offerDelay*1000);
  document.addEventListener('mouseleave',e=>{if(e.clientY<=0)auto()});          // leaving towards the tab bar
  let n=0;(function next(){bubbleT=setTimeout(()=>{if(!busy()){showBubble(bi+1);n++}if(n<3)next()},n===0?(SHOP.offerDelay+14)*1000:16000)})();
}

/* ---------- Start ---------- */
setLang(lang);
if(gate.hidden){enter()}else{document.body.classList.add('locked');$('#gateYes').focus()}
(function(){
  let q='';try{q=new URLSearchParams(location.search).get('pago')||''}catch(e){}
  if(q==='ok'){cart={};renderCart();thanks.hidden=false;try{history.replaceState(null,'',location.pathname)}catch(e){}}
  else if(q==='cancelado'){openCart();payErr(T('payCancel'));try{history.replaceState(null,'',location.pathname)}catch(e){}}
})();
