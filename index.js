const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.up5eg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const serviceCollection = client.db('carDoctorPractice').collection('services');
    const bookingCollection = client.db('carDoctorPractice').collection('booking');

    // service related api
    app.get('/services', async(req, res) => {
        const result = await serviceCollection.find().toArray();
        res.send(result);
    });

    app.get('/service/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const options = {
            projection: {title: 1, img: 1, price: 1, description: 1}
        };
        const result = await serviceCollection.findOne(query, options);
        res.send(result);
    });

    // booking related api
    app.post('/booking', async(req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });
    app.get('/booking', async(req, res) => {
      let query = {}
      if(req.query.email){
        query = {email: req.query.email}
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });
    app.delete('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const result = await bookingCollection.deleteOne(filter);
      res.send(result);
    });
    app.patch('/booking/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const status = req.body.status;
      const updateDoc = {
        $set: {status}
      };
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result)
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from Car Doctor');
})
app.listen(port, () => {
    console.log(`Listening at port: ${port}`)
})