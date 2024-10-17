# スーパーこよみ

## 起動方法

トップディレクトリに `.env.local` を作成し、以下の内容を記述します。

```sh
DATABASE_URL=postgresql://admin:password@localhost:5432/superkoyomi
GOOGLE_CLIENT_ID=<チームメンバーから共有されたクライアントID>
GOOGLE_CLIENT_SECRET=<チームメンバーから共有されたクライアントシークレット>
```

DB を起動しておきます。

```console
docker compose up -d
```

初回起動の場合は DB のセットアップが必要です。

```console
npm install
export DATABASE_URL=postgresql://admin:password@localhost:5432/superkoyomi
npx prisma migrate dev
```

アプリケーションを起動します。

```console
npm run dev
```

[http://localhost:3000](http://localhost:3000) にアクセスするとアプリケーションが表示されます。
