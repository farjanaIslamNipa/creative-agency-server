const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m0vup.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 5000;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const adminServiceCollection= client.db("creativeDatabase").collection("serviceData");
    const orderCollection= client.db("creativeDatabase").collection("OrderData");
    

    // for image upload
    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        console.log(title, description, file);
        file.mv(`${__dirname}/services/${file.name}`, err => {
            if(err){
                console.log(err);
                return res.status(500).send({msg: 'Failed to upload image'})
            }
            return res.send({name: file.name, path: `${file.name}`})
        })
    })
    

    // for sending order data
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        orderCollection.insertOne(order)
        .then(result => {
            res.send(result.insertedCount > 0 )
        })
    })


    // for showing all orders at admin service list page
    app.get('/orders', (req, res) => {
        orderCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    // for single user order list 
    app.get('/singleUserOrder', (req, res) => {
        // console.log(req.query.email);
        orderCollection.find({email: req.query.email})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })

});



app.get('/', (req, res) => {
    res.send("Creative agency server")
})

app.listen(process.env.PORT || port);
