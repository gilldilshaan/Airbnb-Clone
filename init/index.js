const mongoose=require('mongoose');
const initData = require('./data.js');
const Listing=require('../models/listing.js');

// connecting to MongoDB
main()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB", err);
    });

async function main() {
await mongoose.connect('mongodb://localhost:27017/wanderlust');
}

const initDb=async()=>{
        await Listing.deleteMany({})
        await Listing.insertMany(initData.data);
        console.log("Database initialized with sample data");
};
initDb();