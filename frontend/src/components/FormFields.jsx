import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function Field({ label, placeholder, type = 'text', value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </label>
  )
}

export function SelectField({ label, value, onChange, options = [], placeholder = true }) {
  const placeholderText = typeof placeholder === 'string' ? placeholder : 'Selecionar...'
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(opt) {
    onChange?.(opt)
    setOpen(false)
  }

  return (
    <div className="field" ref={ref}>
      <span>{label}</span>
      <button
        type="button"
        className={`prodDropdownTrigger${open ? ' open' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={value ? 'prodDropdownValue' : 'prodDropdownPlaceholder'}>
          {value || placeholderText}
        </span>
        <ChevronDown size={15} className={`prodDropdownChevron${open ? ' rotated' : ''}`} />
      </button>

      {open && (
        <div className="prodDropdownMenu">
          <ul className="prodDropdownList" style={{ padding: '6px' }}>
            {options.map((opt) => (
              <li
                key={opt}
                className={`prodDropdownItem${opt === value ? ' selected' : ''}`}
                onClick={() => select(opt)}
              >
                {opt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
