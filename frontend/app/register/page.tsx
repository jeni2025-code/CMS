'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../lib/api';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)',
  color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '6px', display: 'block',
};

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Registration failed');
      }
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
        borderRadius: '24px', padding: '48px 40px', width: '100%', maxWidth: '420px',
        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>📋</div>
          <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: 700, margin: 0 }}>Create Account</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: '8px', fontSize: '14px' }}>
            Join the College Management System
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@college.edu" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={{
              ...inputStyle, cursor: 'pointer',
            }}>
              <option value="student" style={{ background: '#302b63' }}>🎓 Student</option>
              <option value="faculty" style={{ background: '#302b63' }}>👨‍🏫 Faculty</option>
              <option value="admin" style={{ background: '#302b63' }}>🛠️ Admin</option>
            </select>
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)',
              color: '#ff9090', padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
            }}>⚠️ {error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: '4px', padding: '13px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
            fontSize: '16px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '28px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
          Already have an account?{' '}
          <a href="/" style={{ color: '#6c63ff', fontWeight: 600 }}>Sign In</a>
        </p>
      </div>
    </div>
  );
}
