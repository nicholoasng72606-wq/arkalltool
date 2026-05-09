# ⚔️ 羅德島後勤終端

一個針對《明日方舟》與《明日方舟：終末地》玩家設計的**網頁工具**。整合抽卡模擬、養成資源計算以及抽卡資源轉換，協助博士們有效規劃遊戲內的資源與抽卡策略。

> 🌐 線上使用：[https://nicholoasng72606-wq.github.io/arkalltool/](https://nicholoasng72606-wq.github.io/arkalltool/)

---

## ✨ 功能模組

### 🎲 抽卡模擬器（明日方舟）
- 支援四種卡池類型獨立設定數量：
  - 單up卡池
  - 指定單目標限定池（需求限定/陪跑）
  - 雙目標限定池
  - 聯動卡池
- 大量蒙地卡羅模擬（可設定 1 萬次以上）取得統計分佈
- 提供**平均抽數、中位數、標準差、十分位數、99%/99.99%信賴區間**
- 進度條顯示模擬進度，支援中途不阻塞 UI
- 互動式查詢工具：
  - 給定抽數 → 查詢抽到目標的累積機率
  - 給定機率 → 查詢對應所需抽數
- 一鍵複製 **MATLAB 代碼**：自動生成繪製 PDF/CDF 與多個信賴區間的 `.m` 腳本

### 📦 資源需求計算（養成規劃）
- 批量輸入幹員升級路線（星級+起止等級+數量），自動計算：
  - 所需總經驗（換算成經驗卡）
  - 所需總龍門幣
- 同時計算**模組升級**成本（支援 4/5/6 星，0→1/1→2/2→3 級獨立設定）
- 資源儲備系統：
  - 可設定「資源儲備目標」，計算所需總資源後一鍵設為底線
  - 若當前庫存低於儲備量會發出警告，防止誤用戰備資源
- 支援輸入每日基建產出（經驗、龍門幣、理智），並可選**包含每日任務與週任獎勵**
- 智慧型天數推算：
  - 根據經驗／龍門幣分開計算最短天數
  - 混合考慮**刷資源關卡（CE-6 / LS-6）產出**，自動估算最佳分配天數

### 🧮 抽數計算器
- 輸入合成玉、十抽卷、單抽卷、源石
- 一鍵算出：
  - 不碎石的總抽數（只算合成玉）
  - 碎石（源石換合成玉）後的最大可抽數
- 簡潔快速的抽卡資源概覽

### 🌌 終末地抽卡模擬
- 針對《明日方舟：終末地》的專屬抽卡邏輯：
  - 包含 30 抽贈送的一次 10 連
- 與明日方舟模擬器相同的完整功能：
  - 蒙地卡羅模擬、統計結果、進度條
  - 查詢機率／抽數對應
  - 複製 MATLAB 代碼（自動包含註解與多級信賴區間）


### ⌨️ 操作輔助
- 鍵盤快捷鍵：`Ctrl+1~4` 可在四個功能分頁間快速切換
- 分頁間進入時自動保持原輸入狀態
- 動態語言切換時，儲備狀態、提示文字等會隨之更新

## 🚀 使用方式

1. 直接前往 GitHub Pages 部署網址：  
   [https://nicholoasng72606-wq.github.io/arkalltool/](https://nicholoasng72606-wq.github.io/arkalltool/)
2. 也可以將整個倉庫下載後，用任意靜態伺服器（如 Live Server）開啟 `index.html` 即可運行。
3. 所有計算均在**瀏覽器端執行**，無需後端服務。

# ⚔️ Rhodes Island Logistics Terminal

A **web-based tool** designed for *Arknights* and *Arknights: Endfield* players. It integrates gacha simulation, resource requirement calculation, and pull currency conversion, helping Doctors efficiently plan their in-game resources and pulling strategies.

> 🌐 Live version: [https://nicholoasng72606-wq.github.io/arkalltool/](https://nicholoasng72606-wq.github.io/arkalltool/)

---

## ✨ Features

### 🎲 Gacha Simulator (Arknights)
- Supports independent quantity settings for four banner types:
  - Single rate-up banner
  - Designated single-target limited banner (rate-up / off-rate target)
  - Dual-target limited banner
  - Collaboration banner
- Large-scale Monte Carlo simulation (configurable to 10,000+ runs) to obtain statistical distributions
- Provides **average pulls, median, standard deviation, deciles, and 99%/99.99% confidence intervals**
- Progress bar shows simulation progress without blocking the UI
- Interactive query tool:
  - Given number of pulls → get cumulative probability of obtaining the target
  - Given probability → get corresponding number of pulls needed
- One-click copy **MATLAB code**: auto-generates `.m` scripts for plotting PDF/CDF with multiple confidence intervals

### 📦 Resource Requirement Calculator (Progression Planner)
- Batch input of operator upgrade paths (rarity + start/end level + quantity), automatically calculates:
  - Total EXP required (converted into EXP cards)
  - Total LMD required
- Simultaneously calculates **module upgrade** costs (supports 4/5/6★, levels 0→1/1→2/2→3 individually configurable)
- Resource reserve system:
  - Set a "resource reserve target" and lock it as a baseline with one click
  - Warns if current inventory falls below the reserve, preventing accidental use of emergency funds
- Supports entering daily base production (EXP, LMD, Sanity), with an option to **include daily and weekly mission rewards**
- Smart day estimation:
  - Calculates minimum days separately based on EXP and LMD shortages
  - Integrates **resource stage (CE-6 / LS-6) farming output** to automatically estimate optimal distribution of days

### 🧮 Pull Calculator
- Input Orundum, 10-pull tickets, single-pull tickets, and Originite Prime
- One-click output:
  - Total pulls without using Originite (Orundum only)
  - Maximum pulls after converting Originite to Orundum
- A quick and simple overview of pulling resources

### 🌌 Endfield Gacha Simulation
- Dedicated logic for *Arknights: Endfield*:
  - Includes the free 10-pull granted within the first 30 pulls
- Same full feature set as the Arknights simulator:
  - Monte Carlo simulation, statistical results, progress bar
  - Probability ↔ pulls query
  - Copy MATLAB code (auto-includes annotations and multi-level confidence intervals)

### ⌨️ Usability
- Keyboard shortcuts: `Ctrl+1~4` to quickly switch between the four tabs
- Inputs are preserved when switching tabs
- Dynamic language switching updates reserve status, hints, etc.

---

## 🚀 How to Use

1. Visit the GitHub Pages deployment:  
   [https://nicholoasng72606-wq.github.io/arkalltool/](https://nicholoasng72606-wq.github.io/arkalltool/)
2. Alternatively, download the entire repository and open `index.html` with any static server (e.g., Live Server).
3. All calculations are performed **client-side**; no backend is required.

---

## 🛠 Technical Details

- **Gacha logic** fully implements in-game pity mechanics (including soft pity with escalating probability).
- Monte Carlo simulations use `setTimeout` chunking to prevent the main thread from freezing during large loops.
- MATLAB code generation automatically produces complete plotting commands, including `ecdf` with multiple confidence intervals.
