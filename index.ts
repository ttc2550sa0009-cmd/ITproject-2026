import express, { Request, Response } from 'express';
import path from 'path';
import { pool } from './db';
import { todoRouter } from './src/apps/todo/todoRouter';

const app = express(); // Expressアプリケーションを作成
const port: number = 3000; // ローカルで使用するポート番号

// ------------------------------
// Expressの基本設定
// ------------------------------
app.use(express.json()); // JSONのリクエスト本文を受け取れるようにする
app.use(express.urlencoded({ extended: true })); // フォームから送信されたデータを受け取れるようにする
app.set('view engine', 'ejs'); // テンプレートエンジンにEJSを設定
app.set('views', path.join(process.cwd(), 'views')); // EJSファイルを保存するフォルダーを指定

// ------------------------------
// ルーティング
// ------------------------------
// 「/」にアクセスされたときの処理
app.get('/', (req: Request, res: Response): void => {
  res.send('Hello World!');
});

// 接続確認「/api/db-check」
app.get('/api/db-check', async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// TODO画面「/todo」
app.get('/todo', (req: Request, res: Response): void => {
  res.render('todo/index');
});

// TODO API
app.use('/api/v1/todos', todoRouter);

// CSSや画像などの静的ファイルを公開する
// ルートのあとに置く。public/todo/ があるため、/todo が静的ファイル側に
// リダイレクトされないようにするため。
app.use(express.static(path.join(process.cwd(), 'public')));

// ------------------------------
// サーバー起動
// ------------------------------
app.listen(port, (): void => {
  console.log(`Server started: http://localhost:${port}`);
});
