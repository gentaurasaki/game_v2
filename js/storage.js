const KidsStorage={
  key:'kids_media_v03',
  get(){try{return JSON.parse(localStorage.getItem(this.key)||'[]')}catch(e){return[]}},
  save(a){localStorage.setItem(this.key,JSON.stringify(a))},
  async add(file,word='しゃしん'){const image=await this.compress(file);const item={id:'m_'+Date.now()+'_'+Math.random().toString(36).slice(2),word:word||'しゃしん',image};const a=this.get();a.push(item);this.save(a);return item},
  rename(id,word){const a=this.get();const it=a.find(x=>x.id===id);if(it){it.word=word||it.word;this.save(a)}},
  remove(id){this.save(this.get().filter(x=>x.id!==id));['puzzle_use_v03','hira_use_v03','mog_use_v03'].forEach(k=>{try{localStorage.setItem(k,JSON.stringify(JSON.parse(localStorage.getItem(k)||'[]').filter(x=>x!==id)))}catch(e){}});if(localStorage.getItem('mog_correct_v03')===id)localStorage.removeItem('mog_correct_v03')},
  compress(file,size=180,q=.7){return new Promise(res=>{const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=size;c.height=size;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);const sc=Math.max(size/img.width,size/img.height),w=img.width*sc,h=img.height*sc;ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h);res(c.toDataURL('image/jpeg',q))};img.src=e.target.result};r.readAsDataURL(file)})},
  speak(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='ja-JP';u.rate=.9;u.pitch=1.1;speechSynthesis.speak(u)}catch(e){}},
  shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a},
  ids(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}},
  setIds(k,a){localStorage.setItem(k,JSON.stringify([...new Set(a)]))},
  esc(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
};