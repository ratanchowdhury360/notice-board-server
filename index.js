const express = require('express')
const cors = require('cors')
const app = express();
require('dotenv').config()
const port = process.env.PORT || 3000;


// middleware
app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yg74xme.mongodb.net/?appName=Cluster0`;


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


    //database and collections
    const noticeCollection = client.db('noticeDB').collection('notice');


    // Read all notices
    app.get('/notice', async (req, res) => {
      try {
        const notices = await noticeCollection.find().toArray();
        res.send(notices);
      } catch (error) {
        console.error('Failed to fetch notices', error);
        res.status(500).send({ message: 'Failed to fetch notices.' });
      }
    });

    // Read single notice by custom id
    app.get('/notice/:id', async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).send({ message: 'Invalid notice id.' });
      }

      try {
        const notice = await noticeCollection.findOne({ id: id });
        if (!notice) {
          return res.status(404).send({ message: 'Notice not found.' });
        }
        res.send(notice);
      } catch (error) {
        console.error('Failed to fetch notice', error);
        res.status(500).send({ message: 'Failed to fetch notice.' });
      }
    });

    // CREATE a new notice
    app.post('/notice', async (req, res) => {
      const newNotice = req.body;

      try {
        const result = await noticeCollection.insertOne(newNotice);
        res.status(201).send({ message: 'Notice created', noticeId: result.insertedId });
      } catch (error) {
        console.error('Failed to create notice', error);
        res.status(500).send({ message: 'Failed to create notice.' });
      }
    });

    // UPDATE a notice by custom id
    app.put('/notice/:id', async (req, res) => {
      const id = parseInt(req.params.id);
      const updatedData = req.body;

      if (isNaN(id)) {
        return res.status(400).send({ message: 'Invalid notice id.' });
      }

      try {
        const result = await noticeCollection.updateOne(
          { id: id },
          { $set: updatedData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: 'Notice not found.' });
        }

        res.send({ message: 'Notice updated successfully.' });
      } catch (error) {
        console.error('Failed to update notice', error);
        res.status(500).send({ message: 'Failed to update notice.' });
      }
    });

    // DELETE a notice by custom id
    app.delete('/notice/:id', async (req, res) => {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).send({ message: 'Invalid notice id.' });
      }

      try {
        const result = await noticeCollection.deleteOne({ id: id });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: 'Notice not found.' });
        }

        res.send({ message: 'Notice deleted successfully.' });
      } catch (error) {
        console.error('Failed to delete notice', error);
        res.status(500).send({ message: 'Failed to delete notice.' });
      }
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


    // Start the server after successful database connection
    app.get('/', (req, res) => {
      res.send('Hello World!')
    })

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);