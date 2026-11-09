import { createServer } from 'vite';
const port = Number(process.env.ASYNCLY_VISUAL_PREVIEW_PORT || 5173);
const server = await createServer({server:{host:'127.0.0.1',port,strictPort:true}});
await server.listen();
server.printUrls();
