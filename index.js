const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eqwoetz.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        await client.connect();

        const db = client.db('taste_house')
        const foodsCollection = db.collection('foods')

        app.get('/foods', async (req, res) => {

            const email = req.query.email
            const query = {}
            if (email) {
                query.sellerEmail = email
            }

            const cursor = foodsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/topFoods', async (req, res) => {
            const cursor = foodsCollection.find().limit(6)
            const result = await cursor.toArray()
            res.send(result)
        })



        app.post('/foods', async (req, res) => {
            const newFoodData = req.body
            const {title, shortDescription, fullDescription, price, priority, relevantField, imageUrl, sellerEmail, sellerUsername, category} = newFoodData
            const newFood = {
                title,
                shortDescription,
                fullDescription,
                price,
                date: new Date().toISOString().slice(0, 10),
                priority,
                relevantField,
                imageUrl,
                sellerEmail,
                sellerUsername,
                category
            }
            
            const result = await foodsCollection.insertOne(newFood)
            res.send(result)
        })

        app.delete('/foods/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await foodsCollection.deleteOne(query)
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('TasteHouse server is running.')
})

app.listen(port, () => {
    console.log(`TasteHouse server is running on port: ${port}`)
})