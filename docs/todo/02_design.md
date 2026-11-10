# TODOアプリ V1 設計書

本書は `docs/todo/01_requirements.md` の REQ-01〜REQ-04 を変更せずに参照し、設計だけを定める。REQ の内容と食い違う場合は、要件定義書を根拠に本書を修正する。

## 1. 作るものとファイルの役割

### 1.1 ファイル構成

```
.
├── index.ts                 # 既存。todoRouter を /api/v1/todos へ登録する。既存ルートは残す
├── db.ts                    # 既存のはずだが現時点のプロジェクトにはない。Neon 接続用に追加する
├── package.json             # pg, dotenv を追加する
├── tsconfig.json            # 既存のまま
├── public/
│   ├── style.css            # 既存
│   └── todo/
│       └── todo.js          # ブラウザ用 JavaScript。TodoApi と画面操作
├── views/
│   ├── index.ejs            # 既存のトップページ
│   └── todo/
│       └── index.ejs        # TODO 画面（/todo）。要確認：ドキュメント内に views/index.ejs と書かれた箇所もある
├── src/
│   └── apps/
│       └── todo/
│           ├── todoRouter.ts     # ルーティングだけを担当
│           ├── todoController.ts # リクエスト・レスポンスとバリデーションを担当
│           └── todoModel.ts      # DB への問い合わせだけを担当
├── docs/
│   └── todo/
│       ├── 01_requirements.md
│       ├── 02_design.md         # 本書
│       ├── 03_implementation_plan.md
│       └── 04_test_results.md
└── sql/
    ├── README.md
    └── todo/
        └── 020_create_todo_tasks.sql
```

- 既存のファイルは無理に移動しない。TODO の新規ファイルはアプリ別のフォルダに作る。
- `index.ts` への追記は最低限にする。todoRouter の import と登録だけにする。

### 1.2 各ファイルの役割

| ファイル | 役割 |
| --- | --- |
| `db.ts` | `pg` の Pool を作る。`DATABASE_URL` がない場合は起動時にエラーを出す。 |
| `src/apps/todo/todoRouter.ts` | `/api/v1/todos` の4操作を Controller につなげるだけ。DB や画面の処理は書かない。 |
| `src/apps/todo/todoController.ts` | 入力チェック、成功・失敗時のステータスと JSON を決める。Model を呼ぶ。 |
| `src/apps/todo/todoModel.ts` | SQL を実行するだけ。HTTP の処理は書かない。 |
| `public/todo/todo.js` | Fetch で API を呼ぶ TodoApi と、画面の表示・入力・操作をつなげる。 |
| `views/todo/index.ejs` | TODO 画面の HTML。登録フォーム、一覧、完了切替、削除の操作を持つ。 |
| `sql/todo/020_create_todo_tasks.sql` | TODO 用のテーブルを作る SQL。 |

## 2. リクエストはどこを通るか

```
ブラウザ (/todo)
  → public/todo/todo.js (TodoApi, fetch)
  → index.ts (todoRouter を /api/v1/todos へ登録)
  → src/apps/todo/todoRouter.ts
  → src/apps/todo/todoController.ts
  → src/apps/todo/todoModel.ts
  → db.ts (Pool)
  → Neon PostgreSQL
```

- 逆方向も同じ経路で返す。Model が DB の結果を返し、Controller が JSON にして返す。
- 画面 URL `/todo` と API URL `/api/v1/todos` は別である。

## 3. DB の設計

### 3.1 テーブル

- テーブル名：`todo_tasks`
- SQL：`sql/todo/020_create_todo_tasks.sql`

| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | integer | 主キー、自動採番 | TODO を区別する番号 |
| title | text | NOT NULL | TODO のタイトル |
| completed | boolean | NOT NULL、初期値 false | 完了状態 |
| created_at | timestamptz | NOT NULL、初期値 now() | 作成日時 |
| updated_at | timestamptz | NOT NULL、初期値 now() | 更新日時 |

- 要確認：ドキュメントでは作成日時・更新日時が `createdAT` / `updatedAT` と書かれている。DB のカラム名は PostgreSQL の慣例に合わせて `created_at` / `updated_at` とする。API の JSON でも同じ名前を使う。第6章で別の指定がある場合はそちらを優先する。

### 3.2 接続

- `db.ts` は次の方針で作る（ドキュメントの動作確認にある形に合わせる）。
  - `dotenv/config` を読み込む。
  - `process.env.DATABASE_URL` がない場合はエラーを出す。
  - `new Pool({ connectionString: process.env.DATABASE_URL, max: 2 })` を使う。
- `DATABASE_URL` と `DATABASE_URL_POOLED` の使い分けは、Neon の手順で確認する。ローカルと Vercel で同じキー名を使う。
- 接続文字列はコードや文書に書かない。`.env`（ローカル）と Vercel の環境変数で設定する。

## 4. API の共通ルール

- ベース URL：`/api/v1/todos`
- レスポンスは JSON とする。成功時は作成・更新した TODO、または一覧を `data` に入れて返す。
- 一覧の成功例：`{ "data": [ { "id": 1, "title": "...", "completed": false, "created_at": "...", "updated_at": "..." } ] }`
- 1件の成功例：`{ "data": { "id": 1, "title": "...", "completed": false, "created_at": "...", "updated_at": "..." } }`
- エラー時は、ステータスと画面に表示できるメッセージを返す。接続文字列などの情報は含めない。
- GET では DB を変更しない。DELETE を繰り返しても最終状態は同じになる。

