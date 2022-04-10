const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');

mongoose.connect('mongodb+srv://titsy:titsy123@cluster0.mtb4s.mongodb.net/yelp-camp?retryWrites=true&w=majority');

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log("Database connected!");
});

const sample = arr => arr[Math.floor(Math.random()*arr.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()* 20) + 10;
        const camp = new Campground({
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image:"https://source.unsplash.com/collection/483251",
            description:"Lorem ipsum dolor sit, amet consectetur adipisicing elit. Neque ipsa sit delectus, nobis quidem, perspiciatis alias doloribus laudantium enim blanditiis asperiores aperiam laboriosam temporibus iste reiciendis quos velit dolore aspernatur.",
            price,
        });
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});