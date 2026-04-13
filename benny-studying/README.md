# 🧠 BENNY STUDYING

**你的智能自主學習平台** — AI 問答 · 智能筆記 · 測驗生成 · 深度專注

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/benny-studying)

---

## ✨ 功能特色

| 功能 | 說明 |
|------|------|
| 📄 **資料管理中心** | 上傳 PDF、Markdown、TXT，自動建立向量索引 |
| ✍️ **智能筆記系統** | Markdown 編輯器，自動儲存，語音輸入，標籤分類 |
| 🤖 **AI 智庫問答** | 一般模式 + 文件 RAG 模式，串流回應 |
| 🧪 **測驗生成與分析** | AI 自動出題，錯題本，學習掌握度追蹤 |
| 🎯 **沉浸式專注模式** | 番茄鐘，環境音效，呼吸引導 |
| 🌅 **動態主題背景** | 隨時間自動切換晨/午/晚/夜色調 |

---

## 🛠 技術架構

- **框架**：Next.js 14 (App Router) + TypeScript
- **樣式**：Tailwind CSS + 毛玻璃效果
- **資料庫**：Supabase (PostgreSQL + pgvector + Storage)
- **AI**：Anthropic Claude（對話、出題）+ OpenAI text-embedding-3-small（向量嵌入）
- **部署**：Vercel

---

## 🚀 快速開始

### 1. Clone 專案

```bash
git clone https://github.com/YOUR_USERNAME/benny-studying.git
cd benny-studying
npm install
```

### 2. 設定環境變數

複製範本並填入你的金鑰：

```bash
cp .env.example .env.local
```

編輯 `.env.local`：

```env
# ─── Supabase ─────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# ─── AI Providers ─────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...

# ─── App ──────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 設定 Supabase

#### a) 建立專案

前往 [supabase.com](https://supabase.com) → New Project

#### b) 啟用 pgvector 並執行 Migration

在 Supabase Dashboard → **SQL Editor** 貼上並執行：

```sql
-- 完整 SQL 在 supabase/migrations/001_init.sql
```

或直接執行檔案：
```bash
# 安裝 Supabase CLI
npm install -g supabase

# 登入並連結專案
supabase login
supabase link --project-ref YOUR_PROJECT_ID

# 執行 migration
supabase db push
```

#### c) 建立 Storage Bucket

在 Supabase Dashboard → **Storage** → New Bucket：
- Name: `documents`
- Public: **否**（保持私有）

#### d) 設定 Storage Policy（允許 service role 存取）

在 SQL Editor 執行：

```sql
-- Allow service role full access to documents bucket
CREATE POLICY "Service role can do everything"
ON storage.objects
FOR ALL
USING (auth.role() = 'service_role');
```

### 4. 本地開發

```bash
npm run dev
# 開啟 http://localhost:3000
```

---

## ☁️ Vercel 一鍵部署

### 步驟

1. **Push 到 GitHub**
   ```bash
   git add .
   git commit -m "🚀 Initial commit"
   git push origin main
   ```

2. **在 Vercel 匯入**
   - 前往 [vercel.com/new](https://vercel.com/new)
   - 選擇你的 GitHub repo

3. **設定環境變數**
   在 Vercel 的 **Environment Variables** 填入：

   | 變數名稱 | 說明 | 必填 |
   |----------|------|------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL | ✅ |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key | ✅ |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key（⚠️ 勿公開） | ✅ |
   | `ANTHROPIC_API_KEY` | Anthropic API 金鑰 | ✅ |
   | `OPENAI_API_KEY` | OpenAI API 金鑰（用於 embeddings） | ✅ |
   | `NEXT_PUBLIC_APP_URL` | 你的 Vercel 網域，例如 `https://benny.vercel.app` | 建議 |

4. **Deploy** 🎉

---

## 📁 專案結構

