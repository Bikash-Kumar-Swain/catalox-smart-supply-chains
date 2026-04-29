/* ═══════════════════════════════════════════
   CATALOX – Smart Supply Chains
   script.js
═══════════════════════════════════════════ */
const ORS_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjNmNDRlYWU4M2JlNjVhZDY2YWM0ZDVkNTRiMDM4MWIxZGRmMjMwMGY1NDI2NTc5Y2U4OGY1N2U4IiwiaCI6Im11cm11cjY0In0=';

const MODE_CFG = {
  road:  { label:'🚛 Truck',      color:'#4f82ff', speedKmh: null },
  rail:  { label:'🚂 Train',      color:'#f97316', speedKmh: 70   },
  air:   { label:'✈️ Air Cargo',  color:'#a855f7', speedKmh: 750  },
  water: { label:'🚢 Ship',       color:'#06b6d4', speedKmh: 35   },
};

const WEATHER_FACTOR = {
  road:  { Clear:1.0, Rain:1.3,  Storm:1.8 },
  rail:  { Clear:1.0, Rain:1.1,  Storm:1.4 },
  air:   { Clear:1.0, Rain:1.2,  Storm:2.5 },
  water: { Clear:1.0, Rain:1.3,  Storm:3.0 },
};

const TRAFFIC_FACTOR = { Low:1.0, Medium:1.2, High:1.55 };

const MSGS = {
  road:  { ok:['✅ Highway route clear. Truck dispatched.','🟢 Road network nominal. Cargo on the move.','🚛 Optimal highway selected. ETA confirmed.'],
           dl:['⚡ Road congestion detected. Alternate highway suggested.','🛤️ Rerouting truck via bypass road.','🔄 Traffic jam ahead — new route activated.'] },
  rail:  { ok:['🚂 Train scheduled on time. Rail network clear.','✅ Express freight train confirmed.','🟢 Rail corridor nominal. Cargo loaded.'],
           dl:['⚠️ Weather affecting rail speed. Minor delays expected.','🚂 Storm advisory on rail network. ETA adjusted.','🔄 Track maintenance detected. Alternate line suggested.'] },
  air:   { ok:['✈️ Air cargo route confirmed. Skies clear.','🟢 Flight path optimal. Cargo airborne soon.','✅ Air freight dispatched. No turbulence detected.'],
           dl:['⛈️ Storm advisory — flight path rerouted.','⚠️ Air traffic congestion. Departure delayed.','🌪️ Weather turbulence detected. ETA adjusted.'] },
  water: { ok:['🚢 Shipping lane clear. Vessel on course.','✅ Cargo ship route confirmed. Seas calm.','🌊 Optimal coastal route selected.'],
           dl:['⛈️ Rough seas detected. Ship speed reduced.','🌊 Storm warning — vessel rerouted via safer lane.','⚠️ Port congestion detected. Estimated delay added.'] },
};

const RISK_OK = ['Low','Minimal'];
const RISK_DL = ['High','Critical'];

const COASTAL_CITIES = [
  'mumbai','goa','panaji','vasco','kochi','cochin','kozhikode','calicut','kannur',
  'kollam','thiruvananthapuram','trivandrum','mangalore','udupi','karwar',
  'surat','bharuch','bhavnagar','jamnagar','kandla','mundra','porbandar','dwarka','okha',
  'chennai','madras','visakhapatnam','vizag','kakinada','nellore',
  'pondicherry','puducherry','tuticorin','thoothukudi','rameswaram','nagapattinam',
  'paradeep','paradip','puri','gopalpur','kolkata','calcutta','haldia','digha',
  'dubai','abu dhabi','sharjah','muscat','salalah','aden','jeddah',
  'dammam','jubail','kuwait','doha','bahrain','bandar abbas',
  'karachi','gwadar','colombo','hambantota','chittagong','yangon',
  'singapore','kuala lumpur','penang','port klang','bangkok','laem chabang',
  'ho chi minh','haiphong','manila','jakarta','surabaya','medan','batam',
  'hong kong','shenzhen','guangzhou','shanghai','tianjin','qingdao','ningbo',
  'dalian','xiamen','busan','incheon','tokyo','osaka','yokohama','nagoya','kobe',
  'taipei','kaohsiung',
  'sydney','melbourne','brisbane','perth','fremantle','adelaide','darwin',
  'auckland','wellington','christchurch',
  'cape town','durban','mombasa','dar es salaam','maputo','lagos','accra',
  'abidjan','dakar','casablanca','alexandria','suez','tripoli',
  'london','liverpool','southampton','glasgow','amsterdam','rotterdam','antwerp',
  'hamburg','bremen','copenhagen','oslo','stockholm','helsinki','gdansk',
  'marseille','le havre','bordeaux','barcelona','valencia','bilbao',
  'lisbon','porto','genoa','naples','venice','trieste','palermo',
  'piraeus','athens','istanbul','izmir','thessaloniki',
  'new york','newark','boston','baltimore','miami','tampa','new orleans','houston',
  'galveston','charleston','savannah','los angeles','long beach',
  'seattle','tacoma','san francisco','oakland','san diego','vancouver',
  'montreal','halifax','buenos aires','montevideo','santos','rio de janeiro',
  'lima','callao','guayaquil','cartagena','panama','colon','panama city',
  'manzanillo','veracruz','havana',
];

const INLAND_CITIES = [
  'delhi','jaipur','agra','lucknow','kanpur','bhopal','indore','nagpur',
  'hyderabad','secunderabad','bangalore','bengaluru','mysore','pune',
  'patna','varanasi','allahabad','prayagraj','dehradun','chandigarh',
  'amritsar','ludhiana','jalandhar','jodhpur','udaipur','jaisalmer',
  'raipur','ranchi','bhubaneswar','new delhi','ncr',
  'moscow','paris','berlin','madrid','rome','milan','zurich','vienna',
  'prague','warsaw','budapest','bucharest','kiev','kyiv',
  'beijing','chengdu','chongqing','xian','wuhan','harbin','shenyang',
  'kathmandu','kabul','tehran','baghdad','riyadh',
  'nairobi','addis ababa','khartoum','cairo',
  'johannesburg','pretoria','harare','lusaka','kampala',
  'chicago','dallas','denver','phoenix','las vegas','atlanta','detroit',
  'toronto','ottawa','calgary','winnipeg',
  'sao paulo','brasilia','bogota','quito','santiago','la paz','asuncion',
  'mexico city','guadalajara','monterrey',
];

let selectedMode = 'road';
let leafletMap   = null;
let routeLayer   = null;
const DS = { total:1284, delay:47, ontime:1237, routes:312 };
const acTimers = {};

window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('shadow', window.scrollY > 28);
});

