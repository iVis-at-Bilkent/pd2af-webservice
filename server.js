const FormData = require('form-data');
const express = require('express');
const axios = require('axios');
const app = express();
const bodyParser = require("body-parser");
// Change the 5555 if another port is going to be assigned
const PORT = process.env.PORT || 5555;
// After deploying Conversion Server, change the URL accordingly but leave the /translate
const conversion_url = 'http://ec2-3-140-243-255.us-east-2.compute.amazonaws.com/translate';
app.get('/', function(req, res){
    res.sendFile(__dirname+'/index.html');
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Allow requests from anywhere (CORS policy requirements)
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

        // console.log(form.getHeaders())
        // Send data to Conversion server with axios post
        const response = await axios.post(conversion_url, form,
        {
                headers:{
                    ...form.getHeaders()}
        });
        // console.log(response);
        // If Converesion Server returns error, send the message 
        if(response.data.error_message){
            let error = {};
            // console.log("Returns error");
            error.message = response.data.error_message;
            error.error = true;
            res.send(error);
        }else{
            // Change filename from filename.af.sbgn to filename_af.sbgn
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


