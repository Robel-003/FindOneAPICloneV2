/* generalize findOne API clone to query other databases and collections: 
    * sample_airbnb
    * sample_analytics
    * sample_geospatial
    * .....
* API endpoint: localhost:3000/findOne
* endpoint should accept POST request
* Instead of accepting query string 
    (example: localhost:3000/findOne?property_type=Apartment&bedrooms=2&beds=2)
* need to accept JSON body that accepts below properties
    (example: localhost:3000/findOne?databases=sample_mflix&collection=movies)
{
    database   : client.database   --> (ex: sample_airbnb, sample_mflix, sample_restaurants)
    collection : client.collection --> (ex: comments, movies, sessions, theaters, users)
    filter     : ...
        filter values specific to collection
    projection
        projection values specific to collection
}
*/

import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import express from 'express';
import cors from 'cors';

dotenv.config();
console.log(process.env);

const db_username = process.env.MONGO_DB_USERNAME;
const db_password = process.env.MONGO_DB_PASSWORD;
const db_url = process.env.MONGO_DB_URL;

const uri =
`mongodb+srv://${db_username}:${db_password}@${db_url}?retryWrites=true&w=majority`;

const client = new MongoClient(uri);


const app = express();

app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(express.json());


app.post('/findOne', async (req,res) => {
    try{
        const {database, collection, filter, projection} = req.body;
        // connecting to db (mongodb)
        await client.connect();
        const db = client.db(database);
        const coll = db.collection(collection);
        const listing = await coll.findOne(filter, projection);
        console.log(listing);
        res.type('json');
        res.status(200);
        res.json({
            data: listing
        })
    } catch (error) {
        console.log(error)  
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
});

app.use((req, res) => {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not found');
});

app.listen(app.get('port'), () => {
        console.log('Express started');
});
