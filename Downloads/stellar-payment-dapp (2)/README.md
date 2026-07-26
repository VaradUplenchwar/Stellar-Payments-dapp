# ⭐ Stellar Payments dApp

A lightweight, no-frills XLM payment dApp built on the **Stellar Testnet**, using the **Freighter** wallet for connection and transaction signing.

Connect your wallet → check your balance → send XLM to any address → get instant confirmation. That's the whole app, done right.

---

## ✨ Features

- 🔌 **Connect / Disconnect** — one-click Freighter wallet connection, with a network check that warns you if Freighter isn't set to Testnet
- 💰 **Live Balance** — fetches and displays your XLM balance directly from Horizon, with a manual refresh button
- 🚰 **Friendbot Funding** — if your connected wallet has a 0 balance, a "Fund via Friendbot" button appears so you can get free testnet XLM without leaving the app
- 💸 **Send Payments** — enter any destination address, amount, and an optional memo to send a real signed transaction on testnet
- ✅ **Transaction Feedback** — a clear success/failure banner with the transaction hash and a direct link to view it on Stellar Expert
- 🛡️ **Error Handling** — client-side address/amount validation plus human-readable errors for network and signing failures

---

## 🧱 Tech Stack

| Layer | Tool |
|---|---|
| UI | React 18 + Vite |
| Wallet | [Freighter](https://www.freighter.app/) via `@stellar/freighter-api` |
| Blockchain | [`@stellar/stellar-sdk`](https://www.npmjs.com/package/@stellar/stellar-sdk) |
| Network | Stellar **Testnet** (Horizon: `horizon-testnet.stellar.org`) |

---

## ✅ Requirements Coverage

| Requirement | Implementation |
|---|---|
| Freighter wallet setup, Testnet | `NETWORK_PASSPHRASE = Networks.TESTNET` in `src/stellar.js`; `connectWallet()` verifies Freighter's active network before proceeding |
| Wallet connect / disconnect | `connectWallet()` / `disconnectWallet()` in `src/stellar.js`, wired to buttons in `src/App.jsx` |
| Fetch + display XLM balance | `getXlmBalance()` loads the account from Horizon and reads the native balance; rendered live in the UI |
| Send XLM transaction | `sendXlmPayment()` builds a `TransactionBuilder` payment operation, signs it via Freighter, and submits it to Horizon |
| Transaction feedback (success/failure + hash) | Result banner in `App.jsx` shows status, message, transaction hash, and a Stellar Expert link |
| Development standards | Clean separation of concerns — all blockchain/wallet logic lives in `src/stellar.js`; `App.jsx` is UI-only. Try/catch around every async call with user-facing error messages |

---

## 🚀 Getting Started

### Prerequisites

1. Install the [Freighter](https://www.freighter.app/) browser extension.
2. Open Freighter → create or import an account → **Settings → Network → Testnet**.
3. Node.js 18+ installed locally.

### Run it

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`) in the **same browser** where Freighter is installed — not an embedded/in-editor browser, which can't access extensions.

### Build for production

```bash
npm run build
npm run preview
```

---

## 🕹️ Using the App

1. Click **Connect Freighter Wallet** and approve the connection in the popup.
2. Your XLM balance loads automatically. If it's `0`, click **Fund via Friendbot** to get free testnet XLM.
3. To send a payment, fill in:
   - **Destination Address** — a valid `G...` Stellar public key (56 characters)
   - **Amount** — how much XLM to send
   - **Memo** *(optional)* — up to 28 characters
4. Click **Send Payment**. Freighter will prompt you to sign — approve it.
5. Watch the result banner: ✅ success with a transaction hash and explorer link, or ❌ a specific failure reason.

> **Sending to a brand-new address?** Stellar requires a destination account to exist before it can receive a plain payment. If you see `op_no_destination`, fund that address first via:
> `https://friendbot.stellar.org?addr=<destination_address>`
> then retry the send.

---

## 📁 Project Structure

```
stellar-payment-dapp/
├── src/
│   ├── stellar.js     # All Stellar/Freighter logic (connect, balance, send, validation)
│   ├── App.jsx         # UI: wallet card, balance card, send form, result banner
│   ├── main.jsx        # React entry point
│   └── style.css        # Styling
├── index.html
├── package.json
└── vite.config.js
```

---

## 🛠️ Troubleshooting

| Symptom | Fix |
|---|---|
| "Freighter wallet extension not found" | Install Freighter and refresh the page |
| "Freighter is set to X. Please switch to Testnet." | Open Freighter → Settings → Network → Testnet |
| Balance shows `0` | Click **Fund via Friendbot** on the balance card |
| `op_no_destination` on send | The destination account doesn't exist yet — fund it via Friendbot first |
| Page loads Vite's default "Get started" screen | You're running the wrong project folder — make sure the open folder contains `src/stellar.js` |
| `localhost` "refused to connect" | The dev server (`npm run dev`) isn't running, or you're viewing it in an editor's built-in browser instead of a real browser |

---

## 🔭 Possible Next Steps

Ideas for extending this beyond Level 1 (not implemented yet):

- Transaction history for the connected wallet
- QR code for receiving payments
- Multi-account balance checker
- Split-bill calculator with multi-send
- Live XLM/USD price alongside the balance

---

## ⚠️ Notes

- This app only interacts with **Stellar Testnet** — no real funds are involved.
- Built for educational/hackathon purposes as part of a Stellar Level 1 tournament submission.
