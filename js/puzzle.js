const PuzzleApp={
  inited:false,score:0,COLS:3,ROWS:3,PSIZE:80,boardPieces:[],pieces:[],sourceCanvas:null,
  presets:[
    {id:'zou',name:'ぞう',emoji:'🐘',bg:'#e3f2fd'},
    {id:'panda',name:'ぱんだ',emoji:'🐼',bg:'#f3e5f5'},
    {id:'ari',name:'あり',emoji:'🐜',bg:'#fff8e1'},
    {id:'chou',name:'ちょう',emoji:'🦋',bg:'#fce4ec'},
    {id:'hoshi',name:'ほし',emoji:'⭐',bg:'#fffde7'},
    {id:'rocket',name:'ろけっと',emoji:'🚀',bg:'#e8eaf6'}
  ],
  init(){if(this.inited){this.renderList();return;}this.inited=true;this.mount();this.renderList();},
  mount(){
    const root=document.getElementById('puzzle-screen');
    root.innerHTML=`
      <header class="app-header"><div class="top-line"><button class="back-btn" onclick="App.home()">←</button><h1>🧩 えあわせぱずる</h1></div><div class="small-info">えをえらんでね</div></header>
      <div id="puzzle-list" class="content-scroll"><div id="puzzle-grid" class="card-grid"></div></div>
      <div id="puzzle-play" style="display:none;flex:1;flex-direction:column;overflow:hidden;">
        <header class="app-header"><div class="top-line"><button class="back-btn" onclick="PuzzleApp.closePlay()">←</button><h1 id="puzzle-title">ぱずる</h1><div>⭐ <span id="puzzle-score">0</span></div></div></header>
        <div class="puzzle-board-wrap"><canvas id="puzzle-board"></canvas></div>
        <div class="tray-wrap"><div id="puzzle-tray"></div></div>
      </div>
      <div id="puzzle-clear" class="overlay"><h2>やったー！🎉</h2><p id="puzzle-clear-msg"></p><button class="main-btn" onclick="PuzzleApp.next()">つぎ</button><button class="sub-btn" onclick="PuzzleApp.closePlay()">もどる</button></div>
    `;
  },
  renderList(){
    document.getElementById('puzzle-list').style.display='block';document.getElementById('puzzle-play').style.display='none';
    const grid=document.getElementById('puzzle-grid');grid.innerHTML='';
    this.presets.forEach(p=>{
      const card=document.createElement('button');card.className='item-card';card.onclick=()=>this.startPreset(p);
      const c=document.createElement('canvas');c.width=160;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle=p.bg;ctx.fillRect(0,0,160,160);ctx.font='92px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.emoji,80,84);
      card.appendChild(c);card.insertAdjacentHTML('beforeend',`<div class="item-label">${p.name}</div>`);grid.appendChild(card);
    });
  },
  startPreset(p){this.current=p;const sc=document.createElement('canvas');sc.width=360;sc.height=360;const ctx=sc.getContext('2d');ctx.fillStyle=p.bg;ctx.fillRect(0,0,360,360);ctx.font='210px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.emoji,180,190);this.openPlay(p.name,sc);},
  openPlay(name,srcCanvas){
    document.getElementById('puzzle-list').style.display='none';const play=document.getElementById('puzzle-play');play.style.display='flex';
    document.getElementById('puzzle-title').textContent=name+'のぱずる';document.getElementById('puzzle-score').textContent=this.score;
    this.sourceCanvas=srcCanvas;const vw=window.innerWidth;this.PSIZE=Math.floor((Math.min(vw,400)-20)/this.COLS*.9);
    const board=document.getElementById('puzzle-board');board.width=this.PSIZE*this.COLS;board.height=this.PSIZE*this.ROWS;this.board=board;this.ctx=board.getContext('2d');
    this.boardPieces=[];this.pieces=[];for(let r=0;r<this.ROWS;r++)for(let c=0;c<this.COLS;c++){this.boardPieces.push({c,r,filled:false});this.pieces.push({c,r});}
    KidsStorage.shuffle(this.pieces);const tray=document.getElementById('puzzle-tray');tray.innerHTML='';const ts=Math.floor(this.PSIZE*.8);
    this.pieces.forEach(p=>{const pc=document.createElement('canvas');pc.width=ts;pc.height=ts;pc.className='tray-piece';const pctx=pc.getContext('2d');const sw=srcCanvas.width/this.COLS,sh=srcCanvas.height/this.ROWS;pctx.drawImage(srcCanvas,p.c*sw,p.r*sh,sw,sh,0,0,ts,ts);pc.dataset.c=p.c;pc.dataset.r=p.r;this.addDrag(pc,ts);tray.appendChild(pc);});
    this.drawBoard();
  },
  drawBoard(){const ctx=this.ctx,PS=this.PSIZE,sw=this.sourceCanvas.width/this.COLS,sh=this.sourceCanvas.height/this.ROWS;ctx.clearRect(0,0,this.board.width,this.board.height);for(let r=0;r<this.ROWS;r++)for(let c=0;c<this.COLS;c++){const bp=this.boardPieces[r*this.COLS+c];if(bp.filled){ctx.drawImage(this.sourceCanvas,c*sw,r*sh,sw,sh,c*PS,r*PS,PS,PS);}else{ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(c*PS+2,r*PS+2,PS-4,PS-4);ctx.strokeStyle='rgba(255,112,67,.55)';ctx.lineWidth=2;ctx.strokeRect(c*PS+2,r*PS+2,PS-4,PS-4);ctx.fillStyle='rgba(255,112,67,.4)';ctx.font=`${PS*.38}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('?',c*PS+PS/2,r*PS+PS/2);}}},
  addDrag(pc,size){let clone=null;const xy=e=>e.touches?{x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY};const pos=(x,y)=>{clone.style.left=(x-size/2)+'px';clone.style.top=(y-size/2)+'px';};const start=e=>{e.preventDefault();const p=xy(e);clone=pc.cloneNode(true);clone.style.cssText=`position:fixed;z-index:999;pointer-events:none;width:${size}px;height:${size}px;opacity:.92`;pos(p.x,p.y);document.body.appendChild(clone);};const move=e=>{if(!clone)return;e.preventDefault();const p=xy(e);pos(p.x,p.y);};const end=e=>{if(!clone)return;e.preventDefault();clone.remove();clone=null;const p=e.changedTouches?{x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}:{x:e.clientX,y:e.clientY};const rect=this.board.getBoundingClientRect(),scale=this.board.width/rect.width,x=(p.x-rect.left)*scale,y=(p.y-rect.top)*scale;if(x>=0&&y>=0&&x<this.board.width&&y<this.board.height){const tc=Math.floor(x/this.PSIZE),tr=Math.floor(y/this.PSIZE),c=+pc.dataset.c,r=+pc.dataset.r;if(tc===c&&tr===r&&!this.boardPieces[tr*this.COLS+tc].filled){this.boardPieces[tr*this.COLS+tc].filled=true;this.drawBoard();pc.remove();this.checkComplete();}else{pc.style.transform='translateX(-8px)';setTimeout(()=>pc.style.transform='',180);}}};pc.addEventListener('touchstart',start,{passive:false});pc.addEventListener('touchmove',move,{passive:false});pc.addEventListener('touchend',end,{passive:false});pc.addEventListener('mousedown',start);document.addEventListener('mousemove',move);document.addEventListener('mouseup',end);},
  checkComplete(){if(!this.boardPieces.every(p=>p.filled))return;this.score+=10;document.getElementById('puzzle-score').textContent=this.score;document.getElementById('puzzle-clear-msg').textContent=`+10てん！ ごうけい ${this.score}てん`;document.getElementById('puzzle-clear').classList.add('show');KidsStorage.speak('できた');},
  next(){document.getElementById('puzzle-clear').classList.remove('show');const i=(this.presets.indexOf(this.current)+1)%this.presets.length;this.startPreset(this.presets[i]);},
  closePlay(){document.getElementById('puzzle-clear').classList.remove('show');this.renderList();}
};
