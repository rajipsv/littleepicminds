const app = require('./api/index');
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
