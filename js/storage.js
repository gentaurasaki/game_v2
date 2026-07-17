const KidsStorage={
  mediaKey:'kids_media_v01',
  getMedia(){
    try{return JSON.parse(localStorage.getItem(this.mediaKey)||'[]');}catch(e){return[];}
  },
  saveMedia(list){localStorage.setItem(this.mediaKey,JSON.stringify(list));},
  async compressImage(file,size=180,quality=.7){
    return new Promise(resolve=>{
      const reader=new FileReader();
      reader.onload=ev=>{
        const img=new Image();
        img.onload=()=>{
          const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
          const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);
          const sc=Math.max(size/img.width,size/img.height),w=img.width*sc,h=img.height*sc;
          ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h);
          resolve(canvas.toDataURL('image/jpeg',quality));
        };
        img.src=ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  },
  speak(text){
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.lang='ja-JP';u.rate=.9;u.pitch=1.1;
      speechSynthesis.speak(u);
    }catch(e){}
  },
  shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
};
