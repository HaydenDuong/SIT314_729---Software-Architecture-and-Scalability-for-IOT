const express = require('express');
const app = express();

const port = 3001;

app.get('/lightOn', function (req, res) {
    console.log("Switching Light On");
});

app.get('/lightOff', function (req, res) {
    console.log("Switching Light Off");
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});