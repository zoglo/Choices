import dev from 'rollup-plugin-dev'

const server = () => {
  const WATCH_HOST = process.env.WATCH_HOST;
  const WATCH_PORT = process.env.WATCH_PORT || 3001;

  if (!WATCH_HOST) {
    return void 0;
  }

  return dev({
    dirs: ['public'],
    host: WATCH_HOST,
    port: WATCH_PORT,
    extend: async (server) => {
      server.get('/data', (req, res) => {
        // prevent endpoint from being cached
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');

        const fakeData = [...new Array(50)].map((_, index) => ({
          label: `Label ${index + 1}`,
          value: `Value ${index + 1}`,
        }));

        setTimeout(() => {
          res.status(200).send(fakeData);
        }, 1000);
      });
    }
  });
};

export default server;