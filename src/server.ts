import express from 'express';

const app = express();
const port:Number = 3000;
app.use(express.static())

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
