import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Profile(){
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ username:'', email:'', first_name:'', last_name:'' })
  const [pw, setPw] = useState({ old_password:'', new_password:'' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const load = async () => {
    try{
      const res = await axios.get('/api/me/')
      if(res.data.success){
        setUser(res.data.user)
        setForm({
          username: res.data.user.username || '',
          email: res.data.user.email || '',
          first_name: res.data.user.first_name || '',
          last_name: res.data.user.last_name || ''
        })
      }
    }catch(e){ setErr('Please login to view your profile.') }
  }

  useEffect(()=>{ load() }, [])

  const save = async () => {
    setMsg(''); setErr('')
    try{ await axios.patch('/api/me/', form); setMsg('Profile updated.') }catch(e){ setErr('Update failed') }
  }

  const changePassword = async () => {
    setMsg(''); setErr('')
    try{ await axios.post('/api/change-password/', pw); setMsg('Password changed. Login again if required.') }catch(e){ setErr(e.response?.data?.error || 'Password change failed') }
  }

  if(!user) return <div>{err || 'Loading profile…'}</div>

  return (
    <div className="container">
      <h2 className="my-3">Profile</h2>
      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}
      
      <div className="row">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card p-3 mb-3">
            <h5 className="mb-3">Personal Information</h5>
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <input className="form-control" placeholder="Username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
              </div>
              <div className="col-12 col-md-6">
                <input className="form-control" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
              </div>
              <div className="col-12 col-md-6">
                <input className="form-control" placeholder="First Name" value={form.first_name} onChange={e=>setForm({...form, first_name:e.target.value})} />
              </div>
              <div className="col-12 col-md-6">
                <input className="form-control" placeholder="Last Name" value={form.last_name} onChange={e=>setForm({...form, last_name:e.target.value})} />
              </div>
              <div className="col-12">
                <button className="btn btn-primary w-100" onClick={save}>Save Changes</button>
              </div>
            </div>
          </div>
          
          <div className="card p-3">
            <h5 className="mb-3">Change Password</h5>
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <input type="password" className="form-control" placeholder="Old password" value={pw.old_password} onChange={e=>setPw({...pw, old_password:e.target.value})} />
              </div>
              <div className="col-12 col-md-6">
                <input type="password" className="form-control" placeholder="New password" value={pw.new_password} onChange={e=>setPw({...pw, new_password:e.target.value})} />
              </div>
              <div className="col-12">
                <button className="btn btn-warning w-100" onClick={changePassword}>Change Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
