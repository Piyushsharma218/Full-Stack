const express = require("express");
const router = express.Router();
const wrapasync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });
//index route and create route

router.route("/")
 .get(wrapasync(listingController.index))
 .post(isLoggedIn,upload.single('listing[image][url]'),validateListing,wrapasync(listingController.createListing));

//NEW ROUTE

router.get("/new", isLoggedIn, listingController.renderNewForm);

//show route and update route and delete route

router.route("/:id")
 .get(wrapasync(listingController.showListing))
 .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image][url]'),
    validateListing,
    wrapasync(listingController.updateListing))
 .delete(isLoggedIn,isOwner,wrapasync(listingController.destroyListing));
  
//EDIT ROUTE

router.get("/:id/edit",isLoggedIn,isOwner,wrapasync(listingController.editListing));

const reviewRoutes = require("./review.js");
router.use("/:id/reviews", reviewRoutes);


module.exports = router;