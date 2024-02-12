const express = require('express')
const cors = require('cors')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 3000

//middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASS}@cluster0.6v8amsy.mongodb.net/?retryWrites=true&w=majority`;

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


    const menuCollection = client.db('bistroDB').collection('menu')
    const userCollection = client.db('bistroDB').collection('users')
    const reviewCollection = client.db('bistroDB').collection('review')
    const cartsCollection = client.db('bistroDB').collection('cart')

    //user Info
    app.post('/users', async (req, res) => {
      const user = req.body
      console.log(user);

      // can login if email doesn't exist on the database with using (email unique, upsert, simple checking)
      const query = { email : user.email}
      const existingUser = await userCollection.findOne(query)
      if(existingUser){
       return res.send({message: "User already exists", insertedId : null})
      }

      const result = await userCollection.insertOne(user)
      res.send(result)
    })

    // menu 
    app.get('/menu', async (req, res) => {
      const result = await menuCollection.find().toArray()
      res.send(result)
    })

    // review 
    app.get('/reviews', async (req, res) => {
      const result = await reviewCollection.find().toArray()
      res.send(result);
    })

    // cart collection
   


    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      const query = {'cartItem.email' : email}
      const result = await cartsCollection.find(query).toArray()
      // console.log(result)
      res.send(result)
    })

    app.post('/carts', async (req, res) => {
      const cart = req.body;
      const result = await cartsCollection.insertOne(cart)
      res.send(result)
    })

 
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id
      console.log(req, req.params, req.params.id);
      const query = {_id : new ObjectId(id)}
      const result = await cartsCollection.deleteOne(query)
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
  res.send('CRUD  is running ......!')
})

app.listen(port, () => {
  console.log(`App is  listening on port ${port}`)
})



