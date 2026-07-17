const MoguraApp={
  inited:false,score:0,best:0,combo:0,running:false,timer:null,active:new Map(),bgmOn:false,audioCtx:null,bgmTimer:null,
  init(){if(this.inited)return;this.inited=true;this.best=Number(localStorage.getItem('mogura_best_v01')||0);this.mount();},
  mount(){
    const root=document.getElementById('mogura-screen');
    root.innerHTML=`
      <header class="app-header"><div class="top-line"><button class="back-btn" onclick="MoguraApp.stop();App.home()">←</button><h1>🐼 どうぶつたっち</h1></div><div class="small-info">ただしいえだけたっち</div></header>
      <div id="mogura-controls">
        <button class="main-btn" onclick="MoguraApp.start()">すたーと</button>
        <button class="sub-btn" onclick="MoguraApp.toggleBgm()" id="mogura-bgm">BGM OFF</button>
        <label>でるじかん <input id="mogura-speed" type="range" min="1000" max="4000" value="2000" step="100"></label><span id="mogura-speed-text">2.0びょう</span>
        <div>✅ <span id="mogura-score">0</span>　🏆 <span id="mogura-best">${this.best}</span>　🔥 <span id="mogura-combo">0</span></div>
        <div id="mogura-topic">まちがえたらおしまい</div>
      </div>
      <div id="mogura-game"></div>
      <div id="mogura-over" class="overlay"><h2>💥 おしまい！</h2><p id="mogura-result"></p><button class="main-btn" onclick="MoguraApp.start()">もういちど</button></div>
    `;
    const game=document.getElementById('mogura-game');for(let i=0;i<24;i++){const h=document.createElement('div');h.className='hole';h.dataset.i=i;game.appendChild(h);} 
    const sp=document.getElementById('mogura-speed');sp.oninput=()=>document.getElementById('mogura-speed-text').textContent=(sp.value/1000).toFixed(1)+'びょう';
  },
  getItems(){const media=KidsStorage.getMedia();if(media.length>=2){return media;}return[{word:'ぱんだ',emoji:'🐼'},{word:'りす',emoji:'🐿️'},{word:'ぞう',emoji:'🐘'},{word:'ねこ',emoji:'🐱'}];},
  start(){this.stop(false);this.score=0;this.combo=0;this.running=true;document.getElementById('mogura-score').textContent=0;document.getElementById('mogura-combo').textContent=0;document.getElementById('mogura-over').classList.remove('show');if(this.bgmOn)this.startBgm();this.timer=setInterval(()=>this.spawn(),220);},
  stop(clear=true){this.running=false;clearInterval(this.timer);this.timer=null;this.active.forEach(x=>clearTimeout(x.timeout));this.active.clear();document.querySelectorAll('#mogura-game .target-img,#mogura-game .target-emoji,#mogura-game .boom').forEach(e=>e.remove());if(clear)this.stopBgm();},
  spawn(){if(!this.running)return;const holes=[...document.querySelectorAll('#mogura-game .hole')].filter(h=>!this.active.has(h.dataset.i));if(!holes.length)return;const items=this.getItems();const correct=items[0];const isCorrect=Math.random()<.35;const data=isCorrect?correct:items[1+Math.floor(Math.random()*(items.length-1))]||items[0];const hole=holes[Math.floor(Math.random()*holes.length)],i=hole.dataset.i;let el;if(data.image){el=document.createElement('img');el.src=data.image;el.className='target-img';}else{el=document.createElement('div');el.textContent=data.emoji||'🐼';el.className='target-emoji';}hole.appendChild(el);const timeout=setTimeout(()=>this.remove(i),+document.getElementById('mogura-speed').value);this.active.set(i,{el,isCorrect,timeout});el.onclick=e=>{e.stopPropagation();const item=this.active.get(i);if(!item||!this.running)return;if(item.isCorrect){this.score++;this.combo++;document.getElementById('mogura-score').textContent=this.score;document.getElementById('mogura-combo').textContent=this.combo;this.fly(el);this.playPon();if(this.combo%10===0)this.comboPop();this.remove(i);}else{this.boom(hole);this.playBoom();this.gameOver();}};},
  remove(i){const item=this.active.get(i);if(!item)return;clearTimeout(item.timeout);item.el?.remove();this.active.delete(i);},
  boom(hole){const b=document.createElement('div');b.className='boom';b.textContent='💥';b.style.left='50%';b.style.top='40%';hole.appendChild(b);setTimeout(()=>b.remove(),600);},
  comboPop(){const d=document.createElement('div');d.className='combo-pop';d.textContent='🔥 '+this.combo+' こんぼ！';document.body.appendChild(d);setTimeout(()=>d.remove(),850);},
  fly(el){const r=el.getBoundingClientRect();const f=el.cloneNode(true);f.style.position='fixed';f.style.left=r.left+'px';f.style.top=r.top+'px';f.style.width=r.width+'px';f.style.height=r.height+'px';f.style.zIndex=160;f.style.pointerEvents='none';f.style.transition='transform .55s,opacity .55s';document.body.appendChild(f);setTimeout(()=>{f.style.transform='translate(0,-120px) scale(.25) rotate(20deg)';f.style.opacity='0';},10);setTimeout(()=>f.remove(),650);},
  gameOver(){this.running=false;clearInterval(this.timer);this.active.forEach(x=>clearTimeout(x.timeout));this.active.clear();if(this.score>this.best){this.best=this.score;localStorage.setItem('mogura_best_v01',this.best);document.getElementById('mogura-best').textContent=this.best;}setTimeout(()=>{document.querySelectorAll('#mogura-game .target-img,#mogura-game .target-emoji').forEach(e=>e.remove());document.getElementById('mogura-result').textContent=`${this.score} かいできた！ さいこう ${this.best}`;document.getElementById('mogura-over').classList.add('show');},400);},
  ensureAudio(){if(!this.audioCtx)this.audioCtx=new(window.AudioContext||window.webkitAudioContext)();},
  playPon(){this.ensureAudio();const o=this.audioCtx.createOscillator(),g=this.audioCtx.createGain();o.connect(g);g.connect(this.audioCtx.destination);o.frequency.value=880;o.type='sine';g.gain.setValueAtTime(.18,this.audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.01,this.audioCtx.currentTime+.12);o.start();o.stop(this.audioCtx.currentTime+.12);},
  playBoom(){this.ensureAudio();const o=this.audioCtx.createOscillator(),g=this.audioCtx.createGain();o.connect(g);g.connect(this.audioCtx.destination);o.frequency.value=90;o.type='sawtooth';g.gain.setValueAtTime(.24,this.audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.01,this.audioCtx.currentTime+.35);o.start();o.stop(this.audioCtx.currentTime+.35);},
  toggleBgm(){this.bgmOn=!this.bgmOn;document.getElementById('mogura-bgm').textContent=this.bgmOn?'BGM ON':'BGM OFF';if(this.bgmOn)this.startBgm();else this.stopBgm();},
  startBgm(){this.stopBgm();this.ensureAudio();const notes=[523,659,784,659];let i=0;this.bgmTimer=setInterval(()=>{const o=this.audioCtx.createOscillator(),g=this.audioCtx.createGain();o.connect(g);g.connect(this.audioCtx.destination);o.frequency.value=notes[i++%notes.length];o.type='triangle';g.gain.setValueAtTime(.035,this.audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.audioCtx.currentTime+.28);o.start();o.stop(this.audioCtx.currentTime+.28);},360);},
  stopBgm(){clearInterval(this.bgmTimer);this.bgmTimer=null;}
};
