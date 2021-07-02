const FormData = require('form-data');
const express = require('express');
const axios = require('axios');
const app = express();
const bodyParser = require("body-parser");
const HOST = "localhost";
const PORT = process.env.PORT || 5555;
const fs = require('fs');
const open = require('open');
app.get('/', function(req, res){
    res.sendFile(__dirname+'/index.html');
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.listen(PORT, () => console.log('Server listening on port ' +PORT + '...'));
app.post('/deneme', async (req, res) => {
    // console.log(typeof req.body.file);
    // let options = {
    //     header: 'Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryQzlzmdgbQfbawnvk',
    //     filename: req.body.filename,
    //     filepath: './' + req.body.filename
    // };

    // var file = fs.open(req.body.filename);

    // await fs.writeFile(req.body.filename, req.body.file + "</xml>", await function (err) {
    //     if (err) throw err;
    //     console.log('File is created successfully.');
    // });

    const form = new FormData();

    await form.append('file', req.body.file, {
        filename: req.body.filename,
        contentType: "text/plain"
    });
    // await form.append('file', fs.readFileSync(req.body.filename), req.body.filename);
    await form.append('action', 'parse');
    await form.append('filename', req.body.filename);
    console.log("-------------------")
    // console.log('after form');
    // console.log(form);
    try {

        console.log(form.getHeaders())

        const response = await axios.post('http://ec2-3-140-243-255.us-east-2.compute.amazonaws.com/translate', form,
            {
                headers:{
                    ...form.getHeaders()}
            })

        console.log(response)
        // console.log("----------")
        if(response.data.error_message){
            let error = {};
            error.message = response.data.error_message;
            // error.error = true;
            res.send(error);
        }else{
            // open('https://newtpd2af.herokuapp.com/?URL=' + response.data.af_fileurl);
            await open('https://newtpd2af.herokuapp.com/?URL=' + response.data.af_fileurl);

            // await fs.unlink(req.body.filename, ()=>{});
            // await fs.close();
            res.send(response);
        }
    } catch (error) {
        // await fs.unlink(req.body.filename, ()=>{});

        error.error = true;
        // console.log(error);
        // console.log('error');
        res.send(error);
    }
});


