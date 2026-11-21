declare function setInterval(callback: () => void, ms?: number): number

const api = require('any-listen')
const FILE = 'music-stats/data-v2.json'
const LEGACY_FILE = 'music-stats/data-v1.json'
const THRESHOLD = 30
const MAX_SESSIONS = 20000
const PLUGIN_VERSION = '1.2.0'

type Track = { key: string; id: string; name: string; singer: string; album: string; seconds: number; plays: number; lastPlayed: number }
type Session = { key: string; name: string; singer: string; album: string; startedAt: number; endedAt: number; seconds: number }
type Store = { version: 2; tracks: Record<string, Track>; sessions: Session[]; totalSeconds: number; validPlays: number }
const emptyStore = (): Store => ({ version: 2, tracks: {}, sessions: [], totalSeconds: 0, validPlays: 0 })
let store = emptyStore()
let current: { key: string; music: NonNullable<typeof music>; startedAt: number; lastTick: number; elapsed: number; counted: boolean } | null = null
let playing = false
let music: { id: string; name: string; singer: string; album: string } | null = null
let saveChain: Promise<unknown> = Promise.resolve()
let eventCount = 0
let syncCount = 0
let lastEvent = '尚未收到播放器事件'
let lastSyncAt = 0
let lastSyncError = ''
let startupPendingPlayback = false
let syncToken = 0

