// UNIT 1337 — Operation Survivors
// Playable recovery build: waves, auto-fire, XP upgrades, loot and dash.
const $ = (id) => document.getElementById(id);
const canvas = $('c');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101820);
scene.fog = new THREE.Fog(0x101820, 28, 72);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 180);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
scene.add(new THREE.HemisphereLight(0xb6d5ed, 0x263021, 2.0));
const sun = new THREE.DirectionalLight(0xffedcf, 2.4);
sun.position.set(-12, 22, 10); sun.castShadow = true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);
const mat = (color, roughness=.82, metalness=.02) => new THREE.MeshStandardMaterial({color, roughness, metalness});
const groundMat = mat(0x35413b);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(150,150), groundMat);
ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);
const grid = new THREE.GridHelper(100, 50, 0x536354, 0x455247); grid.position.y=.015; scene.add(grid); grid.visible=false;
const floorMarkMat = new THREE.MeshStandardMaterial({color:0x6a776b, roughness:1, transparent:true, opacity:.17});
for(let i=-4;i<=4;i++){
 const lineA=new THREE.Mesh(new THREE.BoxGeometry(78,.012,.035),floorMarkMat);
 lineA.position.set(0,.025,i*8);scene.add(lineA);
 const lineB=new THREE.Mesh(new THREE.BoxGeometry(.035,.012,78),floorMarkMat);
 lineB.position.set(i*8,.026,0);scene.add(lineB);
}
const arena = [], obstacles = [], corpses = [];
const coverMat=mat(0x303a38), concrete=mat(0x59615c), rust=mat(0x66513e), hazard=mat(0xb69b54);
function addBuilding(x,z,w,h,d,color=0x424b49){
 const group=new THREE.Group();
 const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));body.position.y=h/2;body.castShadow=true;body.receiveShadow=true;group.add(body);
 const roof=new THREE.Mesh(new THREE.BoxGeometry(w+.12,.12,d+.12),mat(0x262f30));roof.position.y=h+.06;roof.castShadow=true;group.add(roof);
 const door=new THREE.Mesh(new THREE.BoxGeometry(Math.min(1.2,w*.22),Math.min(2.1,h*.65),.06),mat(0x202827));door.position.set(0,Math.min(2.1,h*.65)/2,d/2+.035);group.add(door);
 group.position.set(x,0,z);scene.add(group);
 // Building footprint participates in movement collision.
 obstacles.push({x,z,hw:w/2,hz:d/2,h,mesh:body});
}
addBuilding(-25,-24,12,5,9,0x414b49);addBuilding(24,-25,10,4,12,0x4c5149);
addBuilding(-27,22,9,3.4,11,0x3c4846);addBuilding(25,23,13,5.4,8,0x454b46);
for(let i=0;i<12;i++){
 const x=(Math.random()-.5)*58,z=(Math.random()-.5)*58;
 if(Math.hypot(x,z)<10)continue;
 const w=2.4+Math.random()*3.5,d=1.2+Math.random()*2.2,h=.65+Math.random()*1.1;
 const block=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(i%3?0x505953:0x5c5140));
 block.position.set(x,h/2,z);block.castShadow=true;block.receiveShadow=true;scene.add(block);
 obstacles.push({x,z,hw:w/2,hz:d/2,h,mesh:block});
}
for(let i=0;i<8;i++){
 const x=-32+i*9,z=(i%2? -8:8);
 const barrier=new THREE.Mesh(new THREE.BoxGeometry(3.2,.9,.65),concrete);
 barrier.position.set(x,.45,z);barrier.castShadow=true;scene.add(barrier);
 obstacles.push({x,z,hw:1.6,hz:.325,h:.9,mesh:barrier});
}
for(let i=0;i<10;i++){
 const x=-34+Math.random()*68,z=-34+Math.random()*68;
 if(Math.hypot(x,z)<9)continue;
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.13,.17,.7,7),mat(0x4d5751));
 mesh.position.set(x,.35,z);mesh.castShadow=true;scene.add(mesh);
 const lamp=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),new THREE.MeshBasicMaterial({color:0xe3b56c}));
 lamp.position.set(x,.76,z);scene.add(lamp);
}
for(let i=0;i<6;i++){
 const x=-28+i*11,z=(i%2===0?-15:15);
 const stripe=new THREE.Mesh(new THREE.BoxGeometry(1.6,.018,.14),hazard);
 stripe.position.set(x,.04,z);scene.add(stripe);
}