```
benny-studying/
├── app/
│   ├── layout.tsx               # 根 layout（字型、Toaster）
│   ├── globals.css              # 全域樣式、glass-card、動畫
│   ├── page.tsx                 # 重新導向至 /dashboard
│   ├── (dashboard)/
│   │   ├── layout.tsx           # 含 Sidebar + 動態背景
│   │   ├── dashboard/page.tsx   # 總覽頁
│   │   ├── documents/page.tsx   # 資料管理
│   │   ├── notes/page.tsx       # 智能筆記
│   │   ├── chat/page.tsx        # AI 問答
│   │   ├── quiz/page.tsx        # 測驗中心
│   │   └── focus/page.tsx       # 專注模式
│   └── api/
│       ├── chat/route.ts        # 串流 AI 對話 + RAG
│       ├── upload/route.ts      # 檔案上傳 + 嵌入生成
│       ├── documents/route.ts   # 文件 CRUD
│       ├── notes/route.ts       # 筆記 CRUD
│       └── quiz/route.ts        # 測驗生成 + 錯題記錄
├── components/
│   ├── ui/
│   │   ├── Sidebar.tsx          # 側邊導覽列
│   │   ├── BreathingOrb.tsx     # 右下角呼吸球
│   │   └── PomodoroTimer.tsx    # 番茄鐘
│   ├── documents/
│   │   ├── FileUploader.tsx     # 拖曳上傳元件
│   │   └── DocumentList.tsx     # 文件列表
│   ├── notes/
│   │   ├── NoteEditor.tsx       # Markdown 編輯器 + 語音輸入
│   │   └── NoteList.tsx         # 筆記列表
│   ├── chat/
│   │   ├── ChatWindow.tsx       # 串流聊天視窗
│   │   └── ModeToggle.tsx       # 模式切換
│   └── quiz/
│       ├── QuizGenerator.tsx    # 測驗生成與作答
│       └── ErrorBook.tsx        # 錯題本
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # 瀏覽器端 Supabase client
│   │   └── server.ts            # 伺服器端 client（service role）
│   ├── ai/
│   │   ├── anthropic.ts         # Claude 對話、出題、建議
│   │   ├── embeddings.ts        # OpenAI embeddings + 文本分塊
│   │   └── rag.ts               # RAG 檢索管線
│   └── utils.ts                 # cn、格式化、時間工具
├── types/index.ts               # 全域 TypeScript 型別
├── supabase/migrations/
│   └── 001_init.sql             # 完整資料庫 Schema
├── .env.example                 # 環境變數範本
├── tailwind.config.ts           # Tailwind 自訂主題
├── next.config.ts               # Next.js 設定
└── package.json
```

---

## 🔑 取得 API 金鑰

### Supabase
1. 前往 [supabase.com](https://supabase.com) → 你的專案
2. **Settings → API**
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `anon` `public` key
   - `SUPABASE_SERVICE_ROLE_KEY` = `service_role` key（⚠️ 機密，絕不放入前端）

### Anthropic
1. 前往 [console.anthropic.com](https://console.anthropic.com)
2. **API Keys → Create Key**
3. 複製 `sk-ant-...` 金鑰

### OpenAI
1. 前往 [platform.openai.com](https://platform.openai.com)
2. **API Keys → Create new secret key**
3. 複製 `sk-...` 金鑰

> 💡 **只使用 OpenAI 做 embeddings**（`text-embedding-3-small`，成本極低），對話全部使用 Anthropic Claude。

---

## 🗄️ 資料庫 Schema 說明

| 資料表 | 用途 |
|--------|------|
| `documents` | 上傳的文件基本資訊 |
| `document_chunks` | 文件的向量嵌入分塊（RAG 核心） |
| `notes` | 使用者筆記（含 Markdown 內容與標籤） |
| `chat_sessions` | 對話 session |
| `chat_messages` | 對話歷史訊息 |
| `quizzes` | 測驗記錄 |
| `quiz_questions` | 個別題目（含選項、答案、解析） |
| `quiz_attempts` | 作答記錄（用於錯題本） |
| `learning_stats` | 各主題的掌握度統計 |

---

## 🧩 RAG 流程說明

```
使用者提問
    ↓
建立問題的向量嵌入 (OpenAI)
    ↓
在 pgvector 搜尋相似文件片段 (cosine similarity)
    ↓
將相關片段注入 Claude 的 system prompt
    ↓
Claude 根據文件內容生成回答（引用來源）
```

---

## 🎨 UI 設計說明

- **色調**：深夜藍 `#080D14` 主背景，搭配毛玻璃卡片
- **毛玻璃**：`backdrop-blur-md` + `bg-white/[0.06]`
- **動態背景**：根據系統時間（晨/午/晚/夜）自動切換 aurora gradient
- **動畫**：呼吸球 `breathe` 動畫 4 秒循環，頁面 `fade-in` / `slide-up`
- **字體**：Geist Sans + Geist Mono（Next.js 官方字體）

---

## 🐛 常見問題

**Q: 上傳 PDF 後沒有向量索引？**
確認 `OPENAI_API_KEY` 正確，且 Supabase 已啟用 `pgvector` 擴充。

**Q: AI 回應沒有串流？**
確認 `ANTHROPIC_API_KEY` 正確，Vercel 部署時需確保 Function 逾時設定 > 30 秒（Pro plan 支援最長 300s）。

**Q: 語音輸入無法使用？**
語音輸入僅支援 HTTPS 環境（本地開發需使用 `localhost`，已在 Chrome 白名單中）。

---

## 📄 License

MIT License — 自由使用、修改、商業用途均可。

---

> 學習從來不是一件孤獨的事，BENNY STUDYING 陪你一起成長。🌱