const dayKey = (time: number) => { const d = new Date(time); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
const weekStart = (time: number) => { const d = new Date(time); d.setHours(0,0,0,0); d.setDate(d.getDate() - ((d.getDay()+6)%7)); return dayKey(d.getTime()) }
const monthKey = (time: number) => dayKey(time).slice(0,7)
const makeKey = (m: NonNullable<typeof music>) => `${m.id || ''}|${m.name}|${m.singer}`
const dashboardSnapshot = () => {
  const tracks = Object.values(store.tracks).map(t => ({ ...t })).sort((a,b) => b.plays-a.plays || b.seconds-a.seconds)
  const sessions = store.sessions.slice(-5000).map(s => ({ ...s }))
  return JSON.stringify({ version: 1, generatedAt: Date.now(), totalSeconds: store.totalSeconds, validPlays: store.validPlays, tracks, sessions })
}
const syncDashboardConfig = async () => {
  try { await api.configuration.setConfigs({ dashboardData: dashboardSnapshot() }) }
  catch (e) { api?.logcat?.warn?.('[music-stats] dashboard config sync failed', e) }
}
const save = () => {
  const snapshot = JSON.stringify(store)
  saveChain = saveChain.then(async () => {
    await api.storage.writeFile(FILE, snapshot)
    await syncDashboardConfig()
  }).catch((e: unknown) => api.logcat.error('[music-stats] save failed', e))
}
const load = async () => {
  try {
    if (await api.storage.fileExists(FILE)) {
      const parsed = JSON.parse(await api.storage.readFile(FILE, 'utf-8')) as Store
      if (parsed?.version === 2 && parsed.tracks && Array.isArray(parsed.sessions)) { store = parsed; return }
    }
    if (await api.storage.fileExists(LEGACY_FILE)) {
      const old = JSON.parse(await api.storage.readFile(LEGACY_FILE, 'utf-8')) as any
      if (old?.version === 1 && old.tracks) {
        store.tracks = old.tracks
        store.totalSeconds = Number(old.totalSeconds) || 0
        store.validPlays = Number(old.validPlays) || 0
        // v1 stored only each track's last-play timestamp, not a full historical timeline.
        await save()
      }
    }
  } catch (e) { api.logcat.warn('[music-stats] data load/migration failed', e) }
}
const tick = () => {
  if (!playing || !current) return
  const now = Date.now()
  const delta = Math.max(0, Math.min(2, (now - current.lastTick) / 1000))
  current.lastTick = now
  current.elapsed += delta
  if (!current.counted && current.elapsed >= THRESHOLD) current.counted = true
}
const flushCurrent = () => {
  if (!current) { current = null; return }
  const sessionMusic = current.music
  const elapsed = Math.floor(current.elapsed)
  if (elapsed >= THRESHOLD) {
    const track = store.tracks[current.key]
    if (track) {
      track.seconds += elapsed
      track.lastPlayed = Date.now()
      if (current.counted) track.plays += 1
    }
    store.totalSeconds += elapsed
    if (current.counted) store.validPlays += 1
    store.sessions.push({ key: current.key, name: sessionMusic.name, singer: sessionMusic.singer, album: sessionMusic.album, startedAt: current.startedAt, endedAt: Date.now(), seconds: elapsed })
    if (store.sessions.length > MAX_SESSIONS) store.sessions.splice(0, store.sessions.length - MAX_SESSIONS)
    save()
  }
  current = null
}
const startTrack = () => {
  flushCurrent()
  if (!music) return
  const key = makeKey(music)
  current = { key, music: { ...music }, startedAt: Date.now(), lastTick: Date.now(), elapsed: 0, counted: false }
  if (!store.tracks[key]) store.tracks[key] = { key, id: music.id, name: music.name, singer: music.singer, album: music.album, seconds: 0, plays: 0, lastPlayed: 0 }
}
const fmt = (s: number) => { const n = Math.floor(Math.max(0,s)); const h = Math.floor(n/3600), m = Math.floor(n%3600/60), sec=n%60; return h ? `${h}小时${m}分` : `${m}分${sec}秒` }
const inRange = (s: Session, range: string, now: number) => {
  const t = new Date(now)
  if (range === 'today') return dayKey(s.endedAt) === dayKey(now)
  if (range === 'week') return s.endedAt >= new Date(weekStart(now)).getTime()
  if (range === 'month') return monthKey(s.endedAt) === monthKey(now)
  return true
}
const rangeStats = (range: string) => {
  const now = Date.now(), sessions = store.sessions.filter(s => inRange(s, range, now))
  const seconds = sessions.reduce((n,s)=>n+s.seconds,0)
  const songs = new Set(sessions.map(s=>s.key)).size
  return { seconds, plays: sessions.length, songs }
}
const summary = () => {
  const top = Object.values(store.tracks).sort((a,b)=>b.seconds-a.seconds).slice(0,10)
  const labels = [['今日','today'],['本周','week'],['本月','month']] as const
  return [
    'Any Listen 听歌统计', `累计有效收听：${fmt(store.totalSeconds)}`, `有效播放次数：${store.validPlays}`, `歌曲数量：${Object.keys(store.tracks).length}`,
    ...labels.map(([label,key]) => { const s = rangeStats(key); return `${label}：${fmt(s.seconds)}｜${s.plays} 次｜${s.songs} 首` }),
    '', '收听时长 TOP 10：', ...top.map((t,i)=>`${i+1}. ${t.name} - ${t.singer}｜${fmt(t.seconds)}｜${t.plays} 次`),
    '', '统计规则：单次连续播放达到 30 秒才计入；暂停、停止和缓冲期间不计时。历史明细从 v1.0.2 开始累计。',
  ].join('\n')
}
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string))
const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g,'""')}"`
const exportJson = async () => {
  const dir = await api.app.showSaveDialog({ title: '选择听歌统计 JSON 保存位置', defaultFileName: 'anylisten-music-stats.json', filters: { JSON: ['json'] } })
  if (!dir) return
  await api.app.writeSaveDialogFile(dir, 'anylisten-music-stats.json', JSON.stringify(store, null, 2))
  await api.app.showMessage('JSON 统计数据已导出。')
}
const normalizeImportedStore = (value: any): Store => {
  if (!value || typeof value !== 'object' || !value.tracks) throw new Error('JSON 文件不是有效的 Any Listen Music Stats 备份')

  // --- 格式检测与标准化 ---
  let tracks: Record<string, Track>
  const tracksIsArray = Array.isArray(value.tracks)

  if (tracksIsArray) {
    // 情况 A: tracks 为数组 → 转换为 dict
    // 使用复合键: key|id|name|singer，确保唯一性
    tracks = {}
    for (const raw of value.tracks as any[]) {
      if (!raw || typeof raw !== 'object') continue
      // 尝试多种键生成方式，优先使用现有 key，回退自动生成
      const key = String(
        raw.key ||
        `${raw.id || ''}|${raw.name || '未知歌曲'}|${raw.singer || '未知歌手'}`
      )
      // 检查是否已存在相同 key（防止覆盖）
      if (!tracks[key]) {
        tracks[key] = {
          key,
          id: String(raw.id || ''),
          name: String(raw.name || '未知歌曲'),
          singer: String(raw.singer || '未知歌手'),
          album: String(raw.album || ''),
          seconds: Math.max(0, Number(raw.seconds) || 0),
          plays: Math.max(0, Number(raw.plays) || 0),
          lastPlayed: Math.max(0, Number(raw.lastPlayed) || 0)
        }
      }
    }
  } else {
    // 情况 B: tracks 为对象/dict — 当前逻辑
    // 直接使用现有结构，但过滤无效条目
    tracks = value.tracks as Record<string, Track>
  }

  // --- 会话标准化 (保持不变，但增加健壮性) ---
  const sessions: Session[] = (value.sessions && Array.isArray(value.sessions))
    ? value.sessions.filter((x: any) =>
        x && typeof x === 'object' &&
        Number(x.startedAt) > 0 &&
        Number(x.endedAt) > 0 &&
        Number(x.seconds) >= THRESHOLD
      )
        .map((x: any) => ({
          key: String(x.key || ''),
          name: String(x.name || '未知歌手'),
          singer: String(x.singer || '未知歌手'),
          album: String(x.album || ''),
          startedAt: Number(x.startedAt),
          endedAt: Number(x.endedAt),
          seconds: Math.floor(Number(x.seconds))
        }))
    : []

  // --- 持久化属性 (保持不变) ---
  const effectiveTotalSeconds = tracksIsArray
    ? Object.values(tracks).reduce((n, x) => n + x.seconds, 0)
    : Number(value.totalSeconds) || (tracks ? Object.values(tracks).reduce((n, x) => n + x.seconds, 0) : 0)
  const effectiveValidPlays = tracksIsArray
    ? Object.keys(tracks).length
    : Number(value.validPlays) || (tracks ? Object.keys(tracks).length : 0)

  return { version: 2, tracks, sessions, totalSeconds: Math.max(0, effectiveTotalSeconds), validPlays: Math.max(0, effectiveValidPlays) }
}
const sessionId = (x: Session) => `${x.key}|${x.startedAt}|${x.endedAt}|${x.seconds}`
const mergeStores = (a: Store, b: Store): Store => {
  const sessions = new Map<string, Session>()
  for (const x of [...a.sessions, ...b.sessions]) sessions.set(sessionId(x), x)
  const mergedSessions = [...sessions.values()].sort((x,y)=>x.endedAt-y.endedAt).slice(-MAX_SESSIONS)
  const tracks: Record<string, Track> = {}
  for (const x of Object.values(a.tracks)) tracks[x.key] = { ...x }
  for (const x of Object.values(b.tracks)) {
    const old = tracks[x.key]
    if (!old) tracks[x.key] = { ...x }
    else tracks[x.key] = { ...old, id: old.id || x.id, name: old.name || x.name, singer: old.singer || x.singer, album: old.album || x.album, seconds: Math.max(old.seconds, x.seconds), plays: Math.max(old.plays, x.plays), lastPlayed: Math.max(old.lastPlayed, x.lastPlayed) }
  }
  // Session details are authoritative for records shared by both backups; aggregate-only legacy data is retained by max() above.
  const sessionSeconds = mergedSessions.reduce((n,x)=>n+x.seconds,0)
  const sessionPlays = mergedSessions.length
  const byTrack = new Map<string, { seconds: number; plays: number; lastPlayed: number }>()
  for (const x of mergedSessions) { const v=byTrack.get(x.key)||{seconds:0,plays:0,lastPlayed:0}; v.seconds+=x.seconds; v.plays++; v.lastPlayed=Math.max(v.lastPlayed,x.endedAt); byTrack.set(x.key,v) }
  for (const [key,v] of byTrack) if (tracks[key]) tracks[key]={...tracks[key],seconds:v.seconds,plays:v.plays,lastPlayed:Math.max(tracks[key].lastPlayed,v.lastPlayed)}
  return { version: 2, tracks, sessions: mergedSessions, totalSeconds: mergedSessions.length ? sessionSeconds : Math.max(a.totalSeconds,b.totalSeconds), validPlays: mergedSessions.length ? sessionPlays : Math.max(a.validPlays,b.validPlays) }
}
const importJson = async (mode: 'replace' | 'merge') => {
  const picked = await api.app.showOpenDialog({ title: mode === 'merge' ? '选择要合并的听歌统计 JSON' : '选择要恢复的听歌统计 JSON', filters: { JSON: ['json'] } })
  if (!picked) return
  try {
    const raw = await api.app.readOpenDialogFile(picked, 'utf-8')
    const incoming = normalizeImportedStore(JSON.parse(raw))
    const backupPath = `music-stats/pre-import-${Date.now()}.json`
    await api.storage.writeFile(backupPath, JSON.stringify(store, null, 2))
    store = mode === 'merge' ? mergeStores(store, incoming) : incoming
    await save()
    await api.app.showMessage(mode === 'merge' ? `合并完成：现有 ${store.sessions.length} 条播放明细。导入前数据已自动备份。` : `恢复完成：${store.sessions.length} 条播放明细。导入前数据已自动备份。`)
  } catch (e) { await api.app.showMessage(`导入失败：${String(e)}`, { type: 'error' }) }
}

