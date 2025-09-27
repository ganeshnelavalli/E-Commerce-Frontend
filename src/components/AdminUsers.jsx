import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminUsers(){
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', password: '' })
  const API = '/api/admin/users/'

  axios.defaults.withCredentials = true

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try{
      const res = await axios.get(API)
      setUsers(res.data.users || [])
    }catch(e){
      setError('Failed to load users (admin only)')
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ fetchUsers() }, [])

  const addUser = async () => {
    setError('')
    try{
      await axios.post(API, form)
      setForm({ username: '', email: '', first_name: '', last_name: '', password: '' })
      fetchUsers()
    }catch(e){ setError(e.response?.data?.error || 'Failed to create user') }
  }

  const deleteUser = async (id) => {
    setError('')
    try{
      await axios.delete(`/api/admin/users/${id}/`)
      fetchUsers()
    }catch(e){ setError(e.response?.data?.error || 'Delete failed') }
  }

  const updateUser = async (u, changes) => {
    try{
      await axios.patch(`/api/admin/users/${u.id}/`, changes)
      fetchUsers()
    }catch(e){ setError(e.response?.data?.error || 'Update failed') }
  }

  if(loading) return <div>Loading users…</div>
  if(error) return <div className="alert alert-danger">{error}</div>

  return (
    <div id="users">
      <h3>Users</h3>
      <div className="card p-3 mb-3">
        <div className="row g-2">
          <div className="col"><input className="form-control" placeholder="Username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} /></div>
          <div className="col"><input className="form-control" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} /></div>
          <div className="col"><input className="form-control" placeholder="First name" value={form.first_name} onChange={e=>setForm({...form, first_name:e.target.value})} /></div>
          <div className="col"><input className="form-control" placeholder="Last name" value={form.last_name} onChange={e=>setForm({...form, last_name:e.target.value})} /></div>
          <div className="col"><input type="password" className="form-control" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} /></div>
          <div className="col-auto"><button className="btn btn-primary" onClick={addUser}>Add</button></div>
        </div>
      </div>
      <ul className="list-group">
        {users.map(u=> (
          <li className="list-group-item" key={u.id}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{u.username}</strong> <span className="text-muted">{u.email}</span>
                {u.is_staff && <span className="badge bg-warning text-dark ms-2">admin</span>}
              </div>
              <div className="btn-group">
                <button className="btn btn-sm btn-outline-secondary" onClick={()=>updateUser(u, { is_staff: !u.is_staff })}>{u.is_staff? 'Demote' : 'Promote'}</button>
                <button className="btn btn-sm btn-outline-danger" onClick={()=>deleteUser(u.id)}>Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
