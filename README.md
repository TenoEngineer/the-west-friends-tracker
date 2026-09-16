# 🤠 The West - Friends Tracker

> A lightweight, open-source Google Chrome extension for InnoGames' **The-West** that automatically tracks friend activity during events (Oktoberfest, Easter, Independence Day, Day of the Dead). Easily detect who is active, who sent you event currency (pretzels, hearts, eggs, flowers), and identify inactive friends who never returned your gifts!

---

## ✨ Features

* **⚡ Auto-Detection Mode (Zero Setup / No List Required):**
  * Automatically scans your event log for gifts you sent (`Gift to a friend: [Player]`) to build your active friend list.
  * Tracks incoming gifts (`Gift from a friend: [Player]`).
  * Calculates the exact difference (`Sent - Received`) to find **inactive friends who didn't return gifts**.
* **📝 Manual List Mode:**
  * Option to enter a fixed list of friends or alliance members (`friend1;friend2;friend3...`).
  * Compare incoming gifts against your custom list.
  * **"Import from Logs"** button allows you to auto-populate your manual list with a single click.
* **📋 One-Click Inactive Export:**
  * Copies the list of non-returning players directly to your clipboard in `player1;player2;player3` format so you can easily message, review, or replace them in-game.
* **🖱️ Draggable In-Game Widget & Minimized Pill:**
  * Position the widget anywhere on your screen.
  * Minimize to a compact status badge (`🤠 Inactive: 24 | Active: 76`).
  * The minimized badge is also **draggable** across your screen.
* **🔄 Auto-Scan on Pagination:**
  * When browsing log pages in the game, the tracker automatically detects page changes and scans new entries.
* **🌐 Multilingual Support:**
  * Works on all servers and languages (English, Portuguese/Brazilian, Spanish, German, etc.).
* **🔒 100% Private & Safe:**
  * Runs entirely local inside your browser. No passwords, no login tokens, no tracking, and no external servers.

---

## 📥 Step-by-Step Installation Guide (Google Chrome)

It takes **less than 1 minute** to install:

### Step 1: Download or Clone the Extension
* **Option A (Git):**
  ```bash
  git clone https://github.com/TenoEngineer/the-west-friends-tracker.git
  ```
* **Option B (ZIP):**
  Click on the green **Code** button at the top of this repository and select **Download ZIP**. Unpack/extract the ZIP folder onto your computer.

### Step 2: Open Extensions in Chrome
1. Open Google Chrome.
2. In the address bar, type:
   ```text
   chrome://extensions/
   ```
   *(Or click the three dots at the top right > **Extensions** > **Manage Extensions**).*

### Step 3: Enable Developer Mode
* At the top-right corner of the Extensions page, toggle the **Developer mode** switch to **ON**.

### Step 4: Load the Extension
1. Click the **"Load unpacked"** button in the top-left corner.
2. Select the `the-west-friends-tracker` folder.
3. Done! The extension is now installed.

> **Tip for Edge, Brave, or Opera users:** This extension is compatible with all Chromium-based browsers! Go to `edge://extensions/` or `brave://extensions/`, enable Developer Mode, and click "Load unpacked".

---

## 🎮 How to Use in The-West

1. **Open The-West:** Go to your game world (e.g. `https://en31.the-west.net/game.php`).
2. **Locate the Widget:** Look at the bottom-right corner of your screen for the **🤠 Friends Tracker** panel.
3. **Open the Event Window:** Click on the current event icon (e.g., Oktoberfest).
4. **Go to the Event Log:** Open the tab with your pretzel/gift transactions.
5. **Scan Your Pages:**
   * Click **"🔍 Scan Logs"** (or simply click through the pages of your event log).
   * As you flip through pages, the tracker adds newly detected sent and received gifts.
6. **Review Inactive Players:**
   * Look at the **"Inactives"** counter.
   * View the list of friends who received gifts from you but never returned one.
7. **Copy Inactives:**
   * Click **"📋 Copy Inactives"** to copy the list of names formatted with semicolons (`player1;player2;player3`).
   * Paste it in-game to notify them or clean up your friend list!

---

## ⚙️ Modes Explained

| Mode | Description | When to use |
| :--- | :--- | :--- |
| **⚡ Auto (Logs)** | Scans both `Gift to` and `Gift from`. Your friends list is automatically determined by whoever you sent gifts to. | **Recommended!** No typing or copy-pasting required. |
| **📝 Manual List** | Compares incoming gifts (`Gift from`) against a pre-defined text list of usernames. | Best for alliances, town rosters, or fixed friend lists. |

---

## 🔄 Resetting for a New Day / Cycle

To start fresh for a new day or week:
1. Click the **"Reset Cycle"** button at the bottom of the widget.
2. Confirm the reset.
3. Flip through your log pages again to start tracking the new period.

---

## 🛡️ Security & Privacy

* This extension does **not** make any network requests outside your browser.
* All data is stored locally in your browser's `localStorage`.
* Fully compliant with InnoGames rules (read-only UI helper, does not automate clicks or gameplay actions).

---

## 🤝 Contributing

Contributions, bug reports, and translations are welcome! Feel free to open an issue or submit a Pull Request.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
