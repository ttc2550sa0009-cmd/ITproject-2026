# TODOアプリ V1 実装手順書

本書は `docs/todo/01_requirements.md` と `docs/todo/02_design.md` を根拠にする。要件・設計・手順でカラム名、URL、機能名が食い違えば、実装前に直す。

- API の URL：`/api/v1/todos`
- 画面の URL：`/todo`
- 作業は小さな変更単位で進める。1工程ごとに確認してから次へ進む。
- 提出はユーザーが行う。本書の作業では Google フォームへの提出はしない。

## 0. 前提の確認（実装前に行う）

| 対象ファイル | 作業内容 | 確認コマンド / 確認方法 | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| `index.ts`、`package.json`、`tsconfig.json` | 実際の内容を読む | ファイルを開く | 既存ルート `/` があり、`express` と `ejs` が入っている | ファイル配置が違う場合は、講師と実際の構成を確認する |
| `db.ts` | 存在するか確認する | ファイルを開く | 現時点では存在しない。Neon の手順で追加する | 20261013 Neon の手順を確認する |
| Neon | データベースが作成済みか確認する | Neon の画面を開く | DATABASE_URL が取得できる | Neon のプロジェクト一覧を確認する |

- 要確認：Neon データベースが未作成の場合は、まず Neon の作成から行う。`DATABASE_URL` がない状態では、以降の DB の工程はテストできない。

## 1. ブランチを作成する

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| Git | `main` を更新し、`feature/todo-app` を作成する | `git checkout main`、`git pull`、`git checkout -b feature/todo-app` | ブランチが `feature/todo-app` になる | GitHub の main が更新されていない場合は、まず `git pull` の結果を確認する |

- 以降の作業はすべて `feature/todo-app` ブランチで行う。`main` へ直接コミットしない。

## 2. Neon 接続を実装する

### 2.1 パッケージを追加する

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| `package.json` | `pg`、`dotenv`、`@types/pg` を追加する | `npm install pg dotenv`、`npm install -D @types/pg` | `package.json` に追加される | npm のエラーメッセージを確認する |

### 2.2 `db.ts` を作成する

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| `db.ts` | Pool を作る。`DATABASE_URL` がない場合はエラーを出す | `npm run build` | ビルドが通る | `tsconfig.json` と `db.ts` の import を確認する |

### 2.3 `.env` を設定する（ローカル）

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| `.env` | `DATABASE_URL` を設定する。値は Neon の画面からコピーする | ファイルを開く（値は画面に表示しない） | `.env` に設定される | `.gitignore` に `.env` が含まれているか確認する |

- `.env` は Git に含めない。

### 2.4 `/api/db-check` を追加する

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| `index.ts` | `/api/db-check` を追加する。DB に接続できれば `{"status":"ok","database":"connected"}` を返す | `npm run dev`、`http://localhost:3000/api/db-check` を開く | `{"status":"ok","database":"connected"}` が表示される | サーバーのログと `db.ts` の接続設定を確認する |

## 3. SQL を作成する

### 3.1 SQL ファイルを Git に保存する

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| `sql/todo/020_create_todo_tasks.sql` | `todo_tasks` テーブルを作る SQL を書く | ファイルを開く | `id`、`title`、`completed`、`created_at`、`updated_at` のカラムがある | 設計書の DB 設計と照合する |

### 3.2 Neon SQL Editor で手動実行する

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| Neon SQL Editor | 3.1 の SQL を実行する | Neon の画面でテーブル一覧を確認する | `todo_tasks` テーブルができる | SQL のエラーメッセージを確認する |

- SQL を Git に保存する作業と、Neon SQL Editor で手動実行する作業は別工程にする。

## 4. 一覧 API（REQ-01）を実装する

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| `src/apps/todo/todoModel.ts` | 一覧取得の SQL を書く | `npm run build` | ビルドが通る | SQL とカラム名を確認する |
| `src/apps/todo/todoController.ts` | 一覧を JSON で返す | `npm run dev`、curl で `GET /api/v1/todos` | 200 で `data` に配列が返る。0件なら空配列 | サーバーのログを確認する |
| `src/apps/todo/todoRouter.ts`、`index.ts` | `GET /api/v1/todos` を登録する | 同上 | 同上 | ルーティングの登録を確認する |

- 確認したら完了と言える状態：データ0件なら、GET の `data` が空配列になること。

