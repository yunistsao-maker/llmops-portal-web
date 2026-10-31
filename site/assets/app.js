(function(){
/* LLMOps Portal page (production port of the prototype app3.html).
   Data: GET /api/content/portal.json   chat: POST /api/chat   form helper: POST /api/assist/form
   requests: POST /api/requests. No inline scripts or styles: the page runs under CSP default-src 'self'. */
let D = null;
const app = document.getElementById('app');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ------------------------------------------------------------------ language */
let lang = 'zh';
try { const s = localStorage.getItem('llmops-lang'); if (s === 'en' || s === 'zh') lang = s; } catch (e) {}
const UIS = ['dark','light','beige'];
let ui = null; try { const s = localStorage.getItem('llmops-ui'); if (UIS.includes(s)) ui = s; } catch (e) {}
const T = {
zh: {
  'nav.home':'總覽','nav.news':'動態','nav.retire':'退役','nav.models':'模型','nav.tests':'測試','nav.cost':'成本試算','nav.apply':'申請','nav.label':'主要頁面',
  'asof':'資料日期 {d}','lang':'語言',
  'hero.title':'雲端模型最新消息',
  'hl.title':'本期重點','hl.all':'看全部動態 →','imp.high':'重要',
  'cd.title':'倒數','cd.new':'新模型上架','cd.price':'價格調整','cd.retire':'即將退役','cd.allRetire':'全部退役 →','cd.unit':'天','cd.today':'今天','cd.tbd':'未定','cd.none':'目前沒有。',
  'cat.title':'模型目錄','cat.more':'看完整比較 →',
  'col.model':'模型','col.tier':'等級','col.score':'能力分數','col.price':'每百萬 tokens 價格（輸入 / 輸出）','col.compare':'比較','col.taipei':'從台北用（AWS）','col.progress':'導入進度',
  'tier.frontier':'旗艦','tier.balanced':'主力','tier.efficient':'輕量',
  'st.ga':'已上架','st.preview':'預覽','st.private-preview':'限定預覽','st.restricted':'受限','st.not-offered':'未上架','st.unknown':'未確認',
  'sec.上架':'上架','sec.價格':'價格','sec.退役':'退役','sec.Gateway':'Gateway','sec.資安':'資安','sec.法規':'法規','sec.all':'全部',
  'maker':'原廠 API','cloud.all':'全部雲',
  'news.title':'動態','news.feed':'發布與變更','news.open':'開放權重模型','news.todo':'待辦','news.tabs':'切換','news.cat':'類別','news.cloud':'雲',
  'news.high':'只看重要的','news.count':'{n} 則','news.empty':'這個篩選條件下沒有動態。','news.enNote':'','news.new':'本期新增','news.when':'首次 {a} · 最後更新 {b}',
  'open.model':'模型','open.heat':'熱度','open.lic':'授權','open.one':'一句話','heat.hit':'熱門','heat.rising':'上升','heat.watch':'觀察','open.nolic':'未公布',
  'p.P0':'緊急','p.P1':'重要','p.P2':'一般','todo.over':'逾期 {n} 天','todo.by':'{d} 前','todo.ongoing':'持續','todo.since':'自 {a} 起',
  'ret.title':'退役日曆','ret.past':'也顯示最近 14 天已過的','ret.count':'{n} 項','ret.empty':'沒有符合的項目。','ret.month':'{y} 年 {m} 月',
  'ret.left':'剩 {n} 天','ret.ago':'已過 {n} 天','ret.norepl':'沒有指定替代',
  'ev.retirement':'退役','ev.legacy':'進入舊版','ev.deprecation':'宣布停用','ev.extended-access':'延長使用','ev.eol-no-sooner-than':'最早退役日',
  'cdr.retire':'{x} 退役','cdr.soonest':'{x} 最早退役','cdr.more':'等 {n} 個',
  'models.title':'模型目錄','taipei.global':'可（跨區）','taipei.none':'不可',
  'chart.title':'能力分數與價格','chart.x':'每百萬 tokens 價格（輸入 3：輸出 1 混合，USD）','chart.aria':'各模型能力分數與價格的散佈圖',
  'cmp.title':'並排比較','cmp.one':'一句話','cmp.score':'能力分數','cmp.price':'最低價格（輸入 / 輸出）','cmp.ctx':'Context / 輸出上限','cmp.avail':'上架','cmp.cau':'要注意','cmp.sel':'已選 {n} 個模型','cmp.clear':'清除','cmp.add':'加入比較：{m}',
  'm.back':'← 模型目錄','m.eval':'評估中','m.apply':'申請使用','m.notfound':'找不到這個模型。',
  'm.fScore':'能力分數','m.fRank':'{r}','m.fPrice':'最低價格（每百萬 tokens）','m.fCtx':'Context / 輸出上限','m.fSec':'安全測試','m.secOf':'{p} / {n} 通過','m.notTested':'還沒有測',
  'm.hi':'優點','m.cau':'要注意','m.br':'行為變更 {n} 項',
  'm.clouds':'三雲比較','m.status':'狀態','m.pGlobal':'價格（全球）','m.pRes':'價格（指定地區）','m.tw':'台灣境內處理','m.twNo':'沒有','m.twUnknown':'未確認',
  'm.res':'可選的資料地區','m.so':'結構化輸出（JSON）','m.eol':'最早退役日','m.litellm':'LiteLLM 名稱','m.src':'來源','m.unpub':'未公布','m.unrec':'未記錄',
  'so.supported':'支援','so.not-supported':'不支援','so.partial':'部分支援','so.card-updated':'模型卡寫支援，待實測',
  'm.tests':'內部測試','m.testsAll':'看全部結果 →','m.compat':'相容測試','m.perf':'效能測試','m.secT':'安全測試','m.notYet':'還沒有實測。',
  'm.perfRef':'外部參考：每秒 {n} tokens（Artificial Analysis，{d}）','m.pass':'通過 {n}','m.fail':'未通過 {n}','m.review':'待複核 {n}','m.secWhen':'{d} 上線前測試',
  'm.costLink':'到成本試算算這個模型 →','m.gates':'導入進度','m.rel':'相關動態','m.relAll':'全部 →','m.relNone':'最近沒有提到這個模型的動態。',
  'm.repl':'它可以取代','m.replNone':'退役日曆裡沒有指名它當替代。','m.card':'原廠模型卡',
  'gs.done':'完成','gs.doing':'進行中','gs.blocked':'未通過','gs.todo':'未開始',
  'g.G0':'登記','g.G1':'研究','g.G2':'法遵審查','g.G3':'相容測試','g.G4':'效能測試','g.G5':'品質評測','g.G6':'安全測試','g.G7':'成本審查','g.G8':'試用','g.G9':'上線','g.G10':'退役',
  'tests.title':'測試結果','tests.model':'模型','tests.all':'全部模型','tests.noSec':'這個模型還沒有安全測試結果。','tests.status':'測試狀態','tests.compat':'相容','tests.perf':'效能','tests.sec':'安全','tests.none':'未測','tests.failN':'未通過 {n} 項','tests.passed':'通過',
  'tests.secTitle':'安全測試（{d}）','tests.item':'項目','tests.rule':'通過條件',
  'ui.label':'外觀','ui.dark':'深色','ui.light':'白色','ui.beige':'米色',
  'sx.title':'安全評估矩陣','sx.scope':'範圍','sx.core':'核心 16 項','sx.draft':'擴充草案 16 項','sx.allN':'全部 32 項','sx.arch':'適用架構','sx.archAll':'全部架構','sx.count':'顯示 {n} 項',
  'sx.how':'怎麼看這張表','sx.runNote':'結果欄是 {d} 那次測試的判定，用的是當時的門檻，不一定等於矩陣的通過標準；展開每一項可以對照。擴充草案 SEC-17 到 SEC-32 還沒測過。',
  'sx.relNote':'「相關資料」是原矩陣網站上相關論文、社群文章與案例的數量，這裡只列數量。','sx.enNote':'',
  'sx.id':'ID','sx.item':'項目','sx.owasp':'OWASP 2026','sx.archCol':'適用架構','sx.pri':'優先序','sx.tierCore':'核心','pri.high':'高','pri.medium':'中','pri.low':'低','sx.notYet':'還沒測','sx.result':'測試結果',
  'sx.what':'測什麼','sx.pass':'通過標準','sx.run':'這次測試（{d}）','sx.runRule':'當時的門檻：{r}','sx.rate':'失敗 {p}%','sx.cases':'{n} 題','sx.gw':'（測的是 gateway，不分模型）',
  'sx.tools':'工具與測試方式','sx.users':'適用使用者','sx.unit':'測試單位','sx.atlas':'MITRE ATLAS','sx.moda':'數發部風險類別','sx.note':'補充說明','sx.why':'為什麼需要','sx.refs':'參考來源',
  'sx.rel':'相關資料','sx.relV':'{a} 篇論文 · {b} 則社群文章 · {c} 件案例','sx.other':'其他清單：{x}','sx.noRun':'選的模型還沒有安全測試結果，下面只列測試項目。','sx.empty':'沒有符合條件的項目。',
  'v.pass':'通過','v.fail':'未通過','v.review':'待複核','v.info':'只記錄',
  'tests.cmp':'同一模型，三雲比較','tests.cmpText':'還沒有實測資料。','tests.mock':'看範例畫面（假資料）','tests.mockBanner':'這是範例畫面，數字都是假資料，不是任何模型的實測結果。',
  'mock.route':'路由','mock.cloud':'雲','mock.rate':'相容率','mock.silent':'悄悄降級','mock.gw':'gateway 造成','mock.cloudlim':'雲端限制','mock.delay':'gateway 額外延遲',
  'cost.title':'成本試算','cost.wl':'用量','cost.model':'模型','cost.all':'全部模型','cost.rpd':'每天請求數','cost.tin':'每次輸入 tokens','cost.tout':'每次輸出 tokens',
  'cost.basis':'每天 {r} 次，每次輸入 {i}、輸出 {o} tokens；以 30 天與官方價格計算，不含快取與批次折扣。',
  'cost.cloud':'雲','cost.mGlobal':'每月（全球）','cost.mRes':'每月（指定地區）','cost.x':'是最便宜的幾倍','cost.cheapest':'最便宜','cost.none':'沒有公布價格的管道。',
  'wl.chat':'客服問答','wl.doc':'文件摘要','wl.agent':'程式代理','wl.custom':'自訂',
  'apply.title':'申請使用模型','apply.steps':'流程','apply.form':'申請表',
  'step1':'提出申請','step1d':'填用途、資料等級、預估用量與想用的雲，當天回覆是否受理。',
  'step2':'法遵與資料審查','step2d':'Security B、Security A/AA、其他等級或對外服務一定要審：資料在哪裡處理、保留多久、符合哪些法規。',
  'step3':'技術驗證','step3d':'相容、效能、品質、安全與成本；已經測過的模型直接沿用結果。',
  'step4':'試用','step4d':'限定團隊用兩週，沒有重大問題才進下一步。',
  'step5':'上線','step5d':'開通 gateway 名稱與金鑰，發布使用說明。',
  'f.team':'申請單位','f.teamPh':'例：數位通路部 AI 小組','f.alias':'填表人 Alias','f.aliasPh':'例：jchen','f.model':'想用的模型（可複選）','f.modelPick':'請選擇模型','f.unsure':'還不確定，請 AI 建議','f.nSel':'已選 {n} 個','f.aiFill':'讓 AI 幫我填','f.modelShort':'模型','f.useShort':'用途','f.extShort':'對外服務','f.twShort':'台灣境內處理','f.noteShort':'特殊備註','yes':'是','no':'否','f.use':'用途（一兩句）','f.usePh':'例：客服知識庫問答，內部員工使用',
  'f.class':'資料等級','f.classPick':'請選擇','c.other':'其他（請說明）','c.property':'Property','c.sec-c':'Security C','c.sec-b':'Security B','c.sec-a':'Security A/AA','f.classOther':'請說明資料等級','f.classOtherPh':'例：客戶資料的匿名化摘要','f.cloud':'偏好的雲','f.cloudAny':'不限',
  'f.rpd':'每天請求數','f.date':'希望上線日','f.tin':'每次輸入 tokens','f.tout':'每次輸出 tokens','f.ext':'對外服務（客戶會直接看到輸出）','f.tw':'資料必須在台灣境內處理',
  'f.note':'特殊備註（選填）','f.notePh':'例：上線日期不能延、只能用某一朵雲、需要預留用量','r.note':'特殊備註',
  'f.submit':'送出申請',
  'r.need':'請填申請單位、填表人 Alias 與用途。','r.needClass':'請選擇資料等級。','r.needOther':'請說明資料等級。','r.alias':'填表人','r.class':'資料等級','r.models':'申請的模型','r.id':'申請編號 {id}','r.pending':'待受理','r.gates':'要過的關卡','r.cost':'預估每月成本（官方價格）','r.noModel':'沒有指定，平台會依用途與資料等級建議 2 到 3 個候選',
  'r.tw':'目錄裡的 {n} 個模型在三雲都沒有台灣境內處理；最接近的是 Bedrock 的日本區（{m}）。這一項會在法遵審查先討論。','r.twNone':'目錄裡的 {n} 個模型在三雲都沒有台灣境內處理。這一項會在法遵審查先討論。','r.twSome':'可以在台灣境內處理的模型：{m}。這一項會在法遵審查確認。','r.noPrice':'{m} 在你選的雲沒有公布價格或沒有上架。','r.secReuse':'{m} 已有安全測試結果（{d}），只需要複核未通過的 {n} 項。','r.month':'{c} {v} / 月',
  'r.sending':'送出中…','r.err':'沒有送出','r.errNet':'送出失敗，請稍後再試。','r.errAuth':'登入已過期，請重新整理頁面後再送出。','r.errInvalid':'申請內容有欄位不符合規則：{m}','r.badAlias':'填表人 Alias 只能用英文字母、數字、點、底線與連字號。','r.badNum':'每天請求數與 tokens 要填 0 以上的整數（每天請求數最多 1 億，tokens 最多 1000 萬）。','r.tooMany':'模型最多選 10 個。','r.preview':'（依表單預估）','r.next':'下一關','rs.in_review':'審查中','rs.changes_requested':'需要修改','rs.approved':'已核准','rs.provisioning':'開通中','rs.active':'已開通','rs.trial':'試用中','rs.rejected':'未核准','rs.failed':'失敗','rs.withdrawn':'已撤回','gst.pending':'待審','gst.approved':'已核准','gst.rejected':'未核准','gst.skipped':'略過','gst.done':'完成',
  'foot':'資料日期 {d}。',
  'chat.fab':'問問看','chat.title':'問 portal','chat.close':'關閉','chat.in':'輸入問題','chat.ph':'例如：Sonnet 5.5 在台北能用嗎？','chat.send':'送出','chat.stop':'停止',
  'chat.hello':'我會從 portal 裡的動態、退役、模型、測試與申請資料找答案，並告訴你該看哪一頁。',
  'chat.s1':'Sonnet 5.5 在台北能用嗎？','chat.s2':'11 月有哪些模型要退役？','chat.s3':'最便宜的模型是哪個？','chat.s4':'LiteLLM 1.107.0 怎麼了？',
  'chat.think':'思考中…','chat.noAI':'AI 回答暫時無法使用，先幫你找到這些相關頁面：','chat.auth':'登入已過期，請重新整理頁面。','chat.tooLong':'問題太長了，請精簡一點再問。',
  'chat.rate':'問得太快了，請稍等一下再試。','chat.refused':'這個問題沒辦法回答，換個問法試試。','chat.upstream':'連線中斷了，請再試一次。','chat.stopped':'已停止。',
  'chat.cut':'回答太長被截斷了，可以問得更具體一點。','chat.notfound':'portal 裡找不到相關資料，可以換個關鍵字，或到「動態」頁搜尋。','chat.pages':'相關頁面',
  'load.loading':'正在載入 portal 資料…','load.error':'portal 資料載入失敗。','load.retry':'重試','load.auth':'請先登入公司帳號，再重新整理這個頁面。','load.empty':'portal 資料還在準備中，請稍後再試。',
  'fa.title':'申請表小幫手','fa.hello':'我來幫你挑模型、填申請表。請說說看：要做什麼？誰會用（內部同事或客戶）？資料大概多敏感？一天大概用幾次？有沒有指定的雲或上線日期？',
  'fa.ph':'例：給客戶用的客服機器人，一天約 3 萬次，只能用 AWS','fa.useChip':'用表單上的用途：{u}','fa.back':'改回一般問答','fa.apply':'套用到申請表','fa.applied':'已套用到申請表，送出前請再確認資料等級。',
  'fa.noAI':'AI 建議暫時無法使用。可以先到模型目錄比較，或不選模型、讓平台建議。','fa.bad':'AI 的回覆格式不對，請再說一次。','fa.fill':'建議填入','fa.q':'想再確認：',
  'col.avail':'申請狀態','av.available':'可以申請','av.trial':'試用中','av.evaluating':'尚未開放','av.paused':'暫停導入',
  'av.eta':'預計 {p}','av.etaNote':'依導入關卡估算','av.basisEd':'平台團隊提供的時間','av.next':'下一關：{g}',
  'av.availableT':'可以申請使用','av.availableD':'這個模型已經上線，可以直接申請使用。',
  'av.evaluatingT':'尚未開放申請','av.evaluatingD':'預計 {p}可以申請（{n}）。可以先訂閱上線通知；也可以先送出申請，開放後依序處理。',
  'av.evaluatingNoEta':'還沒有預計時間。可以先訂閱上線通知；也可以先送出申請，開放後依序處理。',
  'av.trialT':'試用中','av.trialD':'限定團隊試用中，預計 {p}正式開放（{n}）。可以先訂閱上線通知，或先送出申請。',
  'av.pausedT':'暫停導入','av.pausedD':'「{g}」沒有通過，暫停導入；問題處理完才會重新估算時間。','av.pausedSec':'安全測試有 {n} 項沒有通過：',
  'av.queue':'先送出申請','sub.on':'訂閱上線通知','sub.off':'取消訂閱',
  'sub.done':'已訂閱：{m} 開放申請時會通知你。','sub.undone':'已取消 {m} 的上線通知。','sub.err':'訂閱沒有成功，請稍後再試。',
  'mt.label':'模型資訊','mt.overview':'模型與能力','mt.security':'資安與 GW','mt.rollout':'導入細節',
  'm.release':'發布日期','m.where':'哪裡可以用','m.taipeiYes':'從台北可用（跨區）','m.taipeiNo':'從台北不能用','m.good':'擅長',
  'm.secSum':'安全測試','m.secNone':'這個模型還沒有安全測試結果。','m.secItems':'沒有通過或待複核的項目',
  'm.dp':'資料處理與區域','m.zdr':'不保留資料（ZDR）','zdr.available':'可以','zdr.on-request':'要申請','zdr.not-available':'不提供','zdr.unknown':'未確認',
  'm.gw':'公司 Gateway','m.gwAlias':'Gateway 名稱','m.gwAliasD':'用這個名稱呼叫公司 gateway','m.gwProv':'LiteLLM 設定','m.gwVer':'LiteLLM 版本',
  'm.gwVerD':'平台建議 {r}，最低 {m}；不要用 {a}','m.gwModelVer':'這個模型','m.gwMin':'最低可路由版本','m.gwCav':'要注意','m.gwLog':'紀錄',
  'm.gwLogD':'公司 gateway 不保存提示與回覆內容（turn_off_message_logging，SEC-31），只記用量與成本。',
  'm.rollEta':'預計 {p}開放（依各關卡的標準天數估算）','m.gate':'關卡','m.state':'狀態','m.owner':'負責','m.exit':'完成條件','m.compatPerf':'相容與效能',
  'cal.title':'退役月曆','cal.prev':'上個月','cal.next':'下個月','cal.dow':'日,一,二,三,四,五,六','cal.day':'{m} 月 {d} 日','cal.today':'今天',
  'cal.events':'{n} 項退役','cal.hint':'把滑鼠移到清單裡的項目上（或用 Tab 移過去），月曆會用紅筆圈出那一天。',
  'cal.todayL':'今天','cal.todayBtn':'今天 {d}','cal.todayTitle':'回到這個月',
  'cal.noneLeft':'本月已無退役事件','cal.nextEv':'下一個：{d}（剩 {n} 天）','cal.nextEv1':'下一個：{d}（剩 1 天）','cal.nothing':'之後也沒有已排定的退役'
},
en: {
  'nav.home':'Overview','nav.news':'News','nav.retire':'Retirements','nav.models':'Models','nav.tests':'Tests','nav.cost':'Cost','nav.apply':'Request','nav.label':'Main pages',
  'asof':'Data as of {d}','lang':'Language',
  'hero.title':'Cloud model updates',
  'hl.title':'Highlights','hl.all':'All news →','imp.high':'Important',
  'cd.title':'Countdown','cd.new':'New models coming','cd.price':'Price changes','cd.retire':'Retiring soon','cd.allRetire':'All retirements →','cd.unit':'days','cd.today':'Today','cd.tbd':'TBD','cd.none':'Nothing right now.',
  'cat.title':'Model catalog','cat.more':'Compare all →',
  'col.model':'Model','col.tier':'Tier','col.score':'Score','col.price':'Price per 1M tokens (in / out)','col.compare':'Compare','col.taipei':'From Taipei (AWS)','col.progress':'Rollout',
  'tier.frontier':'Flagship','tier.balanced':'Everyday','tier.efficient':'Lightweight',
  'st.ga':'Available','st.preview':'Preview','st.private-preview':'Private preview','st.restricted':'Limited','st.not-offered':'Not offered','st.unknown':'Unknown',
  'sec.上架':'Launch','sec.價格':'Price','sec.退役':'Retirement','sec.Gateway':'Gateway','sec.資安':'Security','sec.法規':'Regulation','sec.all':'All',
  'maker':'Model maker API','cloud.all':'All clouds',
  'news.title':'News','news.feed':'Releases and changes','news.open':'Open-weight models','news.todo':'To-dos','news.tabs':'Switch view','news.cat':'Category','news.cloud':'Cloud',
  'news.high':'Important only','news.count':'{n} items','news.empty':'Nothing matches these filters.','news.enNote':'News items are written in Traditional Chinese for now.','news.new':'New this issue','news.when':'First seen {a} · Updated {b}',
  'open.model':'Model','open.heat':'Trend','open.lic':'License','open.one':'Summary','heat.hit':'Hot','heat.rising':'Rising','heat.watch':'Watch','open.nolic':'Not published',
  'p.P0':'Urgent','p.P1':'High','p.P2':'Normal','todo.over':'{n} days overdue','todo.by':'By {d}','todo.ongoing':'Ongoing','todo.since':'Since {a}',
  'ret.title':'Retirement calendar','ret.past':'Also show the last 14 days','ret.count':'{n} items','ret.empty':'Nothing matches.','ret.month':'{m} {y}',
  'ret.left':'{n} days left','ret.ago':'{n} days ago','ret.norepl':'No replacement named',
  'ev.retirement':'Retirement','ev.legacy':'Moves to legacy','ev.deprecation':'Deprecated','ev.extended-access':'Extended access','ev.eol-no-sooner-than':'Earliest retirement',
  'cdr.retire':'{x} retire','cdr.soonest':'{x}: earliest retirement','cdr.more':'+{n} more',
  'models.title':'Model catalog','taipei.global':'Yes (global)','taipei.none':'No',
  'chart.title':'Score vs price','chart.x':'Price per 1M tokens (3 parts input : 1 part output, USD)','chart.aria':'Scatter plot of each model\'s score and price',
  'cmp.title':'Side by side','cmp.one':'Summary','cmp.score':'Score','cmp.price':'Lowest price (in / out)','cmp.ctx':'Context / max output','cmp.avail':'Availability','cmp.cau':'Watch out for','cmp.sel':'{n} selected','cmp.clear':'Clear','cmp.add':'Compare {m}',
  'm.back':'← Model catalog','m.eval':'Under evaluation','m.apply':'Request access','m.notfound':'Model not found.',
  'm.fScore':'Score','m.fRank':'{r}','m.fPrice':'Lowest price (per 1M tokens)','m.fCtx':'Context / max output','m.fSec':'Security test','m.secOf':'{p} of {n} passed','m.notTested':'Not tested yet',
  'm.hi':'Strengths','m.cau':'Watch out for','m.br':'{n} behavior changes',
  'm.clouds':'Cloud comparison','m.status':'Status','m.pGlobal':'Price (global)','m.pRes':'Price (chosen region)','m.tw':'Processed in Taiwan','m.twNo':'No','m.twUnknown':'Unknown',
  'm.res':'Data region options','m.so':'Structured outputs (JSON)','m.eol':'Earliest retirement','m.litellm':'LiteLLM name','m.src':'Sources','m.unpub':'Not published','m.unrec':'Not recorded',
  'so.supported':'Supported','so.not-supported':'Not supported','so.partial':'Partly supported','so.card-updated':'Card says supported; to be tested',
  'm.tests':'Internal tests','m.testsAll':'All results →','m.compat':'Compatibility','m.perf':'Performance','m.secT':'Security','m.notYet':'Not tested yet.',
  'm.perfRef':'Outside reference: {n} tokens per second (Artificial Analysis, {d})','m.pass':'{n} passed','m.fail':'{n} failed','m.review':'{n} to review','m.secWhen':'Pre-launch test, {d}',
  'm.costLink':'Estimate this model\'s cost →','m.gates':'Rollout progress','m.rel':'Related news','m.relAll':'All →','m.relNone':'No recent news mentions this model.',
  'm.repl':'It can replace','m.replNone':'Not named as a replacement in the calendar.','m.card':'Vendor model card',
  'gs.done':'Done','gs.doing':'In progress','gs.blocked':'Failed','gs.todo':'Not started',
  'g.G0':'Intake','g.G1':'Research','g.G2':'Compliance','g.G3':'Compatibility','g.G4':'Performance','g.G5':'Quality','g.G6':'Security','g.G7':'Cost review','g.G8':'Beta','g.G9':'Launch','g.G10':'Retirement',
  'tests.title':'Test results','tests.model':'Model','tests.all':'All models','tests.noSec':'No security test results for this model yet.','tests.status':'Test status','tests.compat':'Compatibility','tests.perf':'Performance','tests.sec':'Security','tests.none':'Not tested','tests.failN':'{n} failed','tests.passed':'Passed',
  'tests.secTitle':'Security test ({d})','tests.item':'Item','tests.rule':'Pass rule',
  'ui.label':'Appearance','ui.dark':'Dark','ui.light':'White','ui.beige':'Beige',
  'sx.title':'Security evaluation matrix','sx.scope':'Scope','sx.core':'Core (16)','sx.draft':'Draft additions (16)','sx.allN':'All 32','sx.arch':'Architecture','sx.archAll':'All architectures','sx.count':'{n} shown',
  'sx.how':'How to read this table','sx.runNote':'Result columns are the verdicts from the {d} run, judged by the thresholds used then, which are not always the matrix pass criteria; open an item to compare. Draft items SEC-17 to SEC-32 have not been tested yet.',
  'sx.relNote':'"Related material" counts the papers, community posts and cases listed on the matrix\'s original site; only the counts are shown here.','sx.enNote':'The English text is a translation; the Chinese matrix is the source.',
  'sx.id':'ID','sx.item':'Item','sx.owasp':'OWASP 2026','sx.archCol':'Architecture','sx.pri':'Priority','sx.tierCore':'Core','pri.high':'High','pri.medium':'Medium','pri.low':'Low','sx.notYet':'Not tested','sx.result':'Test results',
  'sx.what':'What it tests','sx.pass':'Pass criteria','sx.run':'Run on {d}','sx.runRule':'Threshold used: {r}','sx.rate':'{p}% failed','sx.cases':'{n} cases','sx.gw':'(tests the gateway, not a model)',
  'sx.tools':'Tools and method','sx.users':'Who it applies to','sx.unit':'Who tests','sx.atlas':'MITRE ATLAS','sx.moda':'MODA risk category','sx.note':'Notes','sx.why':'Why it is needed','sx.refs':'References',
  'sx.rel':'Related material','sx.relV':'{a} papers · {b} community posts · {c} cases','sx.other':'Other lists: {x}','sx.noRun':'The selected model has no security test results yet; only the test items are listed.','sx.empty':'No items match.',
  'v.pass':'Pass','v.fail':'Fail','v.review':'Review','v.info':'Recorded',
  'tests.cmp':'Same model, three clouds','tests.cmpText':'No measurements yet.','tests.mock':'Show the sample layout (fake data)','tests.mockBanner':'Sample layout: every number here is fake, not a real test of any model.',
  'mock.route':'Route','mock.cloud':'Cloud','mock.rate':'Compatible','mock.silent':'Silent downgrades','mock.gw':'Caused by gateway','mock.cloudlim':'Cloud limits','mock.delay':'Gateway delay',
  'cost.title':'Cost estimate','cost.wl':'Usage','cost.model':'Model','cost.all':'All models','cost.rpd':'Requests per day','cost.tin':'Input tokens per request','cost.tout':'Output tokens per request',
  'cost.basis':'{r} requests a day, {i} input and {o} output tokens each; 30 days at list price, without caching or batch discounts.',
  'cost.cloud':'Cloud','cost.mGlobal':'Monthly (global)','cost.mRes':'Monthly (chosen region)','cost.x':'× the cheapest','cost.cheapest':'Cheapest','cost.none':'No published prices.',
  'wl.chat':'Support Q&A','wl.doc':'Document summaries','wl.agent':'Coding agent','wl.custom':'Custom',
  'apply.title':'Request a model','apply.steps':'Steps','apply.form':'Request form',
  'step1':'Send a request','step1d':'Tell us the use, data class, expected volume and preferred cloud; we reply the same day.',
  'step2':'Compliance and data review','step2d':'Required for Security B, Security A/AA, other classes or customer-facing use: where data is processed, how long it is kept, which rules apply.',
  'step3':'Technical checks','step3d':'Compatibility, performance, quality, security and cost; models already tested reuse their results.',
  'step4':'Beta','step4d':'Two weeks with a small group; we move on only if nothing serious comes up.',
  'step5':'Launch','step5d':'We set up the gateway name and keys and publish a how-to.',
  'f.team':'Requesting unit','f.teamPh':'e.g. Digital Channels AI team','f.alias':'Your alias','f.aliasPh':'e.g. jchen','f.model':'Models (pick any)','f.modelPick':'Choose models','f.unsure':'Not sure: ask AI for a suggestion','f.nSel':'{n} selected','f.aiFill':'Fill it in with AI','f.modelShort':'Models','f.useShort':'What it\'s for','f.extShort':'Customer-facing','f.twShort':'Processed in Taiwan','f.noteShort':'Special notes','yes':'Yes','no':'No','f.use':'What it\'s for (a sentence or two)','f.usePh':'e.g. Q&A over the support knowledge base for staff',
  'f.class':'Data class','f.classPick':'Select…','c.other':'Other (please specify)','c.property':'Property','c.sec-c':'Security C','c.sec-b':'Security B','c.sec-a':'Security A/AA','f.classOther':'Describe the data class','f.classOtherPh':'e.g. anonymised summaries of customer data','f.cloud':'Preferred cloud','f.cloudAny':'Any',
  'f.rpd':'Requests per day','f.date':'Target date','f.tin':'Input tokens per request','f.tout':'Output tokens per request','f.ext':'Customer-facing (customers see the output)','f.tw':'Data must be processed in Taiwan',
  'f.note':'Special notes (optional)','f.notePh':'e.g. a fixed launch date, only one cloud allowed, reserved capacity needed','r.note':'Special notes',
  'f.submit':'Send request',
  'r.need':'Please fill in the requesting unit, your alias and what it\'s for.','r.needClass':'Please choose a data class.','r.needOther':'Please describe the data class.','r.alias':'Submitted by','r.class':'Data class','r.models':'Models requested','r.id':'Request {id}','r.pending':'Pending','r.gates':'Steps to pass','r.cost':'Estimated monthly cost (list price)','r.noModel':'None chosen; the platform team will suggest 2 or 3 options for your use and data class',
  'r.tw':'None of the {n} catalog models is processed inside Taiwan on any cloud; the closest is Bedrock\'s Japan region ({m}). This comes up first in the compliance review.','r.twNone':'None of the {n} catalog models is processed inside Taiwan on any cloud. This comes up first in the compliance review.','r.twSome':'Processed inside Taiwan: {m}. The compliance review confirms this.','r.noPrice':'{m} has no published price or isn\'t offered on the cloud you picked.','r.secReuse':'{m} already has security results ({d}); only the {n} failed items need a second look.','r.month':'{c} {v} / month',
  'r.sending':'Sending…','r.err':'Not sent','r.errNet':'Sending failed. Please try again later.','r.errAuth':'Your sign-in has expired. Reload the page and send it again.','r.errInvalid':'Some fields don\'t follow the rules: {m}','r.badAlias':'The alias may only use letters, digits, dots, underscores and hyphens.','r.badNum':'Requests per day and tokens must be whole numbers from 0 (up to 100 million requests and 10 million tokens).','r.tooMany':'Pick at most 10 models.','r.preview':' (estimated from the form)','r.next':'Next step','rs.in_review':'In review','rs.changes_requested':'Changes requested','rs.approved':'Approved','rs.provisioning':'Provisioning','rs.active':'Active','rs.trial':'Trial','rs.rejected':'Rejected','rs.failed':'Failed','rs.withdrawn':'Withdrawn','gst.pending':'pending','gst.approved':'approved','gst.rejected':'rejected','gst.skipped':'skipped','gst.done':'done',
  'foot':'Data as of {d}.',
  'chat.fab':'Ask','chat.title':'Ask the portal','chat.close':'Close','chat.in':'Your question','chat.ph':'e.g. Can I use Sonnet 5.5 from Taipei?','chat.send':'Send','chat.stop':'Stop',
  'chat.hello':'I answer from the portal\'s news, retirements, models, tests and request info, and point you to the right page.',
  'chat.s1':'Can I use Sonnet 5.5 from Taipei?','chat.s2':'Which models retire in November?','chat.s3':'What is the cheapest model?','chat.s4':'What happened to LiteLLM 1.107.0?',
  'chat.think':'Thinking…','chat.noAI':'AI answers aren\'t available right now, so here are the pages that look relevant:','chat.auth':'Your sign-in has expired. Please reload the page.','chat.tooLong':'That question is too long. Please make it shorter.',
  'chat.rate':'Too many questions at once. Please wait a moment and try again.','chat.refused':'I can\'t answer that one. Try asking another way.','chat.upstream':'The connection dropped. Please try again.','chat.stopped':'Stopped.',
  'chat.cut':'The answer was cut short. Try a more specific question.','chat.notfound':'Nothing in the portal matches. Try other words, or search the News page.','chat.pages':'Related pages',
  'load.loading':'Loading portal data…','load.error':'The portal data could not be loaded.','load.retry':'Try again','load.auth':'Please sign in with your company account, then reload this page.','load.empty':'The portal data is still being prepared. Please try again shortly.',
  'fa.title':'Request helper','fa.hello':'I\'ll help you pick models and fill in the form. Tell me: what will it do? Who uses it (staff or customers)? How sensitive is the data? Roughly how many requests a day? Any required cloud or launch date?',
  'fa.ph':'e.g. a customer support bot, about 30,000 requests a day, AWS only','fa.useChip':'Use what the form says: {u}','fa.back':'Back to general questions','fa.apply':'Apply to the form','fa.applied':'Applied to the form. Please double-check the data class before you submit.',
  'fa.noAI':'AI suggestions aren\'t available right now. Compare models in the catalog, or leave models empty and the platform team will suggest some.','fa.bad':'The AI reply wasn\'t in the right format. Please say it again.','fa.fill':'Suggested values','fa.q':'To narrow it down:',
  'col.avail':'Availability','av.available':'Ready to request','av.trial':'In beta','av.evaluating':'Not open yet','av.paused':'On hold',
  'av.eta':'Expected {p}','av.etaNote':'estimate from the rollout gates','av.basisEd':'date from the platform team','av.next':'next step: {g}',
  'av.availableT':'Ready to request','av.availableD':'This model is live; you can request access now.',
  'av.evaluatingT':'Not open for requests yet','av.evaluatingD':'Expected to open {p} ({n}). Subscribe to hear when it opens, or send a request now and it is handled once the model opens.',
  'av.evaluatingNoEta':'No expected date yet. Subscribe to hear when it opens, or send a request now and it is handled once the model opens.',
  'av.trialT':'In beta','av.trialD':'A small group is trying it; general availability is expected {p} ({n}). Subscribe, or send a request now.',
  'av.pausedT':'On hold','av.pausedD':'"{g}" did not pass, so the rollout is on hold; a new estimate follows once that is fixed.','av.pausedSec':'{n} security items failed:',
  'av.queue':'Send a request now','sub.on':'Notify me when it opens','sub.off':'Stop notifications',
  'sub.done':'Subscribed: we will tell you when {m} opens for requests.','sub.undone':'Notifications for {m} are off.','sub.err':'That did not work. Please try again later.',
  'mt.label':'Model information','mt.overview':'Model & strengths','mt.security':'Security & gateway','mt.rollout':'Rollout details',
  'm.release':'Released','m.where':'Where you can use it','m.taipeiYes':'Usable from Taipei (global)','m.taipeiNo':'Not usable from Taipei','m.good':'Good at',
  'm.secSum':'Security tests','m.secNone':'No security test results for this model yet.','m.secItems':'Failed or to-review items',
  'm.dp':'Data processing and regions','m.zdr':'Zero data retention','zdr.available':'Available','zdr.on-request':'On request','zdr.not-available':'Not offered','zdr.unknown':'Unknown',
  'm.gw':'Company gateway','m.gwAlias':'Gateway name','m.gwAliasD':'call the company gateway with this name','m.gwProv':'LiteLLM settings','m.gwVer':'LiteLLM version',
  'm.gwVerD':'Platform recommends {r}, at least {m}; never {a}','m.gwModelVer':'This model','m.gwMin':'Minimum for routing','m.gwCav':'Watch out for','m.gwLog':'Logging',
  'm.gwLogD':'The company gateway does not keep prompts or answers (turn_off_message_logging, SEC-31); it records usage and cost only.',
  'm.rollEta':'expected to open {p} (from the standard days per step)','m.gate':'Step','m.state':'Status','m.owner':'Owner','m.exit':'Done when','m.compatPerf':'Compatibility and performance',
  'cal.title':'Retirement calendar','cal.prev':'Previous month','cal.next':'Next month','cal.dow':'Sun,Mon,Tue,Wed,Thu,Fri,Sat','cal.day':'{m} {d}','cal.today':'today',
  'cal.events':'{n} retiring','cal.hint':'Point at an item in the list (or Tab to it) and the calendar circles its date in red.',
  'cal.todayL':'Today','cal.todayBtn':'Today {d}','cal.todayTitle':'Back to this month',
  'cal.noneLeft':'No more retirements this month','cal.nextEv':'Next: {d} ({n} days left)','cal.nextEv1':'Next: {d} (1 day left)','cal.nothing':'nothing else is scheduled'
}};
const t = (k, p) => { let s = T[lang][k]; if (s == null) s = T.zh[k]; if (s == null) s = k; if (p) for (const a of Object.keys(p)) s = s.split('{' + a + '}').join(p[a]); return s; };
const L = (zh, en) => (lang === 'en' && en) ? en : zh;

/* ------------------------------------------------------------------ helpers */
const SVC = {bedrock:'Bedrock', foundry:'Foundry', 'agent-platform':'Agent Platform', 'anthropic-api':'Anthropic API', 'openai-api':'OpenAI API', 'gemini-api':'Gemini API'};
const VENDOR = {anthropic:'Anthropic', openai:'OpenAI', google:'Google', xai:'xAI', meta:'Meta', mistral:'Mistral', deepseek:'DeepSeek', amazon:'Amazon', microsoft:'Microsoft', other:'—'};
const ORIGIN_EN = {'中國':'China', '德國':'Germany', '法國':'France', '美國':'USA', '美國（紐約布魯克林）':'USA (Brooklyn, NY)'};
const STCLS = {ga:'t-ok', preview:'t-chip', 'private-preview':'t-warn', restricted:'t-warn', 'not-offered':'t-none', unknown:'t-none'};
const SECCLS = {'上架':'t-chip','價格':'t-chip','退役':'t-warn','Gateway':'t-chip','資安':'t-hi','法規':'t-chip'};
const SOCLS = {supported:'t-ok', 'not-supported':'t-hi', partial:'t-warn', 'card-updated':'t-warn'};
const CLOUDS = ['aws','azure','gcp'];
const cloudName = c => c === 'aws' ? 'AWS' : c === 'azure' ? 'Azure' : c === 'gcp' ? 'Google Cloud' : t('maker');
const where = (cloud, svc) => (cloud === 'vendor-direct' || cloud === 'direct') ? (SVC[svc] || svc || t('maker')) : cloudName(cloud) + (svc ? ' ' + (SVC[svc] || svc) : '');
const fmtTok = v => v >= 1e6 ? (v / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M' : Math.round(v / 1000).toLocaleString('en-US') + 'K';
let byId = {};
const md = d => d ? d.slice(5) : '';
const money = v => v == null ? '—' : (v >= 100 ? '$' + Math.round(v).toLocaleString('en-US') : '$' + (+v).toFixed(2).replace(/\.00$/, ''));
const tag = (txt, cls) => `<span class="tag ${cls || ''}">${esc(txt)}</span>`;
const stTag = st => tag(t('st.' + st) === 'st.' + st ? (st || '—') : t('st.' + st), STCLS[st] || 't-none');
const secTag = s => tag(t('sec.' + s), SECCLS[s]);
const modelLinks = ids => (ids || []).filter(id => byId[id]).map(id => `<a class="pill" href="#m-${id}">${esc(byId[id].name)}</a>`).join(' ');
const srcLinks = s => (s && s.length) ? `<div class="src">${s.map(x => `<a href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.p ? x.p + '：' : '')}${esc(x.t)}</a>`).join('')}</div>` : '';
const now = new Date(); const TODAY = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const todayISO = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}-${String(TODAY.getDate()).padStart(2, '0')}`;
const daysTo = d => Math.round((new Date(d + 'T00:00:00') - TODAY) / 864e5);
const daysPill = n => n < 0 ? tag(t('ret.ago', {n: -n}), 't-ink') : n <= 30 ? tag(t('ret.left', {n}), 't-p0') : n <= 90 ? tag(t('ret.left', {n}), 't-warn') : tag(t('ret.left', {n}), '');
const nm = s => lang === 'en' ? String(s).replace(/（部分區域）/g, ' (some regions)').replace(/、/g, ', ').replace(/（/g, ' (').replace(/）/g, ')') : s;
const GST = {done:'g-done', doing:'g-doing', blocked:'g-blocked'};
const gateState = (mid, gid) => (D.progress[mid] || {})[gid];
const gateDots = mid => `<span class="dots" role="img" aria-label="${esc(t('col.progress'))}">${D.gates.map(g => { const s = gateState(mid, g.id); return `<span class="dot ${s ? GST[s] : ''}" title="${esc(t('g.' + g.id) + '：' + t('gs.' + (s || 'todo')))}"></span>`; }).join('')}</span>`;
const lowestPrice = m => { let best = null; for (const k of Object.keys(m.offs)) { const p = m.offs[k].price; if (p && p.in != null && (!best || p.in + p.out < best.in + best.out)) best = p; } return best; };
const blended = p => p ? (3 * p.in + p.out) / 4 : null;
const TIER_ORDER = {frontier:0, balanced:1, efficient:2};
const tierSort = (a, b) => (TIER_ORDER[a.tier] - TIER_ORDER[b.tier]) || ((b.aa ? b.aa.score : 0) - (a.aa ? a.aa.score : 0));
const one = m => L(m.oneZ, m.oneE), his = m => lang === 'en' ? m.hiE : m.hiZ, caus = m => lang === 'en' ? m.cauE : m.cauZ;
const breaks = m => m.breaking.map((b, i) => ({sev: b.sev, t: lang === 'en' ? (m.brE[i] || b.t) : b.t}));
const RULE_EN = {'失敗比例超過 10% 即不通過':'Fails above a 10% failure rate','失敗比例超過 20% 即不通過':'Fails above a 20% failure rate','任何一筆失敗即不通過（零容忍）':'Any failure fails (zero tolerance)','失敗比例不得高於現役模型（需與現役模型一起測）':'No worse than the current model (tested side by side)','僅記錄，不設門檻':'Recorded only, no threshold'};

const state = {newsSec:'all', newsCloud:'all', newsHigh:false, newsTab:'feed', retCloud:'all', retPast:false, tier:'all', cmp:new Set(), wl:'chat', wlCustom:{rpd:30000, tin:2000, tout:400}, costModel:'all', testModel:'all', showMock:false, secScope:'core', secArch:'all', secOpen:new Set(), hlOpen:new Set(), form: formDefaults()};

/* ------------------------------------------------------------------ overview */
function viewHome(){
  const isSec = h => h.sec === '資安' && h.imp === 'high';
  const hl = D.hl.map(h => ({...h, shown: h.date <= h.last ? h.date : h.last}))
    .sort((a, b) => (isSec(b) - isSec(a)) || b.shown.localeCompare(a.shown));
  return `
  <h1>${esc(t('hero.title'))}</h1>
  <section class="card" aria-labelledby="h-hl"><div class="card-h"><h2 id="h-hl">${esc(t('hl.title'))}<span class="when">${esc(D.asOf)}</span></h2><a class="more" href="#news">${esc(t('hl.all'))}</a></div>
    <div class="rows">${hl.map(hlRow).join('')}</div>
  </section>
  <section aria-labelledby="h-cd"><h2 class="u-mb12" id="h-cd">${esc(t('cd.title'))}</h2>
    <div class="cd">${cdCol('new')}${cdCol('price')}${cdCol('retire')}</div></section>
  <section class="card" aria-labelledby="h-cat"><div class="card-h"><h2 id="h-cat">${esc(t('cat.title'))}</h2><a class="more" href="#models">${esc(t('cat.more'))}</a></div>${catalogTable()}</section>`;
}
function hlRow(h){
  const n = D.news.find(x => x.id === h.id), open = state.hlOpen.has(h.id);
  const title = esc(L(h.zh, h.en)), end = `<span class="end">${h.imp === 'high' ? tag(t('imp.high'), 't-hi') : ''}</span>`;
  if (!n) return `<div class="row"><span class="date">${md(h.shown)}</span><span class="cat">${secTag(h.sec)}</span><span class="ttl">${title}</span>${end}</div>`;
  const where = n.clouds.map(c => tag(cloudName(c === 'vendor-direct' ? 'direct' : c), '')).join(' ');
  return `<div class="row" id="hl-${h.id}">
    <span class="date">${md(h.shown)}</span>
    <span class="cat">${secTag(h.sec)}</span>
    <div class="main"><button type="button" class="nbtn" data-act="hlToggle" data-id="${h.id}" aria-expanded="${open}" aria-controls="hd-${h.id}">${title}</button>
      <div class="ndetail" id="hd-${h.id}" ${open ? '' : 'hidden'}>
        ${where || n.models.length ? `<div class="nmeta chips u-m008">${where} ${modelLinks(n.models)}</div>` : ''}
        ${lang === 'en' ? `<p class="small u-m006">${esc(t('news.enNote'))}</p>` : ''}${esc(n.d)}${srcLinks(n.src)}
        <div class="small u-mt8">${esc(t('news.when', {a: n.first, b: n.last}))}</div>
      </div>
    </div>
    ${end}
  </div>`;
}
function retireGroups(maxDays){
  const g = new Map();
  D.ret.forEach(r => { const dd = daysTo(r.date); if (dd < 0 || dd > maxDays) return;
    const k = r.date + '|' + r.cloud + '|' + r.svc;
    if (!g.has(k)) g.set(k, {date: r.date, cloud: r.cloud, svc: r.svc, names: [], repl: [], soonest: true});
    const x = g.get(k); x.names.push(r.name); if (r.repl && !x.repl.includes(r.repl)) x.repl.push(r.repl); if (r.ev !== 'eol-no-sooner-than') x.soonest = false; });
  return [...g.values()].sort((a, b) => a.date.localeCompare(b.date));
}
function groupTitle(g){
  const names = g.names.map(nm);
  const x = names.length > 2 ? names.slice(0, 2).join(lang === 'en' ? ', ' : '、') + ' ' + t('cdr.more', {n: names.length - 2}) : names.join(lang === 'en' ? ', ' : '、');
  return t(g.soonest ? 'cdr.soonest' : 'cdr.retire', {x});
}
function cdCol(kind){
  let items;
  if (kind === 'new') items = D.cdNew.map(c => ({d: c.date, t: L(c.zh, c.en), w: L(c.wz, c.we), link: c.link}));
  else if (kind === 'price') items = D.cdPrice.map(c => ({d: c.date, t: L(c.zh, c.en), w: L(c.wz, c.we), link: c.link}));
  else items = retireGroups(30).slice(0, 6).map(g => ({d: g.date, t: groupTitle(g), w: where(g.cloud, g.svc) + (g.repl.length ? ' → ' + g.repl.slice(0, 2).join(' / ') + (g.repl.length > 2 ? ' …' : '') : ''), link: '#retire'}));
  items = items.filter(x => !x.d || daysTo(x.d) >= 0).sort((a, b) => ((a.d ? 0 : 1) - (b.d ? 0 : 1)) || (a.d || '').localeCompare(b.d || ''));
  return `<div class="card"><div class="card-h"><h3>${esc(t('cd.' + kind))}</h3>${kind === 'retire' ? `<a class="more" href="#retire">${esc(t('cd.allRetire'))}</a>` : ''}</div>
    <div class="cd-list">${items.map(x => cdItem(x, kind)).join('') || `<div class="empty">${esc(t('cd.none'))}</div>`}</div></div>`;
}
function cdItem(x, kind){
  const n = x.d ? daysTo(x.d) : null;
  const cls = n == null ? 'tbd' : n === 0 ? 'now urgent' : kind === 'retire' ? (n <= 14 ? 'urgent' : 'soon') : (n <= 7 ? 'soon' : '');
  const box = n == null ? `<span>${esc(t('cd.tbd'))}</span>` : n === 0 ? `<span>${esc(t('cd.today'))}</span>` : `<b>${n}</b><span>${esc(t('cd.unit'))}</span>`;
  return `<a class="cd-item" href="${x.link}"><span class="cd-d ${cls}">${box}</span><span><span class="cd-t">${esc(x.t)}</span><span class="cd-w">${x.d ? `<span class="mono">${esc(x.d)}</span> · ` : ''}${esc(x.w)}</span></span></a>`;
}
function catalogTable(){
  const ms = [...D.models].sort(tierSort);
  return `<div class="tbl-wrap"><table><thead><tr><th>${esc(t('col.model'))}</th><th>${esc(t('col.tier'))}</th><th class="num">${esc(t('col.score'))}</th><th class="num">${esc(t('col.price'))}</th>${CLOUDS.map(c => `<th>${cloudName(c)}</th>`).join('')}</tr></thead><tbody>
  ${ms.map(m => { const p = lowestPrice(m); return `<tr><td class="mname"><a href="#m-${m.id}">${esc(m.name)}</a></td><td>${tag(t('tier.' + m.tier), 't-chip')}</td><td class="num">${m.aa ? m.aa.score : '—'}</td><td class="num">${p ? money(p.in) + ' / ' + money(p.out) : '—'}</td>${CLOUDS.map(c => `<td>${stTag(m.offs[c] ? m.offs[c].status : 'not-offered')}</td>`).join('')}</tr>`; }).join('')}
  </tbody></table></div>`;
}

/* ------------------------------------------------------------------ news */
function viewNews(tab, item){
  state.newsTab = tab || 'feed';
  if (item) { state.newsSec = 'all'; state.newsCloud = 'all'; state.newsHigh = false; }
  const tabs = `<div class="seg" role="group" aria-label="${esc(t('news.tabs'))}">${[['feed','news.feed'],['open','news.open'],['todo','news.todo']].map(([v, k]) => `<button type="button" data-act="newsTab" data-v="${v}" aria-pressed="${state.newsTab === v}">${esc(t(k))}</button>`).join('')}</div>`;
  const head = `<h1>${esc(t('news.title'))}</h1>` + (lang === 'en' ? `<div class="banner info">${esc(t('news.enNote'))}</div>` : '');
  if (state.newsTab === 'open') return head + tabs + openTable();
  if (state.newsTab === 'todo') return head + tabs + todoList();
  const secs = ['all','上架','價格','退役','Gateway','資安','法規'];
  const rows = D.news.filter(n => (state.newsSec === 'all' || n.sec === state.newsSec)
      && (state.newsCloud === 'all' || n.clouds.includes(state.newsCloud) || (state.newsCloud === 'direct' && n.clouds.includes('vendor-direct')))
      && (!state.newsHigh || n.imp === 'high'));
  return head + tabs + `
  <div class="card">
    <div class="toolbar u-mb10"><div class="seg" role="group" aria-label="${esc(t('news.cat'))}">${secs.map(s => `<button type="button" data-act="newsSec" data-v="${s}" aria-pressed="${state.newsSec === s}">${esc(t('sec.' + s))}</button>`).join('')}</div></div>
    <div class="toolbar u-mb6">
      <div class="seg" role="group" aria-label="${esc(t('news.cloud'))}">${[['all', t('cloud.all')],['aws','AWS'],['azure','Azure'],['gcp','Google Cloud'],['direct', t('maker')]].map(([v, l]) => `<button type="button" data-act="newsCloud" data-v="${v}" aria-pressed="${state.newsCloud === v}">${esc(l)}</button>`).join('')}</div>
      <label class="chk"><input type="checkbox" data-act="newsHigh" ${state.newsHigh ? 'checked' : ''}>${esc(t('news.high'))}</label>
      <span class="count">${esc(t('news.count', {n: rows.length}))}</span>
    </div>
    <div class="rows">${rows.length ? rows.map(n => newsRow(n, n.id === item)).join('') : `<div class="empty">${esc(t('news.empty'))}</div>`}</div>
  </div>`;
}
function newsRow(n, open){
  return `<div class="row" id="row-${n.id}">
    <span class="date">${md(n.shown)}</span>
    <span class="cat">${secTag(n.sec)}</span>
    <div class="main"><button type="button" class="nbtn" data-act="toggle" data-id="${n.id}" aria-expanded="${open ? 'true' : 'false'}">${esc(n.t)}</button>
      <div class="nmeta chips">${n.clouds.map(c => tag(cloudName(c === 'vendor-direct' ? 'direct' : c), '')).join(' ')} ${modelLinks(n.models)} ${n.isNew ? tag(t('news.new'), 't-ok') : ''}</div>
      <div class="ndetail" id="d-${n.id}" ${open ? '' : 'hidden'}>${esc(n.d)}${srcLinks(n.src)}<div class="small u-mt8">${esc(t('news.when', {a: n.first, b: n.last}))}</div></div>
    </div>
    <span class="end">${n.imp === 'high' ? tag(t('imp.high'), 't-hi') : ''}</span>
  </div>`;
}
function todoList(){
  const cut = s => { const i = s.search(/[：。]/); return i > 0 && i <= 46 ? [s.slice(0, i), s.slice(i + 1)] : [s.slice(0, 46) + '…', s]; };
  const dueTag = a => { if (!a.due) return tag(t('todo.ongoing'), ''); const d = daysTo(a.due); return d < 0 ? tag(t('todo.over', {n: -d}), 't-p0') : d <= 14 ? tag(t('todo.by', {d: md(a.due)}), 't-warn') : tag(t('todo.by', {d: md(a.due)}), ''); };
  return `<div class="card"><div class="rows">${D.actions.map((a, i) => { const [h] = cut(a.t); return `<div class="row rt">
    <span>${tag(t('p.' + a.p), a.p === 'P0' ? 't-p0' : a.p === 'P1' ? 't-chip' : '')}</span>
    <span>${dueTag(a)}</span>
    <div class="main"><button type="button" class="nbtn" data-act="toggle" data-id="a${i}" aria-expanded="false">${esc(h)}</button>
      <div class="nmeta chips">${modelLinks(a.models)}</div>
      <div class="ndetail" id="d-a${i}" hidden>${esc(a.t)}<div class="small u-mt8">${esc(t('todo.since', {a: a.first}))}</div></div></div></div>`; }).join('')}</div></div>`;
}
function openTable(){
  const HEAT = {hit:'t-ok', rising:'t-chip', watch:''};
  return `<div class="card"><div class="tbl-wrap"><table><thead><tr><th>${esc(t('open.model'))}</th><th>${esc(t('open.heat'))}</th><th>${esc(t('open.lic'))}</th>${CLOUDS.map(c => `<th>${cloudName(c)}</th>`).join('')}<th>${esc(t('open.one'))}</th></tr></thead><tbody>
  ${D.open.map(o => `<tr><td class="mname">${esc(o.name)}<div class="one u-minw0">${esc(o.dev)}${o.origin ? ' · ' + esc(lang === 'en' ? (ORIGIN_EN[o.origin] || o.origin) : o.origin) : ''} · ${esc(o.release || '')}</div></td>
    <td>${tag(t('heat.' + o.heat), HEAT[o.heat] || '')}</td><td class="u-minw140">${esc(o.license || t('open.nolic'))}</td>
    ${CLOUDS.map(c => `<td>${stTag(o.host[c] || 'not-offered')}</td>`).join('')}<td class="u-minw280">${esc(o.one)}</td></tr>`).join('')}
  </tbody></table></div></div>`;
}

/* ------------------------------------------------------------------ retirements: list + small month calendar */
const pad2 = n => String(n).padStart(2, '0');
const cal = {month: null, row: null, day: null};
const curMonth = () => `${TODAY.getFullYear()}-${pad2(TODAY.getMonth() + 1)}`;
/* short date for the calendar texts: 10/31, or Oct 31 in English */
const shortDay = iso => lang === 'en' ? `${MON_EN[+iso.slice(5, 7) - 1].slice(0, 3)} ${+iso.slice(8, 10)}` : `${+iso.slice(5, 7)}/${+iso.slice(8, 10)}`;
function retRows(){
  return D.ret.map(r => ({...r, dd: daysTo(r.date)})).filter(r => (r.dd >= 0 || (state.retPast && r.dd >= -14)) && (state.retCloud === 'all' || r.cloud === state.retCloud || (state.retCloud === 'direct' && r.cloud === 'vendor-direct')));
}
/* the calendar opens on this month every time the page is opened, so today is always in view at first */
window.addEventListener('hashchange', () => { if (!/^#retire\b/.test(location.hash)) cal.month = null; });
function viewRetire(){
  const rows = retRows(), cur = curMonth();
  if (!cal.month) cal.month = cur;
  const groups = {};
  rows.forEach(r => { const k = r.date.slice(0, 7); (groups[k] = groups[k] || []).push(r); });
  /* with the last 14 days shown too, a "today" line separates what has passed from what is coming */
  const past = rows.filter(r => r.dd < 0);
  const divAt = state.retPast && past.length ? (groups[cur] ? cur : past[past.length - 1].date.slice(0, 7)) : null;
  const divHtml = `<tr class="ret-today"><td colspan="5"><div class="ret-today-in"><span class="ret-today-l">${esc(t('cal.todayBtn', {d: shortDay(todayISO)}))}</span></div></td></tr>`;
  const rowHtml = r => `<tr class="ret-row" tabindex="0" data-date="${r.date}">
        <td class="date w60">${md(r.date)}</td><td class="w120">${daysPill(r.dd)}</td>
        <td><span class="ttl ttl16">${esc(nm(r.name))}</span> <span class="small">${esc(t('ev.' + r.ev))}</span><div class="small mono wrap">${esc(r.pmid)}${r.scope && lang !== 'en' ? ' · ' + esc(r.scope) : ''}</div></td>
        <td class="nowrap">${r.cloud === 'vendor-direct' ? tag(SVC[r.svc] || r.svc, '') : `${tag(cloudName(r.cloud), '')} <span class="small">${esc(SVC[r.svc] || r.svc)}</span>`}</td>
        <td class="minw150">${r.repl ? '→ ' + esc(r.repl) : `<span class="small">${esc(t('ret.norepl'))}</span>`}</td></tr>`;
  const body = k => {
    const g = groups[k];
    if (k !== divAt) return g.map(rowHtml).join('');
    const i = g.findIndex(r => r.dd >= 0), n = i < 0 ? g.length : i;
    return g.slice(0, n).map(rowHtml).join('') + divHtml + g.slice(n).map(rowHtml).join('');
  };
  return `<h1>${esc(t('ret.title'))}</h1>
  <div class="ret-layout">
    <aside class="card cal" id="ret-cal" aria-label="${esc(t('cal.title'))}">${calHtml(rows)}</aside>
    <div class="card ret-list">
    <div class="toolbar tb8">
      <div class="seg" role="group" aria-label="${esc(t('news.cloud'))}">${[['all', t('sec.all')],['aws','AWS'],['azure','Azure'],['gcp','Google Cloud'],['direct', t('maker')]].map(([v, l]) => `<button type="button" data-act="retCloud" data-v="${v}" aria-pressed="${state.retCloud === v}">${esc(l)}</button>`).join('')}</div>
      <label class="chk"><input type="checkbox" data-act="retPast" ${state.retPast ? 'checked' : ''}>${esc(t('ret.past'))}</label>
      <span class="count">${esc(t('ret.count', {n: rows.length}))}</span>
    </div>
    ${Object.keys(groups).sort().map(k => `<h3 class="ret-month">${esc(t('ret.month', {y: k.slice(0, 4), m: lang === 'en' ? MON_EN[+k.slice(5) - 1] : +k.slice(5)}))}</h3>
      <div class="tbl-wrap"><table><tbody>${body(k)}</tbody></table></div>`).join('') || `<div class="empty">${esc(t('ret.empty'))}</div>`}
    </div>
  </div>`;
}
function calHtml(rows){
  const [y, mo] = cal.month.split('-').map(Number), cur = curMonth();
  const lead = new Date(y, mo - 1, 1).getDay(), days = new Date(y, mo, 0).getDate();
  const byDate = {};
  rows.forEach(r => { byDate[r.date] = (byDate[r.date] || 0) + 1; });
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push('<td></td>');
  for (let d = 1; d <= days; d++) {
    const iso = `${y}-${pad2(mo)}-${pad2(d)}`, n = byDate[iso] || 0, today = iso === todayISO;
    const cls = `cal-d${n ? ' has' : ''}${today ? ' today' : ''}${iso < todayISO ? ' past' : ''}`;
    if (n) {
      const label = t('cal.day', {m: lang === 'en' ? MON_EN[mo - 1] : mo, d}) + (today ? ' · ' + t('cal.today') : '') + (lang === 'en' ? ': ' : '：') + t('cal.events', {n});
      cells.push(`<td><button type="button" class="${cls}" data-cal="${iso}" aria-label="${esc(label)}"${today ? ' aria-current="date"' : ''}><span class="cal-n">${d}</span>${today ? `<span class="cal-today-l" aria-hidden="true">${esc(t('cal.todayL'))}</span>` : ''}<span class="cal-dot" aria-hidden="true"></span></button></td>`);
    } else {
      cells.push(`<td><span class="${cls}"${today ? ' aria-current="date"' : ''}><span class="cal-n">${d}</span>${today ? `<span class="cal-today-l">${esc(t('cal.todayL'))}</span>` : ''}</span></td>`);
    }
  }
  while (cells.length % 7) cells.push('<td></td>');
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(`<tr>${cells.slice(i, i + 7).join('')}</tr>`);
  /* this month with nothing left to retire: say when the next one is, and jump there */
  let next = '';
  if (cal.month === cur && !rows.some(r => r.date >= todayISO && r.date.slice(0, 7) === cur)) {
    const nx = rows.find(r => r.date > todayISO);
    next = nx ? `<button type="button" class="cal-next" data-act="calNextEv" data-date="${nx.date}"><span><span class="cal-next-a">${esc(t('cal.noneLeft'))} · </span><span class="cal-next-b">${esc(t(nx.dd === 1 ? 'cal.nextEv1' : 'cal.nextEv', {d: shortDay(nx.date), n: nx.dd}))}</span></span><span aria-hidden="true">→</span></button>`
      : `<p class="small cal-next-none">${esc(t('cal.noneLeft'))} · ${esc(t('cal.nothing'))}</p>`;
  }
  return `<div class="cal-h"><h2 class="cal-t" id="cal-t" aria-live="polite">${esc(t('ret.month', {y, m: lang === 'en' ? MON_EN[mo - 1] : mo}))}</h2>
    <div class="cal-ctl"><button type="button" class="cal-today-btn${cal.month === cur ? '' : ' away'}" data-act="calToday" title="${esc(t('cal.todayTitle'))}"><span class="cal-today-ic" aria-hidden="true"></span>${esc(t('cal.todayBtn', {d: shortDay(todayISO)}))}</button>
    <button type="button" class="cal-nav" data-act="calPrev" aria-label="${esc(t('cal.prev'))}">‹</button><button type="button" class="cal-nav" data-act="calNext" aria-label="${esc(t('cal.next'))}">›</button></div></div>
    <table class="cal-g" aria-labelledby="cal-t"><thead><tr>${t('cal.dow').split(',').map(x => `<th scope="col">${esc(x)}</th>`).join('')}</tr></thead><tbody>${weeks.join('')}</tbody></table>${next}
    <p class="small cal-hint">${esc(t('cal.hint'))}</p>`;
}
/* re-render the calendar; a header button that had focus keeps it (keyboard users stay put) */
function renderCal(){
  const el = document.getElementById('ret-cal'); if (!el) return;
  const a = document.activeElement, act = a && el.contains(a) && a.dataset ? a.dataset.act : '';
  el.innerHTML = calHtml(retRows());
  const back = act && el.querySelector(`[data-act="${act}"]`);
  if (back) back.focus({preventScroll: true});
}
function calShift(n){ const [y, mo] = cal.month.split('-').map(Number), d = new Date(y, mo - 1 + n, 1); cal.month = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`; renderCal(); }
function calToday(){ cal.month = curMonth(); renderCal(); }
/* jump to a date's month, circle it and move focus there (its rows are marked as on focus) */
function calJump(iso){
  if (!iso) return;
  cal.month = iso.slice(0, 7); renderCal();
  const cell = document.querySelector(`#ret-cal [data-cal="${iso}"]`);
  if (cell) cell.focus({preventScroll: true});
  circleDate(iso);
}
/* a red-pen loop around one date: a slightly uneven hand-drawn path, turned a little differently per day */
const PEN = 'M30.4 7.6C22.3 3.9 9.1 6.1 6.4 17.2 4.2 27.1 11.4 38.1 22.8 38.3 33.6 38.5 40.4 30.1 38.9 19.6 37.8 11.8 31.1 6.3 21.9 6.6 17.7 6.8 14.6 8.4 12.6 10.3';
function circleDate(iso){
  if (iso && document.querySelector(`#ret-cal .circled[data-cal="${iso}"]`)) return;
  uncircle();
  if (!iso) return;
  if (cal.month !== iso.slice(0, 7)) { cal.month = iso.slice(0, 7); renderCal(); }
  const cell = document.querySelector(`#ret-cal [data-cal="${iso}"]`);
  if (!cell) return;
  const turn = (+iso.slice(8, 10) * 37) % 50 - 25;
  cell.insertAdjacentHTML('beforeend', `<svg class="pen" viewBox="0 0 44 44" aria-hidden="true" focusable="false"><path d="${PEN}" transform="rotate(${turn} 22 22)" pathLength="100"/></svg>`);
  cell.classList.add('circled');
}
function uncircle(){
  document.querySelectorAll('#ret-cal .pen').forEach(x => x.remove());
  document.querySelectorAll('#ret-cal .circled').forEach(x => x.classList.remove('circled'));
}
function markRows(iso, scroll){
  document.querySelectorAll('.ret-row.cal-hl').forEach(r => r.classList.remove('cal-hl'));
  if (!iso) return;
  const rs = [...document.querySelectorAll(`.ret-row[data-date="${iso}"]`)];
  rs.forEach(r => r.classList.add('cal-hl'));
  if (scroll && rs[0]) {
    rs.forEach(r => { r.classList.remove('flash'); void r.offsetWidth; r.classList.add('flash'); });
    rs[0].scrollIntoView({block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  }
}
const calRow = el => el && el.closest ? el.closest('tr.ret-row') : null;
const calDay = el => el && el.closest ? el.closest('#ret-cal button[data-cal]') : null;
app.addEventListener('mouseover', e => {
  const row = calRow(e.target), day = calDay(e.target);
  if (row && row !== cal.row) { cal.row = row; circleDate(row.dataset.date); }
  if (day && day !== cal.day) { cal.day = day; circleDate(day.dataset.cal); markRows(day.dataset.cal); }
});
app.addEventListener('mouseout', e => {
  const row = calRow(e.target), day = calDay(e.target), to = e.relatedTarget;
  if (row && !(to && row.contains(to))) { cal.row = null; if (!cal.day) uncircle(); }
  if (day && !(to && day.contains(to))) { cal.day = null; uncircle(); markRows(null); }
});
app.addEventListener('focusin', e => {
  const row = calRow(e.target), day = calDay(e.target);
  if (row) circleDate(row.dataset.date);
  if (day) { circleDate(day.dataset.cal); markRows(day.dataset.cal); }
});
app.addEventListener('focusout', e => {
  if (!calRow(e.target) && !calDay(e.target)) return;
  if (calRow(e.relatedTarget) || calDay(e.relatedTarget)) return;
  uncircle(); markRows(null);
});
app.addEventListener('click', e => {
  const day = calDay(e.target);
  if (day) { circleDate(day.dataset.cal); markRows(day.dataset.cal, true); }
});

/* ------------------------------------------------------------------ models */
function viewModels(){
  const list = D.models.filter(m => state.tier === 'all' || m.tier === state.tier).sort(tierSort);
  return `<h1>${esc(t('models.title'))}</h1>
  <div class="card">
    <div class="toolbar u-mb10"><div class="seg" role="group" aria-label="${esc(t('col.tier'))}">${[['all', t('sec.all')],['frontier', t('tier.frontier')],['balanced', t('tier.balanced')],['efficient', t('tier.efficient')]].map(([v, l]) => `<button type="button" data-act="tier" data-v="${v}" aria-pressed="${state.tier === v}">${esc(l)}</button>`).join('')}</div></div>
    <div class="tbl-wrap"><table><thead><tr><th>${esc(t('col.compare'))}</th><th>${esc(t('col.model'))}</th><th class="num">${esc(t('col.score'))}</th><th class="num">${esc(t('col.price'))}</th>${CLOUDS.map(c => `<th>${cloudName(c)}</th>`).join('')}<th>${esc(t('col.taipei'))}</th><th>${esc(t('col.avail'))}</th></tr></thead><tbody>
    ${list.map(m => { const p = lowestPrice(m); const tw = m.offs.aws ? m.offs.aws.taipei : null; return `<tr>
      <td><input class="u-chk20" type="checkbox" aria-label="${esc(t('cmp.add', {m: m.name}))}" data-act="cmp" data-id="${m.id}" ${state.cmp.has(m.id) ? 'checked' : ''}></td>
      <td class="mname"><a href="#m-${m.id}">${esc(m.name)}</a> ${tag(t('tier.' + m.tier), 't-chip')}<div class="one">${esc(one(m))}</div></td>
      <td class="num">${m.aa ? m.aa.score : '—'}</td><td class="num">${p ? money(p.in) + ' / ' + money(p.out) : '—'}</td>
      ${CLOUDS.map(c => `<td>${stTag(m.offs[c] ? m.offs[c].status : 'not-offered')}</td>`).join('')}
      <td>${tw === 'global' ? tag(t('taipei.global'), 't-warn') : m.offs.aws ? tag(t('taipei.none'), 't-none') : '—'}</td>
      <td class="minw140">${availShort(m)}</td></tr>`; }).join('')}
    </tbody></table></div>
  </div>
  <div class="card"><div class="card-h"><h2>${esc(t('chart.title'))}</h2></div>${scatter()}</div>
  ${state.cmp.size ? compareBlock() : ''}
  ${state.cmp.size ? `<div class="cmpbar"><span>${esc(t('cmp.sel', {n: state.cmp.size}))}</span><button type="button" class="btn" data-act="cmpClear">${esc(t('cmp.clear'))}</button></div>` : ''}`;
}
function scatter(){
  const W = 760, H = 330, Lm = 48, R = 150, Tm = 16, B = 44;
  const xs = [0.1, 0.3, 1, 3, 10, 30], ymin = 35, ymax = 60;
  const xp = v => Lm + (Math.log10(v) - Math.log10(0.1)) / (Math.log10(30) - Math.log10(0.1)) * (W - Lm - R);
  const yp = v => Tm + (ymax - v) / (ymax - ymin) * (H - Tm - B);
  const pts = D.models.filter(m => m.aa && lowestPrice(m)).map(m => ({m, x: blended(lowestPrice(m)), y: m.aa.score}));
  const placed = [];
  const marks = pts.sort((a, b) => b.y - a.y).map(p => { let ly = yp(p.y) + 4; const lx = xp(p.x) + 10;
    for (let i = 0; i < 8; i++) { if (placed.some(q => Math.abs(q.x - lx) < 110 && Math.abs(q.y - ly) < 14)) ly += 14; else break; }
    placed.push({x: lx, y: ly}); return {...p, ly}; });
  return `<div class="tbl-wrap"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('chart.aria'))}">
    ${[35,40,45,50,55,60].map(v => `<line class="grid-l" x1="${Lm}" x2="${W - R}" y1="${yp(v)}" y2="${yp(v)}"></line><text x="${Lm - 8}" y="${yp(v) + 4}" text-anchor="end">${v}</text>`).join('')}
    ${xs.map(v => `<line class="grid-l" x1="${xp(v)}" x2="${xp(v)}" y1="${Tm}" y2="${H - B}"></line><text x="${xp(v)}" y="${H - B + 18}" text-anchor="middle">$${v}</text>`).join('')}
    <text class="lbl" x="${(W - R + Lm) / 2}" y="${H - 6}" text-anchor="middle">${esc(t('chart.x'))}</text>
    ${marks.map(p => `<a href="#m-${p.m.id}"><circle class="pt${state.cmp.has(p.m.id) ? ' sel' : ''}" cx="${xp(p.x)}" cy="${yp(p.y)}" r="6"><title>${esc(p.m.name)}: ${p.y} · $${p.x.toFixed(2)}</title></circle><text class="lbl" x="${xp(p.x) + 10}" y="${p.ly}">${esc(p.m.name)}</text></a>`).join('')}
  </svg></div>`;
}
function compareBlock(){
  const ms = [...state.cmp].map(id => byId[id]).filter(Boolean);
  const row = (k, f) => `<tr><th class="u-normal">${esc(t(k))}</th>${ms.map(m => `<td>${f(m)}</td>`).join('')}</tr>`;
  return `<div class="card"><div class="card-h"><h2>${esc(t('cmp.title'))}</h2></div><div class="tbl-wrap"><table><thead><tr><th></th>${ms.map(m => `<th class="mname"><a href="#m-${m.id}">${esc(m.name)}</a></th>`).join('')}</tr></thead><tbody>
    ${row('cmp.one', m => esc(one(m)))}
    ${row('cmp.score', m => m.aa ? `<span class="mono">${m.aa.score}</span>` : '—')}
    ${row('cmp.price', m => { const p = lowestPrice(m); return p ? `<span class="mono">${money(p.in)} / ${money(p.out)}</span>` : '—'; })}
    ${row('cmp.ctx', m => `<span class="mono">${fmtTok(m.ctx)} / ${fmtTok(m.maxOut)}</span>`)}
    ${row('cmp.avail', m => CLOUDS.map(c => m.offs[c] ? cloudName(c) + ' ' + stTag(m.offs[c].status) : '').filter(Boolean).join('<br>'))}
    ${row('cmp.cau', m => `<ul class="bul">${caus(m).map(c => `<li>${esc(c)}</li>`).join('')}</ul>`)}
  </tbody></table></div></div>`;
}

/* ------------------------------------------------------------------ availability (computed by view-builder: models[].avail) */
const MON_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const AVCLS = {available:'t-ok', trial:'t-chip', evaluating:'t-warn', paused:'t-hi'};
const av = m => m.avail || {state:'evaluating', eta:null, next_gate:null, basis:'gates'};
/* 2026-11-30 -> 「11 月下旬」 / "late November" (the year only when it is not this year) */
function etaPart(eta){
  if (!eta) return '';
  const y = +eta.slice(0, 4), mo = +eta.slice(5, 7), d = +eta.slice(8, 10), k = d <= 10 ? 0 : d <= 20 ? 1 : 2, other = y !== TODAY.getFullYear();
  return lang === 'en' ? ['early', 'mid', 'late'][k] + ' ' + MON_EN[mo - 1] + (other ? ' ' + y : '') : (other ? y + ' 年 ' : '') + mo + ' 月' + ['上旬', '中旬', '下旬'][k];
}
const availTag = m => tag(t('av.' + av(m).state), AVCLS[av(m).state] || '');
function availShort(m){ const a = av(m); return availTag(m) + (a.eta && (a.state === 'evaluating' || a.state === 'trial') ? `<div class="small">${esc(t('av.eta', {p: etaPart(a.eta)}))}</div>` : ''); }
function availPanel(m){
  const a = av(m), on = subs.has(m.id), msg = state.subMsg && state.subMsg.id === m.id ? state.subMsg : null;
  const gate = a.next_gate ? t('g.' + a.next_gate) : '';
  const how = (a.basis === 'editorial' ? t('av.basisEd') : t('av.etaNote')) + (gate && a.state !== 'paused' ? (lang === 'en' ? '; ' : '；') + t('av.next', {g: gate}) : '');
  const subBtn = `<button type="button" class="btn" data-act="sub" data-id="${m.id}" aria-pressed="${on}">${esc(t(on ? 'sub.off' : 'sub.on'))}</button>`;
  let body, extra = '', acts;
  if (a.state === 'available') { body = t('av.availableD'); acts = `<a class="btn primary" href="#apply-${m.id}">${esc(t('m.apply'))}</a>`; }
  else if (a.state === 'paused') {
    body = t('av.pausedD', {g: gate || '—'});
    const s = D.security.models[m.id], fails = a.next_gate === 'G6' && s ? s.issues.filter(i => i.v === 'fail') : [];
    if (fails.length) extra = `<p class="avail-sub">${esc(t('av.pausedSec', {n: fails.length}))}</p><ul class="bul">${fails.map(i => `<li><a href="#sec-${i.id}">${esc(i.id + ' ' + L(i.t, i.tEn))}</a></li>`).join('')}</ul>`;
    acts = subBtn;
  } else {
    body = a.eta ? t(a.state === 'trial' ? 'av.trialD' : 'av.evaluatingD', {p: etaPart(a.eta), n: how}) : t('av.evaluatingNoEta');
    acts = subBtn + `<a class="btn" href="#apply-${m.id}">${esc(t('av.queue'))}</a>`;
  }
  return `<section class="card avail av-${a.state}" aria-labelledby="av-h"><div class="avail-h"><h2 id="av-h">${esc(t('av.' + a.state + 'T'))}</h2></div>
    <p class="avail-d">${esc(body)}</p>${extra}${a.note ? `<p class="small">${esc(a.note)}</p>` : ''}
    <div class="avail-act">${acts}</div>${msg && !msg.err ? `<p class="sub-msg" role="status">${esc(t(msg.on ? 'sub.done' : 'sub.undone', {m: m.name}))}</p>` : ''}${msg && msg.err ? `<p class="sub-err" role="alert">${esc(t('sub.err'))}</p>` : ''}</section>`;
}

/* ------------------------------------------------------------------ model page: three layers (#m-<id>, #m-<id>/security, #m-<id>/rollout) */
const MTABS = ['overview', 'security', 'rollout'];
const mRoute = (id, tab) => '#m-' + id + (tab && tab !== 'overview' ? '/' + tab : '');
function viewModel(id, tab){
  const m = byId[id];
  if (!m) return `<div class="empty">${esc(t('m.notfound'))} <a href="#models">${esc(t('m.back'))}</a></div>`;
  tab = MTABS.includes(tab) ? tab : 'overview';
  const tabs = MTABS.map((k, i) => `<a class="mtab" href="${mRoute(m.id, k)}"${k === tab ? ' aria-current="page"' : ''}><span class="mtab-n" aria-hidden="true">${i + 1}</span>${esc(t('mt.' + k))}</a>`).join('');
  return `
  <a class="back" href="#models">${esc(t('m.back'))}</a>
  <div class="mhead"><div><h1>${esc(m.name)}</h1><div class="chips mchips">${tag(t('tier.' + m.tier), 't-chip')} ${tag(VENDOR[m.vendor] || m.vendor, '')} ${availTag(m)}</div><p>${esc(one(m))}</p></div>
    <a class="btn primary" href="#apply-${m.id}">${esc(t('m.apply'))}</a></div>
  <nav class="mtabs" aria-label="${esc(t('mt.label'))}">${tabs}</nav>
  <div class="mlayer" id="mlayer">${tab === 'security' ? layerSecurity(m) : tab === 'rollout' ? layerRollout(m) : layerOverview(m)}</div>`;
}
function layerOverview(m){
  const p = lowestPrice(m), tw = m.offs.aws ? m.offs.aws.taipei : null;
  const relRet = D.ret.filter(r => r.repl && r.repl.includes(m.id)).slice(0, 4);
  const clouds = ['aws','azure','gcp','direct'].filter(c => m.offs[c]).map(c => tag(cloudName(c) + ' · ' + (t('st.' + m.offs[c].status) === 'st.' + m.offs[c].status ? m.offs[c].status : t('st.' + m.offs[c].status)), STCLS[m.offs[c].status] || 't-none')).join(' ');
  return `${availPanel(m)}
  <div class="facts">
    <div class="fact"><div class="k">${esc(t('m.fScore'))}</div><div class="v">${m.aa ? m.aa.score : '—'}</div></div>
    <div class="fact"><div class="k">${esc(t('m.fPrice'))}</div><div class="v">${p ? money(p.in) + ' / ' + money(p.out) : '—'}</div></div>
    <div class="fact"><div class="k">${esc(t('m.fCtx'))}</div><div class="v">${fmtTok(m.ctx)} / ${fmtTok(m.maxOut)}</div></div>
    <div class="fact"><div class="k">${esc(t('m.release'))}</div><div class="v">${esc(m.release || '—')}</div></div>
  </div>
  <div class="card"><h2 class="h2s">${esc(t('m.where'))}</h2><div class="chips">${clouds || esc(t('st.not-offered'))}${m.offs.aws ? ' ' + tag(t(tw === 'global' ? 'm.taipeiYes' : 'm.taipeiNo'), tw === 'global' ? 't-warn' : 't-none') : ''}</div></div>
  <div class="two">
    <div class="card"><h2 class="h2s">${esc(t('m.good'))}</h2><ul class="bul">${his(m).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="mt12"><a href="#cost-${m.id}">${esc(t('m.costLink'))}</a></p></div>
    <div class="card"><h2 class="h2s">${esc(t('m.repl'))}</h2>${relRet.length ? `<div class="rows">${relRet.map(r => `<div class="row rr"><span class="date">${md(r.date)}</span><span>${daysPill(daysTo(r.date))}</span><span class="main"><span class="ttl ttl16">${esc(r.name)}</span> <span class="small">${esc(where(r.cloud, r.svc))}</span></span></div>`).join('')}</div>` : `<p class="muted">${esc(t('m.replNone'))}</p>`}
      ${m.modelCard ? `<p class="mt12"><a href="${esc(m.modelCard)}" target="_blank" rel="noopener">${esc(t('m.card'))}</a></p>` : ''}</div>
  </div>`;
}
function layerSecurity(m){
  const s = D.security.models[m.id], g = m.gw || {}, P = D.gw || {};
  const cols = ['aws','azure','gcp','direct'].filter(c => m.offs[c]);
  const cell = (c, f) => `<td>${m.offs[c] ? f(m.offs[c]) : '—'}</td>`;
  const items = s ? s.issues : [];
  const sec = s ? `<p class="chips">${tag(t('m.pass', {n: s.counts.pass}), 't-ok')} ${tag(t('m.fail', {n: s.counts.fail}), 't-hi')} ${tag(t('m.review', {n: s.counts.review}), 't-warn')}</p>
      <p class="small">${esc(t('m.secWhen', {d: D.security.date}))}</p>
      ${items.length ? `<h3 class="h3s">${esc(t('m.secItems'))}</h3><ul class="bul">${items.map(i => `<li><a href="#sec-${i.id}">${esc(i.id + ' ' + L(i.t, i.tEn))}</a> ${secRes(i)}</li>`).join('')}</ul>` : ''}`
    : `<p class="muted">${esc(t('m.secNone'))}</p>`;
  const ver = P.recommended ? `<div>${esc(t('m.gwVerD', {r: P.recommended, m: P.minimum || '—', a: (P.avoid || []).slice(0, 2).join(lang === 'en' ? ', ' : '、') || '—'}))}</div>` : '';
  return `<div class="card"><div class="card-h"><h2>${esc(t('m.secSum'))}</h2><a class="more" href="#tests-${m.id}">${esc(t('m.testsAll'))}</a></div>${sec}</div>
  <div class="card"><div class="card-h"><h2>${esc(t('m.dp'))}</h2></div>
    <div class="tbl-wrap"><table><thead><tr><th></th>${cols.map(c => `<th>${cloudName(c)} · ${esc(SVC[m.offs[c].service] || '')}</th>`).join('')}</tr></thead><tbody>
      <tr><th>${esc(t('m.status'))}</th>${cols.map(c => cell(c, o => stTag(o.status))).join('')}</tr>
      <tr><th>${esc(t('m.tw'))}</th>${cols.map(c => cell(c, o => o.twResidency === 'no' ? tag(t('m.twNo'), 't-hi') : `<span class="small">${esc(t('m.twUnknown'))}</span>`)).join('')}</tr>
      <tr><th>${esc(t('col.taipei'))}</th>${cols.map(c => `<td>${c === 'aws' ? (m.offs.aws.taipei === 'global' ? tag(t('taipei.global'), 't-warn') : tag(t('taipei.none'), 't-none')) : '—'}</td>`).join('')}</tr>
      <tr><th>${esc(t('m.res'))}</th>${cols.map(c => cell(c, o => `<span class="small">${esc(nm((o.residency || []).join('、')) || '—')}</span>`)).join('')}</tr>
      <tr><th>${esc(t('m.zdr'))}</th>${cols.map(c => cell(c, o => o.zdr ? esc(t('zdr.' + o.zdr) === 'zdr.' + o.zdr ? o.zdr : t('zdr.' + o.zdr)) : `<span class="small">${esc(t('m.unrec'))}</span>`)).join('')}</tr>
      <tr><th>${esc(t('m.pRes'))}</th>${cols.map(c => cell(c, o => o.geoPrice ? `<span class="mono">${money(o.geoPrice.in)} / ${money(o.geoPrice.out)}</span>` : '—')).join('')}</tr>
    </tbody></table></div></div>
  <div class="card"><div class="card-h"><h2>${esc(t('m.gw'))}</h2></div><dl class="kv">
    <dt>${esc(t('m.gwAlias'))}</dt><dd><code class="mono">${esc(g.alias || m.id)}</code> <span class="small">${esc(t('m.gwAliasD'))}</span></dd>
    <dt>${esc(t('m.gwProv'))}</dt><dd>${(g.providers || []).length ? `<ul class="bul">${g.providers.map(x => `<li>${esc(SVC[x.svc] || x.svc || '')}${lang === 'en' ? ': ' : '：'}<code class="mono wrap">${esc(x.model)}</code>${x.note ? `<div class="small">${esc(x.note)}</div>` : ''}</li>`).join('')}</ul>` : `<span class="small">${esc(t('m.unrec'))}</span>`}</dd>
    <dt>${esc(t('m.gwVer'))}</dt><dd>${ver}${g.recVersion ? `<div class="small">${esc(t('m.gwModelVer'))}${lang === 'en' ? ': ' : '：'}${esc(g.recVersion)}</div>` : ''}${g.minVersion ? `<div class="small">${esc(t('m.gwMin'))}${lang === 'en' ? ': ' : '：'}${esc(g.minVersion)}</div>` : ''}</dd>
    ${(g.caveats || []).length ? `<dt>${esc(t('m.gwCav'))}</dt><dd><ul class="bul">${g.caveats.map(x => `<li>${esc(x)}</li>`).join('')}</ul></dd>` : ''}
    <dt>${esc(t('m.gwLog'))}</dt><dd>${esc(t('m.gwLogD'))}</dd>
  </dl></div>`;
}
const GSTAG = {done:'t-ok', doing:'t-chip', blocked:'t-hi'};
function layerRollout(m){
  const a = av(m), br = breaks(m);
  const rel = D.news.filter(n => n.models.includes(m.id)).slice(0, 5);
  const cols = ['aws','azure','gcp','direct'].filter(c => m.offs[c]);
  const cell = (c, f) => `<td>${m.offs[c] ? f(m.offs[c]) : '—'}</td>`;
  const when = a.eta && (a.state === 'evaluating' || a.state === 'trial') ? ' ' + esc(t('m.rollEta', {p: etaPart(a.eta)})) : '';
  return `<div class="card"><div class="card-h"><h2>${esc(t('m.gates'))}</h2>${gateDots(m.id)}</div>
    <p class="u-line">${availTag(m)}${when}${a.next_gate ? ' ' + esc(t('av.next', {g: t('g.' + a.next_gate)})) : ''}</p>
    <div class="gates">${D.gates.map(g => { const st = gateState(m.id, g.id); return `<div class="gate ${st ? GST[st] : ''}"><span>${esc(t('g.' + g.id))}</span><small>${esc(t('gs.' + (st || 'todo')))}</small></div>`; }).join('')}</div>
    <div class="tbl-wrap mt12"><table><thead><tr><th>${esc(t('m.gate'))}</th><th>${esc(t('m.state'))}</th><th>${esc(t('m.owner'))}</th><th>${esc(t('m.exit'))}</th></tr></thead><tbody>
      ${D.gates.map(g => { const st = gateState(m.id, g.id); return `<tr><td class="nowrap"><span class="mono">${g.id}</span> ${esc(t('g.' + g.id))}</td><td>${tag(t('gs.' + (st || 'todo')), GSTAG[st] || 't-none')}</td><td>${esc(g.owner)}</td><td>${esc(g.exit)}</td></tr>`; }).join('')}
    </tbody></table></div></div>
  <div class="card"><div class="card-h"><h2>${esc(t('m.clouds'))}</h2></div>
    <div class="tbl-wrap"><table><thead><tr><th></th>${cols.map(c => `<th>${cloudName(c)} · ${esc(SVC[m.offs[c].service] || '')}</th>`).join('')}</tr></thead><tbody>
      <tr><th>${esc(t('m.status'))}</th>${cols.map(c => cell(c, o => stTag(o.status) + (o.since ? ` <span class="small mono">${esc(o.since)}</span>` : ''))).join('')}</tr>
      <tr><th>${esc(t('m.pGlobal'))}</th>${cols.map(c => cell(c, o => o.price ? `<span class="mono">${money(o.price.in)} / ${money(o.price.out)}</span>` : `<span class="small">${esc(t('m.unpub'))}</span>`)).join('')}</tr>
      <tr><th>${esc(t('m.pRes'))}</th>${cols.map(c => cell(c, o => o.geoPrice ? `<span class="mono">${money(o.geoPrice.in)} / ${money(o.geoPrice.out)}</span>` : '—')).join('')}</tr>
      <tr><th>${esc(t('m.so'))}</th>${cols.map(c => cell(c, o => o.so ? tag(t('so.' + o.so), SOCLS[o.so] || '') : `<span class="small">${esc(t('m.unrec'))}</span>`)).join('')}</tr>
      <tr><th>${esc(t('m.eol'))}</th>${cols.map(c => cell(c, o => o.eol ? `<span class="mono">${esc(o.eol)}</span>` : `<span class="small">${esc(t('m.unpub'))}</span>`)).join('')}</tr>
      <tr><th>${esc(t('m.litellm'))}</th>${cols.map(c => cell(c, o => o.litellm ? `<span class="mono small wrap">${esc(o.litellm)}</span>` : '—')).join('')}</tr>
      <tr><th>${esc(t('m.src'))}</th>${cols.map(c => cell(c, o => srcLinks(o.src))).join('')}</tr>
    </tbody></table></div></div>
  <div class="card"><div class="card-h"><h2>${esc(t('m.compatPerf'))}</h2><a class="more" href="#tests-${m.id}">${esc(t('m.testsAll'))}</a></div>
    <div class="grid g2">
      <div><h3>${esc(t('m.compat'))}</h3><p class="muted mt6">${esc(t('m.notYet'))}</p></div>
      <div><h3>${esc(t('m.perf'))}</h3><p class="muted mt6">${esc(t('m.notYet'))}${m.speed && m.speed.tps ? ' ' + esc(t('m.perfRef', {n: m.speed.tps, d: m.speed.date})) : ''}</p></div>
    </div></div>
  <div class="two">
    <div class="card"><h2 class="h2s">${esc(t('m.cau'))}</h2><ul class="bul">${caus(m).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      ${br.length ? `<h3 class="h3s">${esc(t('m.br', {n: br.length}))}</h3><ul class="bul">${br.map(b => `<li>${esc(b.t)}${b.sev === 'high' ? ' ' + tag(t('imp.high'), 't-hi') : ''}</li>`).join('')}</ul>` : ''}</div>
    <div class="card"><div class="card-h"><h2>${esc(t('m.rel'))}</h2><a class="more" href="#news">${esc(t('m.relAll'))}</a></div>${rel.length ? `<div class="rows">${rel.map(n => `<a class="row r3" href="#news-${n.id}"><span class="date">${md(n.shown)}</span><span class="cat">${secTag(n.sec)}</span><span class="ttl ttl16">${esc(n.t)}</span></a>`).join('')}</div>` : `<p class="muted">${esc(t('m.relNone'))}</p>`}</div>
  </div>`;
}

/* ------------------------------------------------------------------ subscriptions: request-api keeps them per user
   GET /api/subscriptions -> {items: [{model_id, created_at}]}, PUT / DELETE /api/subscriptions/{model_id} */
let subs = new Set();
async function loadSubs(){
  try {
    const res = await api('/api/subscriptions');
    subs = new Set((res.items || []).map(x => x && x.model_id).filter(x => typeof x === 'string'));
    if (D && route().v === 'model') rerender();
  } catch (e) { /* keep the page usable; the button reports errors when used */ }
}
async function toggleSub(id){
  if (state.subBusy) return;
  const on = !subs.has(id);
  state.subBusy = true;
  try {
    await api('/api/subscriptions/' + encodeURIComponent(id), {method: on ? 'PUT' : 'DELETE'});
    if (on) subs.add(id); else subs.delete(id);
    state.subMsg = {id, on};
  } catch (e) {
    state.subMsg = {id, on, err: true};
  } finally {
    state.subBusy = false;
    if (route().v === 'model') rerender();
  }
}
/* ------------------------------------------------------------------ end subscriptions */

/* ------------------------------------------------------------------ cost */
const WL = {chat:{rpd:30000, tin:2000, tout:400}, doc:{rpd:5000, tin:12000, tout:800}, agent:{rpd:2000, tin:30000, tout:3000}};
function workload(){ return state.wl === 'custom' ? state.wlCustom : WL[state.wl]; }
function monthly(p, w){ return p ? 30 * w.rpd * (w.tin * p.in + w.tout * p.out) / 1e6 : null; }
function viewCost(pre){
  if (pre && byId[pre]) state.costModel = pre;
  const w = workload();
  const ms = state.costModel === 'all' ? [...D.models].sort(tierSort) : [byId[state.costModel]].filter(Boolean);
  const rows = [];
  ms.forEach(m => CLOUDS.concat(['direct']).forEach(c => { const o = m.offs[c]; if (!o || !o.price) return; rows.push({m, c, g: monthly(o.price, w), r: o.geoPrice ? monthly(o.geoPrice, w) : null}); }));
  rows.sort((a, b) => a.g - b.g);
  const min = rows.length ? rows[0].g : 0;
  const n = v => Number(v).toLocaleString('en-US');
  return `<h1>${esc(t('cost.title'))}</h1>
  <div class="card">
    <div class="toolbar u-mb12">
      <div class="seg" role="group" aria-label="${esc(t('cost.wl'))}">${['chat','doc','agent','custom'].map(k => `<button type="button" data-act="wl" data-v="${k}" aria-pressed="${state.wl === k}">${esc(t('wl.' + k))}</button>`).join('')}</div>
      <div class="f u-minw220"><label class="l" for="cost-model">${esc(t('cost.model'))}</label><select id="cost-model" data-act="costModel"><option value="all" ${state.costModel === 'all' ? 'selected' : ''}>${esc(t('cost.all'))}</option>${[...D.models].sort(tierSort).map(m => `<option value="${m.id}" ${state.costModel === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div>
    </div>
    ${state.wl === 'custom' ? `<div class="fgrid u-maxw720 u-mb12">
      <div class="f"><label class="l" for="wl-rpd">${esc(t('cost.rpd'))}</label><input type="number" id="wl-rpd" min="0" step="1000" value="${w.rpd}" data-act="wlc" data-k="rpd"></div>
      <div class="f"><label class="l" for="wl-tin">${esc(t('cost.tin'))}</label><input type="number" id="wl-tin" min="0" step="100" value="${w.tin}" data-act="wlc" data-k="tin"></div>
      <div class="f"><label class="l" for="wl-tout">${esc(t('cost.tout'))}</label><input type="number" id="wl-tout" min="0" step="100" value="${w.tout}" data-act="wlc" data-k="tout"></div></div>` : ''}
    <p class="u-m0">${esc(t('cost.basis', {r: n(w.rpd), i: n(w.tin), o: n(w.tout)}))}</p>
  </div>
  <div class="card"><div class="tbl-wrap"><table><thead><tr><th>${esc(t('col.model'))}</th><th>${esc(t('cost.cloud'))}</th><th class="num">${esc(t('cost.mGlobal'))}</th><th class="num">${esc(t('cost.mRes'))}</th><th class="num">${esc(t('cost.x'))}</th></tr></thead><tbody>
    ${rows.map((r, i) => `<tr><td class="mname"><a href="#m-${r.m.id}">${esc(r.m.name)}</a></td><td>${esc(r.c === 'direct' ? (SVC[r.m.offs.direct.service] || t('maker')) : cloudName(r.c))}</td><td class="num">${money(r.g)}</td><td class="num">${r.r != null ? money(r.r) : '—'}</td><td class="num">${min && r.g / min < 1.005 ? tag(t('cost.cheapest'), 't-ok') : min ? (r.g / min).toFixed(1) + '×' : ''}</td></tr>`).join('') || `<tr><td colspan="5" class="muted">${esc(t('cost.none'))}</td></tr>`}
  </tbody></table></div></div>`;
}

/* ------------------------------------------------------------------ tests */
function viewTests(pre, item){
  if (pre && byId[pre]) state.testModel = pre;
  const s = D.security;
  const sel = state.testModel !== 'all' && byId[state.testModel] ? state.testModel : 'all';
  const ms = [...D.models].sort(tierSort).filter(m => sel === 'all' || m.id === sel);
  return `<h1>${esc(t('tests.title'))}</h1>
  <div class="f u-maxw360"><label class="l" for="test-model">${esc(t('tests.model'))}</label><select id="test-model" data-act="testModel"><option value="all" ${sel === 'all' ? 'selected' : ''}>${esc(t('tests.all'))}</option>${[...D.models].sort(tierSort).map(m => `<option value="${m.id}" ${sel === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div>
  <div class="card"><div class="card-h"><h2>${esc(t('tests.status'))}</h2></div><div class="tbl-wrap"><table><thead><tr><th>${esc(t('col.model'))}</th><th>${esc(t('tests.compat'))}</th><th>${esc(t('tests.perf'))}</th><th>${esc(t('tests.sec'))}</th></tr></thead><tbody>
    ${ms.map(m => { const r = s.models[m.id]; return `<tr><td class="mname"><a href="#m-${m.id}">${esc(m.name)}</a></td><td>${tag(t('tests.none'), 't-none')}</td><td>${tag(t('tests.none'), 't-none')}</td><td>${r ? (r.counts.fail ? tag(t('tests.failN', {n: r.counts.fail}), 't-hi') : tag(t('tests.passed'), 't-ok')) : tag(t('tests.none'), 't-none')}</td></tr>`; }).join('')}
  </tbody></table></div></div>
  ${secMatrix(sel, item)}
  <div class="card"><div class="card-h"><h2>${esc(t('tests.cmp'))}</h2></div>
    <div class="empty u-mb8">${esc(t('tests.cmpText'))}</div>
    ${D.mock && D.mock.gw ? `<label class="chk"><input type="checkbox" data-act="mock" ${state.showMock ? 'checked' : ''}>${esc(t('tests.mock'))}</label>` : ''}
    ${state.showMock ? mockBlock() : ''}
  </div>`;
}
/* security evaluation matrix: SEC-01..32 from the user's matrix; result columns = the 2026-10-12 run (SEC-01..16 only) */
const SX_V = {pass:'t-ok', fail:'t-hi', review:'t-warn', info:''};
function secMatrix(sel, item){
  const X = D.secMatrix, s = D.security;
  const run = Object.fromEntries(s.items.map(i => [i.id, i]));
  const labels = Object.keys(s.models).filter(k => sel === 'all' || k === sel).map(k => s.models[k].label);
  if (item) { const it = X.items.find(x => x.id === item); if (it) { if (state.secScope !== 'all' && state.secScope !== it.tier) state.secScope = 'all'; if (state.secArch !== 'all' && !it.as.includes(state.secArch)) state.secArch = 'all'; state.secOpen.add(it.id); } }
  const rows = X.items.filter(it => (state.secScope === 'all' || it.tier === state.secScope) && (state.secArch === 'all' || it.as.includes(state.secArch)));
  const showPri = state.secScope !== 'core';
  const cols = ['72px', 'minmax(0,1fr)', '150px', '180px'].concat(showPri ? ['72px'] : [], labels.map(() => '116px')).join(' ');
  const seg = (act, cur, opts, lbl) => `<div class="seg" role="group" aria-label="${esc(lbl)}">${opts.map(([v, l]) => `<button type="button" data-act="${act}" data-v="${v}" aria-pressed="${cur === v}">${esc(l)}</button>`).join('')}</div>`;
  const E = lang === 'en';
  return `<div class="card" id="sec-matrix"><div class="card-h"><h2>${esc(t('sx.title'))}</h2><span class="count">${esc(t('sx.count', {n: rows.length}))}</span></div>
    <div class="toolbar u-mb10">${seg('secScope', state.secScope, [['core', t('sx.core')], ['draft', t('sx.draft')], ['all', t('sx.allN')]], t('sx.scope'))}</div>
    <div class="toolbar u-mb6">${seg('secArch', state.secArch, [['all', t('sx.archAll')], ['Chatbot', 'Chatbot'], ['RAG', 'RAG'], ['Agent', 'Agent']], t('sx.arch'))}</div>
    <details class="fold how"><summary>${esc(t('sx.how'))}</summary>
      ${(E ? X.introEn : X.intro).map(p => `<div>${esc(p)}</div>`).join('')}
      <ul>${(E ? X.readingEn : X.reading).slice(0, 3).map(p => `<li>${esc(p)}</li>`).join('')}<li>${esc(t('sx.runNote', {d: s.date || '—'}))}</li><li>${esc(t('sx.relNote'))}</li>${E ? `<li>${esc(t('sx.enNote'))}</li>` : ''}</ul>
    </details>
    ${labels.length ? '' : `<div class="banner info u-m804">${esc(t('sx.noRun'))}</div>`}
    ${rows.length ? `<div class="sx" role="list" data-sx="${cols}">
      <div class="sx-row sx-head" aria-hidden="true"><span>${esc(t('sx.id'))}</span><span>${esc(t('sx.item'))}</span><span>${esc(t('sx.owasp'))}</span><span>${esc(t('sx.archCol'))}</span>${showPri ? `<span>${esc(t('sx.pri'))}</span>` : ''}${labels.map(l => `<span>${esc(l)}</span>`).join('')}</div>
      ${rows.map(it => secRow(it, run[it.id], labels, showPri)).join('')}
    </div>` : `<div class="empty">${esc(t('sx.empty'))}</div>`}
  </div>`;
}
function secRes(x){ return tag(t('v.' + x.v), SX_V[x.v] || ''); }
function secRow(it, r, labels, showPri){
  const open = state.secOpen.has(it.id);
  const pri = it.tier === 'core' ? `<span class="muted">${esc(t('sx.tierCore'))}</span>` : tag(t('pri.' + it.pri), it.pri === 'high' ? 't-ink' : it.pri === 'medium' ? 't-chip' : '');
  const res = labels.map(l => {
    let cell = '—';
    if (it.tier === 'draft') cell = tag(t('sx.notYet'), 't-none');
    else { const x = r && (r.res[l] || r.res.gateway); if (x) cell = secRes(x) + (x.rate != null && x.v !== 'pass' ? ` <span class="small mono">${Math.round(x.rate * 100)}%</span>` : ''); }
    return `<span class="c-r"><span class="sx-lbl">${esc(l)}</span>${cell}</span>`;
  }).join('');
  return `<div class="sx-row" role="listitem" id="row-${it.id}">
    <span class="c-id">${it.id}</span>
    <div class="c-name"><button type="button" class="nbtn" data-act="secToggle" data-id="${it.id}" aria-expanded="${open}" aria-controls="d-${it.id}">${esc(L(it.n, it.nEn))}</button></div>
    <div class="c-meta"><span class="c-ow${it.owasp.length ? '' : ' none'}"><span class="sr">${esc(t('sx.owasp'))}: </span>${it.owasp.length ? esc(it.owasp.join(' ')) : '—'}</span><span class="c-ar"><span class="sr">${esc(t('sx.archCol'))}: </span>${esc(L(it.arch, it.archEn))}</span>${showPri ? `<span class="c-pr">${pri}</span>` : ''}</div>
    ${labels.length ? `<div class="c-res">${res}</div>` : ''}
    <div class="sx-d" id="d-${it.id}" ${open ? '' : 'hidden'}>${secDetail(it, r, labels)}</div>
  </div>`;
}
function secDetail(it, r, labels){
  const s = D.security, E = lang === 'en', C = E ? ': ' : '：', J = E ? ', ' : '，';
  const f = k => E ? it[k + 'En'] : it[k];
  const P = x => esc(x).replace(/\n/g, '<br>');
  const rows = [[t('sx.what'), P(f('what'))], [t('sx.pass'), P(f('pass'))]];
  if (it.tier === 'core' && r) {
    const got = r.res.gateway ? [['Gateway', r.res.gateway]] : labels.filter(l => r.res[l]).map(l => [l, r.res[l]]);
    const lines = got.map(([l, x]) => `<span>${esc(l)}${C}${secRes(x)}${x.rate != null ? ' ' + esc(t('sx.rate', {p: Math.round(x.rate * 100)})) : ''}${x.n ? J + esc(t('sx.cases', {n: x.n})) : ''}</span>`);
    rows.push([t('sx.run', {d: s.date}), `<div class="sx-run"><span>${esc(t('sx.runRule', {r: E ? (RULE_EN[r.rule] || r.rule) : r.rule}))}${r.res.gateway ? ' ' + esc(t('sx.gw')) : ''}</span>${lines.join('')}</div>`]);
  } else rows.push([t('sx.result'), tag(t('sx.notYet'), 't-none')]);
  rows.push([t('sx.tools'), P(f('tools'))], [t('sx.users'), P(f('users'))], [t('sx.unit'), P(f('unit'))]);
  rows.push([t('sx.owasp'), `<span class="mono">${esc(it.owasp.join(', ') || '—')}</span>${it.other.length ? `<br><span class="muted">${esc(t('sx.other', {x: it.other.join(', ')}))}</span>` : ''}`]);
  if (it.atlas.length) rows.push([t('sx.atlas'), `<span class="mono">${esc(it.atlas.join(', '))}</span>`]);
  if (it.moda.length) rows.push([t('sx.moda'), esc((E ? it.modaEn : it.moda).join(E ? '; ' : '；'))]);
  rows.push([it.tier === 'core' ? t('sx.note') : t('sx.why'), P(f(it.tier === 'core' ? 'note' : 'why'))]);
  rows.push([t('sx.refs'), esc(it.refs)], [t('sx.rel'), esc(t('sx.relV', {a: it.rel.papers, b: it.rel.posts, c: it.rel.cases}))]);
  return `<dl class="sx-dl">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;
}
function dropSec(){ if (/^#sec-/.test(location.hash)) history.replaceState(null, '', '#tests'); }
function mockBlock(){
  const g = D.mock && D.mock.gw;
  if (!g || !Array.isArray(g.byRoute)) return '';
  return `<div class="banner u-m100">${esc(t('tests.mockBanner'))}</div>
  <div class="tbl-wrap"><table><thead><tr><th>${esc(t('mock.route'))}</th><th>${esc(t('mock.cloud'))}</th><th class="num">${esc(t('mock.rate'))}</th><th class="num">${esc(t('mock.silent'))}</th><th class="num">${esc(t('mock.gw'))}</th><th class="num">${esc(t('mock.cloudlim'))}</th><th class="num">${esc(t('mock.delay'))}</th></tr></thead><tbody>
  ${g.byRoute.map(r => `<tr><td class="mono small u-wrap">${esc(r.route)}</td><td>${esc(cloudName(r.csp))}</td><td class="num">${Math.round(r.compatibilityRate * 100)}%</td><td class="num">${r.silentDegradations}</td><td class="num">${r.gatewayInduced}</td><td class="num">${r.providerLimited}</td><td class="num">${r.overheadMs && r.overheadMs.p50 != null ? r.overheadMs.p50 + ' ms' : '—'}</td></tr>`).join('')}
  </tbody></table></div>`;
}

/* ------------------------------------------------------------------ request */
const CLASSES = ['other','property','sec-c','sec-b','sec-a'];
function formDefaults(){ return {team:'', alias:'', use:'', models:[], unsure:false, cls:'', clsOther:'', cloud:'any', rpd:'5000', date:'', tin:'3000', tout:'500', ext:false, tw:false, note:'', pre:''}; }
const sepJ = () => lang === 'en' ? ', ' : '、';
function mselLabel(){
  const f = state.form;
  if (f.unsure) return t('f.unsure');
  const names = f.models.filter(id => byId[id]).map(id => byId[id].name);
  if (!names.length) return t('f.modelPick');
  return names.length > 2 ? t('f.nSel', {n: names.length}) + (lang === 'en' ? ': ' : '：') + names.join(sepJ()) : names.join(sepJ());
}
function viewApply(pre){
  const f = state.form;
  if (pre && byId[pre] && f.pre !== pre) { f.pre = pre; if (!f.models.includes(pre)) f.models = f.models.concat(pre); f.unsure = false; }
  const ms = [...D.models].sort(tierSort);
  const ck = b => b ? 'checked' : '';
  return `<h1>${esc(t('apply.title'))}</h1>
  <div class="two">
    <div class="card"><h2 class="u-mb6">${esc(t('apply.steps'))}</h2><ol class="steps">
      ${[1,2,3,4,5].map(i => `<li><span class="n">${i}</span><span><b>${esc(t('step' + i))}</b><span>${esc(t('step' + i + 'd'))}</span></span></li>`).join('')}
    </ol></div>
    <form class="card" id="apply-form" novalidate>
      <div class="card-h"><h2>${esc(t('apply.form'))}</h2><button type="button" class="btn" data-act="aiFill">${esc(t('f.aiFill'))}</button></div>
      <div class="fgrid">
        <div class="f"><label class="l" for="ap-team">${esc(t('f.team'))}</label><input type="text" id="ap-team" required maxlength="120" placeholder="${esc(t('f.teamPh'))}" value="${esc(f.team)}"></div>
        <div class="f"><label class="l" for="ap-alias">${esc(t('f.alias'))}</label><input type="text" id="ap-alias" required maxlength="64" autocomplete="off" placeholder="${esc(t('f.aliasPh'))}" value="${esc(f.alias)}"></div>
        <div class="f span2"><label class="l" for="ap-use">${esc(t('f.use'))}</label><textarea id="ap-use" required maxlength="4000" placeholder="${esc(t('f.usePh'))}">${esc(f.use)}</textarea></div>
        <div class="f span2"><span class="l" id="ap-model-l">${esc(t('f.model'))}</span>
          <details class="msel" id="ap-msel"><summary aria-labelledby="ap-model-l ap-msel-v"><span class="msel-v" id="ap-msel-v">${esc(mselLabel())}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></summary>
            <div class="msel-pop" role="group" aria-labelledby="ap-model-l">
              <label class="chk msel-unsure"><input type="checkbox" id="ap-unsure" ${ck(f.unsure)}>${esc(t('f.unsure'))}</label>
              ${['frontier','balanced','efficient'].map(tr => `<div class="msel-h">${esc(t('tier.' + tr))}</div>${ms.filter(m => m.tier === tr).map(m => `<label class="chk"><input type="checkbox" name="ap-model" value="${m.id}" ${ck(f.models.includes(m.id))}>${esc(m.name)}</label>`).join('')}`).join('')}
            </div>
          </details>
        </div>
        <div class="f"><label class="l" for="ap-class">${esc(t('f.class'))}</label><select id="ap-class" data-act="apClass" required><option value="" ${f.cls ? '' : 'selected'}>${esc(t('f.classPick'))}</option>${CLASSES.map(c => `<option value="${c}" ${f.cls === c ? 'selected' : ''}>${esc(t('c.' + c))}</option>`).join('')}</select></div>
        <div class="f"><label class="l" for="ap-cloud">${esc(t('f.cloud'))}</label><select id="ap-cloud">${[['any', t('f.cloudAny')],['aws','AWS'],['azure','Azure'],['gcp','Google Cloud']].map(([v, l]) => `<option value="${v}" ${f.cloud === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
        <div class="f span2" id="ap-class-other-wrap" ${f.cls === 'other' ? '' : 'hidden'}><label class="l" for="ap-class-other">${esc(t('f.classOther'))}</label><input type="text" id="ap-class-other" maxlength="200" placeholder="${esc(t('f.classOtherPh'))}" value="${esc(f.clsOther)}"></div>
        <div class="f"><label class="l" for="ap-rpd">${esc(t('f.rpd'))}</label><input type="number" id="ap-rpd" min="0" step="100" value="${esc(f.rpd)}"></div>
        <div class="f"><label class="l" for="ap-date">${esc(t('f.date'))}</label><input type="date" id="ap-date" value="${esc(f.date)}"></div>
        <div class="f"><label class="l" for="ap-tin">${esc(t('f.tin'))}</label><input type="number" id="ap-tin" min="0" step="100" value="${esc(f.tin)}"></div>
        <div class="f"><label class="l" for="ap-tout">${esc(t('f.tout'))}</label><input type="number" id="ap-tout" min="0" step="100" value="${esc(f.tout)}"></div>
        <label class="chk span2"><input type="checkbox" id="ap-ext" ${ck(f.ext)}>${esc(t('f.ext'))}</label>
        <label class="chk span2"><input type="checkbox" id="ap-tw" ${ck(f.tw)}>${esc(t('f.tw'))}</label>
        <div class="f span2"><label class="l" for="ap-note">${esc(t('f.note'))}</label><textarea id="ap-note" maxlength="4000" placeholder="${esc(t('f.notePh'))}">${esc(f.note)}</textarea></div>
      </div>
      <p class="chips u-m1400"><button type="submit" class="btn primary" id="ap-submit" ${state.sending ? 'disabled' : ''}>${esc(t('f.submit'))}</button></p>
      <div id="ap-out" aria-live="polite">${state.applyOut ? resultHtml(state.applyOut.f, state.applyOut.sent) : ''}</div>
    </form>
  </div>`;
}
function readForm(){
  const form = document.getElementById('apply-form'); if (!form) return;
  const v = id => document.getElementById(id);
  Object.assign(state.form, {team: v('ap-team').value, alias: v('ap-alias').value, use: v('ap-use').value,
    models: [...form.querySelectorAll('input[name="ap-model"]:checked')].map(x => x.value), unsure: v('ap-unsure').checked,
    cls: v('ap-class').value, clsOther: v('ap-class-other').value, cloud: v('ap-cloud').value,
    rpd: v('ap-rpd').value, date: v('ap-date').value, tin: v('ap-tin').value, tout: v('ap-tout').value,
    ext: v('ap-ext').checked, tw: v('ap-tw').checked, note: v('ap-note').value});
}
function formChange(tg){
  if (tg.name === 'ap-model' && tg.checked) { const u = document.getElementById('ap-unsure'); if (u) u.checked = false; }
  if (tg.id === 'ap-unsure' && tg.checked) document.querySelectorAll('input[name="ap-model"]').forEach(x => { x.checked = false; });
  readForm();
  const lv = document.getElementById('ap-msel-v'); if (lv) lv.textContent = mselLabel();
  if (tg.id === 'ap-unsure' && tg.checked) { document.getElementById('ap-msel').removeAttribute('open'); startFormHelper(); }
}
/* Gate preview: the same rule as libs/llmops-common gates.required_gates, which request-api applies.
   G0 intake always; G2 compliance for Security B, Security A/AA, other or customer-facing; G8 beta for
   customer-facing or 10,000+ requests a day; G9 launch always. */
function requiredGates(f){
  const g = ['G0'];
  if (['sec-b', 'sec-a', 'other'].includes(f.cls) || f.ext) g.push('G2');
  if (f.ext || (parseInt(f.rpd, 10) || 0) >= 10000) g.push('G8');
  g.push('G9');
  return g;
}
const LIMITS = {rpd: 100000000, tin: 10000000, tout: 10000000};
const intOf = v => { const s = String(v == null ? '' : v).trim(); return s === '' ? 0 : /^\d+$/.test(s) ? Number(s) : NaN; };
function formProblems(f){
  const miss = [];
  if (!f.team.trim() || !f.alias.trim() || !f.use.trim()) miss.push(t('r.need'));
  if (!f.cls) miss.push(t('r.needClass'));
  else if (f.cls === 'other' && !f.clsOther.trim()) miss.push(t('r.needOther'));
  if (f.alias.trim() && !/^[A-Za-z0-9._-]+$/.test(f.alias.trim())) miss.push(t('r.badAlias'));
  if ([['rpd', f.rpd], ['tin', f.tin], ['tout', f.tout]].some(([k, v]) => { const n = intOf(v); return !Number.isFinite(n) || n > LIMITS[k]; })) miss.push(t('r.badNum'));
  if (!f.unsure && f.models.filter(id => byId[id]).length > 10) miss.push(t('r.tooMany'));
  return miss;
}
/* the form as a contracts/schemas/request.schema.json body (also the helper's view of the form) */
function requestPayload(f){
  const models = f.unsure ? [] : [...new Set(f.models.filter(id => byId[id]))];
  const num = v => { const n = intOf(v); return Number.isFinite(n) ? n : 0; };
  const p = {team: f.team.trim(), use_case: f.use.trim(), models, unsure: !!f.unsure || !models.length, cloud: f.cloud || 'any',
    rpd: num(f.rpd), tokens_in: num(f.tin), tokens_out: num(f.tout), external: !!f.ext, taiwan_only: !!f.tw};
  if (f.cls) p.data_class = f.cls;
  if (f.alias.trim()) p.alias = f.alias.trim();
  if (f.cls === 'other' && f.clsOther.trim()) p.data_class_other = f.clsOther.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(f.date || '')) p.target_date = f.date;
  if (f.note.trim()) p.note = f.note.trim();
  return p;
}
function twNote(){
  const J = sepJ();
  const tw = D.models.filter(m => Object.values(m.offs).some(o => o && o.twResidency === 'yes')).map(m => m.name);
  if (tw.length) return t('r.twSome', {m: tw.join(J)});
  const jp = D.models.filter(m => m.offs.aws && (m.offs.aws.residency || []).some(r => /^JP/i.test(String(r)))).map(m => m.name);
  return t(jp.length ? 'r.tw' : 'r.twNone', {n: D.models.length, m: jp.join(J)});
}
const label = (prefix, v) => { const s = t(prefix + v); return s === prefix + v ? String(v) : s; };
function gateText(g){
  const id = typeof g === 'string' ? g : (g && (g.gate || g.id)) || '';
  const st = g && typeof g === 'object' ? g.status : null;
  return label('g.', id) + (st ? (lang === 'en' ? ' (' + label('gst.', st) + ')' : '（' + label('gst.', st) + '）') : '');
}
function errText(e){
  e = e || {};
  if (e.status === 401 || e.status === 403) return t('r.errAuth');
  if (e.status === 422 || e.status === 400) return t('r.errInvalid', {m: e.message || ''});
  if (e.status === 429) return t('chat.rate');
  return t('r.errNet');
}
/* sent: {state: 'sending' | 'ok' | 'error', res, err}. The preview (gates, cost, notes) is computed here, in the page. */
function resultHtml(f, sent){
  const C = lang === 'en' ? ': ' : '：', J = sepJ();
  const team = f.team.trim(), alias = f.alias.trim(), use = f.use.trim(), cls = f.cls, clsOther = f.clsOther.trim(), note = f.note.trim();
  const mids = f.unsure ? [] : f.models.filter(id => byId[id]);
  const cloud = f.cloud;
  const w = {rpd: +f.rpd || 0, tin: +f.tin || 0, tout: +f.tout || 0};
  const preview = requiredGates(f);
  const notes = [];
  if (f.tw) notes.push(twNote());
  const costs = [];
  mids.forEach(mid => {
    const m = byId[mid];
    const offs = CLOUDS.concat(['direct']).filter(c => m.offs[c] && m.offs[c].price && (cloud === 'any' || cloud === c));
    if (!offs.length) notes.push(t('r.noPrice', {m: m.name}));
    else costs.push(m.name + C + offs.map(c => t('r.month', {c: c === 'direct' ? (SVC[m.offs.direct.service] || t('maker')) : cloudName(c), v: money(monthly(m.offs[c].price, w))})).join(J));
    const s = D.security.models[mid];
    if (s) notes.push(t('r.secReuse', {m: m.name, d: D.security.date, n: s.counts.fail}));
  });
  const clsText = cls === 'other' ? t('c.other').replace(/[（(].*$/, '').trim() + C + clsOther : t('c.' + cls);
  let head, gates;
  if (sent.state === 'ok') {
    const r = sent.res || {};
    const id = r.id || r.request_id || '—';
    head = `<div class="card-h"><h3>${esc(t('r.id', {id}))}</h3>${r.status ? tag(label('rs.', r.status), 't-chip') : ''}</div>`;
    const list = Array.isArray(r.gates) && r.gates.length ? r.gates.map(gateText) : preview.map(g => t('g.' + g));
    gates = `<p class="u-m008">${esc(t('r.gates'))}${C}${list.map(esc).join(' → ')}</p>`
      + (r.next_gate ? `<p class="u-m008">${esc(t('r.next'))}${C}${esc(label('g.', r.next_gate))}</p>` : '');
  } else {
    head = `<div class="card-h"><h3>${esc(t(sent.state === 'sending' ? 'r.sending' : 'r.err'))}</h3>${sent.state === 'sending' ? tag(t('r.pending'), 't-chip') : ''}</div>`
      + (sent.state === 'error' ? `<div class="banner u-m008" role="alert">${esc(errText(sent.err))}</div>` : '');
    gates = `<p class="u-m008">${esc(t('r.gates'))}${esc(t('r.preview'))}${C}${preview.map(g => esc(t('g.' + g))).join(' → ')}</p>`;
  }
  return `<div class="card result-card">${head}
    <p class="u-m008">${esc(team)}${C}${esc(use)}</p>
    <p class="u-m008">${esc(t('r.alias'))}${C}${esc(alias)}</p>
    <p class="u-m008">${esc(t('r.class'))}${C}${esc(clsText)}</p>
    <p class="u-m008">${esc(t('r.models'))}${C}${mids.length ? esc(mids.map(x => byId[x].name).join(J)) : esc(t('r.noModel'))}</p>
    ${note ? `<p class="u-m008 u-preline">${esc(t('r.note'))}${C}${esc(note)}</p>` : ''}
    ${gates}
    ${costs.length ? `<p class="u-m004">${esc(t('r.cost'))}${C}</p><ul class="bul u-mb8">${costs.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${notes.length ? `<ul class="bul">${notes.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
  </div>`;
}
function showApplyOut(){ const o = document.getElementById('ap-out'); if (o && state.applyOut) o.innerHTML = resultHtml(state.applyOut.f, state.applyOut.sent); }
async function submitRequest(){
  readForm();
  const f = state.form, out = document.getElementById('ap-out');
  const miss = formProblems(f);
  if (miss.length) { state.applyOut = null; out.innerHTML = `<div class="banner u-mt12" role="alert">${miss.map(esc).join('<br>')}</div>`; return; }
  if (state.sending) return;
  const snap = JSON.parse(JSON.stringify(f));
  state.sending = true;
  const btn = document.getElementById('ap-submit'); if (btn) btn.disabled = true;
  state.applyOut = {f: snap, sent: {state: 'sending'}}; showApplyOut();
  try {
    const res = await api('/api/requests', {method: 'POST', body: requestPayload(snap)});
    state.applyOut = {f: snap, sent: {state: 'ok', res}};
  } catch (e) {
    state.applyOut = {f: snap, sent: {state: 'error', err: e}};
  } finally {
    state.sending = false;
    const b = document.getElementById('ap-submit'); if (b) b.disabled = false;
    showApplyOut();
  }
}

/* ------------------------------------------------------------------ chrome + router */
const NAV = ['home','news','retire','models','tests','cost','apply'];
function chrome(){
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant-TW';
  const nav = document.getElementById('nav');
  nav.setAttribute('aria-label', t('nav.label'));
  nav.innerHTML = NAV.map(k => `<a href="#${k}">${esc(t('nav.' + k))}</a>`).join('');
  document.getElementById('asof').textContent = D ? t('asof', {d: D.asOf}) : '';
  const lg = document.getElementById('lang'); lg.setAttribute('aria-label', t('lang'));
  lg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  document.getElementById('foot').textContent = D ? t('foot', {d: D.asOf}) : '';
  chatChrome();
  applyUi();
}
/* palette: an explicit pick is stored; with none, follow the host / system light-dark setting */
function curUi(){
  if (ui) return ui;
  const h = document.documentElement.getAttribute('data-theme'); if (h === 'dark' || h === 'light') return h;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyUi(){
  const r = document.documentElement; if (ui) r.setAttribute('data-ui', ui); else r.removeAttribute('data-ui');
  const cur = curUi(), pk = document.getElementById('ui-pick');
  pk.querySelectorAll('button[data-ui]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.ui === cur)); b.querySelector('.ui-l').textContent = t('ui.' + b.dataset.ui); });
  document.getElementById('ui-h').textContent = t('ui.label');
  document.getElementById('ui-sum').setAttribute('aria-label', t('ui.label') + (lang === 'en' ? ': ' : '：') + t('ui.' + cur));
}
function route(){
  const h = decodeURIComponent((location.hash || '#home').slice(1));
  if (h.startsWith('m-')) { const [id, tab] = h.slice(2).split('/'); return {v:'model', arg:id, tab:tab || '', nav:'models'}; }
  if (h.startsWith('apply-')) return {v:'apply', arg:h.slice(6), nav:'apply'};
  if (h.startsWith('cost-')) return {v:'cost', arg:h.slice(5), nav:'cost'};
  if (h.startsWith('tests-')) return {v:'tests', arg:h.slice(6), nav:'tests'};
  if (/^sec-SEC-\d\d$/.test(h)) return {v:'tests', arg:'', item:h.slice(4), nav:'tests'};
  if (h === 'news-open') return {v:'news', arg:'open', nav:'news'};
  if (h === 'news-todo') return {v:'news', arg:'todo', nav:'news'};
  if (h.startsWith('news-')) return {v:'news', arg:'feed', item:h.slice(5), nav:'news'};
  return NAV.includes(h) ? {v:h, arg:'', nav:h} : {v:'home', arg:'', nav:'home'};
}
function render(){
  const r = route();
  if (!D) return r;
  const views = {home: viewHome, news: () => viewNews(r.arg || 'feed', r.item), retire: viewRetire, models: viewModels, model: () => viewModel(r.arg, r.tab), tests: () => viewTests(r.arg, r.item), cost: () => viewCost(r.arg), apply: () => viewApply(r.arg)};
  app.innerHTML = (views[r.v] || viewHome)();
  app.querySelectorAll('[data-sx]').forEach(el => el.style.setProperty('--sx', el.dataset.sx));  /* CSSOM: allowed under CSP */
  document.querySelectorAll('#nav a').forEach(a => { if (a.getAttribute('href') === '#' + r.nav) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  document.title = (r.v === 'model' && byId[r.arg] ? byId[r.arg].name + (MTABS.includes(r.tab) && r.tab !== 'overview' ? ' · ' + t('mt.' + r.tab) : '') + ' · ' : r.v !== 'home' ? t('nav.' + r.nav) + ' · ' : '') + 'LLMOps Portal';
  if (r.item) { const el = document.getElementById('row-' + r.item); if (el) { requestAnimationFrame(() => { el.scrollIntoView({block:'center'}); el.classList.add('flash'); }); } }
  return r;
}
function rerender(){ const y = window.scrollY; render(); window.scrollTo(0, y); }
function dropItem(){ if (/^#news-it-/.test(location.hash)) history.replaceState(null, '', '#news'); }
window.addEventListener('hashchange', () => { const r = render(); if (!r.item) window.scrollTo(0, 0); app.focus({preventScroll:true}); });
document.getElementById('lang').addEventListener('click', e => {
  const b = e.target.closest('button[data-lang]'); if (!b || b.dataset.lang === lang) return;
  lang = b.dataset.lang; try { localStorage.setItem('llmops-lang', lang); } catch (err) {}
  chrome(); if (D) rerender(); else renderState(); renderLog();
});
app.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act, v = el.dataset.v;
  if (a === 'reload') { loadData(); return; }
  if (a === 'toggle') { const d = document.getElementById('d-' + el.dataset.id); const open = d.hidden; d.hidden = !open; el.setAttribute('aria-expanded', String(open)); return; }
  if (a === 'newsTab') { location.hash = v === 'open' ? 'news-open' : v === 'todo' ? 'news-todo' : 'news'; return; }
  if (a === 'newsSec') { dropItem(); state.newsSec = v; return rerender(); }
  if (a === 'newsCloud') { dropItem(); state.newsCloud = v; return rerender(); }
  if (a === 'retCloud') { state.retCloud = v; return rerender(); }
  if (a === 'secScope') { dropSec(); state.secScope = v; return rerender(); }
  if (a === 'secArch') { dropSec(); state.secArch = v; return rerender(); }
  if (a === 'hlToggle') { const id = el.dataset.id, d = document.getElementById('hd-' + id); const open = d.hidden; d.hidden = !open; el.setAttribute('aria-expanded', String(open)); if (open) state.hlOpen.add(id); else state.hlOpen.delete(id); return; }
  if (a === 'secToggle') { const id = el.dataset.id, d = document.getElementById('d-' + id); const open = d.hidden; d.hidden = !open; el.setAttribute('aria-expanded', String(open)); if (open) state.secOpen.add(id); else { state.secOpen.delete(id); dropSec(); } return; }
  if (a === 'tier') { state.tier = v; return rerender(); }
  if (a === 'wl') { state.wl = v; return rerender(); }
  if (a === 'cmpClear') { state.cmp.clear(); return rerender(); }
  if (a === 'aiFill') { readForm(); startFormHelper(); return; }
  if (a === 'sub') { toggleSub(el.dataset.id); return; }
  if (a === 'calPrev' || a === 'calNext') { calShift(a === 'calNext' ? 1 : -1); return; }
  if (a === 'calToday') { calToday(); return; }
  if (a === 'calNextEv') { calJump(el.dataset.date); return; }
});
app.addEventListener('input', e => { if (e.target.closest && e.target.closest('#apply-form')) readForm(); });
app.addEventListener('keydown', e => { if (e.key !== 'Escape') return; const d = e.target.closest && e.target.closest('details.msel'); if (d && d.open) { d.removeAttribute('open'); d.querySelector('summary').focus(); } });
document.addEventListener('click', e => { const d = document.getElementById('ap-msel'); if (d && d.open && !d.contains(e.target)) d.removeAttribute('open'); });
{ const pk = document.getElementById('ui-pick');
  pk.addEventListener('click', e => { const b = e.target.closest('button[data-ui]'); if (!b) return; ui = b.dataset.ui; try { localStorage.setItem('llmops-ui', ui); } catch (err) {} applyUi(); pk.removeAttribute('open'); pk.querySelector('summary').focus(); });
  pk.addEventListener('keydown', e => { if (e.key === 'Escape' && pk.open) { pk.removeAttribute('open'); pk.querySelector('summary').focus(); } });
  document.addEventListener('click', e => { if (pk.open && !pk.contains(e.target)) pk.removeAttribute('open'); });
  try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (!ui) applyUi(); }); } catch (err) {}
  new MutationObserver(() => { if (!ui) applyUi(); }).observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']}); }
app.addEventListener('change', e => {
  if (e.target.closest && e.target.closest('#apply-form')) formChange(e.target);
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act;
  if (a === 'newsHigh') { dropItem(); state.newsHigh = el.checked; return rerender(); }
  if (a === 'retPast') { state.retPast = el.checked; return rerender(); }
  if (a === 'mock') { state.showMock = el.checked; return rerender(); }
  if (a === 'apClass') { const wrap = document.getElementById('ap-class-other-wrap'); wrap.hidden = el.value !== 'other'; if (!wrap.hidden) document.getElementById('ap-class-other').focus(); return; }
  if (a === 'testModel') { state.testModel = el.value; if (location.hash.startsWith('#tests-') || location.hash.startsWith('#sec-')) { history.replaceState(null, '', '#tests'); } return rerender(); }
  if (a === 'costModel') { state.costModel = el.value; if (location.hash.startsWith('#cost-')) { history.replaceState(null, '', '#cost'); } return rerender(); }
  if (a === 'cmp') { if (el.checked) { if (state.cmp.size >= 3) { el.checked = false; return; } state.cmp.add(el.dataset.id); } else state.cmp.delete(el.dataset.id); return rerender(); }
  if (a === 'wlc') { state.wlCustom[el.dataset.k] = Math.max(0, +el.value || 0); const id = el.id; rerender(); const f = document.getElementById(id); if (f) f.focus(); return; }
});
app.addEventListener('submit', e => { if (e.target.id !== 'apply-form') return; e.preventDefault(); submitRequest(); });

/* ------------------------------------------------------------------ server calls (same origin; portal-web forwards /api/* and the sign-in header) */
async function api(path, opts){
  opts = opts || {};
  const req = {method: opts.method || 'GET', headers: {'Accept': 'application/json'}, credentials: 'same-origin', cache: 'no-cache', signal: opts.signal};
  if (opts.body !== undefined) { req.headers['Content-Type'] = 'application/json'; req.body = JSON.stringify(opts.body); }
  let res;
  try { res = await fetch(path, req); }
  catch (e) { if (e && e.name === 'AbortError') throw e; throw {status: 0, code: 'network', message: '', links: []}; }
  let data = null;
  if ((res.headers.get('content-type') || '').includes('json')) { try { data = await res.json(); } catch (e) { if (e && e.name === 'AbortError') throw e; data = null; } }
  if (!res.ok) {
    const er = (data && data.error) || {};
    throw {status: res.status, code: er.code || 'http_' + res.status,
      message: er.message || (data && typeof data.detail === 'string' ? data.detail : ''),
      links: data && Array.isArray(data.links) ? data.links : []};
  }
  if (data === null) {  /* 204 No Content (or another bodyless success) is fine for PUT / POST / DELETE */
    if (res.status === 204 || req.method !== 'GET') return null;
    throw {status: res.status, code: 'bad_response', message: '', links: []};
  }
  return data;
}

/* ------------------------------------------------------------------ data: GET /api/content/portal.json (ETag; the browser revalidates) */
let loadState = {kind: 'loading', err: null};
function stateHtml(){
  if (loadState.kind === 'loading') return `<div class="state" role="status"><span class="spinner" aria-hidden="true"></span><span>${esc(t('load.loading'))}</span></div>`;
  const e = loadState.err || {};
  const key = e.status === 401 || e.status === 403 ? 'load.auth' : (e.code === 'no_view' ? 'load.empty' : 'load.error');
  return `<div class="card state-error" role="alert"><h1>${esc(t(key))}</h1>${e.message ? `<p class="small u-m800">${esc(e.message)}</p>` : ''}
    <p class="u-m1200"><button type="button" class="btn primary" data-act="reload">${esc(t('load.retry'))}</button></p></div>`;
}
function renderState(){ app.innerHTML = stateHtml(); }
function init(data){
  if (!data || !Array.isArray(data.models) || !Array.isArray(data.news)) throw {status: 0, code: 'bad_data', message: 'unexpected portal data', links: []};
  data.security = data.security || {}; data.security.models = data.security.models || {}; data.security.items = data.security.items || [];
  data.secMatrix = data.secMatrix || {}; ['intro', 'introEn', 'reading', 'readingEn', 'items'].forEach(k => { if (!Array.isArray(data.secMatrix[k])) data.secMatrix[k] = []; });
  ['hl', 'cdNew', 'cdPrice', 'ret', 'open', 'actions', 'gates', 'brief'].forEach(k => { if (!Array.isArray(data[k])) data[k] = []; });
  data.progress = data.progress || {};
  data.news.forEach(n => { n.shown = (n.date && n.date <= n.last) ? n.date : n.last; });
  data.news.sort((a, b) => (b.last + b.shown).localeCompare(a.last + a.shown));
  byId = Object.fromEntries(data.models.map(m => [m.id, m]));
  D = data;
}
async function loadData(){
  loadState = {kind: 'loading', err: null};
  if (!D) renderState();
  try {
    init(await api('/api/content/portal.json'));
  } catch (e) {
    loadState = {kind: 'error', err: e};
    D = null; chrome(); renderState();
    return;
  }
  loadState = {kind: 'ready', err: null};
  chatEl('chat-fab').hidden = chat.open;
  chrome(); render();
  loadSubs();
}

/* ------------------------------------------------------------------ ask the portal: retrieval and the model call happen in assistant-api */
const ROUTE_OK = /^#(home|news|news-open|news-todo|retire|models|tests|cost|apply|m-[a-z0-9-]+(?:\/(?:security|rollout))?|cost-[a-z0-9-]+|tests-[a-z0-9-]+|apply-[a-z0-9-]+|news-it-[a-f0-9]+|sec-SEC-[0-9]{2})$/;
function mdLite(s){
  let h = esc(s);
  h = h.replace(/\[([^\]\n]{1,90})\]\((#[A-Za-z0-9\-\/]+)\)/g, (m0, txt, href) => ROUTE_OK.test(href) ? `<a href="${href}" data-chatlink>${txt}</a>` : txt);
  h = h.replace(/\[([^\]\n]{1,90})\]\((?!#)[^)\s]*\)/g, '$1');
  h = h.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
  let out = '', inList = false;
  h.split('\n').forEach(ln => { const m = ln.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)$/); if (m) { if (!inList) { out += '<ul>'; inList = true; } out += `<li>${m[1]}</li>`; } else { if (inList) { out += '</ul>'; inList = false; } if (ln.trim()) out += `<p>${ln}</p>`; } });
  if (inList) out += '</ul>';
  return out;
}
const chat = {open:false, mode:'qa', msgs:[], turns:[], fturns:[], ctl:null, busy:false, seq:0};
const chatEl = id => document.getElementById(id);
function chatChrome(){
  const form = chat.mode === 'form';
  chatEl('chat-fab-l').textContent = t('chat.fab');
  chatEl('chat-h').textContent = t(form ? 'fa.title' : 'chat.title');
  chatEl('chat-x').setAttribute('aria-label', t('chat.close'));
  chatEl('chat-in-l').textContent = t('chat.in');
  chatEl('chat-in').placeholder = t(form ? 'fa.ph' : 'chat.ph');
  chatEl('chat-send').textContent = t('chat.send');
  chatEl('chat-stop').textContent = t('chat.stop');
  const asked = chat.msgs.some(m => m.role === 'user');
  if (form) { const u = (state.form.use || '').trim(); chatEl('chat-sugg').innerHTML = (!asked && u) ? `<button type="button" data-q="${esc(u)}">${esc(t('fa.useChip', {u: u.length > 40 ? u.slice(0, 40) + '…' : u}))}</button>` : ''; }
  else chatEl('chat-sugg').innerHTML = asked ? '' : ['chat.s1','chat.s2','chat.s3','chat.s4'].map(k => `<button type="button" data-q="${esc(t(k))}">${esc(t(k))}</button>`).join('');
}
function linksHtml(links){
  const seen = new Set();
  const items = (links || []).filter(l => l && typeof l.route === 'string' && ROUTE_OK.test(l.route) && !seen.has(l.route) && seen.add(l.route)).slice(0, 4);
  if (!items.length) return '';
  return `<p class="u-m800 muted">${esc(t('chat.pages'))}</p><ul class="chat-links">${items.map(l => `<li><a href="${l.route}" data-chatlink>${esc(l.title || l.route)}</a></li>`).join('')}</ul>`;
}
function formPreview(o){
  const J = sepJ(), rows = [];
  if (o.models) rows.push([t('f.modelShort'), o.models.map(id => byId[id].name).join(J)]);
  if (o.use) rows.push([t('f.useShort'), o.use]);
  if (o.cls) rows.push([t('f.class'), t('c.' + o.cls) + (o.cls === 'other' && o.clsOther ? (lang === 'en' ? ': ' : '：') + o.clsOther : '')]);
  if (o.cloud) rows.push([t('f.cloud'), o.cloud === 'any' ? t('f.cloudAny') : cloudName(o.cloud)]);
  if (o.rpd != null) rows.push([t('f.rpd'), o.rpd.toLocaleString('en-US')]);
  if (o.tin != null) rows.push([t('f.tin'), o.tin.toLocaleString('en-US')]);
  if (o.tout != null) rows.push([t('f.tout'), o.tout.toLocaleString('en-US')]);
  if (o.date) rows.push([t('f.date'), o.date]);
  if (o.ext != null) rows.push([t('f.extShort'), t(o.ext ? 'yes' : 'no')]);
  if (o.tw != null) rows.push([t('f.twShort'), t(o.tw ? 'yes' : 'no')]);
  if (o.note) rows.push([t('f.noteShort'), o.note]);
  return rows;
}
function msgHtml(m){
  if (m.role === 'user') return `<div class="msg u">${esc(m.text)}</div>`;
  if (m.kind === 'hello') return `<div class="msg b"><p>${esc(t('chat.hello'))}</p></div>`;
  if (m.kind === 'formHello') return `<div class="msg b"><p>${esc(t('fa.hello'))}</p><p><button type="button" class="linkbtn" data-mode="qa">${esc(t('fa.back'))}</button></p></div>`;
  if (m.kind === 'form') {
    let body = m.thinking ? `<p class="think">${esc(t('chat.think'))}</p>` : '';
    if (m.reply) body += mdLite(m.reply);
    if (m.questions && m.questions.length) body += `<p class="u-m802">${esc(t('fa.q'))}</p><ul>${m.questions.map(q => `<li>${esc(q)}</li>`).join('')}</ul>`;
    const rows = m.form ? formPreview(m.form) : [];
    if (rows.length) body += `<div class="fa-box"><p class="fa-h">${esc(t('fa.fill'))}</p><dl class="fa-dl">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>${m.applied ? `<p class="fa-ok">${esc(t('fa.applied'))}</p>` : `<button type="button" class="btn primary" data-apply="${m.id}">${esc(t('fa.apply'))}</button>`}</div>`;
    if (m.err) body += `<div class="err">${esc(t(m.err))}</div>`;
    return `<div class="msg b">${body}</div>`;
  }
  let body = m.thinking ? `<p class="think">${esc(t('chat.think'))}</p>` : '';
  if (m.text) body = mdLite(m.text);
  if (m.fallback) body += `<p>${esc(t(m.fallback))}</p>` + (m.links && m.links.length ? linksHtml(m.links) : (m.fallback === 'chat.notfound' ? '' : `<p class="muted">${esc(t('chat.notfound'))}</p>`));
  else if (m.done && m.links && m.links.length && !/data-chatlink/.test(body)) body += linksHtml(m.links);
  if (m.err) body += `<div class="err">${esc(t(m.err))}</div>`;
  if (m.cut) body += `<p class="muted">${esc(t('chat.cut'))}</p>`;
  return `<div class="msg b">${body}</div>`;
}
function renderLog(){ const log = chatEl('chat-log'); log.innerHTML = (chat.mode === 'form' ? [] : [{role:'bot', kind:'hello'}]).concat(chat.msgs).map(msgHtml).join(''); log.scrollTop = log.scrollHeight; chatChrome(); }
function setBusy(b){ chat.busy = b; chatEl('chat-send').disabled = b; chatEl('chat-stop').hidden = !b; }
function openChat(open){
  chat.open = open; chatEl('chat').hidden = !open; chatEl('chat-fab').hidden = open; chatEl('chat-fab').setAttribute('aria-expanded', String(open));
  if (open) { renderLog(); chatEl('chat-in').focus(); } else chatEl('chat-fab').focus();
}
function startFormHelper(){
  if (chat.busy && chat.ctl) chat.ctl.abort();
  chat.mode = 'form'; chat.fturns = []; chat.msgs = [{id: ++chat.seq, role:'bot', kind:'formHello'}];
  openChat(true);
}
function backToQa(){ if (chat.busy && chat.ctl) chat.ctl.abort(); chat.mode = 'qa'; chat.msgs = []; renderLog(); chatEl('chat-in').focus(); }
/* the helper's suggestion arrives in request-schema names (assistant-api already dropped unknown models);
   map it to the form's own fields and check it again here */
function fromServerForm(f){
  const o = {};
  if (!f || typeof f !== 'object') return o;
  if (Array.isArray(f.models)) { const ms = [...new Set(f.models.map(String).filter(id => byId[id]))].slice(0, 3); if (ms.length) o.models = ms; }
  if (typeof f.use_case === 'string' && f.use_case.trim()) o.use = f.use_case.trim().slice(0, 300);
  if (CLASSES.includes(f.data_class)) { o.cls = f.data_class; if (o.cls === 'other' && typeof f.data_class_other === 'string' && f.data_class_other.trim()) o.clsOther = f.data_class_other.trim().slice(0, 120); }
  if (['any','aws','azure','gcp'].includes(f.cloud)) o.cloud = f.cloud;
  [['rpd', 'rpd'], ['tokens_in', 'tin'], ['tokens_out', 'tout']].forEach(([s, k]) => { const n = Number(f[s]); if (f[s] != null && f[s] !== '' && typeof f[s] !== 'boolean' && Number.isFinite(n) && n >= 0 && n < 1e9) o[k] = Math.round(n); });
  if (typeof f.external === 'boolean') o.ext = f.external;
  if (typeof f.taiwan_only === 'boolean') o.tw = f.taiwan_only;
  if (typeof f.target_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f.target_date)) o.date = f.target_date;
  if (typeof f.note === 'string' && f.note.trim()) o.note = f.note.trim().slice(0, 300);
  return o;
}
/* what the model said last time, in the JSON shape its rules ask for (sent back as conversation history) */
function toPromptJson(reply, questions, f){
  f = f || {};
  return JSON.stringify({reply, questions, form: {models: f.models || [], use: f.use_case || '', dataClass: f.data_class || '', dataClassOther: f.data_class_other || '',
    cloud: f.cloud || 'any', rpd: f.rpd ?? null, tin: f.tokens_in ?? null, tout: f.tokens_out ?? null, external: f.external ?? null,
    taiwan: f.taiwan_only ?? null, date: f.target_date || null, note: f.note || ''}}).slice(0, 4000);
}
function applySuggestion(id){
  const m = chat.msgs.find(x => x.id === id); if (!m || !m.form) return;
  readForm();
  const o = m.form, f = state.form;
  if (o.models) { f.models = o.models.slice(); f.unsure = false; }
  ['use','cls','clsOther','cloud','date','note','ext','tw'].forEach(k => { if (o[k] != null) f[k] = o[k]; });
  ['rpd','tin','tout'].forEach(k => { if (o[k] != null) f[k] = String(o[k]); });
  m.applied = true;
  if (route().v !== 'apply') location.hash = 'apply'; else rerender();
  renderLog();
  if (window.innerWidth < 760) openChat(false);
}
async function askForm(q){
  chat.msgs.push({role:'user', text:q});
  const m = {id: ++chat.seq, role:'bot', kind:'form', thinking:true};
  chat.msgs.push(m); renderLog();
  readForm();
  const ctl = new AbortController(); chat.ctl = ctl; setBusy(true);
  try {
    const res = await api('/api/assist/form', {method: 'POST', signal: ctl.signal,
      body: {messages: chat.fturns.slice(-6).concat([{role: 'user', content: q}]), form: requestPayload(state.form), lang}});
    m.thinking = false;
    m.reply = typeof res.reply === 'string' ? res.reply : '';
    m.questions = Array.isArray(res.questions) ? res.questions.filter(x => typeof x === 'string' && x.trim()).slice(0, 2) : [];
    m.form = fromServerForm(res.form);
    if (!m.reply && !Object.keys(m.form).length) m.err = 'fa.bad';
    chat.fturns.push({role: 'user', content: q}, {role: 'assistant', content: toPromptJson(m.reply, m.questions, res.form)});
  } catch (e) {
    m.thinking = false;
    if (e && e.name === 'AbortError') m.err = 'chat.stopped';
    else if (e.status === 401 || e.status === 403) m.err = 'chat.auth';
    else if (e.status === 429) m.err = 'chat.rate';
    else if (e.code === 'refused') m.err = 'chat.refused';
    else if (e.code === 'question_too_long') m.err = 'chat.tooLong';
    else if (e.code === 'invalid_reply') m.err = 'fa.bad';
    else if (e.status === 0 || e.status === 502 || e.status === 503 || e.status === 504) m.err = 'fa.noAI';
    else m.err = 'chat.upstream';
  } finally { if (chat.ctl === ctl) chat.ctl = null; setBusy(false); renderLog(); }
}
async function ask(q){
  q = q.trim(); if (!q || chat.busy) return;
  if (chat.mode === 'form') return askForm(q);
  chat.msgs.push({role:'user', text:q});
  const m = {role:'bot', thinking:true, links:[]};
  chat.msgs.push(m); renderLog();
  const ctl = new AbortController(); chat.ctl = ctl; setBusy(true);
  try {
    const res = await api('/api/chat', {method: 'POST', signal: ctl.signal, body: {question: q, history: chat.turns.slice(-6), lang}});
    m.thinking = false; m.done = true;
    m.text = typeof res.answer === 'string' ? res.answer : '';
    m.links = Array.isArray(res.links) ? res.links : [];
    m.cut = !!res.truncated;
    if (!m.text && !m.cut) m.fallback = 'chat.notfound';
    chat.turns.push({role:'user', content:q}, {role:'assistant', content:m.text});
  } catch (e) {
    m.thinking = false; m.links = (e && e.links) || [];
    if (e && e.name === 'AbortError') m.err = 'chat.stopped';
    else if (e.status === 401 || e.status === 403) m.err = 'chat.auth';
    else if (e.status === 429) m.err = 'chat.rate';
    else if (e.code === 'refused') m.err = 'chat.refused';
    else if (e.code === 'question_too_long') m.err = 'chat.tooLong';
    else if (m.links.length && [0, 502, 503, 504].includes(e.status)) m.fallback = 'chat.noAI';
    else m.err = 'chat.upstream';
  } finally { if (chat.ctl === ctl) chat.ctl = null; setBusy(false); renderLog(); }
}
chatEl('chat-fab').addEventListener('click', () => openChat(true));
chatEl('chat-x').addEventListener('click', () => openChat(false));
chatEl('chat').addEventListener('keydown', e => { if (e.key === 'Escape') openChat(false); });
chatEl('chat-form').addEventListener('submit', e => { e.preventDefault(); const box = chatEl('chat-in'); const q = box.value; box.value = ''; ask(q); });
chatEl('chat-in').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); chatEl('chat-form').requestSubmit(); } });
chatEl('chat-stop').addEventListener('click', () => { if (chat.ctl) chat.ctl.abort(); });
chatEl('chat-sugg').addEventListener('click', e => { const b = e.target.closest('button[data-q]'); if (b) ask(b.dataset.q); });
chatEl('chat-log').addEventListener('click', e => {
  const ap = e.target.closest('button[data-apply]'); if (ap) { applySuggestion(+ap.dataset.apply); return; }
  if (e.target.closest('button[data-mode]')) { backToQa(); return; }
  const a = e.target.closest('a[data-chatlink]'); if (a && window.innerWidth < 760) openChat(false);
});

chrome();
loadData();
})();
