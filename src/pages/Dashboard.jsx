import { useState, useEffect } from 'react'
import styles from './Dashboard.module.css'

const BLOCK_MODELS = [
  'GIT-1.5', 'HCL-T160', 'GRF-2', 'HCL-2008 V2 BAYER', 'GIT-2',
  'CSS-2', 'GIL-2', 'GIC216 G', 'HCL-2210D', 'HCL-2214D',
  'HCL-2216D', 'HCL-2218A', 'GIT-2.5', 'MP-1', 'HCL-2510'
]

const RESULTS = ['OK', 'IMP', 'Sleeve']

const CUSTOMERS = [
  'ABC Industries', 'XYZ Corp', 'Global Manufacturing',
  'Tech Solutions', 'Industrial Works'
]

function LiveClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true
  })
  const date = now.toLocaleDateString('en-US', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <div className={styles.clock}>
      <span className={styles.time}>{time}</span>
      <span className={styles.date}>{date}</span>
    </div>
  )
}

export default function Dashboard({ employee, onLogout }) {
  const [mode, setMode] = useState('new') // 'new' or 'repair'
  const [entries, setEntries] = useState([])

  // NEW mode fields
  const [blockModel, setBlockModel] = useState('')
  const [blockNumber, setBlockNumber] = useState('')
  const [result, setResult] = useState('')
  const [stage, setStage] = useState('')

  // REPAIR mode fields
  const [customer, setCustomer] = useState('')
  const [repairResult, setRepairResult] = useState('')

  const handleAdd = () => {
    if (mode === 'new') {
      if (!blockModel || !blockNumber || !result || !stage) return
      setEntries(prev => [...prev, {
        id: Date.now(),
        type: 'NEW',
        blockModel,
        blockNumber,
        result,
        stage,
        employee: employee.id,
        timestamp: new Date().toLocaleString()
      }])
      setBlockModel('')
      setBlockNumber('')
      setResult('')
      setStage('')
    } else {
      if (!customer || !repairResult) return
      setEntries(prev => [...prev, {
        id: Date.now(),
        type: 'REPAIR',
        customer,
        result: repairResult,
        employee: employee.id,
        timestamp: new Date().toLocaleString()
      }])
      setCustomer('')
      setRepairResult('')
    }
  }

  const handleBlockNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setBlockNumber(val)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.brand}>HEXACARB ENGINEERS</h1>
        <div className={styles.headerRight}>
          <LiveClock />
          <div className={styles.divider} />
          <button className={styles.logout} onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          {/* Mode toggle */}
          <div className={styles.modeToggle}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={mode === 'new'}
                onChange={() => setMode('new')}
                className={styles.checkbox}
              />
              <span className={styles.checkboxCustom} data-checked={mode === 'new'} />
              <span className={styles.checkboxText}>NEW</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={mode === 'repair'}
                onChange={() => setMode('repair')}
                className={styles.checkbox}
              />
              <span className={styles.checkboxCustom} data-checked={mode === 'repair'} />
              <span className={styles.checkboxText}>REPAIR</span>
            </label>
          </div>

          <div className={styles.separator} />

          {mode === 'new' ? (
            /* NEW mode form */
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Block Model</label>
                <select
                  className={styles.select}
                  value={blockModel}
                  onChange={e => setBlockModel(e.target.value)}
                >
                  <option value="">-- Select Block Model --</option>
                  {BLOCK_MODELS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Block Number</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="6 digits only"
                  value={blockNumber}
                  onChange={handleBlockNumberChange}
                  maxLength={6}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Result</label>
                <select
                  className={styles.select}
                  value={result}
                  onChange={e => setResult(e.target.value)}
                >
                  <option value="">-- Select Result --</option>
                  {RESULTS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Stage</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="stage"
                      value="Rough"
                      checked={stage === 'Rough'}
                      onChange={e => setStage(e.target.value)}
                      className={styles.radio}
                    />
                    Rough
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="stage"
                      value="Final"
                      checked={stage === 'Final'}
                      onChange={e => setStage(e.target.value)}
                      className={styles.radio}
                    />
                    Final
                  </label>
                </div>
              </div>
            </div>
          ) : (
            /* REPAIR mode form */
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Customer Name</label>
                <select
                  className={styles.select}
                  value={customer}
                  onChange={e => setCustomer(e.target.value)}
                >
                  <option value="">-- Select Customer --</option>
                  {CUSTOMERS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Result</label>
                <select
                  className={styles.select}
                  value={repairResult}
                  onChange={e => setRepairResult(e.target.value)}
                >
                  <option value="">-- Select Result --</option>
                  {RESULTS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button className={styles.addButton} onClick={handleAdd}>Add</button>
        </div>

        {/* Entries */}
        {entries.length === 0 ? (
          <p className={styles.noEntries}>No entries logged yet.</p>
        ) : (
          <div className={styles.entriesCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  {mode === 'new' ? (
                    <>
                      <th>Block Model</th>
                      <th>Block #</th>
                      <th>Stage</th>
                    </>
                  ) : (
                    <th>Customer</th>
                  )}
                  <th>Result</th>
                  <th>Employee</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id}>
                    <td>
                      <span className={entry.type === 'NEW' ? styles.badgeNew : styles.badgeRepair}>
                        {entry.type}
                      </span>
                    </td>
                    {entry.type === 'NEW' ? (
                      <>
                        <td>{entry.blockModel}</td>
                        <td>{entry.blockNumber}</td>
                        <td>{entry.stage}</td>
                      </>
                    ) : (
                      <td>{entry.customer}</td>
                    )}
                    <td>
                      <span className={
                        entry.result === 'OK' ? styles.resultOk :
                        entry.result === 'IMP' ? styles.resultImp :
                        styles.resultSleeve
                      }>
                        {entry.result}
                      </span>
                    </td>
                    <td>{entry.employee}</td>
                    <td>{entry.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