for (let i=0;i<42;i++) {
  const x=(Math.random()-.5)*64, z=(Math.random()-.5)*64;
  if (Math.hypot(x,z)<7) continue;
  const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2+Math.random()*1.5,.8+Math.random()*1.1,1.2+Math.random()*1.4), mat(i%3?0x4a5149:0x6a5b43));
  crate.position.set(x,crate.geometry.parameters.height/2,z); crate.castShadow=true; crate.receiveShadow=true; scene.add(crate); arena.push(crate); obstacles.push({x,z,hw:crate.geometry.parameters.width/2,hz:crate.geometry.parameters.depth/2,h:crate.geometry.parameters.height,mesh:crate});
}
const OPS = [
 {id:'ghost',name:'GHOST',color:0x3d5a49,desc:'Сбалансированный боец'},
 {id:'viper',name:'VIPER',color:0x6a7741,desc:'Быстрый штурмовик'},
 {id:'raven',name:'RAVEN',color:0x303b4b,desc:'Тактическая броня'}
];
let selectedOp=0, running=false, paused=false, dead=false, last=0, elapsed=0, fireClock=0, spawnClock=0, wave=1, waveKills=0, kills=0, level=1, xp=0, xpNeed=5, armor=0, weaponLevel=1, chestClock=0, messageClock=0;
const keys={}, zombies=[], bullets=[], drops=[];
const player={x:0,z:0,hp:100,maxHp:100,speed:7.2,r:.42,dash:0,dashCd:0,invuln:0,moveX:0,moveZ:0,mesh:null,aim:0,vaultT:0,vaultDur:.55,vaultY:0,vaultX:0,vaultZ:0,vaultStartX:0,vaultStartZ:0,vaultEndX:0,vaultEndZ:0,vaultHeight:0,vaultArc:0,rollT:0,rollDur:.52,rollX:0,rollZ:0,rollSide:1,faceAngle:0,moveBlend:0};
function makeHumanoid(color, isZombie=false) {
 const root=new THREE.Group(), legs=[], arms=[];
 const torso=new THREE.Mesh(new THREE.BoxGeometry(.62,.8,.34),mat(color)); torso.position.y=1.08; root.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.23,12,10),mat(isZombie?0x83947b:0xc3a78b)); head.position.y=1.67; root.add(head);
 const pelvis=new THREE.Mesh(new THREE.BoxGeometry(.48,.24,.3),mat(isZombie?0x394238:0x303638));pelvis.position.y=.66;root.add(pelvis);
 for (const s of [-1,1]) {
  const legPivot=new THREE.Group();legPivot.position.set(s*.18,.67,0);root.add(legPivot);
  const leg=new THREE.Mesh(new THREE.BoxGeometry(.22,.65,.24),mat(isZombie?0x465044:0x252d32));leg.position.y=-.29;legPivot.add(leg);legs.push(legPivot);
  const armPivot=new THREE.Group();armPivot.position.set(s*.4,1.34,0);root.add(armPivot);
  const arm=new THREE.Mesh(new THREE.BoxGeometry(.19,.62,.22),mat(color));arm.position.y=-.27;armPivot.add(arm);
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.085,8,6),mat(isZombie?0x83947b:0xc3a78b));hand.position.set(0,-.55,.03);armPivot.add(hand);arms.push(armPivot);
 }
 let rifle=null, muzzle=null;
 if (!isZombie) {
  const rifleGroup=new THREE.Group();
  rifle=new THREE.Mesh(new THREE.BoxGeometry(.12,.13,.9),mat(0x171b1d,.45,.5)); rifle.position.set(0,0,.12); rifleGroup.add(rifle);
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.38,8),mat(0x080b0c,.4,.6)); barrel.rotation.x=Math.PI/2; barrel.position.set(0,0,.72); rifleGroup.add(barrel);
  const stock=new THREE.Mesh(new THREE.BoxGeometry(.14,.17,.28),mat(0x343a38)); stock.position.set(0,0,-.28); rifleGroup.add(stock);
  const sight=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,.12),mat(0x080b0c,.4,.4)); sight.position.set(0,.1,.16); rifleGroup.add(sight);
  rifleGroup.position.set(.27,1.22,.36);root.add(rifleGroup);muzzle=new THREE.Object3D();muzzle.position.set(0,0,.95);rifleGroup.add(muzzle);
 }
 root.userData={legs,arms,torso,head,pelvis,isZombie,rifle,rifleGroup,muzzle,fireKick:0,hitFlash:0,attackT:0,phase:Math.random()*Math.PI*2};

 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 return root;
}
function setupMenu(){
 const ops=$('ops'), info=$('menuOpInfo');
 if(ops){ops.innerHTML=''; OPS.forEach((op,i)=>{const b=document.createElement('button');b.className='op-card'+(i===selectedOp?' active':'');b.textContent=op.name;b.style.borderColor=i===selectedOp?'#a9d47a':'';b.onclick=()=>{selectedOp=i;setupMenu();};ops.appendChild(b);});}
 if(info) info.textContent=OPS[selectedOp].name+' · '+OPS[selectedOp].desc;
 const skins=$('skinPick'); if(skins && !skins.children.length){['STANDARD','FIELD','NIGHT'].forEach((s,i)=>{const b=document.createElement('button');b.className='skin-chip';b.textContent=s;b.onclick=()=>{[...skins.children].forEach(x=>x.classList.remove('active'));b.classList.add('active');};if(!i)b.classList.add('active');skins.appendChild(b);});}
}
setupMenu();
function blockedAt(x,z,r=player.r){
 for(const o of obstacles){
  const cx=Math.max(o.x-o.hw,Math.min(x,o.x+o.hw));
  const cz=Math.max(o.z-o.hz,Math.min(z,o.z+o.hz));
  if((x-cx)*(x-cx)+(z-cz)*(z-cz)<r*r) return o;
 }
 return null;
}
function startRoll(mx,mz){
 if(player.dashCd>0||player.vaultT>0||player.rollT>0)return false;
 let dx=mx,dz=mz,len=Math.hypot(dx,dz);
 if(len<.15){dx=Math.sin(player.mesh.rotation.y);dz=Math.cos(player.mesh.rotation.y);len=1;}
 player.rollX=dx/len;player.rollZ=dz/len;player.rollT=player.rollDur;player.dashCd=1.05;player.invuln=.38;player.rollSide=Math.random()<.5?-1:1;return true;
}
function tryVault(mx,mz){
 if(player.vaultT>0||player.rollT>0||Math.hypot(mx,mz)<.25)return false;
 const len=Math.hypot(mx,mz)||1, dx=mx/len,dz=mz/len;
 // Find the first obstacle directly in the player's travel lane, then land beyond its far edge.
 let hit=null, best=Infinity;
 for(const o of obstacles){
  const along=(o.x-player.x)*dx+(o.z-player.z)*dz;
  if(along<.25||along>2.8)continue;
  const side=Math.abs((o.x-player.x)*(-dz)+(o.z-player.z)*dx);
  const lateral= Math.abs(dx)>Math.abs(dz)?o.hz:o.hw;
  if(side>lateral+player.r+.22)continue;
  if(along<best){best=along;hit=o;}
 }
 if(!hit||hit.h>2.55||hit.h<.35)return false;
 const alongX=dx*(best+((Math.abs(dx)>Math.abs(dz)?hit.hw:hit.hz))+player.r+.2);
 const alongZ=dz*(best+((Math.abs(dx)>Math.abs(dz)?hit.hw:hit.hz))+player.r+.2);
 const lx=player.x+alongX,lz=player.z+alongZ;
 if(blockedAt(lx,lz,player.r*.9))return false;
 player.vaultT=player.vaultDur=Math.max(.48,Math.min(.95,.44+hit.h*.18));
 player.vaultX=dx;player.vaultZ=dz;player.vaultArc=Math.min(2.15,.7+hit.h*.42);player.vaultY=0;
 player.vaultStartX=player.x;player.vaultStartZ=player.z;
 player.vaultEndX=lx;player.vaultEndZ=lz;
 player.vaultHeight=hit.h;
 player.invuln=Math.max(player.invuln,.35);
 return true;
}
function showMsg(t){const e=$('msg');if(e)e.textContent=t;messageClock=2.6;}
function updateHud(){
 const hp=$('hpBar'), ht=$('hpText'), lv=$('lvl'), xb=$('xpBar');
 if(hp)hp.style.width=(100*player.hp/player.maxHp)+'%';if(ht)ht.textContent=Math.ceil(player.hp);
 if(lv)lv.textContent=level;if(xb)xb.style.width=(100*xp/xpNeed)+'%';
 if($('timer'))$('timer').textContent=String(Math.floor(elapsed/60)).padStart(2,'0')+':'+String(Math.floor(elapsed%60)).padStart(2,'0');
 if($('kills'))$('kills').textContent=kills;if($('diff'))$('diff').textContent=(1+elapsed/150).toFixed(1);
 if($('hudOp'))$('hudOp').textContent=OPS[selectedOp].name;
 if($('loadout'))$('loadout').textContent='AR-15 · LV '+weaponLevel+' · ARMOR '+armor;
}
function startGame(){
 $('menu')?.classList.add('hidden');$('pause')?.classList.add('hidden');$('over')?.classList.add('hidden');$('levelup')?.classList.add('hidden');$('hud')?.classList.remove('hidden');$('boot')?.classList.add('hidden');
 for(const a of [...zombies,...bullets,...drops])scene.remove(a.mesh||a);
 zombies.length=0;bullets.length=0;drops.length=0;
 elapsed=0;fireClock=0;spawnClock=0;wave=1;waveKills=0;kills=0;level=1;xp=0;xpNeed=5;armor=0;weaponLevel=1;
 Object.assign(player,{x:0,z:0,hp:100,maxHp:100,dash:0,dashCd:0,invuln:0,vaultT:0,vaultY:0,rollT:0,rollX:0,rollZ:0});
 if(player.mesh)scene.remove(player.mesh);player.mesh=makeHumanoid(OPS[selectedOp].color);scene.add(player.mesh);
 running=true;paused=false;dead=false;last=performance.now();showMsg('МИССИЯ НАЧАЛАСЬ · ВОЛНА 1');updateHud();
}
function spawnZombie(){
 const a=Math.random()*Math.PI*2, d=18+Math.random()*10;
 const tough=wave%5===0 && waveKills===0 && Math.random()<.18;
 const mesh=makeHumanoid(tough?0x6e3532:0x52634c,true);
 mesh.scale.setScalar(tough?1.35:1);
 const z={mesh,x:player.x+Math.cos(a)*d,z:player.z+Math.sin(a)*d,hp:tough?7+wave:2+Math.floor(wave*.35),speed:(tough?1.3:1.65)+Math.min(wave*.045,1),damage:tough?18:8,r:tough?.65:.42,attack:0,tough};
 mesh.position.set(z.x,0,z.z);scene.add(mesh);zombies.push(z);
}
function dropAt(x,z,type){
 let color=type==='chest'?0xd5a448:type==='heal'?0x4ee48a:type==='armor'?0x66aaff:0x65d8ff;
 const mesh=new THREE.Mesh(type==='chest'?new THREE.BoxGeometry(.85,.58,.6):new THREE.IcosahedronGeometry(.3,0),mat(color,.35,.25));
 mesh.position.set(x,type==='chest'?.35:.45,z);mesh.castShadow=true;scene.add(mesh);drops.push({mesh,x,z,type,bob:Math.random()*6});
}
function killZombie(i){
 const z=zombies[i];
 z.dead=true;z.deathT=.52;z.mesh.userData.deathDir=(Math.random()<.5?-1:1);z.mesh.userData.legs.forEach(l=>{l.rotation.x=-.7;});z.mesh.userData.arms.forEach((a,k)=>{a.rotation.x=k===0?-1.1:-.8;});z.mesh.userData.torso.rotation.x=.28;
 zombies.splice(i,1);scene.add(z.mesh);z.mesh.userData.remains=true;corpses.push({mesh:z.mesh,life:.62,dir:z.mesh.userData.deathDir});kills++;waveKills++;
 if(Math.random()<.16)dropAt(z.x,z.z,Math.random()<.5?'heal':'armor');else dropAt(z.x,z.z,'xp');
 if(z.tough){dropAt(z.x,z.z,'chest');showMsg('ЭЛИТА УСТРАНЕНА · ДОБЫЧА');}
 if(waveKills>=wave*8){wave++;waveKills=0;dropAt(player.x+2,player.z-2,'chest');showMsg('ВОЛНА '+wave+' · ПОДКРЕПЛЕНИЕ');}
 updateHud();
}
function shoot(){
 if(!zombies.length)return;
 let target=null, best=25*25;
 for(const z of zombies){const d=(z.x-player.x)**2+(z.z-player.z)**2;if(d<best){best=d;target=z;}}
 if(!target)return;
 const dx=target.x-player.x,dz=target.z-player.z,len=Math.hypot(dx,dz)||1;
 player.mesh.rotation.y=Math.atan2(dx,dz);
 const ud=player.mesh.userData;ud.fireKick=.12;
 const muzzle=ud.muzzle?ud.muzzle.getWorldPosition(new THREE.Vector3()):new THREE.Vector3(player.x+dx/len*.55,1.2,player.z+dz/len*.55);
 const mesh=new THREE.Sprite(new THREE.SpriteMaterial({color:0xfff1bd,transparent:true,opacity:1,depthWrite:false}));
 mesh.scale.set(.12,.12,1);mesh.position.copy(muzzle);scene.add(mesh);
 const tracer=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffdca0,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));
 tracer.scale.set(.58,.055,1);tracer.position.copy(muzzle);scene.add(tracer);
 const flash=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffb84d,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false}));
 flash.scale.set(.32,.32,1);flash.position.copy(muzzle);scene.add(flash);
 bullets.push({mesh,tracer,flash,x:muzzle.x,z:muzzle.z,vx:dx/len*29,vz:dz/len*29,life:.62,damage:1+Math.floor((weaponLevel-1)*.7)});
}
function levelUp(){
 level++;xp-=xpNeed;xpNeed=Math.ceil(xpNeed*1.35);running=false;
 const box=$('choices');if(box){box.innerHTML='';const choices=[
 ['МЕДИЦИНА','Восстановить 35 HP',()=>player.hp=Math.min(player.maxHp,player.hp+35)],
 ['УСИЛЕНИЕ ОРУЖИЯ','Урон +1',()=>weaponLevel++],
 ['БРОНЯ','Поглотить часть урона',()=>armor++],
 ['АДРЕНАЛИН','Скорость +10%',()=>player.speed*=1.1]
 ];choices.sort(()=>Math.random()-.5).slice(0,3).forEach(([name,desc,fn])=>{const b=document.createElement('button');b.className='choice';b.innerHTML='<b>'+name+'</b><span>'+desc+'</span>';b.onclick=()=>{fn();$('levelup').classList.add('hidden');running=true;last=performance.now();showMsg('УСИЛЕНИЕ ПОЛУЧЕНО');updateHud();};box.appendChild(b);});}
 $('levelup')?.classList.remove('hidden');updateHud();
}
function endGame(){running=false;dead=true;$('hud')?.classList.add('hidden');$('over')?.classList.remove('hidden');if($('overStats'))$('overStats').textContent='Время: '+$('timer')?.textContent+' · Убийства: '+kills+' · Уровень: '+level;}
function pauseGame(){if(dead)return;paused=!paused;if(paused){running=false;$('pause')?.classList.remove('hidden');if($('pauseStats'))$('pauseStats').textContent='Убийства: '+kills+' · Уровень: '+level;}else{$('pause')?.classList.add('hidden');running=true;last=performance.now();}}
$('btnStart')?.addEventListener('click',startGame);$('btnRetry')?.addEventListener('click',startGame);$('btnRestart')?.addEventListener('click',startGame);
$('btnMenu')?.addEventListener('click',()=>{dead=false;$('over')?.classList.add('hidden');$('hud')?.classList.add('hidden');$('menu')?.classList.remove('hidden');running=false;});
$('btnPauseMenu')?.addEventListener('click',()=>{paused=false;running=false;$('pause')?.classList.add('hidden');$('hud')?.classList.add('hidden');$('menu')?.classList.remove('hidden');});
$('btnResume')?.addEventListener('click',pauseGame);$('btnPause')?.addEventListener('click',pauseGame);
$('btnDash')?.addEventListener('click',()=>startRoll(player.moveX,player.moveZ));
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key==='Escape'&&(!dead))pauseGame();if(e.code==='Space')startRoll((keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0));});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
let touchStart=null;canvas.addEventListener('pointerdown',e=>{touchStart={x:e.clientX,y:e.clientY,id:e.pointerId};});canvas.addEventListener('pointermove',e=>{if(touchStart&&touchStart.id===e.pointerId&&e.pointerType!=='mouse'){const dx=e.clientX-touchStart.x,dy=e.clientY-touchStart.y;player.moveX=Math.max(-1,Math.min(1,dx/45));player.moveZ=Math.max(-1,Math.min(1,dy/45));}});canvas.addEventListener('pointerup',e=>{if(touchStart&&touchStart.id===e.pointerId){touchStart=null;player.moveX=0;player.moveZ=0;}});canvas.addEventListener('pointercancel',()=>{touchStart=null;player.moveX=0;player.moveZ=0;});
function frame(now){
 requestAnimationFrame(frame);
 const dt=Math.min((now-last)/1000||0,.04);last=now;
 let mx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+player.moveX;
 let mz=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+player.moveZ;
 let len=Math.hypot(mx,mz);if(len>1){mx/=len;mz/=len;}
 if(running&&!paused&&!dead){
  elapsed+=dt;fireClock-=dt;spawnClock-=dt;chestClock-=dt;messageClock-=dt;
  if(messageClock<=0&&$('msg'))$('msg').textContent='';
  player.dash=Math.max(0,player.dash-dt);player.dashCd=Math.max(0,player.dashCd-dt);player.invuln=Math.max(0,player.invuln-dt);
  const rolling=player.rollT>0;
  const speed=player.speed*(rolling?2.25:1);
  if(rolling){
   const stepX=player.rollX*speed*dt,stepZ=player.rollZ*speed*dt;
   const nx=player.x+stepX,nz=player.z+stepZ;
   if(!blockedAt(nx,player.z))player.x=nx;
   if(!blockedAt(player.x,nz))player.z=nz;
   player.rollT=Math.max(0,player.rollT-dt);
  } else if(player.vaultT<=0 && len>.1){
   const nx=player.x+mx*speed*dt,nz=player.z+mz*speed*dt;
   const hit=blockedAt(nx,nz);
   if(!hit){player.x=nx;player.z=nz;}
   else {
    const axisX=blockedAt(nx,player.z),axisZ=blockedAt(player.x,nz);
    if(!axisX)player.x=nx;
    if(!axisZ)player.z=nz;
    if((axisX||axisZ)&&tryVault(mx,mz)){};
   }
  }
  if(player.vaultT>0){
   const progress=1-player.vaultT/player.vaultDur;
   const eased=progress*progress*(3-2*progress);
   player.x=player.vaultStartX+(player.vaultEndX-player.vaultStartX)*eased;
   player.z=player.vaultStartZ+(player.vaultEndZ-player.vaultStartZ)*eased;
   player.vaultY=Math.sin(progress*Math.PI)*player.vaultArc;
   player.vaultT=Math.max(0,player.vaultT-dt);
   if(player.vaultT===0){player.vaultY=0;player.vaultArc=0;player.x=player.vaultEndX;player.z=player.vaultEndZ;}
  }
  player.x=Math.max(-48,Math.min(48,player.x));player.z=Math.max(-48,Math.min(48,player.z));
  const dashY=player.dash>0?Math.sin((.22-player.dash)/.22*Math.PI)*.28:0;
  player.mesh.position.set(player.x,Math.max(dashY,player.vaultY),player.z);
  const rollP=rolling?1-player.rollT/player.rollDur:0;
  player.mesh.rotation.z=rolling?Math.sin(rollP*Math.PI)*.24*player.rollSide:0;
  player.mesh.rotation.x=rolling?Math.sin(rollP*Math.PI*2)*.35:0;
  if(len>.1&&!rolling&&!player.vaultT){const desired=Math.atan2(mx,mz);let diff=((desired-player.faceAngle+Math.PI*3)%(Math.PI*2))-Math.PI;player.faceAngle+=diff*Math.min(1,dt*13);player.mesh.rotation.y=player.faceAngle;}
  player.moveBlend+=(Math.min(1,len)*(!rolling&&!player.vaultT?1:0)-player.moveBlend)*Math.min(1,dt*7);
  const moving=player.moveBlend>.08&&!rolling, phase=elapsed*(7+player.moveBlend*5), gait=moving?Math.sin(phase)*player.moveBlend:0;
  const bob=moving?Math.abs(Math.sin(phase*2))*.045:Math.sin(elapsed*2.1)*.018;
  player.mesh.userData.legs.forEach((limb,i)=>{limb.rotation.x=rolling?(i===0?1:-1)*(.65+Math.sin(rollP*Math.PI*2)*.35):gait*(i===0?-.72:.72);});
  player.mesh.userData.arms.forEach((limb,i)=>{limb.rotation.x=rolling?-1.05+(i===0?.15:-.15):(moving?gait*(i===0?.22:-.22):-.12);});
  player.mesh.userData.torso.rotation.x=rolling?Math.sin(rollP*Math.PI)*.7:(player.vaultT>0?-.28:0);
  player.mesh.userData.head.rotation.x=rolling?-.22*Math.sin(rollP*Math.PI):(player.vaultT>0?.12:0);
  player.mesh.userData.torso.position.y=1.08+bob;
  player.mesh.userData.head.position.y=1.67+bob*.65;
  const ud=player.mesh.userData;
  ud.fireKick=Math.max(0,(ud.fireKick||0)-dt*1.8);
  if(ud.rifleGroup){ud.rifleGroup.rotation.x=-ud.fireKick*.22;ud.rifleGroup.position.z=.36-ud.fireKick*.16;}
  ud.arms.forEach((a,k)=>{if(!rolling&&!player.vaultT){a.rotation.x=-.82-(ud.fireKick||0)*(k===0?.18:.1);a.rotation.z=k===0?-.08:.08;}});
  ud.hitFlash=Math.max(0,(ud.hitFlash||0)-dt);
  if(fireClock<=0){shoot();fireClock=Math.max(.16,.48-(weaponLevel-1)*.035);}
  if(spawnClock<=0){for(let i=0;i<Math.min(1+Math.floor(wave/3),3);i++)spawnZombie();spawnClock=Math.max(.32,1.35-elapsed*.003);}
  for(let i=zombies.length-1;i>=0;i--){
   const z=zombies[i],dx=player.x-z.x,dz=player.z-z.z,d=Math.hypot(dx,dz)||1;
   const zu=z.mesh.userData;
   if(d>z.r+player.r+.2){
    z.x+=dx/d*z.speed*dt;z.z+=dz/d*z.speed*dt;z.mesh.position.set(z.x,Math.sin(now*.003+zu.phase)*.025,z.z);z.mesh.rotation.y=Math.atan2(dx,dz);
    const gait=Math.sin(now*.0065+zu.phase)*.34, lunge=zu.attackT>0?Math.sin((1-zu.attackT/.42)*Math.PI)*.5:0;
    zu.legs.forEach((limb,k)=>{limb.rotation.x=gait*(k===0?-1:1);limb.rotation.z=0;});
    zu.arms.forEach((limb,k)=>{limb.rotation.x=-.48+gait*(k===0?1:-1)-lunge;limb.rotation.z=(k===0?-.12:.12);});
    zu.torso.rotation.x=-.08+Math.abs(gait)*.08;
   } else {
    z.attack-=dt;zu.attackT=Math.max(0,(zu.attackT||0)-dt);
    if(z.attack<=0){let dmg=Math.max(1,z.damage-armor*2);zu.attackT=.42;zu.torso.rotation.x=-.24;zu.arms.forEach((a,k)=>{a.rotation.x=k===0?-1.05:-.85;});if(player.invuln<=0){player.hp-=dmg;player.invuln=.25;}z.attack=.8;if(player.hp<=0){endGame();break;}}
   }
  }
  for(let i=bullets.length-1;i>=0;i--){
   const b=bullets[i];b.x+=b.vx*dt;b.z+=b.vz*dt;b.life-=dt;b.mesh.position.set(b.x,1.2,b.z);
   if(b.tracer){b.tracer.position.set(b.x-b.vx*.014,1.2,b.z-b.vz*.014);b.tracer.material.opacity=Math.min(.9,b.life*1.8);b.tracer.scale.set(.58,.055,1);}
   if(b.flash){b.flash.position.set(b.x,b.flash.position.y,b.z);b.flash.material.opacity=Math.max(0,1-(b.age||0)/.075);b.flash.scale.setScalar(.32*Math.max(.01,1-(b.age||0)/.075));}
   b.age=(b.age||0)+dt;
   if(b.flash&&b.age>.075){scene.remove(b.flash);b.flash.material.dispose();b.flash=null;}
   let hit=-1;for(let j=0;j<zombies.length;j++)if((zombies[j].x-b.x)**2+(zombies[j].z-b.z)**2<(zombies[j].r+.18)**2){hit=j;break;}
   if(hit>=0){
    const target=zombies[hit],zu=target.mesh.userData;target.hp-=b.damage;zu.hitFlash=.12;zu.torso.rotation.x=-.22;zu.head.rotation.x=.16;zu.arms.forEach((a,k)=>{a.rotation.x=k===0?-.95:-.6;});
    target.x-=b.vx*.003;target.z-=b.vz*.003;
    if(target.hp<=0)killZombie(hit);
    scene.remove(b.mesh);scene.remove(b.tracer);if(b.flash){scene.remove(b.flash);b.flash.material.dispose();}b.mesh.material.dispose();b.tracer.material.dispose();bullets.splice(i,1);
   }else if(b.life<=0){scene.remove(b.mesh);scene.remove(b.tracer);if(b.flash){scene.remove(b.flash);b.flash.material.dispose();}b.mesh.material.dispose();b.tracer.material.dispose();bullets.splice(i,1);}
  }
  for(let i=corpses.length-1;i>=0;i--){
   const corpse=corpses[i];corpse.life-=dt;
   const mesh=corpse.mesh;mesh.rotation.z+=(corpse.dir*1.25-mesh.rotation.z)*Math.min(1,dt*6);
   mesh.rotation.x+=(.18-mesh.rotation.x)*Math.min(1,dt*4);
   mesh.position.y=Math.max(-.28,mesh.position.y-dt*.48);
   if(corpse.life<=0){
    scene.remove(mesh);mesh.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else if(o.material)o.material.dispose();}});
    corpses.splice(i,1);
   }
  }
  for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.mesh.position.y=(d.type==='chest'?.35:.45)+Math.sin(now*.004+d.bob)*.12;if((d.x-player.x)**2+(d.z-player.z)**2<1.7){if(d.type==='xp'){xp++;if(xp>=xpNeed)levelUp();}else if(d.type==='heal')player.hp=Math.min(player.maxHp,player.hp+25);else if(d.type==='armor')armor++;else if(d.type==='chest'){const r=Math.random();if(r<.34){player.hp=Math.min(player.maxHp,player.hp+45);showMsg('СУНДУК · АПТЕЧКА');}else if(r<.67){weaponLevel++;showMsg('СУНДУК · УЛУЧШЕНИЕ ОРУЖИЯ');}else{armor++;showMsg('СУНДУК · БРОНЯ +1');}}scene.remove(d.mesh);drops.splice(i,1);updateHud();}}
  if(chestClock<=0){if(elapsed>15&&Math.random()<.4)dropAt(player.x+(Math.random()-.5)*12,player.z+(Math.random()-.5)*12,'chest');chestClock=24;}
  updateHud();
 }
 // Stable isometric follow camera: no movement-direction lead, so the view never swings around.
 const target=new THREE.Vector3(player.x,0,player.z);
 const camX=player.x+13,camZ=player.z+16;
 const follow=1-Math.exp(-dt*2.2);
 camera.position.x+=(camX-camera.position.x)*follow;camera.position.y+=(17-camera.position.y)*follow;camera.position.z+=(camZ-camera.position.z)*follow;camera.lookAt(target);
 renderer.render(scene,camera);
}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));});
$('boot')?.classList.add('hidden');
requestAnimationFrame(frame);
