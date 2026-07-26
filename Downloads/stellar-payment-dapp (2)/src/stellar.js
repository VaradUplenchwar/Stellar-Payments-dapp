import * as freighterApi from '@stellar/freighter-api'
import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  Memo,
  BASE_FEE,
} from '@stellar/stellar-sdk'

// --- Network config: Stellar Testnet ---
export const HORIZON_URL = 'https://horizon-testnet.stellar.org'
export const NETWORK_PASSPHRASE = Networks.TESTNET

export const server = new Horizon.Server(HORIZON_URL)

// ---------- Wallet Connection ----------

/**
 * Checks whether the Freighter browser extension is installed.
 */
export async function isFreighterInstalled() {
  try {
    const result = await freighterApi.isConnected()
    return !!result?.isConnected
  } catch {
    return false
  }
}

/**
 * Prompts the user to connect Freighter and returns their public address.
 * Throws if the user rejects access or Freighter isn't installed.
 */
export async function connectWallet() {
  const installed = await isFreighterInstalled()
  if (!installed) {
    throw new Error('Freighter wallet extension not found. Please install it from freighter.app')
  }

  const accessObj = await freighterApi.requestAccess()
  if (accessObj?.error) {
    throw new Error(accessObj.error)
  }

  const networkDetails = await freighterApi.getNetworkDetails()
  if (networkDetails?.network !== 'TESTNET') {
    throw new Error(
      `Freighter is set to ${networkDetails?.network || 'an unknown network'}. Please switch Freighter to Testnet.`
    )
  }

  return accessObj.address
}

/**
 * "Disconnects" the wallet from the app's perspective.
 * Freighter doesn't expose a programmatic disconnect (the extension itself
 * owns that permission), so we clear local app state instead - this is the
 * standard pattern for Freighter-based dApps.
 */
export function disconnectWallet() {
  return true
}

// ---------- Balance Handling ----------

/**
 * Fetches the XLM (native) balance for a given public key on testnet.
 * Returns '0' if the account doesn't exist yet (unfunded testnet account).
 */
export async function getXlmBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey)
    const native = account.balances.find((b) => b.asset_type === 'native')
    return native ? native.balance : '0'
  } catch (err) {
    if (err?.response?.status === 404) {
      // Account not yet funded on testnet
      return '0'
    }
    throw err
  }
}

/**
 * Requests testnet XLM from Friendbot for a freshly connected, unfunded account.
 */
export async function fundWithFriendbot(publicKey) {
  const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Friendbot funding failed: ${body}`)
  }
  return true
}

// ---------- Transaction Flow ----------

/**
 * Builds, signs (via Freighter), and submits an XLM payment transaction.
 * Returns { hash, successful } on success; throws on failure.
 */
export async function sendXlmPayment({ senderPublicKey, destination, amount, memo }) {
  // 1. Load the sender's current account state (sequence number, etc.)
  const senderAccount = await server.loadAccount(senderPublicKey)

  // 2. Build the transaction
  const txBuilder = new TransactionBuilder(senderAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    Operation.payment({
      destination,
      asset: Asset.native(),
      amount: String(amount),
    })
  )

  if (memo) {
    // Optional memo text, capped at 28 bytes by the protocol
    txBuilder.addMemo(Memo.text(memo.slice(0, 28)))
  }

  const transaction = txBuilder.setTimeout(180).build()

  // 3. Ask Freighter to sign it
  const signResult = await freighterApi.signTransaction(transaction.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: senderPublicKey,
  })

  if (signResult?.error) {
    throw new Error(signResult.error)
  }

  const signedXdr = signResult.signedTxXdr || signResult
  const signedTransaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)

  // 4. Submit to the network
  const submitResult = await server.submitTransaction(signedTransaction)

  return {
    hash: submitResult.hash,
    successful: submitResult.successful,
    raw: submitResult,
  }
}

/**
 * Validates a Stellar public key format (basic client-side check).
 */
export function isValidStellarAddress(address) {
  return typeof address === 'string' && /^G[A-Z2-7]{55}$/.test(address)
}
