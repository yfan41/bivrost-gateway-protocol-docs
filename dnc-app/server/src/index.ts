import { loadConfig } from './config.js';
import { buildApp } from './app.js';

const config = loadConfig();
const { app, schedulers } = await buildApp(config, { logger: true });

schedulers.start();

app.listen({ port: config.port, host: '0.0.0.0' }).then((address) => {
  app.log.info(`DNC app listening at ${address}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    schedulers.stop();
    void app.close().then(() => process.exit(0));
  });
}