function selectMode(mode) {
  const card = document.getElementById('tm-' + mode);
  if (card.classList.contains('disabled')) {
    if (mode === 'water') toast('🚫', 'Ship unavailable — no coastal/port city on this route.');
    else if (mode === 'rail') toast('🚫', 'Railway unavailable — no rail connectivity on this route.');
    return;
  }
  selectedMode = mode;
  ['road','rail','air','water'].forEach(m => document.getElementById('tm-' + m).classList.remove('active'));
  card.classList.add('active');
  const tg = document.getElementById('traf-group');
  if (mode === 'air' || mode === 'water') { tg.style.opacity='.4'; tg.style.pointerEvents='none'; }
  else { tg.style.opacity='1'; tg.style.pointerEvents='auto'; }
}

function isCoastal(city) {
  if (!city) return false;
  const s = city.toLowerCase().replace(/[,.-]/g,' ').replace(/\b(india|usa|uk|uae|china|japan|australia|mh|or|ap|tn|ka|kl|gj|wb|od|odisha|maharashtra|karnataka|kerala|gujarat|tamilnadu|tamil nadu|andhra|telangana|west bengal)\b/g,'').trim();
  const firstWord = s.split(' ')[0];
  if (INLAND_CITIES.some(c => s.includes(c) || c === firstWord)) return false;
  return COASTAL_CITIES.some(c => s.includes(c) || c.includes(firstWord));
}

const NO_ROAD_ISLANDS = [
  'andaman','nicobar','lakshadweep','maldives','sri lanka','ceylon',
  'singapore','indonesia','philippines','japan','taiwan','new zealand','australia',
  'iceland','ireland','uk','britain','great britain','cuba','jamaica',
  'madagascar','mauritius','reunion','seychelles','malta','cyprus',
  'corsica','sardinia','sicily','crete','port blair',
  'fiji','samoa','tonga','vanuatu','solomon','papua',
  'canary','azores','cape verde','falkland',
  'tokyo','osaka','kyoto','yokohama','nagoya','sapporo',
  'taipei','kaohsiung','taichung','hong kong',
  'manila','cebu','davao','jakarta','surabaya','bali','medan',
  'colombo','kandy','auckland','wellington','christchurch',
  'sydney','melbourne','perth','brisbane','darwin','reykjavik',
  'dublin','cork','london','birmingham','manchester','glasgow','edinburgh',
  'valletta','nicosia','havana','kingston',
];

function isNoRoadIsland(city) {
  if (!city) return false;
  const s = city.toLowerCase().replace(/[,.-]/g,' ').trim();
  return NO_ROAD_ISLANDS.some(i => s.includes(i));
}

function isSameIslandGroup(src, dst) {
  const japanCities = ['tokyo','osaka','kyoto','yokohama','nagoya','sapporo','kobe','fukuoka','hiroshima'];
  const ukCities    = ['london','birmingham','manchester','glasgow','edinburgh','liverpool','bristol'];
  const auCities    = ['sydney','melbourne','perth','brisbane','darwin','adelaide','canberra'];
  const groups = [japanCities, ukCities, auCities];
  const s = src.toLowerCase(), d = dst.toLowerCase();
  return groups.some(g => g.some(c => s.includes(c)) && g.some(c => d.includes(c)));
}

function checkTransportAvailability() {
  const src = document.getElementById('src').value.trim();
  const dst = document.getElementById('dst').value.trim();
  const srcIsIsland = isNoRoadIsland(src);
  const dstIsIsland = isNoRoadIsland(dst);
  const crossOcean = (src || dst) && (srcIsIsland || dstIsIsland) && !(srcIsIsland && dstIsIsland && isSameIslandGroup(src, dst));

  const roadCard = document.getElementById('tm-road');
  if (crossOcean) { roadCard.classList.add('disabled'); if (selectedMode==='road') selectMode('air'); }
  else { roadCard.classList.remove('disabled'); }

  const wCard = document.getElementById('tm-water');
  if (!src && !dst) { wCard.classList.remove('disabled'); }
  else {
    const waterOk = isCoastal(src) && isCoastal(dst);
    if (!waterOk) { wCard.classList.add('disabled'); if (selectedMode==='water') selectMode('air'); }
    else { wCard.classList.remove('disabled'); }
  }

  const rCard = document.getElementById('tm-rail');
  const railDisabled = (src || dst) && (srcIsIsland || dstIsIsland);
  if (railDisabled) { rCard.classList.add('disabled'); if (selectedMode==='rail') selectMode('air'); }
  else { rCard.classList.remove('disabled'); }
}

