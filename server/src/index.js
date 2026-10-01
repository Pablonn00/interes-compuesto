import { createApp } from './app.js';

const port = process.env.PORT || 3001;
const app = createApp();

app.listen(port, () => {
  console.log(`API de interés compuesto escuchando en http://localhost:${port}`);
});
