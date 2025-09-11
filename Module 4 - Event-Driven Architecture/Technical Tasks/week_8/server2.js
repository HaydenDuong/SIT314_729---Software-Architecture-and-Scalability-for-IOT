var weather = require('weather-js'); 

const express = require('express');
const app = express();
const port = 3010;
const base = `${__dirname}/public`;
app.use(express.static('public'));

app.get('/', (req, res) => {
    weather.find({search: 'Melbourne, AU', degreeType: 'C'}, function(err, result) {
    temp = result[0].current.temperature;

    if(temp>10){
        var page = "<p>Smart-heating</p>"+"Its a warm "+temp+"C, "+"turning heating off";
        //send a MQTT command to switch off the heating.
        res.send(page);
    }
    else{
        var page = "<p>Smart-heating</p>"+"Its a cold "+temp+"C, "+"putting heating on";
        //send a MQTT command to switch on the heating.
        res.send(page);
    }
    })
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});