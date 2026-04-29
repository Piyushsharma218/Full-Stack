const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
    console.log("CONTROLLER STARTED");

    let { id } = req.params;

    let listing = await Listing.findById(id);

 
    if (!listing) {
        console.log("LISTING NOT FOUND IN DB");
        throw new Error("Listing not found in DB");
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview._id);

    await newReview.save();
    await listing.save();

    console.log("REVIEW SAVED");

    req.flash("success","New review Created!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async(req,res)=>{
    let {id, reviewId} = req.params;
    
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);

};