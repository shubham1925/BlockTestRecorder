import styles from './Dashboard.module.css'

export default function Dashboard({ employee, onLogout }) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.hex}>⬡</span>
          <span className={styles.title}>Block Testing Recorder</span>
        </div>
        <div className={styles.right}>
          <span className={styles.empId}>ID: {employee.id}</span>
          <button className={styles.logout} onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <h2 className={styles.welcome}>Welcome, {employee.id}</h2>
        <p className={styles.subtitle}>
          Dashboard coming soon — SKU tracking, history, and reporting will live here.
        </p>
      </main>
    </div>
  )
}
