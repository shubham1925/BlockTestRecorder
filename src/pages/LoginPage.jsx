import { useState } from 'react'
import styles from './LoginPage.module.css'

const APP_PASSWORD = 'hxcb@123'

export default function LoginPage({ onLogin }) {
  const [step, setStep] = useState('id') // 'id' or 'password'
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleIdSubmit = (e) => {
    e.preventDefault()
    const trimmed = employeeId.trim()
    if (!trimmed) {
      setError('Please enter your employee ID')
      return
    }
    setError('')
    setStep('password')
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (password !== APP_PASSWORD) {
      setError('Incorrect password')
      return
    }
    setError('')
    onLogin({ id: employeeId.trim() })
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.hexIcon}>⬡</div>
          <h1 className={styles.company}>Hexacarb Engineers</h1>
        </div>

        <p className={styles.appName}>Block Testing Recorder</p>

        {step === 'id' ? (
          <form onSubmit={handleIdSubmit} className={styles.form}>
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
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className={styles.form}>
            <p className={styles.welcomeBack}>Employee: {employeeId}</p>
            <label htmlFor="pwd" className={styles.label}>
              Password
            </label>
            <input
              id="pwd"
              type="password"
              className={styles.input}
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              autoFocus
              autoComplete="off"
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.button}>
              Enter
            </button>
            <button
              type="button"
              className={styles.backLink}
              onClick={() => { setStep('id'); setPassword(''); setError('') }}
            >
              ← Change ID
            </button>
          </form>
        )}
      </div>

      <p className={styles.footer}>Internal use only</p>
    </div>
  )
}
