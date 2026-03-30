import React, { useState, useEffect, useRef } from 'react';
import { getUsers, selectUser, registerUser } from '../api.js';

export default function UserPicker({ currentUser, onUserChange, defaultOpen = false }) {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(defaultOpen);
  const [mode, setMode] = useState('pick'); // 'pick' | 'create'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const ref = useRef();

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setMode('pick');
        setError('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSelect(userId) {
    try {
      const result = await selectUser(userId);
      setUsers(u => u); // keep list
      onUserChange(result);
      setOpen(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      const result = await registerUser(form.username, form.email, form.password);
      setUsers(u => [...u, { _id: result.user.id, username: result.user.username, email: result.user.email }]);
      onUserChange(result);
      setOpen(false);
      setMode('pick');
      setForm({ username: '', email: '', password: '' });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div ref={ref} style={css.wrap}>
      <button style={css.trigger} onClick={() => { setOpen(o => !o); setMode('pick'); setError(''); }}>
        {currentUser?.username || 'Select user'} ▾
      </button>

      {open && (
        <div style={css.dropdown}>
          {mode === 'pick' && (
            <>
              {users.map(u => (
                <button
                  key={u._id}
                  style={{ ...css.item, ...(u._id === currentUser?.id ? css.itemActive : {}) }}
                  onClick={() => handleSelect(u._id)}
                >
                  <span style={css.uname}>{u.username}</span>
                  <span style={css.email}>{u.email}</span>
                </button>
              ))}
              <div style={css.divider} />
              <button style={{ ...css.item, ...css.createBtn }} onClick={() => { setMode('create'); setError(''); }}>
                ➕ New user
              </button>
            </>
          )}

          {mode === 'create' && (
            <form style={css.form} onSubmit={handleCreate}>
              <input style={css.input} placeholder="Username" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
              <input style={css.input} placeholder="Email" type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              <input style={css.input} placeholder="Password" type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              {error && <span style={css.err}>{error}</span>}
              <div style={css.formBtns}>
                <button type="button" style={css.cancelBtn} onClick={() => { setMode('pick'); setError(''); }}>Cancel</button>
                <button type="submit" style={css.submitBtn}>Create</button>
              </div>
            </form>
          )}

          {mode === 'pick' && error && <span style={css.err}>{error}</span>}
        </div>
      )}
    </div>
  );
}

const css = {
  wrap: { position: 'relative' },
  trigger: {
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
    color: '#e2e8f0', borderRadius: '6px', padding: '4px 10px',
    cursor: 'pointer', fontSize: '13px', fontFamily: "'Inter','Segoe UI',sans-serif",
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
    background: '#1e293b', border: '1px solid #334155',
    borderRadius: '8px', minWidth: '220px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    zIndex: 100, overflow: 'hidden',
  },
  item: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    width: '100%', padding: '8px 12px', background: 'none',
    border: 'none', cursor: 'pointer', textAlign: 'left',
    transition: 'background 0.15s',
  },
  itemActive: { background: 'rgba(66,180,230,0.15)' },
  uname: { fontSize: '13px', color: '#e2e8f0', fontFamily: "'Inter','Segoe UI',sans-serif" },
  email: { fontSize: '11px', color: '#64748b', fontFamily: "'Inter','Segoe UI',sans-serif" },
  divider: { height: '1px', background: '#334155', margin: '4px 0' },
  createBtn: { color: '#42B4E6', fontSize: '13px', fontFamily: "'Inter','Segoe UI',sans-serif" },
  form: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' },
  input: {
    background: '#0f172a', border: '1px solid #334155', borderRadius: '5px',
    color: '#e2e8f0', padding: '6px 8px', fontSize: '13px',
    fontFamily: "'Inter','Segoe UI',sans-serif", outline: 'none',
  },
  err: { fontSize: '11px', color: '#f87171', fontFamily: "'Inter','Segoe UI',sans-serif" },
  formBtns: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  cancelBtn: {
    background: 'none', border: '1px solid #334155', borderRadius: '5px',
    color: '#94a3b8', padding: '4px 10px', cursor: 'pointer', fontSize: '12px',
  },
  submitBtn: {
    background: '#42B4E6', border: 'none', borderRadius: '5px',
    color: '#0f172a', padding: '4px 10px', cursor: 'pointer',
    fontSize: '12px', fontWeight: 600,
  },
};