function acFetch(inputId) {
  const input = document.getElementById(inputId);
  const dropId = 'ac-' + inputId;
  const q = input.value.trim();
  const drop = document.getElementById(dropId);
  if (q.length < 2) { drop.classList.remove('open'); drop.innerHTML=''; return; }
  clearTimeout(acTimers[inputId]);
  acTimers[inputId] = setTimeout(async () => {
    drop.innerHTML = `<div class="ac-loading"><div class="spinner" style="width:14px;height:14px;border-width:2px"></div>&nbsp;Searching…</div>`;
    drop.classList.add('open');
    try {
      const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_KEY}&text=${encodeURIComponent(q)}&size=6&layers=locality,region,county,localadmin`;
      const res  = await fetch(url);
      const data = await res.json();
      const feats = (data.features || []).slice(0, 6);
      if (!feats.length) { drop.innerHTML=`<div class="ac-loading">😕 No results for "${q}"</div>`; return; }
      drop.innerHTML = feats.map(f => {
        const label  = f.properties.label || f.properties.name || '';
        const region = [f.properties.region, f.properties.country].filter(Boolean).join(', ');
        const regex  = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
        const bold   = label.replace(regex, '<mark>$1</mark>');
        const safeLabel = label.replace(/'/g, "\\'");
        return `<div class="ac-item" onclick="acSelect('${inputId}','${safeLabel}')">
          <div class="ac-pin">📍</div>
          <div><div class="ac-main">${bold}</div>${region?`<div class="ac-sub">${region}</div>`:''}</div>
        </div>`;
      }).join('');
    } catch(e) { drop.innerHTML=`<div class="ac-loading">⚠️ Could not fetch suggestions</div>`; }
  }, 320);
}

function acSelect(inputId, value) {
  document.getElementById(inputId).value = value;
  document.getElementById('ac-'+inputId).classList.remove('open');
  document.getElementById('ac-'+inputId).innerHTML = '';
  checkTransportAvailability();
}

document.addEventListener('click', e => {
  ['src','dst'].forEach(id => {
    const wrap = document.getElementById(id)?.closest('.ac-wrap');
    if (wrap && !wrap.contains(e.target)) document.getElementById('ac-'+id).classList.remove('open');
  });
});

document.getElementById('src').addEventListener('input', () => { acFetch('src'); setTimeout(checkTransportAvailability,400); });
document.getElementById('dst').addEventListener('input', () => { acFetch('dst'); setTimeout(checkTransportAvailability,400); });

['src','dst'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    const drop = document.getElementById('ac-'+id);
    const items = drop.querySelectorAll('.ac-item');
    const focused = drop.querySelector('.ac-item.focused');
    let idx = [...items].indexOf(focused);
    if (e.key==='ArrowDown') { e.preventDefault(); focused?.classList.remove('focused'); items[Math.min(idx+1,items.length-1)]?.classList.add('focused'); }
    else if (e.key==='ArrowUp') { e.preventDefault(); focused?.classList.remove('focused'); items[Math.max(idx-1,0)]?.classList.add('focused'); }
    else if (e.key==='Enter') { if (focused) { focused.click(); return; } runOptimize(); }
    else if (e.key==='Escape') drop.classList.remove('open');
  });
});

function countUp(el, to) {
  const from = parseInt(el.textContent.replace(/,/g,'')) || 0;
  const diff = to - from; let i = 0;
  const id = setInterval(() => { i++; el.textContent=Math.round(from+diff*(i/22)).toLocaleString(); if(i>=22) clearInterval(id); }, 18);
}

async function geocode(place) {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(place)}&size=1`;
  const res  = await fetch(url);
  const data = await res.json();
  if (!data.features || !data.features.length) throw new Error(`City not found: "${place}"`);
  return data.features[0].geometry.coordinates;
}

async function getRoadData(srcC, dstC) {
  const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
    method:'POST', headers:{'Authorization':ORS_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({coordinates:[srcC,dstC]})
  });
  const data = await res.json();
  if (!data.routes?.length) throw new Error('Road route not found.');
  return { distanceKm:Math.round(data.routes[0].summary.distance/1000), durationMin:Math.round(data.routes[0].summary.duration/60) };
}

function haversineKm(c1, c2) {
  const R=6371, r=d=>d*Math.PI/180;
  const dL=r(c2[1]-c1[1]), dLo=r(c2[0]-c1[0]);
  const a=Math.sin(dL/2)**2+Math.cos(r(c1[1]))*Math.cos(r(c2[1]))*Math.sin(dLo/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function fmtTime(mins) {
  const h=Math.floor(mins/60), m=mins%60;
  return h>0?`${h}h ${m}m`:`${m}m`;
}

async function runOptimize() {
  const srcRaw = document.getElementById('src').value.trim();
  const dstRaw = document.getElementById('dst').value.trim();
  const wthr   = document.getElementById('wthr').value;
  const traf   = document.getElementById('traf').value;
  const mode   = selectedMode;
  if (!srcRaw || !dstRaw) { toast('⚠️','Please fill in both source and destination.'); return; }
  const btn = document.getElementById('sbtn');
  const btxt = document.getElementById('sbtn-txt');
  btn.disabled=true; btxt.innerHTML='<span class="spinner"></span>&nbsp;Locating cities…';
  try {
    const [srcCoord, dstCoord] = await Promise.all([geocode(srcRaw), geocode(dstRaw)]);
    let distanceKm, durationMin;
    if (mode==='road') {
      btxt.innerHTML='<span class="spinner"></span>&nbsp;Calculating road route…';
      const d = await getRoadData(srcCoord, dstCoord);
      distanceKm=d.distanceKm; durationMin=Math.round(d.durationMin*(TRAFFIC_FACTOR[traf]||1.0));
    } else {
      btxt.innerHTML=`<span class="spinner"></span>&nbsp;Calculating ${mode} route…`;
      const straight = haversineKm(srcCoord, dstCoord);
      if (mode==='water') {
        const wpts = getOceanWaypoints(srcCoord, dstCoord);
        let pathKm=0;
        // wpts are [lat,lng] — convert to [lng,lat] for haversineKm which expects [lng,lat]
        for(let i=0;i<wpts.length-1;i++){
          const a=[wpts[i][1],wpts[i][0]], b=[wpts[i+1][1],wpts[i+1][0]];
          pathKm+=haversineKm(a,b);
        }
        distanceKm=Math.round(pathKm); durationMin=Math.round((distanceKm/MODE_CFG[mode].speedKmh)*60);
      } else {
        const df={rail:1.25,air:1.0};
        distanceKm=Math.round(straight*(df[mode]||1.0)); durationMin=Math.round((distanceKm/MODE_CFG[mode].speedKmh)*60);
      }
    }
    const wf=WEATHER_FACTOR[mode][wthr]||1.0;
    const adjMin=Math.round(durationMin*wf);
    const etaStr=fmtTime(adjMin);
    const isDelay=mode==='road'?(traf==='High'||wthr==='Storm'):(wthr==='Storm'||(wthr==='Rain'&&mode==='water'));
    const pool=isDelay?MSGS[mode].dl:MSGS[mode].ok;
    const msg=pool[Math.floor(Math.random()*pool.length)];
    const risk=isDelay?RISK_DL[Math.floor(Math.random()*2)]:RISK_OK[Math.floor(Math.random()*2)];
    document.getElementById('rv-time').textContent=etaStr;
    document.getElementById('rv-dist').textContent=distanceKm+' km';
    document.getElementById('rv-status').textContent=isDelay?'Delay Expected':'On Time';
    document.getElementById('rv-status').className='rc-val '+(isDelay?'delay':'ontime');
    document.getElementById('rv-risk').textContent=risk;
    document.getElementById('rv-risk').style.color=isDelay?'var(--danger)':'var(--success)';
    document.getElementById('rmsg-text').textContent=msg;
    document.getElementById('rmsg-icon').textContent=isDelay?'⚠️':'✅';
    document.getElementById('rmsg-icon').className='mi '+(isDelay?'warn':'ok');
    ['rc-time','rc-dist','rc-status','rc-risk'].forEach(id=>{
      const el=document.getElementById(id);
      el.classList.remove('danger','success'); el.classList.add(isDelay?'danger':'success');
    });
    const rw=document.getElementById('result-wrap');
    rw.classList.add('show'); rw.scrollIntoView({behavior:'smooth',block:'nearest'});
    drawMap(srcCoord, dstCoord, srcRaw, dstRaw, distanceKm, etaStr, mode);
    DS.total++; DS.routes++;
    if(isDelay) DS.delay++; else DS.ontime++;
    countUp(document.getElementById('d-total'),DS.total);
    countUp(document.getElementById('d-delay'),DS.delay);
    countUp(document.getElementById('d-ontime'),DS.ontime);
    countUp(document.getElementById('d-routes'),DS.routes);
    const emo={road:'🚛',rail:'🚂',air:'✈️',water:'🚢'};
    toast(isDelay?'⚠️':'✅',`${emo[mode]} ${distanceKm} km · ETA: ${etaStr}`);
  } catch(err) {
    toast('❌', err.message||'Could not fetch route. Check city names.');
  } finally {
    btn.disabled=false; btxt.textContent='⚡ Calculate Optimal Route';
  }
}

function getOceanWaypoints(sc, dc) {
  // sc, dc are [lng, lat] from geocode()
  const sLng=sc[0], sLat=sc[1], dLng=dc[0], dLat=dc[1];
  // zone checker: (c) is [lng,lat]
  const zone=(lng1,lat1,lng2,lat2)=>(c)=>c[0]>=lng1&&c[0]<=lng2&&c[1]>=lat1&&c[1]<=lat2;
  const inIndia    = zone(68,6,100,38);   // wider — covers Odisha/Paradip (86E,20N), Andamans
  const inEurope   = zone(-10,36,40,72);
  const inUSAEast  = zone(-90,20,-60,55);
  const inUSAWest  = zone(-130,15,-110,60);
  const inUSAGulf  = zone(-98,18,-80,32);
  const inEAsia    = zone(100,10,150,50);
  const inSEAsia   = zone(95,0,140,25);
  const inMiddleE  = zone(32,8,60,32);
  const inAustralia= zone(112,-45,155,-8);
  const inEAfrica  = zone(28,-35,55,15);
  const inWAfrica  = zone(-20,-35,28,20);
  const inSAmerica = zone(-82,-60,-34,15);
  const src=[sLng,sLat], dst=[dLng,dLat];

  // Named waypoints: [lng, lat]
  const G={
    arabSea:    [65,14],  arabE:     [72,10],   indOcean:  [75,-5],
    sriLanka:   [80,5],   bay:       [88,10],   bayDeep:   [88,5],
    malacca:    [103,2],  southChina:[114,10],
    redSeaS:    [43,12],  redSeaN:   [32,28],
    medEast:    [28,34],  medCenter: [15,36],   medWest:   [5,36],
    gibraltar:  [-6,36],
    atlNorth:   [-30,42], atlMid:    [-25,10],  atlSouth:  [-15,-20],
    panamaCanal:[-80,9],  panamaAtl: [-79,9],   caribSea:  [-75,15],
    gulfMex:    [-90,23], usaECoast: [-74,37],  usaWCoast: [-120,35],
    pacificN:   [-135,30],pacificMid:[-150,20], pacificS:  [-140,-5],
    capeGoodHope:[18,-35],capeHorn:  [-68,-56],
    aussieW:    [113,-22],aussieE:   [153,-28],
  };

  // Returns array of [lat, lng] points for Leaflet polyline
  const route=(...gates)=>[[sLat,sLng],...gates.map(g=>[g[1],g[0]]),[dLat,dLng]];

  // Helper: is source on east coast of India (Bay of Bengal side, lng >= 79)
  const srcEastCoast = sLng >= 79;
  const dstEastCoast = dLng >= 79;

  // ── India ↔ India ──────────────────────────────────────────────────────────
  if(inIndia(src) && inIndia(dst)) {
    // Both west coast → route around southern tip via Arabian Sea
    if(!srcEastCoast && !dstEastCoast) return route(G.arabE, G.sriLanka);
    // Both east coast → route through Bay of Bengal
    if(srcEastCoast && dstEastCoast)  return route(G.bay, G.bayDeep, G.sriLanka, G.bay);
    // Cross coast → go around Sri Lanka
    if(srcEastCoast && !dstEastCoast) return route(G.bayDeep, G.sriLanka, G.arabE);
    return route(G.arabE, G.sriLanka, G.bayDeep);
  }

  // ── India ↔ Middle East ────────────────────────────────────────────────────
  if(inIndia(src)&&inMiddleE(dst)||inMiddleE(src)&&inIndia(dst))
    return route(G.arabE, G.arabSea, G.redSeaS);

  // ── India ↔ Europe ─────────────────────────────────────────────────────────
  if(inIndia(src)&&inEurope(dst)||inEurope(src)&&inIndia(dst))
    return inIndia(src)
      ? route(G.arabE, G.arabSea, G.redSeaS, G.redSeaN, G.medEast, G.medCenter, G.medWest)
      : route(G.medWest, G.medCenter, G.medEast, G.redSeaN, G.redSeaS, G.arabSea, G.arabE);

  // ── India ↔ East Africa ────────────────────────────────────────────────────
  if(inIndia(src)&&inEAfrica(dst)||inEAfrica(src)&&inIndia(dst))
    return route(G.arabE, G.arabSea, G.redSeaS);

  // ── India ↔ West Africa ────────────────────────────────────────────────────
  if(inIndia(src)&&inWAfrica(dst)||inWAfrica(src)&&inIndia(dst))
    return route(G.indOcean, G.capeGoodHope, G.atlSouth, G.atlMid);

  // ── India ↔ SE Asia ────────────────────────────────────────────────────────
  if(inIndia(src)&&inSEAsia(dst)||inSEAsia(src)&&inIndia(dst))
    return route(G.bay, G.malacca);

  // ── India ↔ East Asia ──────────────────────────────────────────────────────
  if(inIndia(src)&&inEAsia(dst)||inEAsia(src)&&inIndia(dst))
    return route(G.bay, G.malacca, G.southChina);

  // ── India ↔ Australia ──────────────────────────────────────────────────────
  if(inIndia(src)&&inAustralia(dst)||inAustralia(src)&&inIndia(dst))
    return route(G.sriLanka, G.indOcean, G.aussieW);

  // ── India ↔ USA East ───────────────────────────────────────────────────────
  if(inIndia(src)&&inUSAEast(dst)||inUSAEast(src)&&inIndia(dst))
    return route(G.bay, G.malacca, G.southChina, G.pacificMid, G.panamaCanal, G.panamaAtl, G.caribSea, G.usaECoast);

  // ── India ↔ USA Gulf ───────────────────────────────────────────────────────
  if(inIndia(src)&&inUSAGulf(dst)||inUSAGulf(src)&&inIndia(dst))
    return route(G.arabE, G.sriLanka, G.malacca, G.pacificMid, G.panamaCanal, G.gulfMex);

  // ── India ↔ USA West ───────────────────────────────────────────────────────
  if(inIndia(src)&&inUSAWest(dst)||inUSAWest(src)&&inIndia(dst))
    return route(G.bay, G.malacca, G.southChina, G.pacificN, G.usaWCoast);

  // ── India ↔ South America ──────────────────────────────────────────────────
  if(inIndia(src)&&inSAmerica(dst)||inSAmerica(src)&&inIndia(dst))
    return route(G.indOcean, G.capeGoodHope, G.atlSouth, G.atlMid);

  // ── Europe ↔ USA East ──────────────────────────────────────────────────────
  if(inEurope(src)&&inUSAEast(dst)||inUSAEast(src)&&inEurope(dst))
    return route(G.gibraltar, G.atlNorth, G.usaECoast);

  // ── Europe ↔ USA West ──────────────────────────────────────────────────────
  if(inEurope(src)&&inUSAWest(dst)||inUSAWest(src)&&inEurope(dst))
    return route(G.gibraltar, G.atlNorth, G.caribSea, G.panamaAtl, G.panamaCanal, G.pacificN, G.usaWCoast);

  // ── Europe ↔ East Asia ─────────────────────────────────────────────────────
  if(inEurope(src)&&inEAsia(dst)||inEAsia(src)&&inEurope(dst))
    return route(G.medWest, G.medEast, G.redSeaN, G.redSeaS, G.arabSea, G.malacca, G.southChina);

  // ── USA East ↔ East Asia ───────────────────────────────────────────────────
  if(inUSAEast(src)&&inEAsia(dst)||inEAsia(src)&&inUSAEast(dst))
    return route(G.usaECoast, G.caribSea, G.panamaAtl, G.panamaCanal, G.pacificMid, G.southChina);

  // ── USA East/Gulf ↔ Middle East / East Africa ──────────────────────────────
  if((inUSAEast(src)||inUSAGulf(src))&&(inMiddleE(dst)||inEAfrica(dst)))
    return route(G.usaECoast, G.atlNorth, G.gibraltar, G.medEast, G.redSeaN, G.redSeaS);

  // ── East Asia ↔ USA West ───────────────────────────────────────────────────
  if(inEAsia(src)&&inUSAWest(dst)||inUSAWest(src)&&inEAsia(dst))
    return route(G.southChina, G.pacificN, G.usaWCoast);

  // ── Australia ↔ USA West ───────────────────────────────────────────────────
  if(inAustralia(src)&&inUSAWest(dst)||inUSAWest(src)&&inAustralia(dst))
    return route(G.aussieE, G.pacificMid, G.usaWCoast);

  // ── SE Asia ↔ East Asia ────────────────────────────────────────────────────
  if(inSEAsia(src)&&inEAsia(dst)||inEAsia(src)&&inSEAsia(dst))
    return route(G.malacca, G.southChina);

  // ── Fallback: route through Indian Ocean ───────────────────────────────────
  return route(G.indOcean);
}

function greatCirclePts(c1, c2, steps=80) {
  const toR=d=>d*Math.PI/180, toD=r=>r*180/Math.PI;
  const [lo1,la1]=[toR(c1[0]),toR(c1[1])], [lo2,la2]=[toR(c2[0]),toR(c2[1])];
  const d=Math.acos(Math.sin(la1)*Math.sin(la2)+Math.cos(la1)*Math.cos(la2)*Math.cos(lo2-lo1));
  if(isNaN(d)||d===0) return [[c1[1],c1[0]],[c2[1],c2[0]]];
  const pts=[];
  for(let i=0;i<=steps;i++){
    const f=i/steps;
    const A=Math.sin((1-f)*d)/Math.sin(d), B=Math.sin(f*d)/Math.sin(d);
    const x=A*Math.cos(la1)*Math.cos(lo1)+B*Math.cos(la2)*Math.cos(lo2);
    const y=A*Math.cos(la1)*Math.sin(lo1)+B*Math.cos(la2)*Math.sin(lo2);
    const z=A*Math.sin(la1)+B*Math.sin(la2);
    pts.push([toD(Math.atan2(z,Math.sqrt(x*x+y*y))),toD(Math.atan2(y,x))]);
  }
  return pts;
}

function makeIcon(color) {
  return L.divIcon({className:'',html:`<div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 0 10px ${color}"></div>`,iconSize:[14,14],iconAnchor:[7,7]});
}

function initMap() {
  if(leafletMap) return;
  leafletMap=L.map('leaflet-map',{zoomControl:true}).setView([22,82],5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a>',maxZoom:18}).addTo(leafletMap);
}

async function drawMap(srcC, dstC, srcName, dstName, distKm, etaStr, mode) {
  document.getElementById('map-idle').style.display='none';
  document.getElementById('map-container').style.display='block';
  initMap();
  await new Promise(r=>setTimeout(r,80));
  leafletMap.invalidateSize();
  leafletMap.eachLayer(l=>{if(l!==leafletMap._layers&&!(l instanceof L.TileLayer)){try{leafletMap.removeLayer(l)}catch(e){}}});
  routeLayer=null;
  const color=MODE_CFG[mode].color;
  if(mode==='road'){
    try{
      const res=await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson',{method:'POST',headers:{'Authorization':ORS_KEY,'Content-Type':'application/json'},body:JSON.stringify({coordinates:[srcC,dstC]})});
      const data=await res.json();
      routeLayer=L.geoJSON(data.features[0].geometry,{style:{color,weight:5,opacity:.85,lineJoin:'round',lineCap:'round'}}).addTo(leafletMap);
    }catch{
      routeLayer=L.polyline([[srcC[1],srcC[0]],[dstC[1],dstC[0]]],{color,weight:4,dashArray:'8 6'}).addTo(leafletMap);
    }
  }else if(mode==='air'){
    const pts=greatCirclePts(srcC,dstC,100);
    routeLayer=L.polyline(pts,{color,weight:3,dashArray:'10 7',opacity:.9}).addTo(leafletMap);
    const mid=pts[Math.floor(pts.length/2)];
    L.marker(mid,{icon:L.divIcon({className:'',html:`<div style="font-size:1.4rem">✈️</div>`,iconSize:[28,28],iconAnchor:[14,14]})}).addTo(leafletMap);
  }else if(mode==='rail'){
    const pts=greatCirclePts(srcC,dstC,60);
    L.polyline(pts,{color:'#1a1a2e',weight:9,opacity:.6}).addTo(leafletMap);
    routeLayer=L.polyline(pts,{color,weight:5,dashArray:'16 6',opacity:.9}).addTo(leafletMap);
    const mid=pts[Math.floor(pts.length/2)];
    L.marker(mid,{icon:L.divIcon({className:'',html:`<div style="font-size:1.4rem">🚂</div>`,iconSize:[28,28],iconAnchor:[14,14]})}).addTo(leafletMap);
  }else{
    const wpts=getOceanWaypoints(srcC,dstC);
    L.polyline(wpts,{color:'#0e7490',weight:8,opacity:.2}).addTo(leafletMap);
    routeLayer=L.polyline(wpts,{color,weight:4,dashArray:'20 8',opacity:.9}).addTo(leafletMap);
    const mid=wpts[Math.floor(wpts.length/2)];
    L.marker(mid,{icon:L.divIcon({className:'',html:`<div style="font-size:1.4rem">🚢</div>`,iconSize:[28,28],iconAnchor:[14,14]})}).addTo(leafletMap);
  }
  const bounds=routeLayer?routeLayer.getBounds():L.latLngBounds([[srcC[1],srcC[0]],[dstC[1],dstC[0]]]);
  leafletMap.fitBounds(bounds,{padding:[50,50]});
  L.marker([srcC[1],srcC[0]],{icon:makeIcon('#00d48a')}).addTo(leafletMap).bindPopup(`<b>📍 Source</b><br>${srcName}`).openPopup();
  L.marker([dstC[1],dstC[0]],{icon:makeIcon('#ff4f76')}).addTo(leafletMap).bindPopup(`<b>🏁 Destination</b><br>${dstName}`);
  document.getElementById('map-from').textContent=srcName;
  document.getElementById('map-to').textContent=dstName;
  document.getElementById('map-dist-badge').textContent=`📏 ${distKm} km`;
  document.getElementById('map-time-badge').textContent=`⏱ ${etaStr}`;
  const mb=document.getElementById('map-mode-badge');
  mb.textContent=MODE_CFG[mode].label; mb.style.color=color; mb.style.borderColor=color; mb.style.background=color+'22';
  document.getElementById('map-sec').scrollIntoView({behavior:'smooth',block:'start'});
}

function toast(icon, text) {
  const old=document.querySelector('.toast'); if(old) old.remove();
  const t=document.createElement('div');
  t.className='toast';
  t.innerHTML=`<span style="font-size:1.1rem">${icon}</span><span class="toast-txt">${text}</span>`;
  document.body.appendChild(t);
  setTimeout(()=>{ t.classList.add('out'); t.addEventListener('animationend',()=>t.remove()); },3000);
}

const PC_RATES={road:{base:15,fuel:2.5,handling:2.0},rail:{base:8,fuel:1.2,handling:1.5},air:{base:120,fuel:22,handling:18},water:{base:4,fuel:0.6,handling:0.8}};
const PC_SPEED_MULT={1:1.0,2:1.35,3:1.75};
const PC_SPEED_LABEL={1:'Economy',2:'Standard',3:'Express'};
let pcMode='road';

function pcSelectMode(m) {
  pcMode=m;
  ['road','rail','air','water'].forEach(x=>document.getElementById('pcm-'+x).classList.remove('active'));
  document.getElementById('pcm-'+m).classList.add('active');
  pcUpdate();
}

function pcUpdate() {
  const dist=+document.getElementById('pc-dist').value;
  const weight=+document.getElementById('pc-weight').value;
  const speed=+document.getElementById('pc-speed').value;
  const r=PC_RATES[pcMode], sm=PC_SPEED_MULT[speed];
  document.getElementById('pc-dist-val').textContent=dist.toLocaleString()+' km';
  document.getElementById('pc-weight-val').textContent=weight.toLocaleString()+' kg';
  document.getElementById('pc-speed-val').textContent=PC_SPEED_LABEL[speed];
  ['pc-dist','pc-weight','pc-speed'].forEach(id=>{
    const el=document.getElementById(id);
    const pct=((el.value-el.min)/(el.max-el.min))*100;
    el.style.setProperty('--pct',pct+'%');
  });
  const base=dist*weight*r.base*sm/1000;
  const fuel=dist*weight*r.fuel*sm/1000;
  const handling=dist*weight*r.handling*sm/1000;
  const sub=base+fuel+handling;
  const platform=sub*0.02;
  const total=Math.round(sub+platform);
  document.getElementById('pc-base').textContent='₹'+base.toFixed(2);
  document.getElementById('pc-fuel').textContent='₹'+fuel.toFixed(2);
  document.getElementById('pc-handling').textContent='₹'+handling.toFixed(2);
  document.getElementById('pc-platform').textContent='₹'+platform.toFixed(2);
  document.getElementById('pc-total').textContent=total.toLocaleString();
}

document.addEventListener('DOMContentLoaded', pcUpdate);

function toggleFaq(id) {
  const item=document.getElementById(id);
  const isOpen=item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el=>el.classList.remove('open'));
  if(!isOpen) item.classList.add('open');
}

/* ══════════════════════════════════════════════════
   NEW FEATURES — Auto Weather, Alerts, History,
   Charts, Predictive Risk Engine
══════════════════════════════════════════════════ */

/* ── DELIVERY HISTORY ── */
const deliveryHistory = [];

function addToHistory(src, dst, mode, distKm, etaStr, isDelay, wthr) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}) + ', ' + now.toLocaleDateString('en-IN',{day:'2-digit',month:'short'});
  deliveryHistory.unshift({ src, dst, mode, distKm, etaStr, isDelay, wthr, time: timeStr });
  if (deliveryHistory.length > 20) deliveryHistory.pop();
  renderHistory();
  updateModeChart();
}

