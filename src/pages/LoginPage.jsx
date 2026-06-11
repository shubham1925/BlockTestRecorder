import { useState } from 'react'
import styles from './LoginPage.module.css'

export default function LoginPage({ onLogin }) {
  const [employeeId, setEmployeeId] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = employeeId.trim()
    if (!trimmed) {
      setError('Please enter your employee ID')
      return
    }
    setError('')
    onLogin({ id: trimmed })
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.hexIcon}>⬡</div>
          <h1 className={styles.company}>Hexacarb Engineers</h1>
        </div>

        <p className={styles.appName}>Block Testing Recorder</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="empId" className={styles.label}>
            Employee ID
          </label>
          <input
            id="empId"
            type="text"
            className={styles.input}
            placeholder="Enter your ID"
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value)
              if (error) setError('')
            }}
            autoFocus
            autoComplete="off"
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button}>
            Enter
          </button>
        </form>
      </div>

      <p className={styles.footer}>Internal use only</p>
    </div>
  )
}
