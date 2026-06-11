import { useState, useEffect } from 'react'
import styles from './Dashboard.module.css'

const DEFAULT_BLOCK_MODELS = [
  'GIT-1.5', 'HCL-T160', 'GRF-2', 'HCL-2008 V2 BAYER', 'GIT-2',
  'CSS-2', 'GIL-2', 'GIC216 G', 'HCL-2210D', 'HCL-2214D',
  'HCL-2216D', 'HCL-2218A', 'GIT-2.5', 'MP-1', 'HCL-2510'
]

const RESULTS = ['OK', 'IMP', 'Sleeve']

const DEFAULT_CUSTOMERS = [
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
  const [mode, setMode] = useState('new')
  const [entries, setEntries] = useState([])
  const [blockModels, setBlockModels] = useState(DEFAULT_BLOCK_MODELS)
  const [customers, setCustomers] = useState(DEFAULT_CUSTOMERS)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // NEW mode fields
  const [blockModel, setBlockModel] = useState('')
  const [blockNumber, setBlockNumber] = useState('')
  const [result, setResult] = useState('')
  const [stage, setStage] = useState('')
  const [blockNumberError, setBlockNumberError] = useState('')

  // REPAIR mode fields
  const [customer, setCustomer] = useState('')
  const [repairBlockModel, setRepairBlockModel] = useState('')
  const [repairJobNumber, setRepairJobNumber] = useState('')
  const [repairResult, setRepairResult] = useState('')

  // Add-new inputs
  const [showAddModel, setShowAddModel] = useState(false)
  const [newModelName, setNewModelName] = useState('')
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')

  const handleBlockNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setBlockNumber(val)
    if (blockNumberError) setBlockNumberError('')
  }

  const validateBlockNumber = () => {
    if (blockNumber.length !== 6) {
      setBlockNumberError('Block number must be exactly 6 digits')
      return false
    }
    return true
  }

  const handleAdd = () => {
    if (mode === 'new') {
      if (!blockModel || !blockNumber || !result || !stage) return
      if (!validateBlockNumber()) return
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
      setBlockNumberError('')
    } else {
      if (!customer || !repairBlockModel || !repairJobNumber || !repairResult) return
      setEntries(prev => [...prev, {
        id: Date.now(),
        type: 'REPAIR',
        customer,
        blockModel: repairBlockModel,
        jobNumber: repairJobNumber,
        result: repairResult,
        employee: employee.id,
        timestamp: new Date().toLocaleString()
      }])
      setCustomer('')
      setRepairBlockModel('')
      setRepairJobNumber('')
      setRepairResult('')
    }
  }

  const handleAddModel = () => {
    const name = newModelName.trim().toUpperCase()
    if (!name || blockModels.includes(name)) return
    setBlockModels(prev => [...prev, name])
    setNewModelName('')
    setShowAddModel(false)
  }

  const handleAddCustomer = () => {
    const name = newCustomerName.trim()
    if (!name || customers.includes(name)) return
    setCustomers(prev => [...prev, name])
    setNewCustomerName('')
    setShowAddCustomer(false)
  }

  // Compute latest block number per model from entries
  const modelTracker = blockModels.map(model => {
    const modelEntries = entries
      .filter(e => e.blockModel === model && e.blockNumber)
      .sort((a, b) => b.id - a.id)
    return {
      model,
      latestBlock: modelEntries.length > 0 ? modelEntries[0].blockNumber : '—',
      count: modelEntries.length
    }
  })

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
        {/* Tracker toggle button */}
        <button
          className={styles.trackerToggle}
          onClick={() => setDrawerOpen(true)}
        >
          ☰ Block Tracker
        </button>

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
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Block Model</label>
                <div className={styles.selectRow}>
                  <select
                    className={styles.select}
                    value={blockModel}
                    onChange={e => setBlockModel(e.target.value)}
                  >
                    <option value="">-- Select Block Model --</option>
                    {blockModels.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={styles.addSmall}
                    onClick={() => setShowAddModel(!showAddModel)}
                    title="Add new block model"
                  >+</button>
                </div>
                {showAddModel && (
                  <div className={styles.addInline}>
                    <input
                      type="text"
                      className={styles.inputSmall}
                      placeholder="New model name"
                      value={newModelName}
                      onChange={e => setNewModelName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddModel()}
                      autoFocus
                    />
                    <button className={styles.addConfirm} onClick={handleAddModel}>Add</button>
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Block Number</label>
                <input
                  type="text"
                  className={`${styles.input} ${blockNumberError ? styles.inputError : ''}`}
                  placeholder="6 digits only"
                  value={blockNumber}
                  onChange={handleBlockNumberChange}
                  onBlur={() => blockNumber && validateBlockNumber()}
                  maxLength={6}
                  inputMode="numeric"
                />
                {blockNumberError && <p className={styles.fieldError}>{blockNumberError}</p>}
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
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Customer Name</label>
                <div className={styles.selectRow}>
                  <select
                    className={styles.select}
                    value={customer}
                    onChange={e => setCustomer(e.target.value)}
                  >
                    <option value="">-- Select Customer --</option>
                    {customers.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={styles.addSmall}
                    onClick={() => setShowAddCustomer(!showAddCustomer)}
                    title="Add new customer"
                  >+</button>
                </div>
                {showAddCustomer && (
                  <div className={styles.addInline}>
                    <input
                      type="text"
                      className={styles.inputSmall}
                      placeholder="New customer name"
                      value={newCustomerName}
                      onChange={e => setNewCustomerName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddCustomer()}
                      autoFocus
                    />
                    <button className={styles.addConfirm} onClick={handleAddCustomer}>Add</button>
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Block Model</label>
                <select
                  className={styles.select}
                  value={repairBlockModel}
                  onChange={e => setRepairBlockModel(e.target.value)}
                >
                  <option value="">-- Select Block Model --</option>
                  {blockModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Repair Job Number</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter job number"
                  value={repairJobNumber}
                  onChange={e => setRepairJobNumber(e.target.value)}
                />
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
                  <th>Block Model</th>
                  <th>Block / Job #</th>
                  <th>Customer</th>
                  <th>Stage</th>
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
                    <td>{entry.blockModel || '—'}</td>
                    <td>{entry.blockNumber || entry.jobNumber || '—'}</td>
                    <td>{entry.customer || '—'}</td>
                    <td>{entry.stage || '—'}</td>
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

      {/* Sliding drawer - Block Tracker */}
      <div className={`${styles.drawerOverlay} ${drawerOpen ? styles.drawerOverlayOpen : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Block Tracker</h2>
          <button className={styles.drawerClose} onClick={() => setDrawerOpen(false)}>✕</button>
        </div>
        <p className={styles.drawerSubtitle}>All block models &amp; latest block numbers</p>
        <div className={styles.drawerList}>
          {modelTracker.map(({ model, latestBlock, count }) => (
            <div key={model} className={styles.drawerItem}>
              <div>
                <span className={styles.drawerModel}>{model}</span>
                <span className={styles.drawerCount}>{count} {count === 1 ? 'entry' : 'entries'}</span>
              </div>
              <span className={styles.drawerBlock}>{latestBlock}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
