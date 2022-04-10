const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

const { campgroundSchema, reviewSchema } = require('./schema');
const Review = require('./models/review');

const app = express();

mongoose.connect('mongodb+srv://titsy:titsy123@cluster0.mtb4s.mongodb.net/yelp-camp?retryWrites=true&w=majority');

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log("Database connected!");
});
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else next();
}

app.get('/', (req, res) => {
    res.render('home');
});
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});


app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    const camp = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { camp });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const id = req.params.id;
    const camp = await Campground.findById(id);
    res.render('campgrounds/edit', { camp });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${camp._id}`);
}));

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async (req,res) => {
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));
//error handlers
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!', 404));
});
app.use((err, req, res, next) => {
    const { statuscode = 500 } = err;
    if (!err.message) err.message = "Something Went Wrong!";
    res.status(statuscode).render('error', { err });
});

app.listen(3000, () => {
    console.log("Serving on Port 3000.");
});