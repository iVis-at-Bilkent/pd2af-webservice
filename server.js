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
    res.sendFile('index.html');
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

    // let options = {
    //     header: 'Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryQzlzmdgbQfbawnvk',
    //     filename: req.body.filename,
    //     filepath: './' + req.body.filename
    // };

    // var file = fs.open(req.body.filename);

    await fs.writeFile(req.body.filename, req.body.file, await function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
    });

    const form = new FormData();

    await form.append('file', await fs.createReadStream(req.body.filename));
    // await form.append('file', fs.readFileSync(req.body.filename), req.body.filename);
    await form.append('action', 'parse');
    await form.append('filename', req.body.filename);

    console.log('after form');
    // console.log(form);
    try {

        console.log(form.getHeaders())

        const response = await axios.post('http://localhost:8080/translate', form,
            {
                headers:{
                    ...form.getHeaders()}
            })

        // console.log(response)
        // console.log("----------")
        open('http://localhost:3000/?URL=' + response.data.af_fileurl);
        fs.unlink(req.body.filename, ()=>{});
        res.send("Success");

    } catch (error) {
        error.error = true;
        // console.log(error);
        // console.log('error');
        res.send(error);
    }
});


