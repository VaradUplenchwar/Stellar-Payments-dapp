# ⭐ Stellar Payment dApp

**A clean, working XLM payment app on the Stellar Testnet : connect a wallet, check your balance, send a payment, done.**
---

## 📸 Preview

## 📋 Table of Contents

- [Why This Project](#-why-this-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Requirements Coverage](#-requirements-coverage)
- [Getting Started](#-getting-started)
- [Using the App](#️-using-the-app)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 💡 Why This Project

Sending a payment on Stellar involves a few moving pieces  a wallet extension, an account that has to exist on-chain, a transaction that has to be built with the right network passphrase, signed, and submitted, and then interpreted correctly whether it succeeds or fails. Most of that is invisible to a user and easy to get subtly wrong as a developer.

This app strips it down to the essentials: **connect, check balance, send, confirm** — with every step visible, every failure explained in plain language, and nothing hidden behind magic. It's meant to be the kind of dApp a newcomer to Stellar could read end-to-end and immediately understand.

---

## ✨ Features

- 🔌 **Connect / Disconnect** — one-click Freighter connection with an active network check (warns you if Freighter isn't set to Testnet before you can proceed)
- 💰 **Live XLM Balance** — fetched directly from Horizon, with a manual refresh button
- 🚰 **One-Click Testnet Funding** — if your wallet is empty, a "Fund via Friendbot" button appears so you never have to leave the app
- 💸 **Send Payments** — destination address, amount, and optional memo, submitted as a real signed transaction
- ✅ **Clear Transaction Feedback** — a success/failure banner with the transaction hash and a direct link to Stellar Expert
- 🛡️ **Real Error Handling** — client-side validation (address format, amount) plus specific, human-readable messages for every network/signing failure — not a generic "something went wrong"

---

## 🧱 Tech Stack

| Layer | Tool |
|---|---|
| UI | React 18 + Vite |
| Wallet | [Freighter](https://www.freighter.app/) via `@stellar/freighter-api` |
| Blockchain SDK | [`@stellar/stellar-sdk`](https://www.npmjs.com/package/@stellar/stellar-sdk) |
| Network | Stellar **Testnet** (`horizon-testnet.stellar.org`) |
| Explorer links | [Stellar Expert](https://stellar.expert) |

---

## 🏗 Architecture

```
┌──────────┐      connect / sign       ┌────────────────┐
│  Browser │ ─────────────────────────▶│    Freighter    │
│   (You)  │◀───────────────────────── │   (extension)   │
└────┬─────┘        public key,         └────────────────┘
     │              signed tx
     │
     ▼
┌──────────────────┐   loadAccount /   ┌──────────────────────────┐
│  React App (UI)   │   submitTx        │  Stellar Testnet Horizon  │
│  src/App.jsx       │ ─────────────────▶│  horizon-testnet.stellar  │
│  src/stellar.js     │◀───────────────── │        .org                │
└──────────────────┘   balance, result  └──────────────────────────┘
```

All blockchain/wallet logic is isolated in **`src/stellar.js`** — the UI layer (`App.jsx`) never talks to Freighter or Horizon directly, it only calls functions like `connectWallet()`, `getXlmBalance()`, and `sendXlmPayment()`. That separation is what keeps the error handling and testing surface manageable.

---

## ✅ Requirements Coverage

| Level 1 Requirement | Implementation |
|---|---|
| **Wallet setup** — Freighter, Testnet | `NETWORK_PASSPHRASE = Networks.TESTNET` in `stellar.js`; `connectWallet()` actively checks Freighter's selected network and blocks/warns if it isn't Testnet |
| **Wallet connect** | `connectWallet()` → `freighterApi.requestAccess()`, returns the public key |
| **Wallet disconnect** | `disconnectWallet()` clears local session state (Freighter has no programmatic disconnect API by design — this is the standard pattern used by every Freighter dApp) |
| **Fetch XLM balance** | `getXlmBalance()` calls `server.loadAccount()` on Horizon and reads the native asset balance |
| **Display balance in UI** | Rendered live in the Balance card, with a refresh action |
| **Send XLM transaction** | `sendXlmPayment()` builds a `TransactionBuilder` payment operation, signs via `freighterApi.signTransaction()`, submits via `server.submitTransaction()` |
| **Success/failure state** | Result banner switches between ✅ success and ❌ error styling based on the submission result |
| **Transaction hash / confirmation** | Displayed inline, linked to Stellar Expert for independent verification |
| **Error handling** | Try/catch around every async call (connect, balance fetch, send); Horizon error codes (e.g. `op_no_destination`) are surfaced directly to the user |
| **Dev standards** | Clear UI/logic separation, input validation, consistent naming, no dead code |

---

## 🚀 Getting Started

### Prerequisites

1. Install the [Freighter](https://www.freighter.app/) browser extension.
2. In Freighter: create or import an account → **Settings → Network → Testnet**.
3. Node.js 18+.

### Install & Run

```bash
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`) in the **same browser** where Freighter is installed.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🕹️ Using the App

1. **Connect** — click *Connect Freighter Wallet*, approve in the popup.
2. **Check balance** — loads automatically. If it reads `0`, click *Fund via Friendbot* for free testnet XLM.
3. **Send a payment**:
   - **Destination Address** — a valid `G...` public key (56 characters)
   - **Amount** — XLM to send
   - **Memo** *(optional)* — up to 28 characters
4. **Sign** — approve the transaction in the Freighter popup.
5. **Confirm** — the result banner shows ✅ success (with hash + explorer link) or ❌ a specific failure reason.

> **Note:** Stellar requires a destination account to already exist on-chain to receive a plain payment. Sending to a brand-new address fails with `op_no_destination` — fund it first via `https://friendbot.stellar.org?addr=<address>`, then retry.

---

## 📁 Project Structure

```
stellar-payment-dapp/
├── src/
│   ├── stellar.js    # All Stellar/Freighter logic: connect, balance, send, validation
│   ├── App.jsx        # UI: wallet card, balance card, send form, result banner
│   ├── main.jsx        # React entry point
│   └── style.css        # Styling
├── index.html
├── package.json
└── vite.config.js
```

---

## 🛠 Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| "Freighter wallet extension not found" | Install Freighter, refresh the page |
| "Freighter is set to X. Please switch to Testnet." | Freighter → Settings → Network → Testnet |
| Balance shows `0` | Click *Fund via Friendbot* |
| `op_no_destination` on send | Destination account doesn't exist yet — fund it via Friendbot, then retry |
| App shows Vite's default "Get started" page | Wrong project folder is open — confirm it contains `src/stellar.js` |
| `localhost` "refused to connect" | Dev server isn't running (`npm run dev`), or you're viewing it in an editor's embedded browser instead of a real one |

---

## 🌐 Deployment

To get a live demo link for this README:

```bash
npm run build
```
Deploy the `dist/` folder to [Vercel](https://vercel.com), [Netlify](https://netlify.com), or GitHub Pages — all support static Vite builds with zero config. Paste the resulting URL at the top of this README.

---

## 🔭 Roadmap

Planned/possible extensions beyond Level 1 (not yet implemented):

- Transaction history for the connected wallet
- QR code for receiving payments
- Multi-account balance checker
- Split-bill calculator with multi-recipient send
- Live XLM/USD price display

---

## ⚠️ Notes

- Testnet only — no real funds are involved anywhere in this app.
- Built for the Stellar Tournament as an educational/hackathon submission.

## 📄 License

MIT — free to use, modify, and learn from.
