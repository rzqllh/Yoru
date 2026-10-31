import {useMemo,useState} from 'react'
import {exportUserData,importUserData} from '../lib/db'
import {createDeviceSyncClient,syncConfig,type DeviceSyncSession} from '../lib/device-sync'

export default function DeviceSync({onNotify,onDataChanged}:{
 onNotify:(message:string)=>void;onDataChanged:()=>void
}){
 const client=useMemo(()=>{
  const config=syncConfig(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
  return config?createDeviceSyncClient(config):null
 },[])
 const [email,setEmail]=useState('')
 const [code,setCode]=useState('')
 const [sent,setSent]=useState(false)
 const [session,setSession]=useState<DeviceSyncSession|null>(null)
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState('')
 async function run(action:()=>Promise<void>){
  if(busy)return
  setBusy(true);setMessage('')
  try{await action()}catch(error){
   setMessage(error instanceof Error?error.message:'Permintaan gagal')
  }finally{setBusy(false)}
 }
 if(!client)return <div className="settings-note"><p>
  Sinkronisasi antar-device belum diaktifkan pada build ini. Data tetap di browser;
  gunakan Ekspor/Impor sampai layanan akun dikonfigurasi.
 </p></div>
 if(!session)return <div className="settings-box">
  <p>Sinkronisasi cloud bersifat opsional dan manual. Gunakan email yang sama di perangkat lain.
   Sesi login hanya berlaku di tab ini dan tidak disimpan permanen.</p>
  <div className="setting-row"><label htmlFor="sync-email">Email akun</label>
   <input id="sync-email" type="email" autoComplete="email" value={email}
    onChange={e=>{setEmail(e.target.value);setSent(false)}} disabled={busy} placeholder="nama@email.com"/>
   <button type="button" className="btn btn-outline" disabled={busy} onClick={()=>void run(async()=>{
    await client.sendCode(email.trim());setSent(true);setMessage('Kode login dikirim; periksa email.')
   })}>Kirim kode</button>
  </div>
  {sent&&<div className="setting-row"><label htmlFor="sync-code">Kode verifikasi</label>
   <input id="sync-code" value={code} inputMode="numeric" autoComplete="one-time-code" maxLength={10}
    onChange={e=>setCode(e.target.value)} disabled={busy} placeholder="Kode email"/>
   <button type="button" className="btn btn-primary" disabled={busy} onClick={()=>void run(async()=>{
    const next=await client.verifyCode(email.trim(),code.trim())
    setSession(next);setCode('');setMessage('Akun berhasil diverifikasi.')
   })}>Masuk</button>
  </div>}
  {message&&<p role="status" className="settings-note">{message}</p>}
 </div>
 return <div className="settings-box">
  <p role="status">Masuk sebagai {session.email}. Cadangan cloud hanya dapat diakses akun ini jika kebijakan RLS dikonfigurasi benar.</p>
  <p>Sinkronisasi masih manual. Unggah menggantikan snapshot cloud setelah konfirmasi;
   Unduh menggabungkan data cloud ke browser ini dan dapat menimpa entri dengan ID sama.
   Hapus lokal di perangkat lain tidak otomatis menghapus cadangan di sini.</p>
  <div className="setting-row">
   <div><strong>Unggah cadangan lokal</strong><small>Kirim koleksi, progres, dan preferensi terpilih ke cloud.</small></div>
   <button type="button" className="btn btn-outline" disabled={busy} onClick={()=>void run(async()=>{
    const remote=await client.read(session)
    if(remote&&!window.confirm('Ganti cadangan cloud yang sudah ada dengan data perangkat ini?'))return
    const next=await client.upload(session,await exportUserData(),remote?.revision??0)
    setMessage(`Cadangan cloud tersimpan (revisi ${next}).`)
   })}>Unggah</button>
  </div>
  <div className="setting-row">
   <div><strong>Unduh cadangan cloud</strong><small>Data lokal tidak dihapus; entri dengan ID sama dapat tertimpa.</small></div>
   <button type="button" className="btn btn-outline" disabled={busy} onClick={()=>void run(async()=>{
    const remote=await client.read(session)
    if(!remote){setMessage('Belum ada cadangan di akun cloud ini.');return}
    if(!window.confirm('Gabungkan cadangan cloud ke browser ini? Entri yang sama dapat ditimpa.'))return
    await importUserData(remote.payload);onDataChanged();setMessage('Cadangan cloud dipulihkan di browser ini.')
   })}>Unduh</button>
  </div>
  <div className="setting-row">
   <div><strong>Hapus cadangan cloud</strong><small>Tidak menghapus data browser saat ini.</small></div>
   <button type="button" className="btn btn-outline" disabled={busy} onClick={()=>void run(async()=>{
    if(!window.confirm('Hapus permanen cadangan cloud akun ini?'))return
    await client.remove(session);setMessage('Cadangan cloud dihapus.')
   })}>Hapus cloud</button>
  </div>
  <button type="button" className="btn btn-outline" disabled={busy} onClick={()=>{setSession(null);setCode('');onNotify('Sesi sync ditutup pada tab ini')}}>Keluar dari sync</button>
  {message&&<p role="status" className="settings-note">{message}</p>}
 </div>
}
