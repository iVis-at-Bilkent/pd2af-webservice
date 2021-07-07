const FormData = require('form-data');
const express = require('express');
const axios = require('axios');
const app = express();
const bodyParser = require("body-parser");
const HOST = "localhost";
const PORT = process.env.PORT || 5555;
const conversion_url = 'http://ec2-3-140-243-255.us-east-2.compute.amazonaws.com/translate';
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
    // console.log("Adding");
    await form.append('file', req.body.file, {
        filename: req.body.filename,
        contentType: "text/plain"
    });
    // console.log("Added");
    await form.append('action', 'parse');
    await form.append('filename', req.body.filename);

    try {

        // console.log(form.getHeaders())
        // console.log("Before request");
        const response = await axios.post(conversion_url, form,
        // const response = await axios.post('http://localhost:8080/translate', form,
            {
                headers:{
                    ...form.getHeaders()}
            });
        console.log(response);
        if(response.data.error_message){
            let error = {};
            console.log("Returns error");
            error.message = response.data.error_message;
            error.error = true;
            res.send(error);
        }else{
            // let url = 'https://newtpd2af.herokuapp.com/?URL=' + response.data.af_fileurl;
            // await open(url);
            let filename =  response.data.af_filename.substr(0, response.data.af_filename.indexOf('.'));
            filename+= "_af.sbgn";
            res.send({url: response.data.af_fileurl, filename: filename});
        }
    } catch (error) {
        // console.log("Catched error");
        error.error = true;
        res.send(error);
    }
});


