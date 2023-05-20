const express = require("express");
const app = express();
require("dotenv").config();
var cors = require("cors");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tewydk3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db("toymarketDB");
    const dollsCollection = database.collection("dolls");

    app.post("/dolls", async (req, res) => {
      const tollsData = req.body;
      const result = await dollsCollection.insertOne(tollsData);
      res.send(result);
    });

    app.delete("/dolls/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await dollsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/dolls", async (req, res) => {
      let query = req.query;
      console.log(query);

      if (req.query?.email) {
        query = { email: req.query.email };
      }

      if (req.query?.name) {
        query = { name: req.query.name };
      }

      if (req.query?.subcategory) {
        query = { subcategory: req.query.subcategory };
      }

      const sort = req.query.sort == "Ascending";
      console.log(sort);
      const cursor = dollsCollection
        .find(query)
        .limit(20)
        .sort({ price: sort ? 1 : -1 });

      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });

    app.put("/dolls/:id", async (req, res) => {
      const id = req.params.id;
      const updatedtoy = req.body;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          price: updatedtoy.price,
          quantity: updatedtoy.quantity,
          details: updatedtoy.details,
        },
      };
      const result = await dollsCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.send(result);
    });

    app.get("/dolls/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await dollsCollection.findOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
