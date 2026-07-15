'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, logout } from '../lib/api';

interface Course { id: number; name: string; code: string; description?: string; }

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px 24px',
  border: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

export default function FacultyDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'faculty') { router.push('/'); return; }
    } catch { router.push('/'); return; }
    fetchCourses();
  }, [router]);

  async function fetchCourses() {
    setLoading(true);
    try {
      const data = await apiClient('/faculty/courses');
      setCourses(data);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient('/faculty/courses', { method: 'POST', body: JSON.stringify(form) });
      setMsg('✅ Course created!');
      setForm({ name: '', code: '', description: '' });
      setShowForm(false);
      fetchCourses();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteCourse(id: number) {
    if (!confirm('Delete this course?')) return;
    try {
      await apiClient(`/faculty/courses/${id}`, { method: 'DELETE' });
      setMsg('✅ Course deleted!');
      fetchCourses();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 40px', background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>👨‍🏫</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>Faculty Portal</span>
        </div>
        <button onClick={logout} style={{
          padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,80,80,0.4)',
          background: 'rgba(255,80,80,0.1)', color: '#ff9090', cursor: 'pointer', fontSize: '14px',
        }}>Logout</button>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '30px', fontWeight: 700 }}>My Courses</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>Manage courses you teach</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '10px 24px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}>
            {showForm ? '✕ Cancel' : '+ New Course'}
          </button>
        </div>

        {/* Stat */}
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <span style={{ fontSize: '36px' }}>📖</span>
          <div>
            <div style={{ color: '#10b981', fontSize: '28px', fontWeight: 700 }}>{courses.length}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Courses Assigned</div>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <form onSubmit={createCourse} style={{ ...cardStyle, marginBottom: '24px', border: '1px solid rgba(108,99,255,0.3)' }}>
            <h3 style={{ color: '#fff', marginBottom: '16px' }}>Create New Course</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Course Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Data Structures" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Course Code *</label>
                <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. CS201" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Short course description" style={inputStyle} />
            </div>
            <button type="submit" disabled={submitting} style={{
              padding: '10px 24px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #6c63ff, #3b82f6)',
              color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>{submitting ? 'Creating...' : 'Create Course'}</button>
          </form>
        )}

        {msg && (
          <div style={{
            background: msg.startsWith('✅') ? 'rgba(16,185,129,0.15)' : 'rgba(255,80,80,0.15)',
            border: `1px solid ${msg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(255,80,80,0.3)'}`,
            color: msg.startsWith('✅') ? '#6ee7b7' : '#ff9090',
            padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
          }}>{msg}</div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '60px' }}>Loading...</div>
        ) : courses.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px' }}>
            No courses yet. Create your first course!
          </div>
        ) : courses.map(c => (
          <div key={c.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>{c.name}</div>
              <div style={{ color: '#6c63ff', fontSize: '13px', marginTop: '2px' }}>{c.code}</div>
              {c.description && <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginTop: '4px' }}>{c.description}</div>}
            </div>
            <button onClick={() => deleteCourse(c.id)} style={{
              padding: '7px 16px', borderRadius: '8px', border: '1px solid rgba(255,80,80,0.3)',
              background: 'rgba(255,80,80,0.1)', color: '#ff9090', cursor: 'pointer', fontSize: '13px',
            }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
