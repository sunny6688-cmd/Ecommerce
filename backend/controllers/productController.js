const Product = require("../models/productModels");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");

//Create a product function  -> Admin
exports.createProduct = catchAsyncErrors(async (req,res,next)=> {
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    })
})

//Get All product function
exports.getAllProduct = catchAsyncErrors(async (req,res)=> {

    const resultPerPage = 5;
    const productCount = await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultPerPage);
    const products = await apiFeature.query;
    res.status(200).json({
        success: true,
        products,
        productCount
    })
})

//Get Product Details
exports.getProductDetails = catchAsyncErrors(async (req,res,next) => {

    const product = await Product.findById(req.params.id);

    if(!product)
    {
        return next(new ErrorHandler("Product Not Found",404))
    }

    res.status(200).json({
        success: true,
        product
    })
})

exports.updateProduct = catchAsyncErrors(async (req,res,next)=> {

    let product = await Product.findById(req.params.id);

    if(!product)
    {
        return next(new ErrorHandler("Product Not Found",404))
    }
    product = await Product.findOneAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    })
})

//Delete Product.
exports.deleteProduct = catchAsyncErrors(async (req,res,next) => {

    const product = await Product.findById(req.params.id);

    if(!product)
    {
        return next(new ErrorHandler("Product Not Found",404))
    }

    await product.remove();
    res.status(200).json({
        success: true,
        message: "product Deleted Succesfully"
    })
})

//Create new Review or Update review 
exports.createProductReview = catchAsyncErrors(async (req,res,next)=>{

    const {rating,comment,productId} = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(rev=> rev.user.toString()===req.user._id)

    if(isReviewed)
    {
        product.reviews.forEach(rev => {
            if(rev.user.toString()===req.user._id)
            {
                rev.rating=rating;
                rev.comment=comment;
            }
        });
    }
    else
    {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let avg=0;
    product.reviews.forEach(rev=>{
        avg=avg+rev.rating;
    });

    product.ratings = avg/product.reviews.length;

    await product.save({validateBeforeSave:false});

    res.status(200).json({
        success: true
    })
});

//Get all review of a product.
exports.getProductReviews = catchAsyncErrors(async (req,res,next)=>{
    const product = await Product.findById(req.query.id);

    if(!product)
    {
        return next(new ErrorHandler(`Product Not found`,400));
    }
    res.status(200).json({
        success: true,
        review: product.reviews
    })
});

//Delete Product Review.
exports.deleteProductReviews = catchAsyncErrors(async (req,res,next)=>{
    const product = await Product.findById(req.query.productId);

    if(!product)
    {
        return next(new ErrorHandler(`Product Not found`,400));
    }

    const reviews = product.reviews.filter(rev=> rev._id.toString()!=req.query.id.toString())
    let avg=0;
    reviews.forEach(rev=>{
        avg=avg+rev.rating;
    });

    const ratings = avg/reviews.length;
    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId,{
        ratings,
        reviews,
        numOfReviews
    },{
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true
    })
});