const exportCsv = async () => {
  const dir = await api.app.showSaveDialog({ title: '选择听歌记录 CSV 保存位置', defaultFileName: 'anylisten-music-history.csv', filters: { CSV: ['csv'] } })
  if (!dir) return
  const rows = [['歌曲','歌手','专辑','开始时间','结束时间','有效时长(秒)'], ...store.sessions.map(s=>[s.name,s.singer,s.album,new Date(s.startedAt).toLocaleString(),new Date(s.endedAt).toLocaleString(),s.seconds])]
  const csv = '\uFEFF' + rows.map(row=>row.map(csvCell).join(',')).join('\r\n')
  await api.app.writeSaveDialogFile(dir, 'anylisten-music-history.csv', csv)
  await api.app.showMessage('CSV 听歌明细已导出，可用 Excel 打开。')
}
const exportDashboard = async () => {
  const dir = await api.app.showSaveDialog({ title: '选择图形化统计面板保存位置', defaultFileName: 'anylisten-music-dashboard.html', filters: { HTML: ['html'] } })
  if (!dir) return
  const data = JSON.stringify({ ...store, generatedAt: Date.now() }).replace(/</g,'\\u003c')
  const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Any Listen 听歌统计</title><style>*{box-sizing:border-box}body{margin:0;background:#f4f6fa;color:#202633;font:15px system-ui,"Microsoft YaHei",sans-serif}.wrap{max-width:1100px;margin:36px auto;padding:0 20px}.head{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}.muted{color:#788397;font-size:13px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin:22px 0}.card,section{background:white;border:1px solid #e7eaf0;border-radius:14px;padding:20px}.num{font-size:28px;font-weight:700;margin-top:8px}.tabs{display:flex;gap:8px;margin:18px 0}.tabs button{border:1px solid #d8deea;background:white;border-radius:20px;padding:8px 16px;cursor:pointer}.tabs button.active{background:#25334a;color:white}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px 9px;border-bottom:1px solid #edf0f4}th{color:#778196;font-weight:600}section{margin:16px 0;overflow:auto}.bar{height:9px;background:#edf0f5;border-radius:9px;overflow:hidden;min-width:100px}.bar i{display:block;height:100%;background:#607da8}h2{font-size:18px;margin:0 0 16px}@media(max-width:600px){.wrap{margin:18px auto;padding:0 12px}th,td{font-size:13px;padding:9px 5px}}</style><div class="wrap"><div class="head"><div><h1>听歌统计</h1><div class="muted">Any Listen Music Stats · 本地离线报告</div></div><div class="muted" id="generated"></div></div><div class="cards" id="cards"></div><div class="tabs"><button class="active" data-r="all">全部记录</button><button data-r="today">今天</button><button data-r="week">近一周</button><button data-r="month">本月</button></div><section><h2>收听时长排行</h2><div id="ranking"></div></section><section><h2>听歌明细</h2><table><thead><tr><th>歌曲</th><th>歌手</th><th>有效时长</th><th>播放结束时间</th></tr></thead><tbody id="history"></tbody></table></section><div class="muted">单次连续播放达到 30 秒才计入。历史明细从插件 v1.0.2 安装后开始累计；此前版本只有歌曲汇总，无法还原历史日期。</div></div><script>const D=${data};const fmt=n=>{n=Math.floor(n||0);let h=Math.floor(n/3600),m=Math.floor(n%3600/60),s=n%60;return h?h+'小时'+m+'分':m+'分'+s+'秒'};const date=n=>new Date(n).toLocaleString();const startWeek=()=>{let d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d.getTime()};let range='all';function rows(){let a=D.sessions||[],now=Date.now();return a.filter(s=>range==='today'?new Date(s.endedAt).toDateString()===new Date().toDateString():range==='week'?s.endedAt>=startWeek():range==='month'?new Date(s.endedAt).getMonth()===new Date().getMonth()&&new Date(s.endedAt).getFullYear()===new Date().getFullYear():true).sort((a,b)=>b.endedAt-a.endedAt)}function render(){let a=rows(),secs=a.reduce((n,s)=>n+s.seconds,0),songs=new Set(a.map(s=>s.key)).size;document.getElementById('cards').innerHTML=[['收听时长',fmt(range==='all'?D.totalSeconds:secs)],['有效播放次数',range==='all'?D.validPlays:a.length],['听过的歌曲',range==='all'?Object.keys(D.tracks).length:songs],['累计记录片段',a.length]].map(x=>'<div class="card"><div class="muted">'+x[0]+'</div><div class="num">'+x[1]+'</div></div>').join('');let m={};a.forEach(s=>{let k=s.key;m[k]??={name:s.name,singer:s.singer,seconds:0,plays:0};m[k].seconds+=s.seconds;m[k].plays++});let top=Object.values(m).sort((x,y)=>y.seconds-x.seconds).slice(0,15),max=top[0]?.seconds||1;document.getElementById('ranking').innerHTML=top.length?top.map((x,i)=>'<div style="display:grid;grid-template-columns:28px minmax(120px,1fr) 100px;gap:12px;align-items:center;margin:12px 0"><span class="muted">'+(i+1)+'</span><div><b>'+x.name+'</b><div class="muted">'+x.singer+' · '+x.plays+' 次</div><div class="bar"><i style="width:'+x.seconds/max*100+'%"></i></div></div><b>'+fmt(x.seconds)+'</b></div>').join(''):'<div class="muted">所选时间范围暂无记录</div>';document.getElementById('history').innerHTML=a.length?a.map(s=>'<tr><td>'+s.name+'</td><td>'+s.singer+'</td><td>'+fmt(s.seconds)+'</td><td>'+date(s.endedAt)+'</td></tr>').join(''):'<tr><td colspan="4" class="muted">暂无听歌明细</td></tr>'}document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{range=b.dataset.r;document.querySelectorAll('[data-r]').forEach(x=>x.classList.toggle('active',x===b));render()});document.getElementById('generated').textContent='报告生成于 '+date(D.generatedAt);render();</script></html>`
  await api.app.writeSaveDialogFile(dir, 'anylisten-music-dashboard.html', html)
  await api.app.showMessage('图形化统计面板已导出为 HTML 文件。请在保存位置双击打开，使用浏览器离线查看。')
}
const reset = async () => {
  const answer = await api.app.showInputDialog({ title: '清空听歌统计', prompt: '输入 RESET 确认清空本地统计数据' })
  if (answer === 'RESET') { store = emptyStore(); current = null; await save(); await api.app.showMessage('统计数据已清空。') }
}
const apiKeys = () => {
  try { return Object.keys(api).sort() } catch { return ['<无法枚举 API 对象>'] }
}
const diagnostic = (playerApi: any, attempts: number) => [
  'Any Listen Music Stats 运行诊断',
  `插件版本：${PLUGIN_VERSION}`,
  `宿主版本：${api?.env?.version ?? '未知'}`,
  `扩展引擎版本：${api?.env?.extensionVersion ?? '未知'}`,
  `player API：${playerApi ? '已取得' : '未取得'}`,
  `API 检测次数：${attempts}`,
  `当前歌曲：${music ? `${music.name} - ${music.singer}` : '未同步'}`,
  `当前播放状态：${playing ? '播放中' : startupPendingPlayback ? '等待播放进度确认' : '未播放/未知'}`,
  `当前片段计时：${current ? `${Math.floor(current.elapsed)} 秒` : '未计时'}`,
  `播放器事件接收次数：${eventCount}`,
  `最近事件：${lastEvent}`,
  `歌曲信息同步次数：${syncCount}`,
  `最近同步时间：${lastSyncAt ? new Date(lastSyncAt).toLocaleString() : '尚未同步'}`,
  `最近同步错误：${lastSyncError || '无'}`,
  `已保存有效记录：${store.sessions.length}`,
  `累计有效时长：${fmt(store.totalSeconds)}`,
  `有效播放次数：${store.validPlays}`,
  `API 顶层属性：${apiKeys().join(', ')}`,
  `player 属性类型：${typeof api?.player}`,
].join('\n')

const register = async () => {
  await api.command.registerCommand('music-stats', async () => api.app.showMessage(summary(), { type: 'info', textSelect: true }))
  await api.command.registerCommand('music-stats-diagnose', async () => api.app.showMessage(diagnostic(api?.player, 0), { type: 'info', textSelect: true }))
  await api.command.registerCommand('music-stats-dashboard', exportDashboard)
  await api.command.registerCommand('music-stats-export-json', exportJson)
  await api.command.registerCommand('music-stats-import-json', () => importJson('replace'))
  await api.command.registerCommand('music-stats-merge-json', () => importJson('merge'))
  await api.command.registerCommand('music-stats-export-csv', exportCsv)
  await api.command.registerCommand('music-stats-reset', reset)
}

const waitForPlayerApi = async () => {
  // Some host builds finish assembling permission-scoped APIs just after the extension entry runs.
  // Retry briefly instead of aborting initialization on the first undefined read.
  for (let attempt = 1; attempt <= 20; attempt++) {
    try {
      const playerApi = api?.player
      if (playerApi && typeof playerApi.onPlayerEvent === 'function' && typeof playerApi.getPlayInfo === 'function') {
        return { playerApi, attempts: attempt }
      }
    } catch (e) {
      api?.logcat?.warn?.('[music-stats] player API probe failed', e)
    }
    await new Promise<void>(resolve => setTimeout(resolve, 250))
  }
  return { playerApi: null, attempts: 20 }
}

const readCurrentMusic = async (playerApi: any, expectedToken?: number) => {
  try {
    const info = await playerApi.getPlayInfo()
    if (expectedToken !== undefined && expectedToken !== syncToken) return null
    // Any Listen PlayInfo shape: info.info.index is the active list index.
    const index = Number(info?.info?.index)
    const item = Number.isInteger(index) && index >= 0 ? info?.list?.[index] : null
    const d = item?.musicInfo
    syncCount++
    lastSyncAt = Date.now()
    if (!d || !(d.name || d.id || d.singer)) {
      lastSyncError = `未找到歌曲信息（index=${String(info?.info?.index)}，list=${Array.isArray(info?.list) ? info.list.length : '非数组'}）`
      return null
    }
    lastSyncError = ''
    return {
      id: String(d.id || ''),
      name: String(d.name || '未知歌曲'),
      singer: String(d.singer || '未知歌手'),
      album: String(d.album || ''),
    }
  } catch (e) {
    lastSyncError = String(e)
    api?.logcat?.warn?.('[music-stats] getPlayInfo sync failed', e)
    return null
  }
}

const syncAfterMusicChanged = async (playerApi: any) => {
  const token = ++syncToken
  // Let the host finish updating its active list/index before querying it.
  await new Promise<void>(resolve => setTimeout(resolve, 80))
  const next = await readCurrentMusic(playerApi, token)
  if (token !== syncToken || !next) return
  const changed = !music || makeKey(next) !== makeKey(music)
  music = next
  if (playing && changed) startTrack()
}

void (async () => {
  await load()
  await syncDashboardConfig()
  api.configuration.onConfigChanged((keys: string[], configuration: Record<string, unknown>) => {
    if (!keys.includes('dashboardData') || typeof configuration.dashboardData !== 'string') return
    try { const incoming = normalizeImportedStore(JSON.parse(configuration.dashboardData)); store = incoming; saveChain = saveChain.then(() => api.storage.writeFile(FILE, JSON.stringify(store))).catch((e: unknown) => api.logcat.error('[music-stats] imported dashboard data save failed', e)) }
    catch (e) { api.logcat.warn('[music-stats] ignored invalid dashboard data update', e) }
  })
  await register()
  const { playerApi, attempts } = await waitForPlayerApi()
  if (!playerApi) {
    const message = diagnostic(null, attempts)
    api?.logcat?.error?.('[music-stats] player API unavailable', message)
    await api.app.showMessage(message, { type: 'error', textSelect: true })
    return
  }

  // Register events before the initial snapshot to avoid missing a song change during startup.
  playerApi.onPlayerEvent((event: any) => {
    eventCount++
    lastEvent = String(event?.action || 'unknown')
    if (event.action === 'musicInfoUpdated') {
      const d = event.data || {}
      if (d.name || d.id || d.singer) {
        const next = {
          id: d.id || music?.id || '',
          name: d.name || music?.name || '未知歌曲',
          singer: d.singer || music?.singer || '未知歌手',
          album: d.album || music?.album || '',
        }
        const changed = !music || makeKey(next) !== makeKey(music)
        music = next
        if (changed && playing) startTrack()
      }
    } else if (event.action === 'musicChanged') {
      tick()
      flushCurrent()
      music = null
      void syncAfterMusicChanged(playerApi)
    } else if (event.action === 'status') {
      const status = event.data?.[0]
      const nextPlaying = status === 'playing'
      startupPendingPlayback = false
      if (playing && !nextPlaying) {
        tick()
        playing = false
        flushCurrent()
      } else if (!playing && nextPlaying) {
        playing = true
        if (music) startTrack()
        else void syncAfterMusicChanged(playerApi)
      }
    } else if (event.action === 'progress') {
      // Progress events are emitted during active playback. They let us detect
      // a track that was already playing before this extension subscribed.
      if (!playing && startupPendingPlayback && music) {
        playing = true
        startupPendingPlayback = false
        startTrack()
      }
      tick()
    }
  })

  const initialMusic = await readCurrentMusic(playerApi)
  if (initialMusic) music = initialMusic
  // PlayInfo does not expose a reliable current status. Wait for either a
  // status event or the first progress event; do not count paused time.
  startupPendingPlayback = Boolean(music)
  api?.logcat?.info?.('[music-stats] initialized', {
    pluginVersion: PLUGIN_VERSION,
    hostVersion: api?.env?.version,
    extensionVersion: api?.env?.extensionVersion,
    playerApiReady: true,
    attempts,
    currentMusic: music,
    startupPendingPlayback,
  })
  setInterval(() => {
    if (playing) tick()
  }, 1000)
})().catch((e: unknown) => {
  try { api?.logcat?.error?.('[music-stats] init failed', e) } catch {}
  try { void api?.app?.showMessage(`听歌统计初始化失败：${String(e)}`, { type: 'error', textSelect: true }) } catch {}
})
