'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, logout } from '../lib/api';

interface Course { id: number; name: string; code: string; description?: string; }
interface Enrollment { id: number; course_id: number; grade?: string; }

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px 24px',
  border: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px',
};

export default function StudentDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'courses' | 'enrollments'>('courses');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'student') { router.push('/'); return; }
    } catch { router.push('/'); return; }
    fetchData();
  }, [router]);

  async function fetchData() {
    setLoading(true);
    try {
      const [c, e] = await Promise.all([
        apiClient('/students/courses'),
        apiClient('/students/enrollments'),
      ]);
      setCourses(c);
      setEnrollments(e);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function enroll(courseId: number) {
    try {
      await apiClient('/students/enroll', { method: 'POST', body: JSON.stringify({ course_id: courseId }) });
      setMsg('✅ Enrolled successfully!');
      fetchData();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Enrollment failed');
    }
  }

  const enrolledIds = new Set(enrollments.map(e => e.course_id));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 40px', background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🎓</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>Student Portal</span>
        </div>
        <button onClick={logout} style={{
          padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,80,80,0.4)',
          background: 'rgba(255,80,80,0.1)', color: '#ff9090', cursor: 'pointer', fontSize: '14px',
        }}>Logout</button>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#fff', fontSize: '30px', fontWeight: 700 }}>Student Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>Browse and enroll in available courses</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Available Courses', value: courses.length, icon: '📚', color: '#6c63ff' },
            { label: 'My Enrollments', value: enrollments.length, icon: '✅', color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{
              ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 0,
            }}>
              <div style={{ fontSize: '36px' }}>{s.icon}</div>
              <div>
                <div style={{ color: s.color, fontSize: '28px', fontWeight: 700 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {(['courses', 'enrollments'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: '9px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: activeTab === t ? 'linear-gradient(135deg, #6c63ff, #3b82f6)' : 'rgba(255,255,255,0.07)',
              color: '#fff', fontWeight: 600, fontSize: '14px', textTransform: 'capitalize',
            }}>{t === 'courses' ? '📚 All Courses' : '✅ My Enrollments'}</button>
          ))}
        </div>

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
        ) : activeTab === 'courses' ? (
          <div>
            {courses.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px' }}>
                No courses available yet.
              </div>
            ) : courses.map(c => (
              <div key={c.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>{c.name}</div>
                  <div style={{ color: '#6c63ff', fontSize: '13px', marginTop: '2px' }}>{c.code}</div>
                  {c.description && <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginTop: '4px' }}>{c.description}</div>}
                </div>
                {enrolledIds.has(c.id) ? (
                  <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 600 }}>✅ Enrolled</span>
                ) : (
                  <button onClick={() => enroll(c.id)} style={{
                    padding: '8px 18px', borderRadius: '8px', border: 'none',
                    background: 'linear-gradient(135deg, #6c63ff, #3b82f6)',
                    color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  }}>Enroll</button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            {enrollments.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px' }}>
                You haven&apos;t enrolled in any courses yet.
              </div>
            ) : enrollments.map(e => {
              const course = courses.find(c => c.id === e.course_id);
              return (
                <div key={e.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{course?.name || `Course #${e.course_id}`}</div>
                    <div style={{ color: '#6c63ff', fontSize: '13px' }}>{course?.code}</div>
                  </div>
                  <div style={{
                    background: e.grade ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)',
                    border: `1px solid ${e.grade ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    color: e.grade ? '#6ee7b7' : 'rgba(255,255,255,0.4)',
                    padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                  }}>{e.grade ? `Grade: ${e.grade}` : 'Pending'}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
