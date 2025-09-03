let request = require('request');

let url1 = `http://localhost:3001/lightOn`;
let url2 = `http://localhost:3001/lightOff`;

request(url1, function (error, response, body) {
if(error){
    console.log('error:', error);
}
});

request(url2, function (error, response, body) {
if(error){
    console.log('error:', error);
}
});