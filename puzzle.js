const KidsStorage={
  mediaKey:'kids_media_v02',
  getMedia(){try{return JSON.parse(localStorage.getItem(this.mediaKey)||'[]')}catch(e){return[]}},
  saveMedia(list){localStorage.setItem(this.mediaKey,JSON.stringify(list))},
  async addMediaFromFile(file,word='しゃしん'){
    const image=await this.compressImage(file,180,.7);
    const item={id:'media_'+Date.now()+'_'+Math.random().toString(36).slice(2),word:word||'しゃしん',image};
    const list=this.getMedia();list.push(item);this.saveMedia(list);return item;
  },
  updateMediaWord(id,word){const list=this.getMedia();const it=list.find(x=>x.id===id);if(it){it.word=word||it.word;this.saveMedia(list)}},
  removeMedia(id){this.saveMedia(this.getMedia().filter(x=>x.id!==id))},
  async compressImage(file,size=180,quality=.7){return new Promise(resolve=>{const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=size;c.height=size;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);const sc=Math.max(size/img.width,size/img.height),w=img.width*sc,h=img.height*sc;ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h);resolve(c.toDataURL('image/jpeg',quality))};img.src=e.target.result};r.readAsDataURL(file)})},
  speak(text){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=.9;u.pitch=1.1;speechSynthesis.speak(u)}catch(e){}},
  shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a},
  renderMediaList(container,options={}){
    const list=this.getMedia();container.innerHTML='';
    if(!list.length){container.innerHTML='<p class="tiny">まだしゃしんがありません</p>';return}
    list.forEach(item=>{
      const card=document.createElement('div');card.className='media-card';
      if(options.isSelected?.(item))card.classList.add('selected');
      if(options.isCorrect?.(item))card.classList.add('correct');
      card.innerHTML=`<img src="${item.image}"><div class="name">${item.word}</div>`;
      if(options.mode==='radio'){
        const b=document.createElement('button');b.className='main-btn';b.style.marginTop='6px';b.textContent=options.isCorrect?.(item)?'せいかい':'これをせいかい';b.onclick=()=>options.onCorrect?.(item);card.appendChild(b);
      }
      if(options.mode==='checkbox'){
        const lab=document.createElement('label');lab.style.display='block';lab.style.marginTop='6px';lab.innerHTML=`<input type="checkbox" ${options.isSelected?.(item)?'checked':''}> つかう`;lab.querySelector('input').onchange=e=>options.onToggle?.(item,e.target.checked);card.appendChild(lab);
      }
      if(options.mode==='addHiragana'){
        const inp=document.createElement('input');inp.type='text';inp.value=item.word;inp.style.width='100%';inp.style.marginTop='6px';inp.style.fontSize='14px';inp.style.border='1px solid #ff7043';inp.style.borderRadius='8px';inp.style.padding='5px';
        const btn=document.createElement('button');btn.className='main-btn';btn.style.marginTop='6px';btn.textContent='このえをつかう';btn.onclick=()=>options.onAdd?.(item,inp.value.trim());card.appendChild(inp);card.appendChild(btn);
      }
      if(options.allowDelete){const del=document.createElement('button');del.className='sub-btn';del.style.marginTop='6px';del.textContent='けす';del.onclick=()=>{this.removeMedia(item.id);options.onDelete?.()};card.appendChild(del)}
      container.appendChild(card);
    })
  }
};
