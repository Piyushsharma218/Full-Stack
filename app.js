const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingsSchema, reviewSchema } = require("./schema.js");
const listings = require("./routes/listing.js");
 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const MONGO_URL = "mongodb://localhost:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log("error connecting to DB", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
  res.send("hi i am root");
});



const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, result.error);
  } else {
    next();
  }
};

app.use("/listings",listings)


//review Post Rout
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    console.log(req.params);
    let newreview = new Review(req.body.review);

    listing.reviews.push(newreview);

    await newreview.save();
    await listing.save();

    res.redirect(`/listings/${listing.id}`);
  }),
);

//delete Route review
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;  
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
}));


//   app.get("/testListing", async (req, res) => {
//     const sampleListing = new Listing({
//       title: "My New Villa",
//       description: "By The beach",
//       price: 1200,
//       location: "Goa",
//       country: "India",
//     });

//   await sampleListing.save();
//   console.log("Sample was save");
//   res.send("successful Testing");
// });aesfeafbkebwjf

app.use((req, res, next) => {
  next(new ExpressError(404, "page not found"));
});

app.use((err, req, res, next) => {
  let { statuscode = 500, message = "something went wrong" } = err;
  res.status(statuscode).render("error.ejs", { err });
  // res.status(statuscode).send(message);
  // res.send("something went wrong")
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
