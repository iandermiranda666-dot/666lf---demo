// script.js - behavior for 666LF Win demo
const APP = {
  init(){
    this.users = JSON.parse(localStorage.getItem('lf_users')||'{}');
    this.current = null;
    this.bindUI();
    // simulate loading
    setTimeout(()=>{ document.getElementById('preloader').classList.add('hidden'); document.getElementById('app').classList.remove('hidden'); this.showAuth(); }, 1200);
  },
  bindUI(){
    // auth modal handles
    document.getElementById('signinBtn').onclick = ()=>this.signIn();
    document.getElementById('registerBtn').onclick = ()=>this.register();
    document.getElementById('closeAuth').onclick = ()=>this.hideAuth();
    // menu buttons
    document.querySelectorAll('.menu .btn').forEach(b=>b.onclick = (e)=>{ const view=b.dataset.view; if(view) this.changeView(view); });
    document.getElementById('logoutBtn').onclick = ()=>{ this.logout(); };
    document.getElementById('topUp').onclick = ()=>{ if(this.current){ this.current.balance += 100; this.save(); this.updateUI(); alert('+100 coins (demo)'); } };
    // chat
    document.getElementById('chatBtn').onclick = ()=>{ const cb=document.getElementById('chatBubble'); cb.classList.toggle('hidden'); };
    document.getElementById('closeChat').onclick = ()=>{ document.getElementById('chatBubble').classList.add('hidden'); };
    document.getElementById('sendChat').onclick = ()=>{ const v=document.getElementById('chatInput').value.trim(); if(!v) return; this.addChat('me',v); document.getElementById('chatInput').value=''; setTimeout(()=>this.addChat('bot','Suporte (demo): Recebemos sua mensagem — responderemos em instantes (demo).'),700); };
    // logout
    document.getElementById('logoutBtn').onclick = ()=>{ this.logout(); };
  },
  save(){ localStorage.setItem('lf_users', JSON.stringify(this.users)); },
  ensureUser(email,password,name){
    if(!this.users[email]){ this.users[email] = {email,password,name:name||email.split('@')[0],balance:1000,bets:[]}; this.save(); }
    return this.users[email];
  },
  signIn(){
    const e=document.getElementById('authEmail').value.trim().toLowerCase();
    const p=document.getElementById('authPass').value;
    if(e==='admin@666lf.win' && p==='admin123'){ this.current = {admin:true,email:e,name:'ADMIN'}; this.hideAuth(); this.renderApp(); return; }
    const u=this.users[e];
    if(u && u.password===p){ this.current = u; this.hideAuth(); this.renderApp(); return; }
    alert('Credenciais inválidas');
  },
  register(){
    const e=document.getElementById('authEmail').value.trim().toLowerCase();
    const p=document.getElementById('authPass').value || 'demo';
    const n=document.getElementById('authName').value.trim() || e.split('@')[0];
    if(!e.includes('@')) return alert('Coloque um email válido');
    this.ensureUser(e,p,n);
    this.current = this.users[e];
    this.hideAuth();
    this.renderApp();
  },
  logout(){ this.current=null; this.showAuth(); },
  showAuth(){ document.getElementById('authModal').style.display='flex'; document.getElementById('authTitle').innerText='Entrar'; },
  hideAuth(){ document.getElementById('authModal').style.display='none'; },
  renderApp(){
    document.getElementById('userName').innerText = this.current.name;
    document.getElementById('topName').innerText = this.current.name;
    document.getElementById('bal').innerText = this.current.balance.toFixed(2);
    document.getElementById('topBal').innerText = this.current.balance.toFixed(2);
    this.changeView('dashboard');
  },
  updateUI(){ if(this.current){ document.getElementById('bal').innerText=this.current.balance.toFixed(2); document.getElementById('topBal').innerText=this.current.balance.toFixed(2); } },
  changeView(v){
    const area = document.getElementById('mainArea');
    if(v==='dashboard'){ area.innerHTML = `<div class="gameCard card"><h3>Painel</h3><p class="small">Clique nos jogos na lateral para iniciar.</p></div>`; return; }
    if(v==='crash'){ return this.renderCrash(area); }
    if(v==='slots'){ return this.renderSlots(area); }
    if(v==='roleta'){ return this.renderRoleta(area); }
    if(v==='history'){ return this.renderHistory(area); }
  },
  renderCrash(area){
    area.innerHTML = `<div class="gameCard card"><h3>Crash</h3><div id="crashMul">1.00x</div><div class="controls"><input id="crashBet" placeholder="Aposta"/><button class="btn primary" id="startCrash">Apostar</button><button class="btn" id="cashout">Sacar</button></div><div id="crashLog" class="small"></div></div>`;
    document.getElementById('startCrash').onclick = ()=>{ const amt=Number(document.getElementById('crashBet').value); if(!amt||amt>this.current.balance) return alert('Aposta inválida'); const bet={game:'Crash',amt,info:{status:'running'}}; this.current.bets.unshift(bet); this.current.balance-=amt; this.save(); this.updateUI(); this.startCrashSim(bet); };
    document.getElementById('cashout').onclick = ()=>{ if(!this.crashRunning) return alert('Nada em andamento'); clearInterval(this.crashInterval); this.crashRunning=false; const mul=this.crashValue; const bet=this.current.bets.find(b=>b.game==='Crash' && b.info.status==='running'); if(!bet) return; const win=bet.amt*mul; bet.info.status='cashed'; bet.info.win=win; this.current.balance+=win; this.save(); this.updateUI(); document.getElementById('crashLog').innerText='Saque! x'+mul.toFixed(2)+' — ganhou '+win.toFixed(2); this.playSound('win'); };
  },
  startCrashSim(bet){
    this.crashRunning=true; this.crashValue=1; this.crashTarget = Math.random()*6+1.2; document.getElementById('crashLog').innerText='Rodada iniciada (demo)'; this.playSound('spin');
    this.crashInterval = setInterval(()=>{ this.crashValue += this.crashValue*0.06; document.getElementById('crashMul').innerText = this.crashValue.toFixed(2)+'x'; if(this.crashValue>=this.crashTarget){ clearInterval(this.crashInterval); this.crashRunning=false; document.getElementById('crashLog').innerText='EXPLODIU em '+this.crashValue.toFixed(2)+'x — perdeu'; this.playSound('loss'); } },120);
  },
  renderSlots(area){
    area.innerHTML = `<div class="gameCard card"><h3>Slots</h3><div id="reels" class="slot-reels">- - -</div><div class="controls"><input id="slotsBet" placeholder="Aposta"/><button class="btn primary" id="spinSlots">Girar</button></div><div id="slotsRes" class="small"></div></div>`;
    document.getElementById('spinSlots').onclick = ()=>{ const amt=Number(document.getElementById('slotsBet').value); if(!amt||amt>this.current.balance) return alert('Aposta inválida'); this.current.balance-=amt; this.current.bets.unshift({game:'Slots',amt,info:{}}); this.save(); this.updateUI(); this.animateSlots(amt); };
  },
  animateSlots(amt){
    const symbols=['7','🍒','⭐']; const reels = document.getElementById('reels');
    let spins = 12; this.playSound('spin');
    const iv = setInterval(()=>{ reels.innerText = symbols[Math.floor(Math.random()*symbols.length)]+'  '+symbols[Math.floor(Math.random()*symbols.length)]+'  '+symbols[Math.floor(Math.random()*symbols.length)]; spins--; if(spins<=0){ clearInterval(iv); const a=reels.innerText.split('  ')[0]; const b=reels.innerText.split('  ')[1]; const c=reels.innerText.split('  ')[2]; let win=0; if(a===b && b===c){ if(a==='7') win=amt*50; else if(a==='🍒') win=amt*10; else win=amt*5; } else if(a===b||b===c||a===c) win=amt*2; if(win>0){ this.current.balance+=win; this.save(); this.updateUI(); document.getElementById('slotsRes').innerText='Ganhou '+win.toFixed(2); this.playSound('coin'); } else { document.getElementById('slotsRes').innerText='Perdeu'; this.playSound('loss'); } } },80);
  },
  renderRoleta(area){
    area.innerHTML = `<div class="gameCard card"><h3>Roleta</h3><div class="controls"><input id="roletaBet" placeholder="Aposta"/><input id="roletaChoice" placeholder="red/black or 1-36"/><button class="btn primary" id="spinR">Girar</button></div><div id="roletaRes" class="small"></div></div>`;
    document.getElementById('spinR').onclick = ()=>{ const amt=Number(document.getElementById('roletaBet').value); const choice=document.getElementById('roletaChoice').value.trim().toLowerCase(); if(!amt||amt>this.current.balance) return alert('Aposta inválida'); this.current.balance-=amt; this.current.bets.unshift({game:'Roleta',amt,info:{choice}}); this.save(); this.updateUI(); this.playSound('spin'); setTimeout(()=>{ const spun=Math.floor(Math.random()*36)+1; const color = spun%2? 'red':'black'; let win=0; if(choice==='red'||choice==='black'){ if(choice===color) win=amt*2; } else { const num=parseInt(choice); if(num===spun) win=amt*36; } if(win>0){ this.current.balance+=win; this.save(); this.updateUI(); document.getElementById('roletaRes').innerText='Saiu '+spun+' ('+color+'). Ganhou '+win.toFixed(2); this.playSound('coin'); } else { document.getElementById('roletaRes').innerText='Saiu '+spun+' ('+color+'). Perdeu'; this.playSound('loss'); } },900);
  },
  renderHistory(area){
    const rows = this.current.bets.map(b => `<div class="small">${new Date(b.time).toLocaleString()} • ${b.game} • ${b.amt} coins</div>`).join('');
    area.innerHTML = `<div class="card"><h3>Histórico</h3>${rows||'<div class="small">Sem apostas</div>'}</div>`;
  },
  addChat(who,text){
    const container=document.getElementById('chatMessages');
    const el=document.createElement('div'); el.className = who==='me' ? 'msg me' : 'msg'; el.innerHTML=text;
    container.appendChild(el); container.scrollTop = container.scrollHeight;
  },
  playSound(name){
    // sounds are optional files; handle gracefully
    try{
      const s = document.getElementById('s_'+name);
      if(s) s.currentTime=0, s.play();
    }catch(e){}
  }
};

window.addEventListener('load', ()=>APP.init());
