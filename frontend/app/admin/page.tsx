'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, logout } from '../lib/api';

interface User { id: number; email: string; role: string; is_active: boolean; is_superuser: boolean; }
interface Course { id: number; name: string; code: string; description?: string; }
interface Enrollment { id: number; student_id: number; course_id: number; grade?: string; }

type Tab = 'users' | 'courses' | 'enrollments';

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px 24px',
  border: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};
const roleBadge = (role: string) => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
  background: role === 'admin' ? 'rgba(245,158,11,0.2)' : role === 'faculty' ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)',
  color: role === 'admin' ? '#fbbf24' : role === 'faculty' ? '#60a5fa' : '#6ee7b7',
  border: `1px solid ${role === 'admin' ? 'rgba(245,158,11,0.3)' : role === 'faculty' ? 'rgba(59,130,246,0.3)' : 'rgba(16,185,129,0.3)'}`,
});

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [userForm, setUserForm] = useState({ email: '', password: '', role: 'student' });
  const [courseForm, setCourseForm] = useState({ name: '', code: '', description: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') { router.push('/'); return; }
    } catch { router.push('/'); return; }
    fetchAll();
  }, [router]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [u, c, e] = await Promise.all([
        apiClient('/admin/users'),
        apiClient('/admin/courses'),
        apiClient('/admin/enrollments'),
      ]);
      setUsers(u); setCourses(c); setEnrollments(e);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Failed to load');
    } finally { setLoading(false); }
  }

  async function deleteUser(id: number) {
    if (!confirm('Delete this user?')) return;
    try { await apiClient(`/admin/users/${id}`, { method: 'DELETE' }); setMsg('✅ User deleted'); fetchAll(); }
    catch (err: unknown) { setMsg(err instanceof Error ? err.message : 'Failed'); }
  }

  async function deleteCourse(id: number) {
    if (!confirm('Delete this course?')) return;
    try { await apiClient(`/admin/courses/${id}`, { method: 'DELETE' }); setMsg('✅ Course deleted'); fetchAll(); }
    catch (err: unknown) { setMsg(err instanceof Error ? err.message : 'Failed'); }
  }

  async function deleteEnrollment(id: number) {
    if (!confirm('Remove this enrollment?')) return;
    try { await apiClient(`/admin/enrollments/${id}`, { method: 'DELETE' }); setMsg('✅ Enrollment removed'); fetchAll(); }
    catch (err: unknown) { setMsg(err instanceof Error ? err.message : 'Failed'); }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    try { await apiClient('/admin/users', { method: 'POST', body: JSON.stringify(userForm) }); setMsg('✅ User created'); setShowForm(false); fetchAll(); }
    catch (err: unknown) { setMsg(err instanceof Error ? err.message : 'Failed'); }
  }

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    try { await apiClient('/admin/courses', { method: 'POST', body: JSON.stringify(courseForm) }); setMsg('✅ Course created'); setShowForm(false); fetchAll(); }
    catch (err: unknown) { setMsg(err instanceof Error ? err.message : 'Failed'); }
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'courses', label: 'Courses', icon: '📚' },
    { key: 'enrollments', label: 'Enrollments', icon: '📋' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 40px', background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🛠️</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>Admin Panel</span>
        </div>
        <button onClick={logout} style={{
          padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,80,80,0.4)',
          background: 'rgba(255,80,80,0.1)', color: '#ff9090', cursor: 'pointer', fontSize: '14px',
        }}>Logout</button>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Users', value: users.length, icon: '👥', color: '#6c63ff' },
            { label: 'Total Courses', value: courses.length, icon: '📚', color: '#3b82f6' },
            { label: 'Enrollments', value: enrollments.length, icon: '📋', color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 0 }}>
              <div style={{ fontSize: '32px' }}>{s.icon}</div>
              <div>
                <div style={{ color: s.color, fontSize: '26px', fontWeight: 700 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setShowForm(false); setMsg(''); }} style={{
              padding: '9px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: tab === t.key ? 'linear-gradient(135deg, #6c63ff, #3b82f6)' : 'rgba(255,255,255,0.07)',
              color: '#fff', fontWeight: 600, fontSize: '14px',
            }}>{t.icon} {t.label}</button>
          ))}
        </div>

        {/* Action bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 600 }}>
            {tab === 'users' ? '👥 All Users' : tab === 'courses' ? '📚 All Courses' : '📋 All Enrollments'}
          </h2>
          {tab !== 'enrollments' && (
            <button onClick={() => setShowForm(!showForm)} style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>{showForm ? '✕ Cancel' : `+ Add ${tab === 'users' ? 'User' : 'Course'}`}</button>
          )}
        </div>

        {msg && (
          <div style={{
            background: msg.startsWith('✅') ? 'rgba(16,185,129,0.15)' : 'rgba(255,80,80,0.15)',
            border: `1px solid ${msg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(255,80,80,0.3)'}`,
            color: msg.startsWith('✅') ? '#6ee7b7' : '#ff9090',
            padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
          }}>{msg}</div>
        )}

        {/* Create Forms */}
        {showForm && tab === 'users' && (
          <form onSubmit={createUser} style={{ ...cardStyle, border: '1px solid rgba(108,99,255,0.3)', marginBottom: '20px' }}>
            <h3 style={{ color: '#fff', marginBottom: '16px' }}>Create New User</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Email *</label>
                <input required type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="user@example.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Password *</label>
                <input required type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder="••••••••" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Role</label>
                <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="student" style={{ background: '#302b63' }}>Student</option>
                  <option value="faculty" style={{ background: '#302b63' }}>Faculty</option>
                  <option value="admin" style={{ background: '#302b63' }}>Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" style={{
              padding: '9px 22px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #6c63ff, #3b82f6)',
              color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>Create User</button>
          </form>
        )}

        {showForm && tab === 'courses' && (
          <form onSubmit={createCourse} style={{ ...cardStyle, border: '1px solid rgba(108,99,255,0.3)', marginBottom: '20px' }}>
            <h3 style={{ color: '#fff', marginBottom: '16px' }}>Create New Course</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Name *</label>
                <input required value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} placeholder="Data Structures" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Code *</label>
                <input required value={courseForm.code} onChange={e => setCourseForm({ ...courseForm, code: e.target.value })} placeholder="CS201" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Description</label>
                <input value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Short description" style={inputStyle} />
              </div>
            </div>
            <button type="submit" style={{
              padding: '9px 22px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #6c63ff, #3b82f6)',
              color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>Create Course</button>
          </form>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '60px' }}>Loading...</div>
        ) : (
          <>
            {tab === 'users' && (
              users.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px' }}>No users found.</div>
              ) : users.map(u => (
                <div key={u.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '18px',
                      background: u.role === 'admin' ? 'rgba(245,158,11,0.2)' : u.role === 'faculty' ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)',
                    }}>
                      {u.role === 'admin' ? '🛠️' : u.role === 'faculty' ? '👨‍🏫' : '🎓'}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>{u.email}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <span style={roleBadge(u.role)}>{u.role}</span>
                        {!u.is_active && <span style={{ ...roleBadge(''), color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}>Inactive</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteUser(u.id)} style={{
                    padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(255,80,80,0.3)',
                    background: 'rgba(255,80,80,0.1)', color: '#ff9090', cursor: 'pointer', fontSize: '13px',
                  }}>Delete</button>
                </div>
              ))
            )}

            {tab === 'courses' && (
              courses.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px' }}>No courses found.</div>
              ) : courses.map(c => (
                <div key={c.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>{c.name}</div>
                    <div style={{ color: '#6c63ff', fontSize: '13px', marginTop: '2px' }}>{c.code}</div>
                    {c.description && <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginTop: '4px' }}>{c.description}</div>}
                  </div>
                  <button onClick={() => deleteCourse(c.id)} style={{
                    padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(255,80,80,0.3)',
                    background: 'rgba(255,80,80,0.1)', color: '#ff9090', cursor: 'pointer', fontSize: '13px',
                  }}>Delete</button>
                </div>
              ))
            )}

            {tab === 'enrollments' && (
              enrollments.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px' }}>No enrollments found.</div>
              ) : enrollments.map(e => {
                const course = courses.find(c => c.id === e.course_id);
                const user = users.find(u => u.id === e.student_id);
                return (
                  <div key={e.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>
                        {user?.email || `User #${e.student_id}`}
                      </div>
                      <div style={{ color: '#6c63ff', fontSize: '13px', marginTop: '2px' }}>
                        {course ? `${course.name} (${course.code})` : `Course #${e.course_id}`}
                      </div>
                      {e.grade && <div style={{ color: '#6ee7b7', fontSize: '13px', marginTop: '2px' }}>Grade: {e.grade}</div>}
                    </div>
                    <button onClick={() => deleteEnrollment(e.id)} style={{
                      padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(255,80,80,0.3)',
                      background: 'rgba(255,80,80,0.1)', color: '#ff9090', cursor: 'pointer', fontSize: '13px',
                    }}>Remove</button>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
