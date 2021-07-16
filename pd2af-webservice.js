const FormData = require('form-data');
const express = require('express');
const axios = require('axios');
axios.defaults.timeout = 60000; // Default timeout is set to one minute
const request = require('request');
const app = express();
const bodyParser = require("body-parser");
// Change the port if maintainer specifies a port number
const PORT = process.env.PORT || 4000;
// Change the Conversion URL according to conversion server's URL, leave the /translate
// const conversion_url = 'http://139.179.21.94:3000/translate';
const conversion_url = 'http://localhost:3000/translate';
// const conversion_url = 'http://ec2-3-140-243-255.us-east-2.compute.amazonaws.com/translate';
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
            let filename =  response.data.af_filename.substr(0, response.data.af_filename.indexOf('.'));
            filename+= "_af.sbgn";

            // Get the XML file from the url
            request(response.data.af_fileurl, function (error, res1, body) {
                res.send({body: body, filename: filename});
            });

        }
    } catch (error) {
        error.error = true;
        error.message = "Conversion timed out!";
        res.send(error);
    }
});


