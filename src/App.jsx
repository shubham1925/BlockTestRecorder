import { useState } from 'react'
import './App.module.css'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'

function App() {
  const [employee, setEmployee] = useState(null)

  if (!employee) {
    return <LoginPage onLogin={setEmployee} />
  }

  return <Dashboard employee={employee} onLogout={() => setEmployee(null)} />
}

export default App
