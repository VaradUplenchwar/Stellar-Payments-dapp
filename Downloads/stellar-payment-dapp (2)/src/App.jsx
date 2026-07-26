import { useState, useEffect, useCallback } from 'react'
import {
  connectWallet,
  disconnectWallet,
  getXlmBalance,
  sendXlmPayment,
  fundWithFriendbot,
  isValidStellarAddress,
} from './stellar'

export default function App() {
  const [publicKey, setPublicKey] = useState(null)
  const [balance, setBalance] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState(null)

  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [sending, setSending] = useState(false)
  const [txResult, setTxResult] = useState(null) // { status: 'success'|'error', hash?, message }

  const refreshBalance = useCallback(async (key) => {
    if (!key) return
    setBalanceLoading(true)
    try {
      const bal = await getXlmBalance(key)
      setBalance(bal)
    } catch (err) {
      console.error(err)
      setBalance(null)
    } finally {
      setBalanceLoading(false)
    }
  }, [])

  useEffect(() => {
    if (publicKey) refreshBalance(publicKey)
  }, [publicKey, refreshBalance])

  async function handleConnect() {
    setConnectError(null)
    setConnecting(true)
    try {
      const key = await connectWallet()
      setPublicKey(key)
    } catch (err) {
      setConnectError(err.message || 'Failed to connect wallet')
    } finally {
      setConnecting(false)
    }
  }

  function handleDisconnect() {
    disconnectWallet()
    setPublicKey(null)
    setBalance(null)
    setTxResult(null)
  }

  async function handleFund() {
    if (!publicKey) return
    setBalanceLoading(true)
    try {
      await fundWithFriendbot(publicKey)
      await refreshBalance(publicKey)
    } catch (err) {
      alert(err.message)
    } finally {
      setBalanceLoading(false)
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    setTxResult(null)

    if (!isValidStellarAddress(destination)) {
      setTxResult({ status: 'error', message: 'Invalid destination address. Must start with G and be 56 characters.' })
      return
    }
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) {
      setTxResult({ status: 'error', message: 'Enter a valid amount greater than 0.' })
      return
    }

    setSending(true)
    try {
      const result = await sendXlmPayment({
        senderPublicKey: publicKey,
        destination,
        amount,
        memo,
      })
      setTxResult({
        status: result.successful ? 'success' : 'error',
        hash: result.hash,
        message: result.successful ? 'Payment sent successfully!' : 'Transaction did not succeed.',
      })
      await refreshBalance(publicKey)
      setAmount('')
      setMemo('')
    } catch (err) {
      console.error(err)
      const detail =
        err?.response?.data?.extras?.result_codes?.operations?.join(', ') ||
        err?.message ||
        'Unknown error'
      setTxResult({ status: 'error', message: `Transaction failed: ${detail}` })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>⭐ Stellar Payment dApp</h1>
        <span className="badge">Testnet</span>
      </header>

      <section className="card">
        {!publicKey ? (
          <>
            <button className="btn primary" onClick={handleConnect} disabled={connecting}>
              {connecting ? 'Connecting…' : 'Connect Freighter Wallet'}
            </button>
            {connectError && <p className="error">{connectError}</p>}
          </>
        ) : (
          <div className="wallet-info">
            <div>
              <p className="label">Connected Address</p>
              <p className="address" title={publicKey}>
                {publicKey.slice(0, 6)}…{publicKey.slice(-6)}
              </p>
            </div>
            <button className="btn secondary" onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>
        )}
      </section>

      {publicKey && (
        <>
          <section className="card">
            <div className="balance-row">
              <div>
                <p className="label">XLM Balance</p>
                <p className="balance">
                  {balanceLoading ? 'Loading…' : balance !== null ? `${balance} XLM` : '—'}
                </p>
              </div>
              <div className="balance-actions">
                <button className="btn small" onClick={() => refreshBalance(publicKey)} disabled={balanceLoading}>
                  Refresh
                </button>
                {balance === '0' && (
                  <button className="btn small" onClick={handleFund} disabled={balanceLoading}>
                    Fund via Friendbot
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="card">
            <h2>Send XLM</h2>
            <form onSubmit={handleSend} className="form">
              <label>
                Destination Address
                <input
                  type="text"
                  placeholder="G..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.trim())}
                  required
                />
              </label>
              <label>
                Amount (XLM)
                <input
                  type="number"
                  step="0.0000001"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </label>
              <label>
                Memo (optional)
                <input
                  type="text"
                  maxLength={28}
                  placeholder="Up to 28 characters"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </label>
              <button className="btn primary" type="submit" disabled={sending}>
                {sending ? 'Sending…' : 'Send Payment'}
              </button>
            </form>

            {txResult && (
              <div className={`tx-result ${txResult.status}`}>
                <p>{txResult.status === 'success' ? '✅' : '❌'} {txResult.message}</p>
                {txResult.hash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${txResult.hash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on Stellar Expert ↗
                  </a>
                )}
              </div>
            )}
          </section>
        </>
      )}

      <footer>
        <p>Built for the Stellar Testnet · Requires the Freighter browser extension</p>
      </footer>
    </div>
  )
}
