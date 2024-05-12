const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


const port = process.env.PORT || 5000;

const app = express()


const corsOptions = {
  origin: ['http://localhost:5173',
    'http://localhost:5174',],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())




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
    const reviewCollection = client.db('edenSuite').collection('edenSuiteReview')


    //jwt generator
    app.post('/jwt', async (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '7d'
      })
      console.log(token);
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })

    // Get all Rooms data from db
    app.get('/rooms', async (req, res) => {
      const result = await roomsCollection.find().toArray()

      res.send(result)
    })

    // app.get('/rooms', async (req, res) => {
    //   const sort = req.query.sort;

    //   let options = {};
    //   if (sort === 'asc' || sort === 'desc') {
    //     options.sort = { price_per_night: sort === 'asc' ? 1 : -1 };
    //   }
    //   const result = await roomsCollection.find({}, options).toArray();
    //   res.send(result);

    // });


    // Get a single rooms data from db using room id
    app.get('/rooms/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await roomsCollection.findOne(query)
      res.send(result)
    })


    app.put('/rooms/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateProducts = req.body;
      const products = {
        $set: {
          bookingFrom: updateProducts.bookingFrom,
          availability: updateProducts.availability,
          bookingTo: updateProducts.bookingTo,
          email: updateProducts.email,
          name: updateProducts.name,
        }
      }
      const result = await roomsCollection.updateOne(filter, products, options)
      // console.log(result);
      res.send(result)
    })

    app.get('/myBooking/:email', async (req, res) => {
      console.log(req.params.email);
      const result = await roomsCollection.find({ email: req.params.email }).toArray();
      res.send(result)
    })

    app.post('/review', async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await reviewCollection.insertOne(newProduct)
      res.send(result)
  })



    // await client.db("admin").command({ ping: 1 });
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