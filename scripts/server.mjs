import dev from 'rollup-plugin-dev';

export default function server() {
  const WATCH_HOST = process.env.WATCH_HOST;
  const WATCH_PORT = process.env.WATCH_PORT || 3001;

  if (!WATCH_HOST) {
    return void 0;
  }

  return dev({
    dirs: ['public'],
    host: WATCH_HOST,
    port: WATCH_PORT,
  });
};