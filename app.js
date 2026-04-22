const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

// ------------------- DB CONNECTION -------------------
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

main()
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("DB Error:", err));

// ------------------- MIDDLEWARE -------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ------------------- ROUTES -------------------

// HOME
app.get('/', (req, res) => {
    res.redirect('/listings');
});

// INDEX
app.get('/listings', async (req, res) => {
    const listings = await Listing.find({});
    res.render('index.ejs', { listings });
});

// NEW
app.get('/listings/new', (req, res) => {
    res.render('new.ejs');
});

// CREATE ✅ FINAL
app.post('/listings', async (req, res) => {
    try {
        console.log("BODY DATA 👉", req.body);

        const { title, description, price, location, country, image } = req.body;

        const newListing = new Listing({
            title,
            description,
            price,
            location,
            country,
            image: {
                url: image,
                filename: "listingimage"
            }
        });

        await newListing.save();
        res.redirect('/listings');

    } catch (err) {
        console.log(err);
        res.send("Error creating listing");
    }
});

// SHOW
app.get('/listings/:id', async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('show.ejs', { listing });
});

// EDIT
app.get('/listings/:id/edit', async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('edit.ejs', { listing });
});

// UPDATE ✅ FINAL
app.put('/listings/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const updatedData = {
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            location: req.body.location,
            country: req.body.country,
            image: {
                url: req.body.image,
                filename: "listingimage"
            }
        };

        await Listing.findByIdAndUpdate(id, updatedData);
        res.redirect(`/listings/${id}`);

    } catch (err) {
        console.log(err);
        res.send("Error updating listing");
    }
});

// DELETE
app.delete('/listings/:id', async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
});

// ------------------- SERVER -------------------
app.listen(8080, () => {
    console.log("Server running on port 8080");
});