## 5. 登録 API（REQ-02）を実装する

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| `src/apps/todo/todoModel.ts` | 登録の SQL を書く | `npm run build` | ビルドが通る | SQL とカラム名を確認する |
| `src/apps/todo/todoController.ts` | タイトルの入力チェックをする。空の場合は 400 を返す | curl で `POST /api/v1/todos`（正常系と空タイトル） | 正常系は 201、空タイトルは 400 | 入力チェックの条件を確認する |
| `src/apps/todo/todoRouter.ts` | `POST /api/v1/todos` を登録する | 同上 | 同上 | ルーティングの登録を確認する |

- 確認したら完了と言える状態：タイトルを入力して登録すると、一覧にその TODO が表示され、再読み込みしても残っていること。

## 6. 更新 API（REQ-03）を実装する

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| `src/apps/todo/todoModel.ts` | 完了状態の更新 SQL を書く | `npm run build` | ビルドが通る | SQL とカラム名を確認する |
| `src/apps/todo/todoController.ts` | `completed` が真偽値か確認する。存在しない ID は 404 を返す | curl で `PATCH /api/v1/todos/:id`（正常系と存在しない ID） | 正常系は 200、存在しない ID は 404 | ID の判定を確認する |
| `src/apps/todo/todoRouter.ts` | `PATCH /api/v1/todos/:id` を登録する | 同上 | 同上 | ルーティングの登録を確認する |

- 確認したら完了と言える状態：完了状態を切り替えると、再読み込みしてもその状態が残っていること。

## 7. 削除 API（REQ-04）を実装する

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| `src/apps/todo/todoModel.ts` | 削除の SQL を書く | `npm run build` | ビルドが通る | SQL とカラム名を確認する |
| `src/apps/todo/todoController.ts` | 存在しない ID は 404 を返す。成功時の返し方を 204 と 200 のどちらかに統一する | curl で `DELETE /api/v1/todos/:id`（正常系と存在しない ID） | 正常系は統一した返し方、存在しない ID は 404 | 削除した行数の判定を確認する |
| `src/apps/todo/todoRouter.ts` | `DELETE /api/v1/todos/:id` を登録する | 同上 | 同上 | ルーティングの登録を確認する |

- 確認したら完了と言える状態：削除した TODO が一覧から消え、再読み込みしても表示されないこと。

## 8. TodoApi と画面を実装する

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| `public/todo/todo.js` | `listTodos`、`createTodo`、`updateTodo`、`deleteTodo` を作る | `npm run dev`、ブラウザで `/todo` を開く | Fetch で API を呼べる | ブラウザの開発者ツールの Console と Network を確認する |
| `views/todo/index.ejs` | 登録フォーム、一覧、完了切替、削除の操作を作る。0件時は「TODOがありません」と表示する | 同上 | 一覧・登録・完了切替・削除が画面からできる | 画面の HTML と TodoApi の呼び出しを確認する |

## 9. ローカルで確認する

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| 全体 | `npm run build`、`npm run dev` で起動する | `http://localhost:3000/`、`http://localhost:3000/todo`、`http://localhost:3000/api/db-check` を開く | `/` が表示される。`/todo` で CRUD ができる。`/api/db-check` が `{"status":"ok","database":"connected"}` を返す | サーバーのログを確認する |

- 結果は `docs/todo/04_test_results.md` に記録する。

## 10. Preview で確認する

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| GitHub | `feature/todo-app` をプッシュし、Pull Request を作成する | GitHub の画面を開く | Preview 環境の URL が作られる | Pull Request の画面と Vercel の Deployment を確認する |
| Vercel | Preview 環境で `/todo` と `/api/db-check` を開く | Preview の URL を開く | ローカルと同じく CRUD ができ、DB に接続できる | Vercel の環境変数 `DATABASE_URL` が設定されているか確認する |

- Vercel の環境変数が未設定の場合は、Vercel 側で `DATABASE_URL` を追加してから Redeploy する。

## 11. PR をマージし、Production で確認する

| 対象ファイル | 作業内容 | 確認コマンド | 期待結果 | 失敗時に最初に見る場所 |
| --- | --- | --- | --- | --- |
| GitHub | Pull Request を `main` にマージする | GitHub の画面を開く | `main` にマージされる | Pull Request の競合を確認する |
| Vercel | Production 環境で `/todo` と `/api/db-check` を開く | 本番 URL を開く | ローカル・Preview と同じく CRUD ができ、DB に接続できる | Vercel の Production の Deployment と環境変数を確認する |

- 結果は `docs/todo/04_test_results.md` に記録する。
- Google フォームへの提出はユーザーが行う。本書の作業では提出しない。
