const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
require('dotenv').config()


const port = process.env.PORT || 9000;

const app = express()


const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credential: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cd6vky8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    const roomsCollection = client.db('edenSuite').collection('edenSuiteRoom')
    // Get all Rooms data from db
    app.get('/rooms', async (req, res) => {
      const result = await roomsCollection.find().toArray()

      res.send(result)
    })
    // Get a single rooms data from db using room id
    app.get('/rooms/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await roomsCollection.findOne(query)
      res.send(result)
    })
    
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello from Edensuite Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))