
const Product= require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsynErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");


//create product--- Admin

exports.createProduct= catchAsynErrors(async(req,res,next)=>{

    req.body.user= req.user.id;

    const product= await Product.create(req.body);
    res.status(201).json({
        success:true,
        product
    })

});

//get all products 

exports.getAllProducts= catchAsynErrors(async(req,res)=>{
    const resultperPage= 8;
    const productsCount= await Product.countDocuments();
   const apifeature= new  ApiFeatures(Product.find(),req.query).search().filter().pagination(resultperPage);
    const products= await apifeature.query;
    res.status(200).json({message:"Route is working fine",products,productsCount,})
})

//update products

exports.updateProduct = catchAsynErrors(async(req,res)=>{
    let prod = Product.findById(req.params.id);
    if(!prod){
        return res.status(500).json({
            success:false,
            message:"Product not found"
        })
    }
    prod = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    res.status(200).json({
        success:true,
        prod
    }

    )

    
});

// delete product

 exports.deleteProduct = catchAsynErrors(async(req, res, next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return res.status(500).json({
            success:false,
            message:"product not found"
        })
    }
    await product.deleteOne();
    res.status(200).json({
        success:true,
        message:"Product deleted successfully"
    })
 });
 // get product - details
 exports.getProductDetails = catchAsynErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    res.status(200).json({
        success:true,
        message:"Product found successfully",
        product,
        
    })

 });

 //create new review or update the review

 exports.createProductReview = catchAsyncErrors(async (req,res,next)=>{
    const {rating,comment,productId}= req.body;
    const review = {
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    };
    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(rev=>rev.user.toString()===req.user._id.toString());
    if(isReviewed){
     product.reviews.forEach(rev=>{
        rev.rating = rating,
        rev.comment = comment
     })
    }
    else{
        product.reviews.push(review);
        product.numOfReviews= product.reviews.length;

    }
    // rating calculation 
    let avg =0;
    product.ratings= product.reviews.forEach(rev=>{
        avg= avg+ rev.rating;
    }) 
    product.ratings= avg/ product.reviews.length;
    await product.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
    });
 })

 // get all reviews of a product
 exports.getProductReviews = catchAsyncErrors(async (req,res,next)=>{
    const product = await Product.findById(req.query.id);
    if(!product){
        return next(new ErrorHandler("product not found",404));
    }
    res.status(200).json({
        success:true,
        reviews:product.reviews,
    });
 })

 //delete reviews
 exports.deleteReviews = catchAsyncErrors(async (req,res,next)=>{
    const product = await Product.findById(req.query.productId);
    if(!product){
        return next(new ErrorHandler("product not found",404));
    }
    const reviews = product.reviews.filter(rev=>rev._id.toString()!== req.query.id.toString());
    let avg =0;
    reviews.forEach(rev=>{
        avg= avg+ rev.rating;
    }) ;

    const ratings= avg/ product.reviews.length;
    const numOfReviews = reviews.length;
    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews,
    },{
            new:true,
            runValidators:true,
            useFindAndModify:false
        }
    );
    res.status(200).json({
        success:true,
        
    });
 })

   