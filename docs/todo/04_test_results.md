# TODOアプリ V1 テスト結果

## Neon（2026-11-10）

- プロジェクト：Abi、シンガポール（AWS Asia Pacific 1）、プロジェクトID royal-star-61853558、データベース neondb、Postgres 18、Freeプラン、ブランチ production。旧プロジェクト webapp-class と abi はユーザーの指示で削除し、作り直した。
- テーブル作成：Neon SQL Editor で `sql/todo/020_create_todo_tasks.sql` を実行し、成功。`todo_tasks`（id、title、completed、created_at、updated_at）が作成され、0件。成功。
- Vercel 環境変数：2026-11-10 に Vercel プロジェクト i-tproject-2026 の `DATABASE_URL` を設定済み。Production / Preview / Development のすべて、Secret型。接続文字列の値は記録していない。再デプロイはまだしていない。

## ローカル（2026-11-10、Neon 未接続の状態で確認）

- 日時：2026-11-10
- `npm run build`：成功。`dist/db.js`、`dist/index.js`、`dist/src/apps/todo/` が作られる。
- `/`：Hello World! が表示される。成功。
- `/todo`：TODO画面の HTML が表示される。成功。ただし、静的配信をルートより先に置くと `/todo` が `/todo/` へリダイレクトされるため、`index.ts` では静的配信をルートのあとに置いている。
- `/style.css`：200 で配信される。成功。
- `/todo/todo.js`：配信される。成功。
- `/api/db-check`：`{"status":"error","database":"disconnected"}` を返す。Neon に接続していないため、想定どおりの結果。DATABASE_URL を設定してから再確認が必要。
- REQ-01 一覧：`GET /api/v1/todos` は 500 を返す。Neon に接続していないため。DATABASE_URL を設定してから再確認が必要。
- REQ-02 登録：空タイトルで `POST /api/v1/todos` を呼ぶと 400 で `{"error":"タイトルを入力してください。"}` を返す。成功。正常系の登録は、Neon 接続後に確認が必要。
- REQ-03 完了状態の変更：Neon 接続後に確認が必要。
- REQ-04 削除：Neon 接続後に確認が必要。

## Vercel Preview

- Pull Request URL：
- Preview URL：
- `/todo`：
- `/api/db-check`：
- REQ-01 一覧：
- REQ-02 登録：
- REQ-03 完了状態の変更：
- REQ-04 削除：

## Vercel Production

- Production URL：https://i-tproject-2026-omega.vercel.app/（TODO 実装前のデプロイ）
- `/todo`：
- `/api/db-check`：
- REQ-01 一覧：
- REQ-02 登録：
- REQ-03 完了状態の変更：
- REQ-04 削除：