function renderHistory() {
  const container = document.getElementById('history-table-container');
  if (!deliveryHistory.length) {
    container.innerHTML = `<div class="ht-empty" style="border-radius:var(--r);border:1px solid var(--border)"><div class="ht-empty-ico">📋</div><div style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif;font-weight:700;margin-bottom:6px">No deliveries yet</div><div style="font-size:.82rem">Calculate a route above to start building your history</div></div>`;
    return;
  }
  const modeEmoji = {road:'🚛',rail:'🚂',air:'✈️',water:'🚢'};
  const rows = deliveryHistory.map((h,i) => `
    <tr>
      <td style="color:var(--muted);font-size:.75rem">#${deliveryHistory.length - i}</td>
      <td><div style="font-weight:600">${h.src}</div></td>
      <td><div style="font-weight:600">${h.dst}</div></td>
      <td><span class="ht-mode ${h.mode}">${modeEmoji[h.mode]} ${h.mode.charAt(0).toUpperCase()+h.mode.slice(1)}</span></td>
      <td>${h.distKm.toLocaleString()} km</td>
      <td style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif;font-weight:700">${h.etaStr}</td>
      <td>${h.wthr}</td>
      <td><span class="ht-status ${h.isDelay?'delay':'ontime'}">${h.isDelay?'⚠️ Delayed':'✅ On Time'}</span></td>
      <td style="color:var(--muted);font-size:.74rem">${h.time}</td>
    </tr>`).join('');
  container.innerHTML = `
    <div class="history-table-wrap">
      <table class="history-table">
        <thead><tr>
          <th>#</th><th>Source</th><th>Destination</th><th>Mode</th>
          <th>Distance</th><th>ETA</th><th>Weather</th><th>Status</th><th>Time</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

/* ── AUTO WEATHER FETCH ── */
async function autoFetchWeather(coordsLngLat) {
  try {
    const [lng, lat] = coordsLngLat;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    const code = data.current?.weather_code ?? 0;
    // Map WMO weather codes to our categories
    let weather = 'Clear';
    let label = '☀️ Clear skies';
    if (code >= 95) { weather = 'Storm'; label = '⛈️ Thunderstorm detected'; }
    else if (code >= 80) { weather = 'Rain'; label = '🌧️ Heavy showers'; }
    else if (code >= 61) { weather = 'Rain'; label = '🌧️ Rain detected'; }
    else if (code >= 51) { weather = 'Rain'; label = '🌦️ Drizzle detected'; }
    else if (code >= 45) { weather = 'Rain'; label = '🌫️ Foggy conditions'; }
    else { weather = 'Clear'; label = '☀️ Clear conditions'; }
    // Update select
    document.getElementById('wthr').value = weather;
    // Show badge
    const badge = document.getElementById('weather-auto-badge');
    document.getElementById('weather-auto-txt').textContent = label + ' (auto-detected)';
    badge.classList.add('visible');
    setTimeout(() => badge.classList.remove('visible'), 5000);
  } catch(e) { /* silently fail */ }
}

/* ── ALERT SYSTEM ── */
let alertPanelOpen = false;
let unreadCount = 0;

const DISRUPTION_ALERTS = [
  { type:'unread', title:'🚨 Port Congestion — JNPT Mumbai', body:'Container backlog of 4,200 units. Road deliveries rerouted via Nhava Sheva bypass. ETA impact: +2–4 hrs.', time:'2 min ago' },
  { type:'warn',   title:'⛈️ Cyclone Warning — Bay of Bengal', body:'IMD issued Category 3 alert. All sea routes via Paradip suspended for 18 hrs. Air mode recommended.', time:'8 min ago' },
  { type:'unread', title:'🚧 NH-48 Road Closure — Delhi–Mumbai', body:'Accident near Vadodara. Traffic diverted. Road ETA impact: +45 min. Rail advised.', time:'15 min ago' },
  { type:'info',   title:'✅ Route Restored — Chennai Port', body:'Fog clearance at Chennai port. Normal operations resumed. Ship departures on schedule.', time:'22 min ago' },
  { type:'warn',   title:'⚠️ Rail Delay — South Central Railway', body:'Track maintenance on Vijayawada–Hyderabad corridor. All freight trains delayed 90 min.', time:'31 min ago' },
  { type:'info',   title:'📊 Fuel Price Update', body:'Aviation turbine fuel up 3.2% this week. Air cargo rates revised. Road/Rail still optimal for short routes.', time:'1 hr ago' },
  { type:'unread', title:'🌊 High Waves Alert — Arabian Sea', body:'Swell height 4.2m near Kochi–Colombo lane. Ship speed reduced 30%. ETA impact: +6–8 hrs.', time:'1 hr ago' },
  { type:'info',   title:'🚂 New Rail Freight Corridor Active', body:'Eastern DFC fully operational. Delhi–Kolkata transit time reduced by 32%. Recommend rail for this corridor.', time:'2 hr ago' },
];

const TICKER_ALERTS = [
  { label:'ALERT', text:'Port JNPT Mumbai — Container backlog, +2hr delay' },
  { label:'WARN',  text:'Bay of Bengal — Cyclone warning, sea routes suspended' },
  { label:'INFO',  text:'NH-48 closure near Vadodara — Rail recommended' },
  { label:'ALERT', text:'Arabian Sea — High waves 4.2m, ship speed reduced' },
  { label:'INFO',  text:'Eastern DFC active — Delhi–Kolkata rail 32% faster' },
  { label:'WARN',  text:'South Central Railway — 90 min freight delay' },
  { label:'INFO',  text:'Chennai Port fog cleared — normal operations resumed' },
  { label:'ALERT', text:'IMD Cyclone Category 3 — Bay of Bengal 18hr suspension' },
];

function initAlerts() {
  // Render ticker
  const ticker = document.getElementById('ticker-inner');
  const items = [...TICKER_ALERTS, ...TICKER_ALERTS]; // duplicate for seamless loop
  ticker.innerHTML = items.map(a => `
    <span class="ticker-item">
      <span class="ticker-badge">${a.label}</span>
      <span class="t-ico">${a.label==='ALERT'?'🚨':a.label==='WARN'?'⚠️':'ℹ️'}</span>
      ${a.text}
      <span class="t-sep">|</span>
    </span>`).join('');

  // Render alert panel
  const list = document.getElementById('alert-list');
  list.innerHTML = DISRUPTION_ALERTS.map(a => `
    <div class="alert-item ${a.type}">
      <div class="ai-icon">${a.type==='unread'?'🚨':a.type==='warn'?'⚠️':'ℹ️'}</div>
      <div>
        <div class="ai-title">${a.title}</div>
        <div class="ai-body">${a.body}</div>
        <div class="ai-time">${a.time}</div>
      </div>
    </div>`).join('');

  // Count unread
  unreadCount = DISRUPTION_ALERTS.filter(a => a.type==='unread').length;
  updateBellBadge();

  // Simulate new alert every 45 seconds
  setInterval(addRandomAlert, 45000);
}

function addRandomAlert() {
  const newAlerts = [
    { type:'unread', title:'🚨 Live: Traffic surge on NH-44', body:'Heavy congestion between Nagpur–Hyderabad. 2hr+ delay. Alternate via SH-9 recommended.', time:'just now' },
    { type:'warn',   title:'⚠️ Live: Rain intensifying — Chennai', body:'IMD yellow alert. Rail and road delays expected. Air cargo on schedule.', time:'just now' },
    { type:'info',   title:'✅ Live: Kolkata port backlog cleared', body:'All pending shipments processed. Normal operations at Haldia terminal.', time:'just now' },
  ];
  const pick = newAlerts[Math.floor(Math.random() * newAlerts.length)];
  DISRUPTION_ALERTS.unshift(pick);
  if (DISRUPTION_ALERTS.length > 12) DISRUPTION_ALERTS.pop();
  unreadCount++;
  updateBellBadge();
  const list = document.getElementById('alert-list');
  if (list) {
    const div = document.createElement('div');
    div.className = `alert-item ${pick.type}`;
    div.innerHTML = `<div class="ai-icon">🚨</div><div><div class="ai-title">${pick.title}</div><div class="ai-body">${pick.body}</div><div class="ai-time">${pick.time}</div></div>`;
    list.insertBefore(div, list.firstChild);
  }
  toast('🔔', pick.title.replace(/^[^\w]+/, '').trim().substring(0, 50) + '…');
}

function updateBellBadge() {
  const dot = document.getElementById('bell-dot');
  if (dot) dot.style.display = unreadCount > 0 ? 'block' : 'none';
}

function toggleAlertPanel() {
  alertPanelOpen = !alertPanelOpen;
  document.getElementById('alert-panel').classList.toggle('open', alertPanelOpen);
  if (alertPanelOpen) { unreadCount = 0; updateBellBadge(); }
}

document.addEventListener('click', e => {
  const panel = document.getElementById('alert-panel');
  const bell = document.getElementById('nav-bell-btn');
  if (alertPanelOpen && panel && !panel.contains(e.target) && bell && !bell.contains(e.target)) {
    alertPanelOpen = false;
    panel.classList.remove('open');
  }
});

/* ── PREDICTIVE RISK ENGINE ── */
async function runPrediction() {
  const srcRaw = document.getElementById('src').value.trim();
  const dstRaw = document.getElementById('dst').value.trim();
  const wthr   = document.getElementById('wthr').value;
  const mode   = selectedMode;
  if (!srcRaw || !dstRaw) { toast('⚠️', 'Enter source & destination first to predict risks.'); return; }

  const btn = document.getElementById('predict-btn');
  const btxt = document.getElementById('predict-btn-txt');
  btn.disabled = true;
  btxt.innerHTML = '<span class="spinner"></span>&nbsp;Analyzing disruption risks…';

  await new Promise(r => setTimeout(r, 1800)); // simulate AI thinking

  // Generate smart predictions based on inputs
  const predictions = generatePredictions(srcRaw, dstRaw, wthr, mode);

  document.getElementById('pred-timestamp').textContent = `Generated: ${new Date().toLocaleTimeString('en-IN')}`;
  document.getElementById('pred-grid').innerHTML = predictions.map(p => `
    <div class="pred-card ${p.severity}">
      <div class="pred-ico">${p.icon}</div>
      <div class="pred-lbl">${p.label}</div>
      <div class="pred-val" style="color:${p.severity==='critical'?'var(--danger)':p.severity==='warning'?'#f97316':'var(--success)'}">${p.value}</div>
      <div class="pred-desc">${p.desc}</div>
      <div class="pred-time">${p.window}</div>
    </div>`).join('');

  const panel = document.getElementById('predict-panel');
  panel.classList.add('show');
  panel.scrollIntoView({ behavior:'smooth', block:'nearest' });

  btn.disabled = false;
  btxt.textContent = '🔮 Predict Future Disruptions (Next 24h)';
  toast('🔮', 'Disruption forecast generated!');
}

function generatePredictions(src, dst, wthr, mode) {
  const isStormy = wthr === 'Storm';
  const isRainy  = wthr === 'Rain';
  const srcLower = src.toLowerCase();
  const dstLower = dst.toLowerCase();
  const isCoastalRoute = ['mumbai','chennai','kolkata','kochi','visakhapatnam','paradip','puri'].some(c => srcLower.includes(c) || dstLower.includes(c));
  const isNorthernRoute = ['delhi','chandigarh','amritsar','jammu','shimla','dehradun'].some(c => srcLower.includes(c) || dstLower.includes(c));

  const preds = [
    {
      icon: isStormy ? '⛈️' : isRainy ? '🌧️' : '☀️',
      label: 'WEATHER RISK (0–8H)',
      value: isStormy ? 'CRITICAL' : isRainy ? 'MODERATE' : 'LOW',
      severity: isStormy ? 'critical' : isRainy ? 'warning' : 'safe',
      desc: isStormy ? 'Severe weather expected. Immediate rerouting recommended before departure.' : isRainy ? 'Rain may reduce speed. Monitor real-time updates.' : 'Clear skies forecasted. Optimal departure window.',
      window: isStormy ? '⏰ Act now — window closing in 2h' : isRainy ? '⏰ Monitor next 4–6 hours' : '✅ Safe for next 12 hours'
    },
    {
      icon: mode === 'road' ? '🚧' : mode === 'water' ? '⚓' : mode === 'rail' ? '🚂' : '✈️',
      label: `${mode.toUpperCase()} DISRUPTION (8–16H)`,
      value: (isCoastalRoute && mode === 'water' && isStormy) ? 'HIGH' : isRainy && mode === 'road' ? 'MEDIUM' : 'LOW',
      severity: (isCoastalRoute && isStormy) ? 'critical' : isRainy ? 'warning' : 'safe',
      desc: mode === 'water' && isStormy ? 'Rough seas expected. Port operations may be suspended.' : mode === 'road' && isRainy ? 'Highway congestion likely. Bypass routes pre-identified.' : `${mode.charAt(0).toUpperCase()+mode.slice(1)} network stable. No major disruptions predicted.`,
      window: isStormy ? '⏰ High risk 8–20h from now' : isRainy ? '⏰ Medium risk 6–14h from now' : '✅ Low risk for 24 hours'
    },
    {
      icon: '📦',
      label: 'PORT/HUB CONGESTION (16–24H)',
      value: isCoastalRoute ? 'MEDIUM' : 'LOW',
      severity: isCoastalRoute ? 'warning' : 'safe',
      desc: isCoastalRoute ? 'Coastal hub congestion possible due to weather backlog. Pre-book slots 6h early.' : 'Inland hubs operating normally. No congestion signals detected.',
      window: isCoastalRoute ? '⏰ Pre-book by ' + new Date(Date.now()+6*3600000).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '✅ No action needed'
    },
    {
      icon: isNorthernRoute ? '🏔️' : '🛣️',
      label: 'ALTERNATE ROUTE READINESS',
      value: 'READY',
      severity: 'safe',
      desc: isNorthernRoute ? 'NH-44 via Jalandhar and NH-58 via Haridwar pre-computed as alternatives.' : 'Primary route optimal. 2 alternative corridors identified and validated.',
      window: '✅ Alternatives available instantly'
    },
  ];

  return preds;
}

/* ── CHARTS ── */
let weeklyChart = null;
let modeChart = null;
const modeHistory = { road:0, rail:0, air:0, water:0 };

function initCharts() {
  const wCtx = document.getElementById('weeklyChart');
  const mCtx = document.getElementById('modeChart');
  if (!wCtx || !mCtx) return;

  const chartDefaults = {
    color: '#6b78a8',
    plugins: { legend: { display: false } },
  };

  weeklyChart = new Chart(wCtx, {
    type: 'bar',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [
        { label:'On Time', data:[182,210,195,228,241,198,183], backgroundColor:'rgba(79,130,255,.7)', borderRadius:6, borderSkipped:false },
        { label:'Delayed', data:[12,8,14,6,9,11,7], backgroundColor:'rgba(255,79,118,.65)', borderRadius:6, borderSkipped:false },
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:true,
      plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}` } } },
      scales:{
        x:{ grid:{color:'rgba(79,130,255,.07)'}, ticks:{color:'#6b78a8',font:{size:11}} },
        y:{ grid:{color:'rgba(79,130,255,.07)'}, ticks:{color:'#6b78a8',font:{size:11}} }
      }
    }
  });

  modeChart = new Chart(mCtx, {
    type: 'doughnut',
    data: {
      labels: ['🚛 Road','🚂 Rail','✈️ Air','🚢 Water'],
      datasets:[{ data:[312,87,45,28], backgroundColor:['rgba(79,130,255,.8)','rgba(249,115,22,.8)','rgba(168,85,247,.8)','rgba(6,182,212,.8)'], borderWidth:0, hoverOffset:6 }]
    },
    options: {
      responsive:true, maintainAspectRatio:true,
      plugins:{ legend:{ position:'bottom', labels:{ color:'#6b78a8', padding:16, font:{size:11} } } },
      cutout:'65%'
    }
  });
}

