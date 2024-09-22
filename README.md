# Development Support AI Tools

開発時に便利そうなAI機能をいろいろ載せる予定のWebツールです。  
なおin-browserでOpenAI APIを呼び出すため、ローカルもしくはBASIC認証を付けたURLからご利用ください。

## Prepare environments

First, please create an `.env` file with your OpenAI API-key into repository root:

```ini
PUBLIC_OPENAI_API_KEY=sk-xxxxxx
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `npm run preview`.
