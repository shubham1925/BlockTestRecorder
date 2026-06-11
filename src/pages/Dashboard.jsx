import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Dashboard.module.css'

const RESULTS = ['OK', 'IMP', 'Sleeve']

function LiveClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
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
  const [blockModels, setBlockModels] = useState([])
  const [customers, setCustomers] = useState([])
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Drawer history state
  const [selectedModel, setSelectedModel] = useState(null)
  const [modelHistory, setModelHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

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

  // Toast
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [modelsRes, customersRes, entriesRes] = await Promise.all([
        supabase.from('block_models').select('name').order('name'),
        supabase.from('customers').select('name').order('name'),
        supabase.from('entries').select('*').order('created_at', { ascending: false }).limit(50)
      ])
      if (modelsRes.data) setBlockModels(modelsRes.data.map(r => r.name))
      if (customersRes.data) setCustomers(customersRes.data.map(r => r.name))
      if (entriesRes.data) setEntries(entriesRes.data)
      setLoading(false)
    }
    loadData()
  }, [])

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

  const handleAdd = async () => {
    if (saving) return

    if (mode === 'new') {
      if (!blockModel || !blockNumber || !result || !stage) {
        showToast('Please fill in all fields', 'error')
        return
      }
      if (!validateBlockNumber()) return

      setSaving(true)
      const { data, error } = await supabase.from('entries').insert({
        type: 'NEW',
        block_model: blockModel,
        block_number: blockNumber,
        result,
        stage,
        employee_id: employee.id
      }).select()

      if (error) {
        showToast('Failed to save: ' + error.message, 'error')
      } else {
        setEntries(prev => [data[0], ...prev])
        setBlockModel('')
        setBlockNumber('')
        setResult('')
        setStage('')
        setBlockNumberError('')
        showToast('Entry added')
      }
      setSaving(false)

    } else {
      if (!customer || !repairBlockModel || !repairJobNumber || !repairResult) {
        showToast('Please fill in all fields', 'error')
        return
      }

      setSaving(true)
      const { data, error } = await supabase.from('entries').insert({
        type: 'REPAIR',
        block_model: repairBlockModel,
        block_number: null,
        job_number: repairJobNumber,
        customer,
        result: repairResult,
        employee_id: employee.id
      }).select()

      if (error) {
        showToast('Failed to save: ' + error.message, 'error')
      } else {
        setEntries(prev => [data[0], ...prev])
        setCustomer('')
        setRepairBlockModel('')
        setRepairJobNumber('')
        setRepairResult('')
        showToast('Repair entry added')
      }
      setSaving(false)
    }
  }

  const handleAddModel = async () => {
    const name = newModelName.trim().toUpperCase()
    if (!name || blockModels.includes(name)) return
    const { error } = await supabase.from('block_models').insert({ name })
    if (error) {
      showToast('Failed to add model: ' + error.message, 'error')
    } else {
      setBlockModels(prev => [...prev, name].sort())
      setNewModelName('')
      setShowAddModel(false)
      showToast('Model added: ' + name)
    }
  }

  const handleAddCustomer = async () => {
    const name = newCustomerName.trim()
    if (!name || customers.includes(name)) return
    const { error } = await supabase.from('customers').insert({ name })
    if (error) {
      showToast('Failed to add customer: ' + error.message, 'error')
    } else {
      setCustomers(prev => [...prev, name].sort())
      setNewCustomerName('')
      setShowAddCustomer(false)
      showToast('Customer added: ' + name)
    }
  }

  // Drawer: load history for a specific block model
  const loadModelHistory = useCallback(async (modelName) => {
    if (selectedModel === modelName) {
      setSelectedModel(null)
      setModelHistory([])
      return
    }
    setSelectedModel(modelName)
    setHistoryLoading(true)
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('block_model', modelName)
      .order('created_at', { ascending: false })
    if (data) setModelHistory(data)
    if (error) showToast('Failed to load history', 'error')
    setHistoryLoading(false)
  }, [selectedModel])

  // Compute summary for drawer
  const modelSummary = blockModels.map(model => {
    const modelEntries = entries.filter(e => e.block_model === model)
    const latest = modelEntries.length > 0 ? (modelEntries[0].block_number || modelEntries[0].job_number || '—') : '—'
    return { model, latest, count: modelEntries.length }
  })

  const formatDate = (iso) => {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingScreen}>Loading...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
          {toast.message}
        </div>
      )}

      <header className={styles.header}>
        <h1 className={styles.brand}>HEXACARB ENGINEERS</h1>
        <div className={styles.headerRight}>
          <LiveClock />
          <div className={styles.divider} />
          <button className={styles.logout} onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className={styles.main}>
        <button
          className={styles.trackerToggle}
          onClick={() => setDrawerOpen(true)}
        >
          ☰ Block Tracker
        </button>

        <div className={styles.card}>
          <div className={styles.modeToggle}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={mode === 'new'} onChange={() => setMode('new')} className={styles.checkbox} />
              <span className={styles.checkboxCustom} data-checked={mode === 'new'} />
              <span className={styles.checkboxText}>NEW</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={mode === 'repair'} onChange={() => setMode('repair')} className={styles.checkbox} />
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
                  <select className={styles.select} value={blockModel} onChange={e => setBlockModel(e.target.value)}>
                    <option value="">-- Select Block Model --</option>
                    {blockModels.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <button type="button" className={styles.addSmall} onClick={() => setShowAddModel(!showAddModel)} title="Add new block model">+</button>
                </div>
                {showAddModel && (
                  <div className={styles.addInline}>
                    <input type="text" className={styles.inputSmall} placeholder="New model name" value={newModelName}
                      onChange={e => setNewModelName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddModel()} autoFocus />
                    <button className={styles.addConfirm} onClick={handleAddModel}>Add</button>
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Block Number</label>
                <input type="text" className={`${styles.input} ${blockNumberError ? styles.inputError : ''}`}
                  placeholder="6 digits only" value={blockNumber} onChange={handleBlockNumberChange}
                  onBlur={() => blockNumber && validateBlockNumber()} maxLength={6} inputMode="numeric" />
                {blockNumberError && <p className={styles.fieldError}>{blockNumberError}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Result</label>
                <select className={styles.select} value={result} onChange={e => setResult(e.target.value)}>
                  <option value="">-- Select Result --</option>
                  {RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Stage</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="stage" value="Rough" checked={stage === 'Rough'} onChange={e => setStage(e.target.value)} className={styles.radio} />
                    Rough
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="stage" value="Final" checked={stage === 'Final'} onChange={e => setStage(e.target.value)} className={styles.radio} />
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
                  <select className={styles.select} value={customer} onChange={e => setCustomer(e.target.value)}>
                    <option value="">-- Select Customer --</option>
                    {customers.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button type="button" className={styles.addSmall} onClick={() => setShowAddCustomer(!showAddCustomer)} title="Add new customer">+</button>
                </div>
                {showAddCustomer && (
                  <div className={styles.addInline}>
                    <input type="text" className={styles.inputSmall} placeholder="New customer name" value={newCustomerName}
                      onChange={e => setNewCustomerName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCustomer()} autoFocus />
                    <button className={styles.addConfirm} onClick={handleAddCustomer}>Add</button>
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Block Model</label>
                <select className={styles.select} value={repairBlockModel} onChange={e => setRepairBlockModel(e.target.value)}>
                  <option value="">-- Select Block Model --</option>
                  {blockModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Repair Job Number</label>
                <input type="text" className={styles.input} placeholder="Enter job number"
                  value={repairJobNumber} onChange={e => setRepairJobNumber(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Result</label>
                <select className={styles.select} value={repairResult} onChange={e => setRepairResult(e.target.value)}>
                  <option value="">-- Select Result --</option>
                  {RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          )}

          <button className={styles.addButton} onClick={handleAdd} disabled={saving}>
            {saving ? 'Saving...' : 'Add'}
          </button>
        </div>

        {/* Recent entries */}
        {entries.length === 0 ? (
          <p className={styles.noEntries}>No entries logged yet.</p>
        ) : (
          <div className={styles.entriesCard}>
            <h3 className={styles.entriesTitle}>Recent entries</h3>
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
                    <td>{entry.block_model || '—'}</td>
                    <td>{entry.block_number || entry.job_number || '—'}</td>
                    <td>{entry.customer || '—'}</td>
                    <td>{entry.stage || '—'}</td>
                    <td>
                      <span className={
                        entry.result === 'OK' ? styles.resultOk :
                        entry.result === 'IMP' ? styles.resultImp :
                        styles.resultSleeve
                      }>{entry.result}</span>
                    </td>
                    <td>{entry.employee_id}</td>
                    <td>{formatDate(entry.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Sliding drawer */}
      <div className={`${styles.drawerOverlay} ${drawerOpen ? styles.drawerOverlayOpen : ''}`}
        onClick={() => { setDrawerOpen(false); setSelectedModel(null) }} />
      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Block Tracker</h2>
          <button className={styles.drawerClose} onClick={() => { setDrawerOpen(false); setSelectedModel(null) }}>✕</button>
        </div>
        <p className={styles.drawerSubtitle}>Tap a model to view full history</p>
        <div className={styles.drawerList}>
          {modelSummary.map(({ model, latest, count }) => (
            <div key={model}>
              <button
                className={`${styles.drawerItem} ${selectedModel === model ? styles.drawerItemActive : ''}`}
                onClick={() => loadModelHistory(model)}
              >
                <div>
                  <span className={styles.drawerModel}>{model}</span>
                  <span className={styles.drawerCount}>{count} {count === 1 ? 'entry' : 'entries'}</span>
                </div>
                <div className={styles.drawerRight}>
                  <span className={styles.drawerBlock}>{latest}</span>
                  <span className={styles.drawerChevron}>{selectedModel === model ? '▾' : '›'}</span>
                </div>
              </button>

              {/* Expanded history for selected model */}
              {selectedModel === model && (
                <div className={styles.historyPanel}>
                  {historyLoading ? (
                    <p className={styles.historyLoading}>Loading history...</p>
                  ) : modelHistory.length === 0 ? (
                    <p className={styles.historyEmpty}>No entries for this model yet.</p>
                  ) : (
                    <div className={styles.historyList}>
                      {modelHistory.map(entry => (
                        <div key={entry.id} className={styles.historyRow}>
                          <div className={styles.historyTop}>
                            <span className={entry.type === 'NEW' ? styles.badgeNew : styles.badgeRepair}>
                              {entry.type}
                            </span>
                            <span className={styles.historyNumber}>
                              #{entry.block_number || entry.job_number || '—'}
                            </span>
                            <span className={
                              entry.result === 'OK' ? styles.resultOk :
                              entry.result === 'IMP' ? styles.resultImp :
                              styles.resultSleeve
                            }>{entry.result}</span>
                          </div>
                          <div className={styles.historyMeta}>
                            <span>Employee: {entry.employee_id}</span>
                            {entry.stage && <span>Stage: {entry.stage}</span>}
                            {entry.customer && <span>Customer: {entry.customer}</span>}
                            <span>{formatDate(entry.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