function updateModeChart() {
  if (!modeChart) return;
  modeHistory[selectedMode]++;
  const base = { road:312, rail:87, air:45, water:28 };
  modeChart.data.datasets[0].data = ['road','rail','air','water'].map(m => base[m] + modeHistory[m]);
  modeChart.update('none');
}

/* ── INIT ALL NEW FEATURES ── */
document.addEventListener('DOMContentLoaded', () => {
  initAlerts();
  setTimeout(initCharts, 500);
  renderHistory();
});

/* ── PATCH runOptimize TO ALSO SAVE HISTORY + FETCH WEATHER ── */
const _origRunOptimize = runOptimize;
runOptimize = async function() {
  await _origRunOptimize();
  // After optimize completes, save to history
  const src = document.getElementById('src').value.trim();
  const dst = document.getElementById('dst').value.trim();
  const wthr = document.getElementById('wthr').value;
  const rvTime = document.getElementById('rv-time').textContent;
  const rvDist = document.getElementById('rv-dist').textContent;
  const rvStatus = document.getElementById('rv-status').textContent;
  if (src && dst && rvTime !== '–') {
    const dist = parseInt(rvDist) || 0;
    const isDelay = rvStatus.includes('Delay');
    addToHistory(src, dst, selectedMode, dist, rvTime, isDelay, wthr);
  }
};

/* ── PATCH acSelect TO AUTO-FETCH WEATHER ── */
const _origAcSelect = acSelect;
acSelect = function(inputId, value) {
  _origAcSelect(inputId, value);
  // Auto-fetch weather for source city
  if (inputId === 'src') {
    setTimeout(async () => {
      try {
        const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(value)}&size=1`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.features?.length) {
          autoFetchWeather(data.features[0].geometry.coordinates);
        }
      } catch(e) {}
    }, 200);
  }
};

