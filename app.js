const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapasync.js');
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema} = require('./schema.js');
const e = require('express');



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


//-----------JOI FNC----------------
function validateListing(req, res, next) {
    const { error } = listingSchema.validate(req.body);
    
    if (error) {
        let errMessage=error.details.map((el) => el.message).join(', ');
        throw new ExpressError(400, errMessage);
    } else {
        next();
    }
}
// ------------------- ROUTES -------------------

// HOME
app.get('/', (req, res) => {
    res.redirect('/listings');
});

// INDEX
app.get('/listings', wrapAsync(async (req, res) => {
    const listings = await Listing.find({});
    res.render('index.ejs', { listings });
}));

// NEW
app.get('/listings/new', (req, res) => {
    res.render('new.ejs');
});

// CREATE
app.post('/listings', 
    validateListing,
    wrapAsync(async (req, res) => {

    const { title, description, price, location, country, image } = req.body.listing;

    const newListing = new Listing({
        ...req.body.listing,
        image: {
            url: image,
            filename: "listingimage"
        }
    });

    await newListing.save();
    res.redirect('/listings');
}));

// SHOW
app.get('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;

    // prevent invalid ObjectId crash
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Listing not found ❌");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found ❌");
    }

    res.render('show.ejs', { listing });
}));

// EDIT
app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Listing not found ❌");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found ❌");
    }

    res.render('edit.ejs', { listing });
}));

// UPDATE
app.put('/listings/:id', 
    validateListing,
    wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Listing not found ❌");
    }

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
}));

// DELETE
app.delete('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Listing not found ❌");
    }

    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

// ------------------- 404 HANDLER -------------------
app.use((req, res) => {
    res.status(404).render('error.ejs', {
        message: "Page Not Found ❌"
    });
});

// ------------------- ERROR HANDLER -------------------
app.use((err, req, res, next) => {
    console.log(err);

    let { statusCode = 500, message = "Something went wrong ❌" } = err;

    res.status(statusCode).render('error.ejs', { message });
});

// ------------------- SERVER -------------------
app.listen(8080, () => {
    console.log("Server running on port 8080");
});