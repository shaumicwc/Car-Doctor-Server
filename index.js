const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3619;



// middleware
app.use(cors());
app.use(express.json());

// app.use(helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"]
//     }
//   }));
// process.env.DB_USER
// process.env.DB_PASS


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4kfci0x.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

      

        const serviceCollection = client.db('CarDoctor').collection('services');
        const bookingCollection = client.db('CarDoctor').collection('bookings');
        // console.log(serviceCollection)

        app.get('/services', async (req, res) => {
            try {
                const cursor = serviceCollection.find();
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.log(error.message);
                res.status(500).send('Internal Server Error');
            }
        });



        app.get('/services/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const result = await serviceCollection.findOne(query);
                res.send(result);
            } catch (error) {
                res.send(error.message)
            }
        })

        app.get('/bookings', async (req, res) => {
            // console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            // console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        });

        app.patch('/bookings/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const updatedBooking = req.body;
                // console.log(updatedBooking);
                const updateDoc = {
                    $set: {
                        status: updatedBooking.status
                    },
                };
                const result = await bookingCollection.updateOne(filter, updateDoc);
                res.send(result);
            } catch (error) {
                res.send(error.message)
            }
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    }
    catch (error) {
        console.log(error.message)
    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('doctor is running')
})

app.listen(port, () => {
    console.log(`Car Doctor Server is running on port ${port}`)
})