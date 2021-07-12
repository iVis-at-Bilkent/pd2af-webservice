const FormData = require('form-data');
const express = require('express');
const axios = require('axios');
const request = require('request');

axios.defaults.timeout = 60000; // Default timeout is set to one minute
const app = express();
const bodyParser = require("body-parser");
// Change the port if maintainer specifies a port number
const PORT = process.env.PORT || 4000;
// Change the Conversion URL according to conversion server's URL, leave the /translate
const conversion_url = 'http://localhost:8080/translate';
app.get('/', function(req, res){
    res.sendFile(__dirname+'/index.html');
});
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(bodyParser.json({limit: '10mb'}));

app.use('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.listen(PORT, () => console.log('Server listening on port ' +PORT + '...'));
app.post('/convert', async (req, res) => {
    const form = new FormData();

    await form.append('file', req.body.file, {
        filename: req.body.filename,
        contentType: "text/plain"
    });

    await form.append('action', 'parse');
    await form.append('filename', req.body.filename);

    try {
        const response = await axios.post(conversion_url, form,
        {
            headers:{
                ...form.getHeaders()}
        });
        // console.log(response);
        if(response.data.error_message){
            let error = {};
            console.log("Returns error");
            error.message = "Conversion failed!";
            error.error = true;
            res.send(error);
        }else{
            var options = {
                host: 'localhost',
                port: 8080,
                path: '/' + response.data.af_filename
            };

            let filename =  response.data.af_filename.substr(0, response.data.af_filename.indexOf('.'));
            filename+= "_af.sbgn";

            // Get the XML file from the url
            request(response.data.af_fileurl, function (error, response, body) {
                res.send({body: body, filename: filename});
            });

        }
    } catch (error) {
        error.error = true;
        error.message = "Conversion timed out!";
        res.send(error);
    }
});


