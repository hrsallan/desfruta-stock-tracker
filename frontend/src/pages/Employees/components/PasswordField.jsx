import { useState } from 'react'
import { EyeIcon } from '../../../components/EyeIcon'

export function PasswordField({ label, placeholder, value, onChange }) {
  const [show, setShow] = useState(false)
  return (
    <label className="field">
      <span>{label}</span>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          style={{ paddingRight: 44 }}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            color: '#94a3b8', display: 'flex', alignItems: 'center',
          }}
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </label>
  )
}