## 5. API の4操作

### 5.1 REQ-01 TODO 一覧を取得する

| 項目 | 内容 |
| --- | --- |
| メソッド・URL | `GET /api/v1/todos` |
| リクエスト本文 | なし |
| 成功 | 200。`data` に TODO の配列を返す。0件の場合は空配列。 |
| 失敗 | DB 接続エラーの場合は 500。 |
| DB 処理 | `SELECT id, title, completed, created_at, updated_at FROM todo_tasks ORDER BY created_at DESC` |
| TodoApi メソッド | `listTodos()` |
| 確認方法 | ブラウザで `/todo` を開く。curl で `GET /api/v1/todos` を呼ぶ。 |

### 5.2 REQ-02 TODO を登録する

| 項目 | 内容 |
| --- | --- |
| メソッド・URL | `POST /api/v1/todos` |
| リクエスト本文 | `{ "title": "..." }` |
| 成功 | 201。作成した TODO を `data` に入れて返す。 |
| 失敗 | タイトルが空の場合は 400。DB 接続エラーの場合は 500。 |
| DB 処理 | `INSERT INTO todo_tasks (title, completed) VALUES ($1, false) RETURNING *` |
| TodoApi メソッド | `createTodo(title)` |
| 確認方法 | 画面の登録フォームから登録する。再読み込みしても残ることを確認する。 |

### 5.3 REQ-03 完了状態を変える

| 項目 | 内容 |
| --- | --- |
| メソッド・URL | `PATCH /api/v1/todos/:id` |
| リクエスト本文 | `{ "completed": true または false }` |
| 成功 | 200。更新した TODO を `data` に入れて返す。 |
| 失敗 | ID が存在しない場合は 404。`completed` が真偽値でない場合は 400。DB 接続エラーの場合は 500。 |
| DB 処理 | `UPDATE todo_tasks SET completed = $1, updated_at = now() WHERE id = $2 RETURNING *` |
| TodoApi メソッド | `updateTodo(id, completed)` |
| 確認方法 | 画面でチェックを切り替える。再読み込みしても状態が残ることを確認する。 |

### 5.4 REQ-04 TODO を削除する

| 項目 | 内容 |
| --- | --- |
| メソッド・URL | `DELETE /api/v1/todos/:id` |
| リクエスト本文 | なし |
| 成功 | 204（本文なし）または 200（削除した TODO を返す）。どちらかに統一する。 |
| 失敗 | ID が存在しない場合は 404。DB 接続エラーの場合は 500。 |
| DB 処理 | `DELETE FROM todo_tasks WHERE id = $1`。削除した行数を確かめる。 |
| TodoApi メソッド | `deleteTodo(id)` |
| 確認方法 | 画面で削除する。再読み込みしても表示されないことを確認する。 |

- 要確認：DELETE の成功時の返し方は、204 と 200 のどちらかに統一する。実装手順書で決めてから実装する。

## 6. 画面と TodoApi の設計

- 画面：`views/todo/index.ejs`（`/todo`）
  - 登録フォーム：タイトル入力欄と登録ボタン。
  - 一覧：タイトル、完了状態を切り替える操作、削除する操作を表示する。
  - 0件の場合：「TODOがありません」と表示する。
  - エラーが起きた場合：画面にエラーを表示する。
- TodoApi：`public/todo/todo.js`
  - `listTodos()`：`GET /api/v1/todos` を呼ぶ。
  - `createTodo(title)`：`POST /api/v1/todos` を呼ぶ。
  - `updateTodo(id, completed)`：`PATCH /api/v1/todos/:id` を呼ぶ。
  - `deleteTodo(id)`：`DELETE /api/v1/todos/:id` を呼ぶ。
- 画面の表示は、API から返されたデータだけをもとにする。画面側で DB を直接触らない。

## 7. エラーはどこで処理するか

- Model：DB のエラーをそのまま上に渡す。HTTP のステータスは決めない。
- Controller：入力チェックと、存在しない ID の判定をする。ステータスと JSON を決める。
- TodoApi：API のエラーを画面にわかる形で渡す。
- 画面：エラーを表示する。エラーが起きても一覧全体が表示できなくならないようにする。

## 8. 実装への注意事項

- 既存ルート `/` と `/api/db-check` を壊さない。`index.ts` への追記は todoRouter の登録だけにする。
- 静的ファイルの配信（`express.static`）はルートのあとに置く。`public/todo/` があるため、静的配信を先に置くと `/todo` が `/todo/` へリダイレクトされて画面が表示されなくなる。ルートを先にすることで `/todo` は画面、` /todo/todo.js` と `/style.css` は静的ファイルとして配信される。
- `db.ts` がない状態では、TODO の API も `/api/db-check` も動かない。まず Neon 接続を確かめてから TODO を実装する。
- SQL は Git に保存する。Neon SQL Editor で手動実行する作業とは別工程にする。
- 接続文字列、パスワード、API キーは、コード・文書・Git に書かない。
- 確定していない実際のファイル配置は推測せず「要確認」と記す。上の要確認の項目は、実装前に第6章の V1 共通仕様と照合して決める。
