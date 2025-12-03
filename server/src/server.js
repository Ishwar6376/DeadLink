// Importing module
import express from 'express';
const app = express();
const PORT = 3000;
app.get('/', (req, res) => {
    res.send('Welcome to typescript backend!');
});
// Server setup
app.listen(PORT, () => {
    console.log('The application is listening '
        + 'on port http://localhost/' + PORT);
});
//# sourceMappingURL=server.js.map