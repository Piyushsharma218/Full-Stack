const express = require("express");
const router = express.Router({mergeParams: true});
const wrapasync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");


router.post("/",isLoggedIn, validateReview,wrapasync(async (req, res, next) => {
    console.log("POST /reviews HIT");
    console.log("PARAMS:", req.params);
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    next(); 
}), wrapasync(reviewController.createReview));

//delete review route

router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapasync(reviewController.destroyReview));

module.exports = router;