/* =================================================================
   MOTO24 MODULES (แยกไฟล์) — เป้ารายวัน + รายงานเทียบดิว + การ์ดไลน์
   โค้ดชุดเดียวกับ index.html เดือนกันยายน · เรียกด้วย <script src>
   ================================================================= */
/* ================= โมดูล "เป้ารายวัน" (ตรงดิว+3) — เพิ่มใหม่ ไม่แตะโค้ดเดิม ================= */
(function(){
  function ready(){return typeof renderAll==='function'&&typeof renderNav==='function'&&typeof CUST!=='undefined'&&typeof DATA!=='undefined'&&typeof role!=='undefined';}
  if(ready()){boot();}else{var _t=setInterval(function(){if(ready()){clearInterval(_t);boot();}},80);setTimeout(function(){try{clearInterval(_t);}catch(e){}},9000);}

  function boot(){
    if(window.__dkInit)return; window.__dkInit=true;
    var DK={zone:'all',type:'all',br:'all'};
    var monTH=['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    var THS='padding:7px 8px;text-align:left;font-size:11px;font-weight:700';
    var TDS='padding:8px;font-size:12px';

    function money(n){try{return fmt(n||0);}catch(e){return (n||0).toLocaleString();}}
    function P(a,b){return b?((a/b)*100).toFixed(2)+'%':'0.00%';}
    function pdt(s){if(!s)return 0;s=''+s;var p=s.split('/');if(p.length===3)return (+p[2])*10000+(+p[1])*100+(+p[0]);var d=s.split('-');if(d.length===3)return (+d[0])*10000+(+d[1])*100+(+d[2]);return 0;}
    function dcount(x){try{return dailyCounted(x);}catch(e){return (x.pd>0);}}
    function brName(c){var b=DATA.filter(function(x){return x.code===c;})[0];return b?b.name:c;}
    function period(){var pr=(typeof SYNC!=='undefined'&&SYNC.period)||'2569-09';var pp=pr.split('-');var by=parseInt(pp[0])||2569,mon=parseInt(pp[1])||9,ce=by-543;var ld=new Date(ce,mon,0).getDate();return{by:by,mon:mon,ce:ce,ld:ld};}
    function scope(){
      var isBranch=(role==='branch'),zoneRole=(role.charAt(0)==='z'?parseInt(role.slice(1)):0),codes;
      if(isBranch){codes=DATA[curBranch]?[DATA[curBranch].code]:[];}
      else{codes=DATA.filter(function(b){
        if(zoneRole&&b.zone!==zoneRole)return false;
        if(DK.zone!=='all'&&b.zone!==parseInt(DK.zone))return false;
        if(DK.type!=='all'&&b.type!==DK.type)return false;
        if(DK.br!=='all'&&b.code!==DK.br)return false;return true;
      }).map(function(b){return b.code;});}
      return{isBranch:isBranch,zoneRole:zoneRole,codes:codes};
    }
    function build(){
      var sc=scope(),pe=period(),perYM=pe.ce*100+pe.mon;
      var recs=CUST.filter(function(x){return sc.codes.indexOf(x.s)>=0&&x.amType==='1';});
      var days={};for(var i=1;i<=pe.ld;i++)days[i]={d:i,goal:0,on:0,late:0,owed:0,list:[]};
      var flat=[];
      recs.forEach(function(x){
        var dn=pdt(x.du),dday=dn?dn%100:1;if(dday<1)dday=1;if(dday>pe.ld)dday=pe.ld;
        var deadline=Math.min(dday+3,pe.ld),pd=pdt(x.pdate),dueYM=dn?Math.floor(dn/100):0,payYM=pd?Math.floor(pd/100):0,paidNow=(payYM===perYM),st;
        if(!dcount(x))st='owed';else if(dueYM>perYM)st='done';else if(paidNow)st=((pd%100)<=deadline)?'done':'late';else st='done';
        var o={x:x,status:st,d:dday};days[dday].goal++;days[dday].list.push(o);flat.push(o);
        if(st==='done')days[dday].on++;else if(st==='late')days[dday].late++;else days[dday].owed++;
      });
      return{sc:sc,pe:pe,recs:recs,days:days,flat:flat};
    }
    function overdue(x){var dn=pdt(x.du);if(dn){var dd=new Date(Math.floor(dn/10000),Math.floor((dn%10000)/100)-1,dn%100);var o=Math.floor((new Date()-dd)/86400000);if(o>0)return o;}return x.la||0;}
    function _owOver(f,pe){var dn=pdt(f.x.du);if(!dn)return false;var dday=dn%100;if(dday<1)dday=1;if(dday>pe.ld)dday=pe.ld;var deadline=Math.min(dday+3,pe.ld);var _t=new Date(),tn=_t.getFullYear()*10000+(_t.getMonth()+1)*100+_t.getDate();return (pe.ce*10000+pe.mon*100+deadline)<tn;}

    function renderDayPage(){
      var B=build(),pe=B.pe,g=B.recs.length,on=0,la=0,owed=0;
      for(var i=1;i<=pe.ld;i++){on+=B.days[i].on;la+=B.days[i].late;owed+=B.days[i].owed;}
      var over=0,notdue=0;B.flat.forEach(function(f){if(f.status!=='owed')return;if(_owOver(f,pe))over++;else notdue++;});
      var head='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><div class="hd"><b>🎯 เป้ารายวัน · เก็บให้ตรงดิว + 3 วัน</b></div><span class="chip ci">'+g+' ราย</span></div>'
        +'<div style="font-size:12px;color:var(--muted);margin-bottom:12px">รอบ: <b>'+(monTH[pe.mon]||'')+pe.by+'</b> · '+scopeLabel(B)+'</div>';
      return '<div class="wrap"><div class="card">'+head+filterBar(B)+kpis(g,on,la,owed,over,notdue)+gauges(g,on,la)+calendar(B)+footNote()+'</div></div>';
    }
    function scopeLabel(B){if(B.sc.isBranch)return 'สาขา: '+(DATA[curBranch]?'<b style="color:var(--brand)">'+DATA[curBranch].name+'</b>':'-');if(DK.br!=='all')return 'สาขา: <b style="color:var(--brand)">'+brName(DK.br)+'</b>';if(B.sc.zoneRole)return '<b style="color:var(--brand)">เขต '+B.sc.zoneRole+'</b>';if(DK.zone!=='all')return '<b style="color:var(--brand)">เขต '+DK.zone+'</b>';return '<b style="color:var(--brand)">ทุกสาขา ('+B.sc.codes.length+' สาขา)</b>';}
    function filterBar(B){
      if(B.sc.isBranch)return '';
      var zr=B.sc.zoneRole,ss='font-size:12px;padding:4px 8px;border-radius:7px;border:1px solid var(--line)';
      var z=['all','1','2','3'].map(function(v){return '<option value="'+v+'"'+(DK.zone===v?' selected':'')+'>'+(v==='all'?'ทุกเขต':'เขต '+v)+'</option>';}).join('');
      var t=[['all','ทุกประเภท'],['new','รถใหม่'],['used','รถมือสอง']].map(function(v){return '<option value="'+v[0]+'"'+(DK.type===v[0]?' selected':'')+'>'+v[1]+'</option>';}).join('');
      var br='<option value="all">— ทุกสาขา —</option>'+DATA.filter(function(b){return !zr||b.zone===zr;}).slice().sort(function(a,b){return parseInt(a.code)-parseInt(b.code);}).map(function(b){return '<option value="'+b.code+'"'+(DK.br===b.code?' selected':'')+'>'+b.name+'</option>';}).join('');
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin-bottom:14px"><span style="font-size:12px;font-weight:600;color:var(--muted)">กรองดู:</span>'
        +(zr?'<span style="font-size:12px;color:var(--brand);font-weight:600;background:#eef;padding:4px 10px;border-radius:7px">🔒 เขต '+zr+'</span>':'<select style="'+ss+'" onchange="dkSet(\'zone\',this.value)">'+z+'</select>')
        +'<select style="'+ss+'" onchange="dkSet(\'type\',this.value)">'+t+'</select>'
        +'<select style="'+ss+'" onchange="dkSet(\'br\',this.value)">'+br+'</select></div>';
    }
    function kc(k,ic,lb,num,sub,w,act){var C={k0:'#2A2D8F',k1:'#15803d',k2:'#7c3aed',k3:'#e0483a'},BG={k0:'#e8e9f8',k1:'#e4f6ec',k2:'#f2ecfb',k3:'#fde4e2'};
      return '<div onclick="dkList(\''+act+'\')" style="cursor:pointer;background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden"><div style="height:5px;background:'+C[k]+'"></div><div style="padding:13px 15px">'
        +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><div style="width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;background:'+BG[k]+'">'+ic+'</div><div style="font-size:12.5px;color:#4a4f66;font-weight:600">'+lb+'</div></div>'
        +'<div style="font-weight:800;font-size:30px;color:'+C[k]+'">'+money(num)+(sub?'<span style="font-size:12px;color:#9aa0b5"> · '+sub+'</span>':'<span style="font-size:12px;color:#9aa0b5"> ราย</span>')+'</div>'
        +'<div style="height:5px;border-radius:4px;background:#eef0f5;overflow:hidden;margin-top:7px"><div style="height:100%;width:'+w+'%;background:'+C[k]+'"></div></div>'
        +'<div style="text-align:right;font-size:11px;color:#5b4bcc;font-weight:700;margin-top:6px">ดูรายชื่อ ›</div></div></div>';}
    function kpis(g,on,la,owed,over,notdue){return '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:13px">'
      +kc('k0','🎯','เป้าทั้งเดือน',g,'',100,'all')+kc('k1','✅','ตรงดิว',on,P(on,g),g?on/g*100:0,'ontime')
      +kc('k2','⏰','ชำระหลังดิว',la,P(la,g),g?la/g*100:0,'late')+kcOwed(g,owed,over,notdue)+'</div>';}
    function kcOwed(g,owed,over,notdue){var C='#e0483a',BG='#fde4e2',w=g?owed/g*100:0;
      return '<div style="background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden"><div style="height:5px;background:'+C+'"></div><div style="padding:13px 15px">'
        +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><div style="width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;background:'+BG+'">❌</div><div style="font-size:12.5px;color:#4a4f66;font-weight:600">ยังค้าง</div></div>'
        +'<div style="font-weight:800;font-size:30px;color:'+C+'">'+money(owed)+'<span style="font-size:12px;color:#9aa0b5"> · '+P(owed,g)+'</span></div>'
        +'<div style="height:5px;border-radius:4px;background:#eef0f5;overflow:hidden;margin-top:7px"><div style="height:100%;width:'+w+'%;background:'+C+'"></div></div>'
        +'<div style="margin-top:8px;font-size:12px;display:flex;gap:7px;align-items:center;flex-wrap:wrap">'
        +'<span onclick="dkList(\'over\')" style="color:#e0483a;font-weight:600;cursor:pointer;text-decoration:underline;text-decoration-color:#f3b0a6;text-underline-offset:2px">⚠️ เลยดิว <b style="font-weight:800">'+money(over)+'</b> ราย</span>'
        +'<span style="color:#c9cdd6">·</span>'
        +'<span onclick="dkList(\'notdue\')" style="color:#64748b;font-weight:600;cursor:pointer;text-decoration:underline;text-decoration-color:#cfd5df;text-underline-offset:2px">⏳ ไม่ถึงดิว <b style="font-weight:800">'+money(notdue)+'</b> ราย</span>'
        +'</div></div></div>';}
    function gauges(g,on,la){return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-bottom:14px">'
      +'<div style="border-radius:12px;padding:12px 15px;color:#fff;background:linear-gradient(120deg,#15803d,#1ca34f)"><div style="font-size:12px;opacity:.92;font-weight:600">① %ตรงดิวจริง (ภายในดิว+3)</div><div style="font-size:28px;font-weight:800;margin-top:2px">'+P(on,g)+'<span style="font-size:12px;opacity:.85"> · '+on+'/'+g+'</span></div></div>'
      +'<div style="border-radius:12px;padding:12px 15px;color:#fff;background:linear-gradient(120deg,#2A2D8F,#4548b8)"><div style="font-size:12px;opacity:.92;font-weight:600">② %รวมในเดือน (ตรงดิว+หลังดิว)</div><div style="font-size:28px;font-weight:800;margin-top:2px">'+P(on+la,g)+'<span style="font-size:12px;opacity:.85"> · '+(on+la)+'/'+g+'</span></div></div></div>';}
    function footNote(){return '<div style="font-size:11.5px;color:#8a8f9e;margin-top:12px;line-height:1.6">✅ แตะช่องวัน = รายชื่อ 3 กลุ่ม · กล่องสรุปด้านบนกดดูได้ · ปุ่ม 📋 = ติดตามรายที่ยังเก็บไม่ได้ · วันยังไม่ถึงก็ขึ้นผลงานล่วงหน้าได้ · เปลี่ยนตัวกรองแล้วคำนวณใหม่ทั้งหน้า</div>';}
    function box(v,lb,c,bg){return '<div style="background:'+bg+';border-radius:7px;padding:4px 1px;text-align:center"><div style="font-weight:800;font-size:14px;color:'+c+'">'+v+'</div><div style="font-size:7.5px;color:#8790a8">'+lb+'</div></div>';}
    function cell(B,dd){
      var o=B.days[dd],pe=B.pe,g=o.goal,on=o.on,la=o.late,owed=o.owed,p=g?on/g*100:0;
      var t=new Date(),todayNum=t.getFullYear()*10000+(t.getMonth()+1)*100+t.getDate();
      var dl=Math.min(dd+3,pe.ld),dNum=pe.ce*10000+pe.mon*100+dd,dlNum=pe.ce*10000+pe.mon*100+dl;
      var stt=dlNum<todayNum?'past':(dNum>todayNum?'future':(dNum===todayNum?'today':'grace'));
      var tagbg,tagc;if(stt==='past'){if(p>=80){tagbg='#e9f7ef';tagc='#15803d';}else if(p>=50){tagbg='#fef7e0';tagc='#b45309';}else{tagbg='#fdecec';tagc='#e0483a';}}else if(stt==='future'){tagbg='#eef0f5';tagc='#7a80a0';}else{tagbg='#e7edfb';tagc='#3b57c7';}
      var thirdLb=stt==='past'?'❌ ค้าง':(stt==='future'?'⏳ ยังไม่ถึง':'⏳ รอเก็บ');
      var okLb=stt==='future'?'✅ จ่ายก่อน':'✅ ตรงดิว';
      var sub=(dd+3>pe.ld)?'ตัดสิ้นเดือน ('+pe.ld+')':(stt==='past'?'เดดไลน์ '+dl:(stt==='grace'||stt==='today'?'ยังมีเวลาถึง '+dl:'เดดไลน์ '+dl));
      var border=stt==='today'?'2px solid #eab308':(stt==='future'?'1px dashed #d4d9e6':'1px solid var(--line)');
      var bg=stt==='future'?'repeating-linear-gradient(135deg,#fbfcfe,#fbfcfe 8px,#f1f3fa 8px,#f1f3fa 16px)':(stt==='today'?'#fffdf7':'#fff');
      var foot=owed>0?'<button onclick="event.stopPropagation();dkFollow('+dd+')" style="width:100%;border:none;border-radius:8px;padding:6px 0;font-size:11px;font-weight:800;cursor:pointer;background:#fdecec;color:#e0483a">📋 ติดตาม '+owed+' ราย</button>':'<div style="text-align:center;font-size:11px;font-weight:800;color:#15803d;background:#e9f7ef;border-radius:8px;padding:6px 0">✓ เก็บครบแล้ว</div>';
      return '<div onclick="dkOpenDay('+dd+')" style="cursor:pointer;border:'+border+';border-radius:11px;background:'+bg+';overflow:hidden;min-height:150px;display:flex;flex-direction:column">'
        +'<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:6px 8px;border-bottom:1px solid #eef0f5">'
        +'<div><div style="font-weight:800;font-size:19px;color:var(--brand)">'+dd+(stt==='today'?' <span style="font-size:8px;background:#eab308;color:#3a2c00;padding:1px 5px;border-radius:8px;vertical-align:middle">วันนี้</span>':'')+'</div><div style="font-size:8px;color:#9aa0b5">'+sub+'</div></div>'
        +'<span style="font-size:10px;font-weight:800;padding:2px 7px;border-radius:12px;background:'+tagbg+';color:'+tagc+'">'+P(on,g)+'</span></div>'
        +'<div style="padding:6px 8px;display:flex;flex-direction:column;flex:1">'
        +'<div style="text-align:center;font-size:10px;color:#5b6070;margin-bottom:5px">🎯 เป้า <b style="font-size:16px;color:#20233c">'+g+'</b> ราย</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px">'+box(on,okLb,'#15803d','#eafaf0')+box(la,'⏰ หลังดิว','#7c3aed','#f4effc')+box(owed,thirdLb,stt==='past'?'#e0483a':'#6b74a3',stt==='past'?'#fdeeec':'#eef1fa')+'</div>'
        +'<div style="height:5px;border-radius:4px;background:#eef0f5;overflow:hidden;display:flex;margin-top:6px"><i style="height:100%;width:'+p+'%;background:#15803d"></i><i style="height:100%;width:'+(g?la/g*100:0)+'%;background:#7c3aed"></i></div>'
        +'<div style="margin-top:auto;padding-top:7px">'+foot+'</div></div></div>';
    }
    function calendar(B){
      var pe=B.pe,fd=new Date(pe.ce,pe.mon-1,1).getDay();
      var dow='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:6px">'+['อา','จ','อ','พ','พฤ','ศ','ส'].map(function(w,ix){return '<div style="text-align:center;font-size:11px;font-weight:700;color:'+(ix===0?'#d8382a':ix===6?'#2563eb':'#8790a8')+'">'+w+'</div>';}).join('')+'</div>';
      var cells='';for(var k=0;k<fd;k++)cells+='<div></div>';for(var d=1;d<=pe.ld;d++)cells+=cell(B,d);
      return '<div style="display:flex;justify-content:space-between;align-items:center;margin:2px 0 8px"><b style="font-size:14px;color:var(--brand)">‹ '+(monTH[pe.mon]||'')+pe.by+' ›</b><span style="font-size:11px;color:#5b4bcc;font-weight:600">👆 แตะช่องวัน = รายชื่อ 3 กลุ่ม · 📋 = ติดตามรายค้าง</span></div>'+dow+'<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">'+cells+'</div>';
    }

    function pill(st){if(st==='done')return '<span style="font-size:10px;font-weight:800;padding:2px 9px;border-radius:20px;background:#e4f6ec;color:#1a8a4e">ชำระตรงดิว</span>';if(st==='late')return '<span style="font-size:10px;font-weight:800;padding:2px 9px;border-radius:20px;background:#efe7fb;color:#7c3aed">ชำระหลังดิว</span>';return '<span style="font-size:10px;font-weight:800;padding:2px 9px;border-radius:20px;background:#fde3e1;color:#d8382a">ค้าง</span>';}
    function prow(o,i){var x=o.x;return '<tr style="border-bottom:1px solid #eef0f5"><td style="'+TDS+';text-align:center;color:#8790a8">'+(i+1)+'</td><td style="'+TDS+';font-weight:700">'+(x.n||'-')+'</td><td style="'+TDS+'">'+(x.tel||'-')+'</td><td style="'+TDS+'">'+(x.cno||'-')+'</td><td style="'+TDS+';text-align:center">'+(x.pn||'-')+'</td><td style="'+TDS+';text-align:center">'+(x.du||'-')+'</td><td style="'+TDS+';text-align:center;color:#15803d;font-weight:600">'+(x.pdate||'—')+'</td><td style="'+TDS+';text-align:right;font-weight:700">'+money(x.f)+'</td><td style="'+TDS+'">'+pill(o.status)+'</td></tr>';}
    function imgTable(arr,color){if(!arr.length)return '<div style="text-align:center;color:#9aa0b5;font-size:12px;padding:14px">— ไม่มีรายการ —</div>';
      return '<table style="width:100%;border-collapse:collapse;margin-bottom:12px"><tr style="background:'+color+';color:#fff"><th style="'+THS+'">#</th><th style="'+THS+'">ชื่อลูกค้า</th><th style="'+THS+'">เบอร์โทร</th><th style="'+THS+'">เลขสัญญา</th><th style="'+THS+';text-align:center">งวด</th><th style="'+THS+';text-align:center">วันดิว</th><th style="'+THS+';text-align:center">วันรับชำระ</th><th style="'+THS+';text-align:right">ค่างวด</th><th style="'+THS+'">สถานะ</th></tr>'+arr.map(prow).join('')+'</table>';}
    function mh(color,title,sub){return '<div style="background:'+color+';color:#fff;padding:12px 18px;display:flex;align-items:center;gap:10px"><div><div style="font-size:15px;font-weight:800">'+title+'</div>'+(sub?'<div style="font-size:10.5px;opacity:.9;margin-top:2px">'+sub+'</div>':'')+'</div><div onclick="dkClose()" style="margin-left:auto;font-size:20px;cursor:pointer">✕</div></div>';}
    function gh(label,n,color,extra){return '<div style="display:flex;align-items:center;gap:8px;margin:8px 0 6px;font-weight:800;font-size:13px;color:'+color+'">'+label+' <span style="font-size:11px;background:rgba(0,0,0,.06);padding:2px 10px;border-radius:20px">'+n+' ราย</span>'+(extra||'')+'</div>';}
    function flchips(){var a=[DK.br!=='all'?brName(DK.br):'ทุกสาขา',DK.zone!=='all'?'เขต '+DK.zone:'ทุกเขต',DK.type==='new'?'รถใหม่':(DK.type==='used'?'รถมือสอง':'ทุกประเภท')];return a.map(function(s){return '<span style="background:#f4f5fb;border-radius:20px;padding:3px 10px;font-weight:700;color:#5b6070;margin-right:5px">'+s+'</span>';}).join('');}
    function bodyWrap(h){return '<div style="padding:12px 15px;max-height:66vh;overflow:auto">'+h+'</div>';}

    function lastFollow(x){var cl=(typeof _flClass==='function')?_flClass(x):{t:'-',bg:'#eef0f5',c:'#8790a8'};return '<span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;white-space:nowrap;background:'+cl.bg+';color:'+cl.c+'">'+cl.t+'</span>';}
    function apptCell(x){return (typeof _flAppt==='function')?_flAppt(x):'<span style="color:#9aa0b5">—</span>';}
    function trendCell(x){var tr=(typeof _flTrend==='function')?_flTrend(x):{t:'-',bg:'#eef0f5',c:'#8790a8'};return '<span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:'+tr.bg+';color:'+tr.c+'">'+tr.t+'</span>';}
    function timeline(x){var logs=(x.log||[]);if(!logs.length)return '<div style="font-size:11.5px;color:#8a8f9e;padding:4px 2px;text-align:left">ยังไม่มีการบันทึกนัด/ติดตามในระบบ — น้องสาขาบันทึกได้ที่ขั้นตอน "ติดตาม & ปิดจบ"</div>';var h='<div style="font-size:11.5px;font-weight:800;color:#2a2d8f;margin-bottom:7px;text-align:left">📋 ประวัติการติดตาม · '+(x.n||'')+' <span style="font-weight:400;color:#9aa0b5">(จากระบบปกติ)</span></div>';for(var k=logs.length-1;k>=0;k--){var e=logs[k];if(!e)continue;var _rt=String(e.r||''),_dt='',_dl=_rt,_mi=_rt.indexOf("บันทึกวันที่");if(_mi>=0){_dt=_rt.slice(_mi+"บันทึกวันที่".length).trim();_dl=_rt.slice(0,_mi).replace(/[·\s]+$/,'');}var _hd=_dt||(e.t||'บันทึก');var _bd=(e.t||'')+(_dl?(' → '+_dl):'');var col=/ไม่ได้|ผิดนัด|ยึด/.test(String(e.t)+_rt)?'#c0392b':/นัด|รับปาก|ชำระ|จ่าย/.test(String(e.t)+_rt)?'#15803d':'#2563eb';h+='<div style="font-size:11.5px;padding:4px 0 4px 13px;border-left:2px solid #dfe3f0;margin-left:5px;position:relative;color:#444;text-align:left"><span style="position:absolute;left:-6px;top:6px;width:9px;height:9px;border-radius:50%;background:'+col+'"></span><b style="color:#222">'+_hd+'</b> — '+_bd+'</div>';}return h;}
    function frow(o,i){var x=o.x,id='dkf'+i;return '<tr onclick="dkTgl(\''+id+'\')" style="cursor:pointer;border-bottom:1px solid #eef0f5"><td style="'+TDS+';text-align:center;color:#8790a8">'+(i+1)+'</td><td style="'+TDS+';font-weight:700">'+(x.n||'-')+'<div style="font-size:9px;color:#9aa0b5;font-weight:400">'+(x.cno||'')+'</div></td><td style="'+TDS+';text-align:right;font-weight:800;color:#c0392b">'+money(x.f)+'</td><td style="'+TDS+';text-align:center;font-weight:700;color:#e0483a">'+(overdue(x)>0?overdue(x)+' วัน':'—')+'</td><td style="'+TDS+'">'+lastFollow(x)+'</td><td style="'+TDS+'">'+apptCell(x)+'</td><td style="'+TDS+'">'+trendCell(x)+'</td><td style="'+TDS+';color:#8790a8">▾</td></tr><tr id="'+id+'" style="display:none"><td></td><td colspan="7" style="background:#f7f8fd;padding:0"><div style="padding:9px 14px">'+timeline(x)+'</div></td></tr>';}

    window.dkList=function(act){
      var B=build(),on=B.flat.filter(function(f){return f.status==='done';}),la=B.flat.filter(function(f){return f.status==='late';}),cn=B.flat.filter(function(f){return f.status==='owed';});
      var head,body;
      if(act==='all'){head=mh('#2A2D8F','🎯 เป้าทั้งเดือน — ลูกหนี้ครบดิวทุกราย · '+B.flat.length+' ราย','รอบ '+(monTH[B.pe.mon]||'')+B.pe.by);
        body=gh('❌ ค้างชำระ',cn.length,'#e0483a')+imgTable(cn.slice(0,60),'#e0483a')+gh('⏰ ชำระหลังดิว',la.length,'#7c3aed')+imgTable(la.slice(0,60),'#7c3aed')+gh('✅ ชำระตรงดิว',on.length,'#15803d')+imgTable(on.slice(0,60),'#3aa564');}
      else if(act==='ontime'){head=mh('#2A2D8F','✅ ชำระตรงดิว · '+on.length+' ราย','');body=imgTable(on.slice(0,120),'#3aa564');}
      else if(act==='late'){head=mh('#2A2D8F','⏰ ชำระหลังดิว · '+la.length+' ราย','');body=imgTable(la.slice(0,120),'#7c3aed');}
      else if(act==='over'){var ov=cn.filter(function(f){return _owOver(f,B.pe);});head=mh('#c0392b','⚠️ เลยดิว–ยังไม่จ่าย · '+ov.length+' ราย','ยังไม่ชำระ + วันนี้เกินดิว+3 · เร่งด่วน');body=imgTable(ov.slice(0,120),'#e0483a');}
      else if(act==='notdue'){var nd=cn.filter(function(f){return !_owOver(f,B.pe);});head=mh('#6b74a3','⏳ ยังไม่ถึงดิว · '+nd.length+' ราย','ยังมีสิทธิ์จ่ายตรงดิว (ยังไม่เกินดิว+3)');body=imgTable(nd.slice(0,120),'#8a90c0');}
      else{head=mh('#c0392b','❌ ยังค้าง (ยังเก็บไม่ได้) · '+cn.length+' ราย','');body=imgTable(cn.slice(0,120),'#e0483a');}
      showModal(head+'<div style="padding:8px 16px;border-bottom:1px solid #eee;font-size:11px;color:#7a7f92">🔎 กรอง: '+flchips()+'</div>'+bodyWrap(body));
    };
    window.dkOpenDay=function(d){
      var B=build(),L=B.days[d].list,on=L.filter(function(o){return o.status==='done';}),la=L.filter(function(o){return o.status==='late';}),cn=L.filter(function(o){return o.status==='owed';}),pe=B.pe,dl=Math.min(d+3,pe.ld);
      var head=mh('#4b3fb0','🔎 รายชื่อลูกหนี้ · ดิว '+d+' '+(monTH[pe.mon]||'')+' (เดดไลน์ '+dl+') — '+L.length+' ราย','① %ตรงดิว '+P(on.length,L.length)+' · ② %รวม '+P(on.length+la.length,L.length));
      var ex=cn.length?'<span onclick="dkFollow('+d+')" style="margin-left:auto;background:#5b4bcc;color:#fff;border-radius:7px;padding:4px 11px;font-size:11px;font-weight:700;cursor:pointer">📋 ดูการติดตาม '+cn.length+' ราย</span>':'';
      var b=gh('❌ ยังเก็บไม่ได้',cn.length,'#e0483a',ex)+imgTable(cn,'#e0483a')+gh('⏰ ชำระหลังดิว',la.length,'#7c3aed')+imgTable(la,'#7c3aed')+gh('✅ ชำระตรงดิว',on.length,'#15803d')+imgTable(on,'#3aa564');
      showModal(head+bodyWrap(b));
    };
    window.dkFollow=function(d){
      var B=build(),pe=B.pe,L=B.days[d].list.filter(function(o){return o.status==='owed';}),dl=Math.min(d+3,pe.ld);
      var head=mh('#4b3fb0','📋 ผลการติดตาม · ดิว '+d+' '+(monTH[pe.mon]||'')+' — รายที่ยังเก็บไม่ได้ ('+L.length+' ราย)','ดึงจากการบันทึกในระบบปกติ · แสดงอย่างเดียว');
      var rows=L.length?L.map(frow).join(''):'<tr><td colspan="8" style="text-align:center;color:#9aa0b5;padding:16px">— ไม่มีรายค้าง —</td></tr>';
      var b='<div style="background:#fff7e6;border:1px solid #f0d99a;border-radius:9px;padding:7px 12px;font-size:11px;color:#8a6d1e;margin-bottom:10px">⚠️ อ่านอย่างเดียว — บันทึก/แก้ไข ทำที่ขั้นตอน "ติดตาม & ปิดจบ" ในระบบปกติ · กดแถวดูไทม์ไลน์</div>'
        +'<table style="width:100%;border-collapse:collapse"><tr style="background:#e0483a;color:#fff"><th style="'+THS+'">#</th><th style="'+THS+'">ลูกค้า</th><th style="'+THS+';text-align:right">ยอดค้าง</th><th style="'+THS+'">เลยดิว</th><th style="'+THS+'">การติดตามล่าสุด</th><th style="'+THS+'">นัดชำระ</th><th style="'+THS+'">แนวโน้ม</th><th style="'+THS+'"></th></tr>'+rows+'</table>';
      showModal(head+bodyWrap(b));
    };
    window.dkTgl=function(id){var e=document.getElementById(id);if(e)e.style.display=e.style.display==='none'?'':'none';};
    window.dkSet=function(k,v){DK[k]=v;if(k!=='br')DK.br='all';var c=document.getElementById('content');if(c)c.innerHTML=renderDayPage();};
    window.dkClose=function(){var o=document.getElementById('dkOv');if(o)o.style.display='none';};

    function ensureOv(){var o=document.getElementById('dkOv');if(o)return o;o=document.createElement('div');o.id='dkOv';o.style.cssText='position:fixed;inset:0;background:rgba(20,22,45,.5);display:none;align-items:flex-start;justify-content:center;padding:24px 14px;z-index:99999;overflow:auto';o.innerHTML='<div id="dkMod" style="background:#fff;border-radius:14px;width:100%;max-width:960px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.3)"></div>';o.addEventListener('click',function(e){if(e.target===o)dkClose();});document.body.appendChild(o);return o;}
    function showModal(html){var o=ensureOv();document.getElementById('dkMod').innerHTML=html;o.style.display='flex';}

    /* ===== รายงานเทียบผลงาน ดิววัน vs ดิวเดือน (แทปใหม่) ===== */
    var CMP={zone:'all',type:'all',br:'all'};
    function cmpScope(){var isBranch=(role==='branch'),zr=(role.charAt(0)==='z'?parseInt(role.slice(1)):0);
      return DATA.filter(function(b){if(isBranch)return DATA[curBranch]&&b.code===DATA[curBranch].code;if(zr&&b.zone!==zr)return false;if(CMP.zone!=='all'&&b.zone!==parseInt(CMP.zone))return false;if(CMP.type!=='all'&&b.type!==CMP.type)return false;if(CMP.br!=='all'&&b.code!==CMP.br)return false;return true;});}
    function cmpStat(code){var pe=period(),perYM=pe.ce*100+pe.mon,g=0,dv=0,dm=0,over=0,notdue=0;var _t=new Date(),tn=_t.getFullYear()*10000+(_t.getMonth()+1)*100+_t.getDate();
      for(var i=0;i<CUST.length;i++){var x=CUST[i];if(x.s!==code||x.amType!=='1')continue;g++;
        var dn=pdt(x.du),dday=dn?dn%100:1;if(dday<1)dday=1;if(dday>pe.ld)dday=pe.ld;var deadline=Math.min(dday+3,pe.ld),pd=pdt(x.pdate),dueYM=dn?Math.floor(dn/100):0,payYM=pd?Math.floor(pd/100):0,paidNow=(payYM===perYM),st;
        if(!dcount(x))st='owed';else if(dueYM>perYM)st='done';else if(paidNow)st=((pd%100)<=deadline)?'done':'late';else st='done';
        if(st==='done'){dv++;dm++;}else if(st==='late'){dm++;}else{var ddl=pe.ce*10000+pe.mon*100+deadline;if(dn&&ddl<tn)over++;else notdue++;}}
      return{g:g,dv:dv,dm:dm,over:over,notdue:notdue};}
    function cmpGrp(label,z){var col=z===1?['#ececfb','#3b3fa0']:z===2?['#e7f5ee','#177245']:['#fdf0e3','#a2560f'];return '<tr><td colspan="9" style="font-family:Prompt,sans-serif;font-weight:700;font-size:12px;padding:6px 14px;text-align:left;background:'+col[0]+';color:'+col[1]+'">'+label+'</td></tr>';}
    function cmpBr(name,s){var rem=s.g-s.dm;
      return '<tr><td style="text-align:left;padding:7px 6px 7px 14px;border-bottom:1px solid #eef0f5;font-weight:600;color:#25293f;font-size:12px">'+name+'</td><td style="text-align:center;padding:7px 6px;border-bottom:1px solid #eef0f5">'+s.g+'</td>'
      +'<td style="text-align:center;padding:7px 6px;border-bottom:1px solid #eef0f5;background:#effaf3;border-left:2px solid #d7dbe8;font-family:Prompt,sans-serif;font-weight:700;color:#177245">'+s.dv+'</td><td style="text-align:center;padding:7px 6px;border-bottom:1px solid #eef0f5;background:#effaf3;font-family:Prompt,sans-serif;font-weight:800;color:#15803d">'+P(s.dv,s.g)+'</td>'
      +'<td style="text-align:center;padding:7px 6px;border-bottom:1px solid #eef0f5;background:#f1f3f7;border-left:2px solid #d7dbe8;font-family:Prompt,sans-serif;font-weight:700;color:#475569">'+s.dm+'</td><td style="text-align:center;padding:7px 6px;border-bottom:1px solid #eef0f5;background:#f1f3f7;font-family:Prompt,sans-serif;font-weight:800;color:#e0483a">'+P(s.dm,s.g)+'</td>'
      +'<td style="text-align:center;padding:7px 6px;border-bottom:1px solid #eef0f5;border-left:2px solid #d7dbe8;font-weight:600;color:#334155">'+rem+'</td>'
      +'<td style="text-align:center;padding:7px 6px;border-bottom:1px solid #eef0f5;background:#fdeeec;font-family:Prompt,sans-serif;font-weight:800;color:#c0392b">'+s.over+'</td>'
      +'<td style="text-align:center;padding:7px 6px;border-bottom:1px solid #eef0f5;background:#f3f5f9;font-family:Prompt,sans-serif;font-weight:700;color:#64748b">'+s.notdue+'</td></tr>';}
    function cmpSub(label,s){var rem=s.g-s.dm;return '<tr style="background:#f4f6fb;font-family:Prompt,sans-serif;font-weight:800"><td style="text-align:left;padding:7px 14px;border-top:1px solid #dfe3f0">'+label+'</td><td style="text-align:center;padding:7px 6px;border-top:1px solid #dfe3f0">'+s.g+'</td><td style="text-align:center;padding:7px 6px;border-top:1px solid #dfe3f0;color:#15803d">'+s.dv+'</td><td style="text-align:center;padding:7px 6px;border-top:1px solid #dfe3f0;color:#15803d">'+P(s.dv,s.g)+'</td><td style="text-align:center;padding:7px 6px;border-top:1px solid #dfe3f0;color:#475569">'+s.dm+'</td><td style="text-align:center;padding:7px 6px;border-top:1px solid #dfe3f0;color:#e0483a">'+P(s.dm,s.g)+'</td><td style="text-align:center;padding:7px 6px;border-top:1px solid #dfe3f0;color:#334155">'+rem+'</td><td style="text-align:center;padding:7px 6px;border-top:1px solid #dfe3f0;background:#fdeeec;color:#c0392b">'+s.over+'</td><td style="text-align:center;padding:7px 6px;border-top:1px solid #dfe3f0;color:#64748b">'+s.notdue+'</td></tr>';}
    function cmpTot(label,s){var rem=s.g-s.dm;return '<tr style="background:#2A2D8F;color:#fff;font-family:Prompt,sans-serif;font-weight:800"><td style="text-align:left;padding:8px 14px">'+label+'</td><td style="text-align:center;padding:8px 6px">'+s.g+'</td><td style="text-align:center;padding:8px 6px">'+s.dv+'</td><td style="text-align:center;padding:8px 6px">'+P(s.dv,s.g)+'</td><td style="text-align:center;padding:8px 6px">'+s.dm+'</td><td style="text-align:center;padding:8px 6px">'+P(s.dm,s.g)+'</td><td style="text-align:center;padding:8px 6px">'+rem+'</td><td style="text-align:center;padding:8px 6px;color:#ffd0c8">'+s.over+'</td><td style="text-align:center;padding:8px 6px;color:#cbd5e1">'+s.notdue+'</td></tr>';}
    window.cmpSet=function(k,v){CMP[k]=v;if(k!=='br')CMP.br='all';var c=document.getElementById('cmpBody');if(c)c.innerHTML=renderCmpReport();};
    window.openCmpReport=function(){var head='<div style="background:linear-gradient(120deg,#2A2D8F,#4548b8);color:#fff;padding:12px 18px;display:flex;align-items:center;gap:10px"><div style="font-size:16px;font-weight:800;font-family:Prompt,sans-serif">📊 รายงานเทียบผลงาน · ดิววัน ⚡ vs ดิวเดือน 📅</div><div onclick="openLineCard()" style="margin-left:auto;background:#0b8c3f;color:#fff;border-radius:8px;padding:5px 12px;font-size:12px;font-weight:700;cursor:pointer">📤 สร้างรูปส่งไลน์</div><div onclick="dkClose()" style="margin-left:8px;font-size:20px;cursor:pointer">✕</div></div>';showModal(head+'<div id="cmpBody" style="padding:14px 16px;max-height:72vh;overflow:auto">'+renderCmpReport()+'</div>');};
    function ensureLineStyle(){var old=document.getElementById('lcStyle');if(old)old.parentNode.removeChild(old);var s=document.createElement('style');s.id='lcStyle';s.innerHTML='#lineCard{width:552px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 12px 30px rgba(20,24,60,.15);border:1px solid #e6e8f2;font-family:"IBM Plex Sans Thai",sans-serif}#lineCard .lh1{background:linear-gradient(120deg,#33368f,#282b73);border-bottom:3px solid #F37117;padding:11px 16px;display:flex;align-items:center;gap:12px}#lineCard .lh1 .lt{font-family:"Prompt",sans-serif;font-weight:800;font-size:15px;color:#fff;line-height:1.15}#lineCard .lh1 .lt small{display:block;font-weight:400;font-size:11px;color:#fff;opacity:.85;font-family:"IBM Plex Sans Thai",sans-serif}#lineCard .lh1 .lr{margin-left:auto;flex:none;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.35);border-radius:10px;padding:6px 13px;text-align:right}#lineCard .lh1 .lr .k{font-size:9.5px;color:#c9cdf0}#lineCard .lh1 .lr .v{font-family:"Prompt",sans-serif;font-weight:800;font-size:21px;color:#ffd24a;line-height:1.05}#lineCard .lh1 .lr .v small{font-size:10px;color:#c9cdf0;font-weight:400}#lineCard .lbd{padding:15px 17px}#lineCard .lcmp{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:13px}#lineCard .lcmp .b{border-radius:11px;padding:12px 8px;text-align:center;border:1.5px solid}#lineCard .lcmp .n{background:#eef7f0;border-color:#bfe6cd}#lineCard .lcmp .o{background:#eef0f8;border-color:#cdd3ec}#lineCard .lcmp .rr{background:#fdecec;border-color:#f3cabf}#lineCard .lcmp .k{font-size:11.5px;color:#5b6070;font-weight:600}#lineCard .lcmp .v{font-family:"Prompt",sans-serif;font-weight:800;font-size:25px;margin-top:1px}#lineCard .lcmp .n .v{color:#15803d}#lineCard .lcmp .o .v{color:#2f327f}#lineCard .lcmp .rr .v{color:#e0483a}#lineCard .lcmp .s{font-size:10px;color:#9aa0b5}#lineCard .lzt{color:#5b6070;font-size:12.5px;padding:2px 2px 9px}#lineCard .lzt .dv{color:#15803d;font-weight:700}#lineCard .lzt .dd{color:#2f327f;font-weight:700}#lineCard table{width:100%;border-collapse:collapse}#lineCard th{background:#2f327f;color:#fff;font-size:11.5px;font-weight:700;padding:9px 6px;text-align:center}#lineCard th.l{text-align:left;padding-left:14px}#lineCard td{padding:9px 6px;text-align:center;font-size:13px;border-bottom:1px solid #eef0f5;color:#25293f}#lineCard tbody tr:nth-child(even) td{background:#fafbff}#lineCard td.l{text-align:left;padding-left:14px;font-weight:700}#lineCard .grp{border-left:1px solid #eef0f5}#lineCard .dv{color:#15803d;font-family:"Prompt",sans-serif;font-weight:800}#lineCard .dd{color:#2a2d45;font-family:"Prompt",sans-serif;font-weight:800}#lineCard .sl{color:#aeb4c6;margin:0 2px}#lineCard .mini{height:6px;background:#eef0f5;border-radius:3px;overflow:hidden;margin-top:3px}#lineCard .mini i{display:block;height:100%;background:#15803d;border-radius:3px}#lineCard .ov{color:#e0483a;font-family:"Prompt",sans-serif;font-weight:700}#lineCard tr.tot td{background:#f4f6fb;font-family:"Prompt",sans-serif;font-weight:800;border-top:1px solid #dfe3f0}#lineCard tr.tot .dv,#lineCard tr.tot .dd{color:#c98a1a}#lineCard .lfoot{color:#8a90a6;font-size:11px;text-align:center;padding:11px 4px 2px;line-height:1.5}#lineCard .lfoot .dv{color:#15803d;font-weight:700}#lineCard .lfoot .dd{color:#2f327f;font-weight:700}';document.head.appendChild(s);}
    function renderLineCard(){ensureLineStyle();var brs=cmpScope(),pe=period(),G=0,DV=0,DM=0,OV=0,zt={},zov={};
      brs.forEach(function(b){var s=cmpStat(b.code);G+=s.g;DV+=s.dv;DM+=s.dm;OV+=s.over;var k=b.zone+'_'+b.type;if(!zt[k])zt[k]={g:0,dv:0,dm:0};zt[k].g+=s.g;zt[k].dv+=s.dv;zt[k].dm+=s.dm;zov[b.zone]=(zov[b.zone]||0)+s.over;});
      function cell(z,tp){var s=zt[z+'_'+tp];if(!s||!s.g)return '<span style="color:#aeb4c6">—</span>';return '<span><span class="dv">'+(s.dv/s.g*100).toFixed(1)+'</span><span class="sl">/</span><span class="dd">'+(s.dm/s.g*100).toFixed(1)+'</span></span><div class="mini"><i style="width:'+(s.dv/s.g*100)+'%"></i></div>';}
      function tt(tp){var g=0,dv=0,dm=0;[1,2,3].forEach(function(z){var s=zt[z+'_'+tp];if(s){g+=s.g;dv+=s.dv;dm+=s.dm;}});return g?('<span class="dv">'+(dv/g*100).toFixed(1)+'</span><span class="sl">/</span><span class="dd">'+(dm/g*100).toFixed(1)+'</span>'):'—';}
      var mon=['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][pe.mon];
      var d=new Date(),ds=d.getDate()+' '+mon+' '+pe.by,ts=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
      var rows='';[1,2,3].forEach(function(z){rows+='<tr><td class="l">เขต '+z+'</td><td>'+cell(z,'new')+'</td><td class="grp">'+cell(z,'used')+'</td><td class="grp" style="color:#e0483a;font-weight:700;font-family:Prompt,sans-serif">'+(zov[z]||0).toLocaleString()+'</td></tr>';});
      rows+='<tr class="tot"><td class="l">รวมทุกเขต</td><td>'+tt('new')+'</td><td class="grp">'+tt('used')+'</td><td class="grp" style="color:#c98a1a">'+OV.toLocaleString()+'</td></tr>';
      return '<div id="lineCard">'
        +'<div class="lh1"><div style="background:#23266f;border:1.5px solid #4145a8;border-radius:11px;padding:6px 13px 7px;text-align:center;flex-shrink:0;font-family:Prompt,sans-serif"><div style="font-size:22px;font-weight:800;color:#fff;line-height:.92">โมโต<span style="color:#F37117">24</span></div><div style="display:flex;align-items:center;justify-content:center;gap:5px;margin-top:2px"><span style="width:12px;height:2px;background:#9aa0e0;border-radius:2px"></span><span style="font-size:9.5px;color:#fff;font-weight:600;white-space:nowrap">บริษัท โมโต24 จำกัด</span><span style="width:12px;height:2px;background:#9aa0e0;border-radius:2px"></span></div></div>'
        +'<div class="lt">เทียบผลเก็บหนี้ · ดิววัน vs ดิวเดือน<small>'+ds+' · อัปเดต '+ts+'</small></div>'
        +'<div class="lr"><div class="k">สาขาเก็บเอง</div><div class="v">'+G.toLocaleString()+'<small> ราย</small></div></div></div>'
        +'<div class="lbd">'
        +'<div class="lcmp"><div class="b n"><div class="k">⚡ ดิววัน</div><div class="v">'+P(DV,G)+'</div><div class="s">'+DV.toLocaleString()+' ราย</div></div><div class="b o"><div class="k">📅 ดิวเดือน</div><div class="v">'+P(DM,G)+'</div><div class="s">'+DM.toLocaleString()+' ราย</div></div><div class="b rr"><div class="k">⚠️ เลยดิว</div><div class="v">'+OV.toLocaleString()+'</div><div class="s">เร่ง!</div></div></div>'
        +'<div class="lzt">รายเขต × ประเภท · <span class="dv">ดิววัน</span> <span class="sl">/</span> <span class="dd">ดิวเดือน</span></div>'
        +'<table><tr><th class="l">เขต</th><th>🏍️ รถใหม่</th><th class="grp">🛵 รถมือสอง</th><th class="grp">⚠️ เลยดิว</th></tr>'+rows+'</table>'
        +'<div class="lfoot"><span class="dv">ดิววัน</span> = จ่ายภายในดิว+3 · <span class="dd">ดิวเดือน</span> = จ่ายได้ภายในสิ้นเดือน · ⚠️ เลยดิว-ยังไม่จ่าย '+OV.toLocaleString()+' ราย</div>'
        +'</div></div>';
    }
    function ensureH2C(cb){if(window.html2canvas){cb();return;}var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';s.onload=cb;s.onerror=function(){alert('โหลดตัวสร้างรูปไม่สำเร็จ — ใช้แคปหน้าจอแทนได้ครับ');};document.head.appendChild(s);}
    window.dkSaveLine=function(){var el=document.getElementById('lineCard');if(!el)return;ensureH2C(function(){html2canvas(el,{scale:2,backgroundColor:null}).then(function(c){var a=document.createElement('a');a.download='รายงานเทียบดิววัน.png';a.href=c.toDataURL('image/png');a.click();});});};
    window.openLineCard=function(){var head='<div style="background:linear-gradient(120deg,#0b8c3f,#065c29);color:#fff;padding:12px 18px;display:flex;align-items:center;gap:10px"><div style="font-size:15px;font-weight:800;font-family:Prompt,sans-serif">📤 รูปสรุปส่งไลน์กลุ่ม</div><div onclick="dkSaveLine()" style="margin-left:auto;background:#fff;color:#0b8c3f;border-radius:8px;padding:5px 12px;font-size:12px;font-weight:800;cursor:pointer">⬇️ บันทึกรูป PNG</div><div onclick="dkClose()" style="margin-left:8px;font-size:20px;cursor:pointer">✕</div></div>';showModal(head+'<div style="padding:16px;background:#e9ecf5;display:flex;justify-content:center;overflow:auto;max-height:74vh">'+renderLineCard()+'</div>');};
    function renderCmpReport(){
      var brs=cmpScope(),pe=period(),G=0,DV=0,DM=0,OV=0,ND=0,stat={};
      brs.forEach(function(b){var s=cmpStat(b.code);stat[b.code]=s;G+=s.g;DV+=s.dv;DM+=s.dm;OV+=s.over;ND+=s.notdue;});
      var gapAll=G?((DM-DV)/G*100):0;
      var rows='';[1,2,3].forEach(function(z){[['used','รถมือสอง'],['new','รถใหม่']].forEach(function(tp){
        var list=brs.filter(function(b){return b.zone===z&&b.type===tp[0];}).sort(function(a,b){return parseInt(a.code)-parseInt(b.code);});
        if(!list.length)return;rows+=cmpGrp(tp[1]+' · เขต '+z,z);var sg=0,sdv=0,sdm=0,sov=0,snd=0;
        list.forEach(function(b){var s=stat[b.code];sg+=s.g;sdv+=s.dv;sdm+=s.dm;sov+=s.over;snd+=s.notdue;rows+=cmpBr(b.name,s);});
        rows+=cmpSub('รวม '+tp[1]+' · เขต '+z,{g:sg,dv:sdv,dm:sdm,over:sov,notdue:snd});});});
      rows+=cmpTot('รวมทั้งหมด ('+brs.length+' สาขา)',{g:G,dv:DV,dm:DM,over:OV,notdue:ND});
      var head='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><div class="hd"><b>📊 รายงานเทียบผลงาน · ดิววัน ⚡ vs ดิวเดือน 📅</b></div><span class="chip ci">'+G+' ราย</span></div><div style="font-size:12px;color:var(--muted);margin-bottom:10px">รอบ: <b>'+(monTH[pe.mon]||'')+pe.by+'</b> · ลูกหนี้ชุดเดียวกัน วัด 2 วิธี</div>';
      var cards='<div style="display:grid;grid-template-columns:1fr 56px 1fr;gap:0;margin:6px 0 4px">'
        +'<div style="border-radius:14px;padding:13px 16px;color:#fff;background:linear-gradient(135deg,#15803d,#1ca34f)"><div style="font-size:11px;font-weight:700;opacity:.92">⚡ ดิววัน (ตรงดิว+3)</div><div style="font-family:Prompt,sans-serif;font-size:34px;font-weight:800;line-height:1">'+P(DV,G)+'</div><div style="font-size:12px;opacity:.9">ตรงดิว '+DV.toLocaleString()+' / '+G.toLocaleString()+' ราย</div></div>'
        +'<div style="display:flex;align-items:center;justify-content:center"><div style="width:40px;height:40px;border-radius:50%;background:#fff;border:2px solid #2A2D8F;color:#2A2D8F;font-family:Prompt,sans-serif;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:12px">VS</div></div>'
        +'<div style="border-radius:14px;padding:13px 16px;color:#fff;background:linear-gradient(135deg,#475569,#64748b)"><div style="font-size:11px;font-weight:700;opacity:.92">📅 ดิวเดือน (จ่ายแล้วในเดือน)</div><div style="font-family:Prompt,sans-serif;font-size:34px;font-weight:800;line-height:1">'+P(DM,G)+'</div><div style="font-size:12px;opacity:.9">เก็บได้ '+DM.toLocaleString()+' / '+G.toLocaleString()+' ราย</div></div></div>'
        +'<div style="display:flex;gap:10px;margin:9px 0 4px;flex-wrap:wrap">'
        +'<div style="flex:1;min-width:250px;border-radius:11px;padding:10px 14px;font-size:12.5px;font-weight:600;line-height:1.5;background:#fff4e6;border:1px solid #f0dcae;color:#7a5b16">⏰ <b style="color:#b45309">จ่ายช้ากว่าดิว+3 (แต่จ่ายแล้ว)</b> <span style="font-family:Prompt,sans-serif;font-weight:800;font-size:17px">'+(DM-DV).toLocaleString()+' ราย</span> = ส่วนต่าง '+gapAll.toFixed(2)+' จุด → ดึงให้มาตรงดิว</div>'
        +'<div style="flex:1;min-width:250px;border-radius:11px;padding:10px 14px;font-size:12.5px;font-weight:600;line-height:1.5;background:#fdecec;border:1.5px solid #f3b0a6;color:#8a3529">⚠️ <b style="color:#e0483a">เลยดิว-ยังไม่จ่าย</b> <span style="font-family:Prompt,sans-serif;font-weight:800;font-size:17px">'+OV.toLocaleString()+' ราย</span> <b style="color:#e0483a">เสี่ยงกระจุกปลายเดือน</b> → เร่งตาม</div></div>';
      var fb='';if(role!=='branch'){var zr=(role.charAt(0)==='z'?parseInt(role.slice(1)):0),ss='font-size:12px;padding:4px 8px;border-radius:7px;border:1px solid var(--line)';
        var z=['all','1','2','3'].map(function(v){return '<option value="'+v+'"'+(CMP.zone===v?' selected':'')+'>'+(v==='all'?'ทุกเขต':'เขต '+v)+'</option>';}).join('');
        var t=[['all','ทุกประเภท'],['new','รถใหม่'],['used','รถมือสอง']].map(function(v){return '<option value="'+v[0]+'"'+(CMP.type===v[0]?' selected':'')+'>'+v[1]+'</option>';}).join('');
        var br='<option value="all">— ทุกสาขา —</option>'+DATA.filter(function(b){return !zr||b.zone===zr;}).slice().sort(function(a,b){return parseInt(a.code)-parseInt(b.code);}).map(function(b){return '<option value="'+b.code+'"'+(CMP.br===b.code?' selected':'')+'>'+b.name+'</option>';}).join('');
        fb='<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:#fff;border:1px solid var(--line);border-radius:10px;padding:9px 13px;margin-bottom:10px"><span style="font-size:12px;font-weight:600;color:var(--muted)">กรองดู:</span>'+(zr?'<span style="font-size:12px;color:var(--brand);font-weight:600;background:#eef;padding:4px 10px;border-radius:7px">🔒 เขต '+zr+'</span>':'<select style="'+ss+'" onchange="cmpSet(\'zone\',this.value)">'+z+'</select>')+'<select style="'+ss+'" onchange="cmpSet(\'type\',this.value)">'+t+'</select><select style="'+ss+'" onchange="cmpSet(\'br\',this.value)">'+br+'</select></div>';}
      var thh='background:#2A2D8F;color:#fff;padding:7px 6px;font-size:11px';
      var tb='<div style="overflow-x:auto;border:1px solid var(--line);border-radius:10px">'
        +'<table style="width:100%;border-collapse:collapse;font-size:12.5px;min-width:820px"><thead>'
        +'<tr><th rowspan="2" style="'+thh+';text-align:left">สาขา / กลุ่ม</th><th rowspan="2" style="'+thh+'">เป้า</th><th colspan="2" style="background:#1f8a4c;color:#fff;padding:7px 6px;font-size:11px;border-left:2px solid #fff">⚡ ดิววัน</th><th colspan="2" style="background:#4b5563;color:#fff;padding:7px 6px;font-size:11px;border-left:2px solid #fff">📅 ดิวเดือน</th><th rowspan="2" style="'+thh+';border-left:2px solid #fff">คงเหลือ<br>ยังไม่จ่าย</th><th rowspan="2" style="background:#c0392b;color:#fff;padding:7px 6px;font-size:10.5px">⚠️ เลยดิว<br>ยังไม่จ่าย</th><th rowspan="2" style="background:#7c869c;color:#fff;padding:7px 6px;font-size:10.5px">⏳ ยังไม่<br>ถึงดิว</th></tr>'
        +'<tr><th style="background:#1f8a4c;color:#fff;padding:6px;font-size:10.5px">ทำได้</th><th style="background:#1f8a4c;color:#fff;padding:6px;font-size:10.5px">%</th><th style="background:#4b5563;color:#fff;padding:6px;font-size:10.5px">ทำได้</th><th style="background:#4b5563;color:#fff;padding:6px;font-size:10.5px">%</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
      var note='<div style="font-size:11.5px;color:#8a8f9e;margin-top:12px;line-height:1.7">✅ <b>คงเหลือยังไม่จ่าย = ⚠️ เลยดิว + ⏳ ยังไม่ถึงดิว</b> · <b style="color:#e0483a">⚠️ เลยดิว-ยังไม่จ่าย</b> = ยังไม่ชำระ + วันนี้ ≥ วันดิว → กลุ่มต้องเร่งตามกันกระจุกปลายเดือน · <b style="color:#64748b">⏳ ยังไม่ถึงดิว</b> = ยังมีสิทธิ์จ่ายตรงดิว ไม่ใช่ความเสี่ยง (สิ้นเดือน ⏳ เหลือ 0) · <b>ดิววัน</b> = ชำระภายใน min(ดิว+3, สิ้นเดือน) · <b>ดิวเดือน</b> = ชำระได้ภายในสิ้นเดือน · คิดจากลูกหนี้ชุดเดียวกัน (สาขาเก็บเอง) เคารพตัวกรอง/สิทธิ์</div>';
      return head+cards+fb+tb+note;
    }

    var _origNav=renderNav,_origAll=renderAll;
    renderNav=function(){_origNav();try{var el=document.getElementById('navtabs');if(el&&(role==='branch'||role==='gm'||role.charAt(0)==='z')){var on=(view==='daykpi')?' on':'';var html='<div class="navtab'+on+'" onclick="view=\'daykpi\';renderAll()">🎯 เป้ารายวัน</div>';var ref=null,ch=el.children;for(var i=0;i<ch.length;i++){var oc=ch[i].getAttribute('onclick')||'';if(oc.indexOf('weekkpi')>=0){ref=ch[i];break;}}if(ref){ref.insertAdjacentHTML('beforebegin',html);ref.style.display='none';}else el.insertAdjacentHTML('beforeend',html);}}catch(e){}};
    renderAll=function(){if(typeof view!=='undefined'&&view==='daykpi'){try{renderNav();}catch(e){}try{if(typeof renderStepper==='function')renderStepper();}catch(e){}var c=document.getElementById('content');if(c)c.innerHTML=renderDayPage();try{if(typeof renderBell==='function')renderBell();}catch(e){}return;}return _origAll.apply(this,arguments);};
    try{if(document.getElementById('navtabs'))renderNav();}catch(e){}
    try{if(!document.getElementById('cmpFab')){var _cfab=document.createElement('button');_cfab.id='cmpFab';_cfab.className='fab';_cfab.title='รายงานเทียบผลงาน ดิววัน/ดิวเดือน';_cfab.style.cssText='bottom:336px;width:210px;justify-content:center;background:#b45309;box-shadow:0 4px 16px rgba(180,83,9,.4)';_cfab.innerHTML='📊 เทียบ ดิววัน/เดือน';_cfab.onclick=window.openCmpReport;document.body.appendChild(_cfab);}}catch(e){}
  }
})();

/* ===== READ-ONLY LOCK (เดือนสิงหาคม ปิดรอบแล้ว) : ปิด save/push/poll กันเขียนทับ ===== */
(function(){
  function lock(){try{
    window.syncSaveBranch=function(){};
    window.flushSave=function(){};
    window._bootPushAll=function(){};
    window.startPoll=function(){};
    window.touchSave=function(){};
    if(typeof SYNC!=='undefined'&&SYNC){SYNC.dirty={};}
  }catch(e){}}
  lock();setTimeout(lock,2500);setTimeout(lock,6000);setTimeout(lock,12000);
})();

/* ===== WEATHER FLOAT : พยากรณ์อากาศจุดสาขา · Open-Meteo · ป๊อปอัปลอยมุมล่างซ้าย ===== */
(function(){
  if(window.__moto24WX)return;window.__moto24WX=true;
  var DOW=['อา','จ','อ','พ','พฤ','ศ','ส'];
  function icon(code,p){code=code||0;if(code>=95)return '⛈️';if(code>=61&&code<=82)return p>=60?'🌧️':'🌦️';if(code>=51&&code<=57)return '🌦️';if(code>=45&&code<=48)return '🌫️';if(code===3)return '☁️';if(code===1||code===2)return p>=40?'🌦️':'⛅';if(code===0)return p>=40?'🌦️':'☀️';return p>=50?'🌧️':'⛅';}
  function lvl(p){return p>=60?'wet':(p>=35?'mid':'dry');}
  function lvlMM(mm){return mm>=35?'wet':(mm>=10?'mid':'dry');}
  function lvlMMp(mm){return mm>=10?'wet':(mm>=3?'mid':'dry');}
  function lvlP(p){return p>=80?'wet':(p>=60?'mid':'dry');}
  function condW(code){code=code||0;if(code===0)return 'แดดจัด ฟ้าโปร่ง';if(code===1)return 'แดดดี เมฆน้อย';if(code===2)return 'มีเมฆบางส่วน';if(code===3)return 'เมฆมาก';if(code===45||code===48)return 'หมอก/ฟ้าหลัว';return 'ฟ้าโปร่ง';}
  function condShort(code,mm){if(mm>=0.1)return (mm<1?mm.toFixed(1):Math.round(mm))+'มม.';code=code||0;if(code<=1)return 'แดด';if(code===2)return 'เมฆบาง';if(code===3)return 'เมฆมาก';if(code===45||code===48)return 'หมอก';return '—';}
  function barc(p){return p>=60?'wxb-wet':(p>=35?'wxb-mid':'wxb-dry');}
  function brName(code){try{var b=DATA.find(function(d){return d.code===code;});return b?b.name:code;}catch(e){return code;}}
  function scopeCodes(){try{if(typeof VBC==='function'){var v=VBC();if(v&&v.length)return v.slice();}}catch(e){}return (typeof _BRLL!=='undefined')?Object.keys(_BRLL):[];}
  function defCode(){try{if(typeof role!=='undefined'&&role==='branch'&&typeof curBranch!=='undefined'&&DATA[curBranch]&&_BRLL[DATA[curBranch].code])return DATA[curBranch].code;}catch(e){}var s=scopeCodes().filter(function(c){return _BRLL[c];});return s.length?s.sort(function(a,b){return parseInt(a)-parseInt(b);})[0]:null;}
  function url(ll){return 'https://api.open-meteo.com/v1/forecast?latitude='+ll[0]+'&longitude='+ll[1]+'&hourly=precipitation_probability,precipitation,temperature_2m,weather_code&daily=precipitation_probability_max,precipitation_sum,temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia%2FBangkok&forecast_days=7';}
  function periodAgg(h,ds,lo,hi){var mp=0,sum=0,ts=0,tc=0,cd=0,pc=-1;for(var i=0;i<h.time.length;i++){var t=h.time[i];if(t.indexOf(ds)!==0)continue;var hr=parseInt(t.substr(11,2));if(hr<lo||hr>=hi)continue;var pp=h.precipitation_probability[i]||0;if(pp>mp)mp=pp;sum+=(h.precipitation[i]||0);ts+=(h.temperature_2m[i]||0);tc++;var wc=h.weather_code[i]||0;if(pp>=pc){pc=pp;cd=wc;}}return{p:mp,mm:sum,temp:tc?Math.round(ts/tc):null,code:cd};}
  var CSS='#wxPill{position:fixed;left:16px;bottom:16px;display:flex;align-items:center;gap:9px;color:#fff;border-radius:30px;padding:9px 15px 9px 12px;box-shadow:0 8px 22px rgba(0,0,0,.28);cursor:pointer;z-index:9998;font-family:"IBM Plex Sans Thai",sans-serif}#wxPill .i{font-size:22px}#wxPill .tx{line-height:1.1}#wxPill .tx b{font-family:"Prompt",sans-serif;font-size:15px}#wxPill .tx small{display:block;font-size:10px;opacity:.92}#wxPill .pct{font-family:"Prompt",sans-serif;font-weight:800;font-size:18px;margin-left:2px}.wx-wet{background:linear-gradient(100deg,#c0392b,#e0483a)}.wx-mid{background:linear-gradient(100deg,#c98418,#e0a021)}.wx-dry{background:linear-gradient(100deg,#158048,#1f9d57)}#wxPop{position:fixed;left:16px;bottom:74px;width:344px;max-width:calc(100vw - 32px);background:#fff;border:1px solid #e6e8f2;border-radius:16px;box-shadow:0 18px 44px rgba(20,24,60,.28);overflow:hidden;z-index:9999;display:none;font-family:"IBM Plex Sans Thai",sans-serif}#wxPop.show{display:block}#wxPop .hd{background:linear-gradient(120deg,#2A2D8F,#4548b8);color:#fff;padding:10px 13px;display:flex;align-items:center;gap:9px}#wxPop .hd .pin{font-size:18px}#wxPop .hd .t{font-family:"Prompt",sans-serif;font-weight:800;font-size:13.5px;line-height:1.15}#wxPop .hd .t small{display:block;font-weight:400;font-size:10px;opacity:.85;font-family:"IBM Plex Sans Thai",sans-serif}#wxPop .hd .x{margin-left:auto;font-size:16px;cursor:pointer;opacity:.85}#wxPop .pb{padding:11px 13px}#wxPop select{font-size:11px;padding:3px 7px;border-radius:7px;border:1px solid #e6e8f2;max-width:190px}.wx-now{display:flex;align-items:center;gap:10px;border-radius:11px;padding:8px 11px;margin:8px 0 10px;border:1px solid}.wx-now.wet{background:#fdf0ee;border-color:#f4cfc8}.wx-now.mid{background:#fdf6e8;border-color:#f0dcae}.wx-now.dry{background:#eefaf2;border-color:#c4e9d4}.wx-now .ic{font-size:32px}.wx-now .v{font-family:"Prompt",sans-serif;font-weight:800;font-size:24px;line-height:1}.wx-now.wet .v{color:#c0392b}.wx-now.mid .v{color:#b45309}.wx-now.dry .v{color:#15803d}.wx-now .d{font-size:11px;color:#5b6070}.wx-now .tp{margin-left:auto;text-align:right;font-size:11px;color:#5b6070}.wx-now .tp b{font-family:"Prompt",sans-serif;font-size:15px;color:#25293f;display:block}.wx-slab{font-size:10.5px;color:#8a90a6;font-weight:700;margin:2px 0 6px}.wx-four{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:11px}.wx-p{border-radius:9px;border:1px solid #e6e8f2;text-align:center;padding:5px 2px;background:#fbfcff}.wx-p .l{font-size:9px;color:#8a90a6}.wx-p .ic{font-size:17px;margin:1px 0}.wx-p .r{font-family:"Prompt",sans-serif;font-weight:800;font-size:12px}.wx-p.dry .r{color:#15803d}.wx-p.mid .r{color:#b45309}.wx-p.wet .r{color:#e0483a}.wx-p .mm{font-size:8.5px;color:#9aa0b5}.wx-week{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:10px}.wx-d{text-align:center;border-radius:8px;padding:5px 1px;background:#fff;border:1px solid #e6e8f2}.wx-d.tod{border:1.5px solid #F37117}.wx-d .dn{font-size:9px;font-weight:700;color:#25293f}.wx-d .ic{font-size:15px}.wx-d .r{font-family:"Prompt",sans-serif;font-weight:800;font-size:10px}.wx-d .tp{font-size:8px;color:#9aa0b5}.wx-d .bar{height:4px;border-radius:3px;margin:3px 3px 0}.wxb-dry{background:#1f9d57}.wxb-mid{background:#e0a021}.wxb-wet{background:#c0392b}.wx-adv{background:#f6f7fb;border-left:3px solid #F37117;border-radius:8px;padding:8px 11px;font-size:11px;color:#374151;line-height:1.6}.wx-adv b{color:#2A2D8F}.wx-adv .r{color:#e0483a;font-weight:700}.wx-adv .g{color:#15803d;font-weight:700}.wx-src{font-size:9.5px;color:#aab0c0;text-align:right;margin-top:7px}.wx-load{padding:20px;text-align:center;color:#8a90a6;font-size:12px}';
  try{var st=document.createElement('style');st.id='wxStyle';st.innerHTML=CSS;document.head.appendChild(st);}catch(e){}
  var pill=document.createElement('div');pill.id='wxPill';pill.className='wx-dry';pill.style.display='none';pill.innerHTML='<span class="i">⛅</span><span class="tx"><b>อากาศ</b><small id="wxPillBr">—</small></span><span class="pct" id="wxPillPct"></span>';
  var pop=document.createElement('div');pop.id='wxPop';pop.innerHTML='<div class="hd"><span class="pin">📍</span><div class="t">อากาศจุดสาขา<small id="wxSub">—</small></div><span class="x">✕</span></div><div class="pb" id="wxBody"><div class="wx-load">กำลังโหลด…</div></div>';
  try{document.body.appendChild(pill);document.body.appendChild(pop);}catch(e){}
  function toggle(){pop.classList.toggle('show');}
  pill.addEventListener('click',toggle);try{pop.querySelector('.x').addEventListener('click',toggle);}catch(e){}
  function cacheGet(code){try{var raw=localStorage.getItem('moto3_wx_'+code);if(!raw)return null;var o=JSON.parse(raw);var d=new Date();var today=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);if(o.day===today&&(Date.now()-o.ts<10800000))return o.data;}catch(e){}return null;}
  function cacheSet(code,data){try{var d=new Date();var today=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);localStorage.setItem('moto3_wx_'+code,JSON.stringify({day:today,ts:Date.now(),data:data}));}catch(e){}}
  function load(code){window._wxCur=code;var ll=_BRLL[code];if(!ll){pill.style.display='none';return;}try{document.getElementById('wxPillBr').textContent=brName(code);}catch(e){}var c=cacheGet(code);if(c){render(c,code);return;}try{document.getElementById('wxBody').innerHTML='<div class="wx-load">กำลังโหลดข้อมูลอากาศ…</div>';}catch(e){}fetch(url(ll)).then(function(r){return r.json();}).then(function(j){if(j&&j.daily){cacheSet(code,j);render(j,code);}else throw 0;}).catch(function(){try{document.getElementById('wxBody').innerHTML='<div class="wx-load">โหลดอากาศไม่สำเร็จ — เช็คเน็ตแล้วลองใหม่</div>';}catch(e){}});}
  function render(data,code){try{
    var d=data.daily,h=data.hourly,today=d.time[0];
    var per=[['เช้า',6,11],['สาย',11,13],['บ่าย',13,17],['เย็น',17,20]].map(function(x){var a=periodAgg(h,today,x[1],x[2]);a.name=x[0];return a;});
    var tmax=Math.max.apply(null,per.map(function(x){return x.p;}));var todayMM=d.precipitation_sum[0]||0;var todayCode=d.weather_code[0]||0;var L=lvlP(tmax);var wet=per.slice().sort(function(a,b){return b.mm-a.mm;})[0];
    var _nowH=new Date().getHours();var curIdx=(_nowH<11?0:_nowH<13?1:_nowH<17?2:3);var cur=per[curIdx];var CL=lvlP(cur.p);
    var nh=new Date().getHours(),nowT=null,nowCode=0;for(var i=0;i<h.time.length;i++){if(h.time[i].indexOf(today)===0&&parseInt(h.time[i].substr(11,2))===nh){nowT=Math.round(h.temperature_2m[i]);nowCode=h.weather_code[i];break;}}
    pill.className='wx-'+CL;pill.querySelector('.i').textContent=icon(cur.code,cur.p);pill.querySelector('.tx b').textContent=(CL==='wet'?'ช่วง'+cur.name+'มีฝน':CL==='mid'?'ช่วง'+cur.name+'อาจมีฝน':condW(cur.code));document.getElementById('wxPillBr').textContent=brName(code);document.getElementById('wxPillPct').textContent=cur.p+'%';pill.style.display='flex';
    document.getElementById('wxSub').textContent='จุดพิกัดสาขา '+brName(code);
    var html='';var sc=scopeCodes().filter(function(c){return _BRLL[c];});var _isBr=(typeof role!=='undefined'&&role==='branch');
    if(!_isBr&&sc.length>1){var opts=sc.sort(function(a,b){return parseInt(a)-parseInt(b);}).map(function(c){return '<option value="'+c+'"'+(c===code?' selected':'')+'>'+brName(c)+'</option>';}).join('');html+='<div style="text-align:right;margin-bottom:2px"><select id="wxSel">'+opts+'</select></div>';}
    html+='<div class="wx-now '+CL+'"><div class="ic">'+icon(cur.code,cur.p)+'</div><div><div class="v">'+cur.p+'%</div><div class="d"><b>ช่วง'+cur.name+' (ตอนนี้)</b> · '+(CL==='wet'?('ฝนสูง ~'+Math.round(cur.mm)+' มม.'):CL==='mid'?('อาจมีฝน ~'+Math.round(cur.mm)+' มม.'):condW(cur.code))+' <span style="color:#9aa0b5">· ทั้งวันสูงสุด '+tmax+'%</span></div></div><div class="tp">อุณหภูมิ<b>'+(nowT!=null?nowT+'°':(cur.temp!=null?cur.temp+'°':'—'))+'</b></div></div>';
    html+='<div class="wx-slab">วันนี้ · แบ่งช่วง (สีตามโอกาสฝน)</div><div class="wx-four">';
    per.forEach(function(x,pi){var _hl=(pi===curIdx);html+='<div class="wx-p '+lvlP(x.p)+'"'+(_hl?' style="outline:2px solid #F37117;outline-offset:-1px"':'')+'><div class="l">'+x.name+(_hl?' •':'')+'</div><div class="ic">'+icon(x.code,x.p)+'</div><div class="r">'+x.p+'%</div><div class="mm">'+condShort(x.code,x.mm)+'</div></div>';});
    html+='</div><div class="wx-slab">7 วันข้างหน้า (ตัวเลข=โอกาสฝน %)</div><div class="wx-week">';
    for(var k=0;k<d.time.length;k++){var dt=new Date(d.time[k]+'T00:00');var p=d.precipitation_probability_max[k]||0;var mm=d.precipitation_sum[k]||0;var dl=lvlP(p);var tod=(k===0);html+='<div class="wx-d'+(tod?' tod':'')+'"><div class="dn">'+(tod?'นี้':DOW[dt.getDay()])+'</div><div class="ic">'+icon(d.weather_code[k],p)+'</div><div class="r" style="color:'+(dl==='wet'?'#c0392b':dl==='mid'?'#e0a021':'#15803d')+'">'+p+'%</div><div class="tp">'+condShort(d.weather_code[k],mm)+'</div><div class="bar wxb-'+dl+'"></div></div>';}
    html+='</div>';
    var dry=[];for(var k2=1;k2<d.time.length;k2++){if((d.precipitation_probability_max[k2]||0)<60){dry.push(DOW[new Date(d.time[k2]+'T00:00').getDay()]);}}
    var adv='💡 <b>วางแผน:</b> ';if(L==='wet')adv+='วันนี้<span class="r">โอกาสฝนสูง '+tmax+'% ('+wet.name+'หนัก ~'+Math.round(todayMM)+'มม.)</span> → เร่งช่วงฝนน้อย ที่เหลือโทร/นัดโอน';else if(L==='mid')adv+='วันนี้อาจมีฝน ('+tmax+'%) เตรียมแผนสำรอง (โทร/นัดโอน)';else adv+='<span class="g">วันนี้'+condW(todayCode)+' อากาศเปิด เหมาะลงพื้นที่เต็มที่</span>';if(dry.length)adv+=' · โอกาสฝนน้อย: <span class="g">'+dry.slice(0,3).join(', ')+'</span> เร่งเก็บงานค้าง';
    html+='<div class="wx-adv">'+adv+'</div><div class="wx-src">ข้อมูล Open-Meteo · แคชวันละครั้ง</div>';
    document.getElementById('wxBody').innerHTML=html;var sel=document.getElementById('wxSel');if(sel)sel.addEventListener('change',function(){load(this.value);pop.classList.add('show');});
  }catch(e){try{document.getElementById('wxBody').innerHTML='<div class="wx-load">แสดงผลไม่สำเร็จ</div>';}catch(_e){}}}
  var tries=0;
  function boot(){tries++;var ok=false;try{var lo=document.getElementById('loginOv');ok=(typeof role!=='undefined')&&(typeof _BRLL!=='undefined')&&(!lo||lo.style.display==='none'||getComputedStyle(lo).display==='none');}catch(e){}if(!ok){if(tries<150)setTimeout(boot,2000);return;}var code=defCode();if(!code){if(tries<150)setTimeout(boot,2000);return;}load(code);}
  boot();
  setInterval(function(){try{if(window._wxCur&&!document.hidden)load(window._wxCur);}catch(e){}},600000);
})();
