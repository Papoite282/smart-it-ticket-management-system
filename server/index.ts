import { createApp } from './app';
import { store } from './store';

const port = Number(process.env.PORT ?? 4000);
const app = createApp();

async function start() {
  await store.init();

  app.listen(port, () => {
    console.log(`Smart IT backend listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});