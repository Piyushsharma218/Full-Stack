const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    let { q } = req.query;

    let allListings;

    if (q && q.trim() !== "") {
        const search = q.trim();

        allListings = await Listing.find({
            $or: [
                // 🔥 Exact location match (strong priority)
                { location: { $regex: search, $options: "i" } },

                // 🔥 Country match
                { country: { $regex: search, $options: "i" } },

                // 🔥 Title match (secondary)
                { title: { $regex: search, $options: "i" } }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings, q });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    console.log(" SHOW ROUTE HIT");
    console.log("LISTING ID:", req.params.id);

    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    console.log("LISTING DATA:", listing); 

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req,res,next) => {
    
       let response = await geocodingClient.forwardGeocode({
         query: req.body.listing.location,
         limit: 1 
        })
        .send();

        if (!response.body.features.length) {
        req.flash("error", "Invalid location! Please enter a valid place.");
        return res.redirect("/listings/new");
    }

        console.log("MAPBOX RESPONSE:", response.body.features[0]);


       let url = "";
       let filename = "";

       if (req.file) {
        url = req.file.path;
        filename = req.file.filename;
        }
       const newListing = new Listing(req.body.listing);
       newListing.owner = req.user._id;
       newListing.image = {url, filename};
       
       newListing.geometry = {
    type: "Point",
    coordinates: response.body.features[0].geometry.coordinates
};
       let savedListing = await newListing.save();
       console.log(savedListing);
       req.flash("success","New listing Created!");
       res.redirect("/listings");
    };

module.exports.editListing = async (req,res) => {
    let {id} =req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing, originalImageUrl});
};

module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
    }
    
    req.flash("success","Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        req.flash("error", "Listing already deleted!");
        return res.redirect("/listings");
    }
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    return res.redirect("/listings");
};
