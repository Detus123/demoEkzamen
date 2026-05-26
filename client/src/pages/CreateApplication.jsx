import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'
import Toast from '../components/Toast'
const HALLS = [
  'Зал',
  'Ресторан',
  'Летняя веранда',
  'Закрытая веранда'
]
export default function CreateApplication() {
  const [hall, setHall] = useState(HALLS[0])
  const [date, setDate] = useState('')
  const [pay, setPay] = useState('cash')
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ message: '', type: '' })
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
      return setError('Дата должна быть в формате ДД.ММ.ГГГГ')
    }
    const [d, m, y] = date.split('.')
    if (!d || !m || !y) return setError('Неверный формат даты')
    const payload = { 
      hall_name: hall, 
      start_date: `${y}-${m}-${d}`, 
      payment_method: pay 
    }
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token
      const res = await fetch('http://localhost:3000/api/applications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setToast({ message: 'Заявка успешно отправлена!', type: 'success' })
        setTimeout(() => navigate('/dashboard'), 1500)
      } else {
        const data = await res.json()
        setError(data.error || 'Ошибка при отправке')
      }
    } catch (err) {
      setError('Ошибка сети')
    }
  }
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div className="card animate-fade">
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Новая заявка</h2>
        <form onSubmit={submit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#475569' }}>
              Выберите зал:
            </label>
            <select 
              value={hall} 
              onChange={e => setHall(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}
            >
              {HALLS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#475569' }}>
              Дата начала банкета:
            </label>
            <input 
              placeholder="ДД.ММ.ГГГГ" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: error ? '1px solid #ef4444' : '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#475569' }}>
              Способ оплаты:
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="radio" 
                  name="payment"
                  checked={pay === 'cash'} 
                  onChange={() => setPay('cash')} 
                  style={{ width: 'auto', margin: 0 }}
                />
                💵 Наличными
              </label>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="radio" 
                  name="payment"
                  checked={pay === 'phone'} 
                  onChange={() => setPay('phone')} 
                  style={{ width: 'auto', margin: 0 }}
                />
                📱По номеру телефона
              </label>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ cursor: 'pointer' }}>
            Отправить
          </button>
          {error && <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '12px', fontSize: '14px' }}>{error}</p>}
        </form>
      </div>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: '' })} 
      />
    </div>
  )
}
