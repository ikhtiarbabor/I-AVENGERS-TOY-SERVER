const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.1yvmtut.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect((err) => {
      if (err) {
        console.log(err);
        return;
      }
    });
    // Send a ping to confirm a successful connection
    const toysCollection = client.db('avengersToysDB').collection('allToys');
    const userCollection = client.db('avengersToysDB').collection('allUsers');
    app.get('/allToys', async (req, res) => {
      let query = {};
      console.log(req.query);
      if (req.query?.email && req.query?.sellerName) {
        query = { email: req.query.email, sellerName: req.query.sellerName };
      } else if (req.query.ascending === 'true') {
        const sort = { price: 1 };
        const result = await toysCollection.find(query).sort(sort).toArray();
        return res.send(result);
      } else if (req.query.ascending === 'false') {
        const sort = { price: -1 };
        const result = await toysCollection.find(query).sort(sort).toArray();
        return res.send(result);
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });
    app.post('/allToys', async (req, res) => {
      const newToy = req.body;
      const result = await toysCollection.insertOne(newToy);
      res.send(result);
    });

    app.get('/allToys/:id', async (req, res) => {
      const filter = { _id: new ObjectId(req.params.id) };
      const result = await toysCollection.findOne(filter);
      result.send(result);
    });
    app.delete('/allToys/:id', async (req, res) => {
      const filter = { _id: new ObjectId(req.params.id) };
      const result = await toysCollection.deleteOne(filter);
      res.send(result);
    });

    app.patch('/allToys/:id', async (req, res) => {
      const newToy = req.body;
      const filter = { _id: new ObjectId(req.params.id) };
      const updateToy = {
        $set: {
          ...newToy,
        },
      };
      const result = await toysCollection.updateOne(filter, updateToy);
      res.send(result);
    });

    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('avengers toy is running ');
});

app.listen(port, () => {
  console.log(port);
});
