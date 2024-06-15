const ErrorHandler = require("../utils/errorHandler");
const catchAsynErrors = require("../middleware/catchAsyncErrors");
const User= require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");

//register a user
exports.registerUser = catchAsynErrors(async(req,res,next)=>{
    const myCloud= await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder:"avatars",
        width:150,
        crop:"scale"
    });
    const {name,email,password,role}= req.body;
    const user = await User.create({
        name,
        email,
        password,
        role,
        avatar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url,
        },
    });
   sendToken(user,201,res);
})
//login user

exports.loginUser = catchAsynErrors(async (req,res,next)=>{

    const{email,password}= req.body;
    // checking if user has given password and email both

    if(!email || !password){
        return next(new ErrorHandler("please enter Email and password",400))
    }
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next (new ErrorHandler("Invalid email or password",401));
    }
    const isPasswordMatched = user.comparePassword(password);
    if(!isPasswordMatched){
        return next (new ErrorHandler("Invalid email or password",401));
    }
    sendToken(user,200,res);

})
//logout user

exports.logout = catchAsynErrors(async(req,res,next)=>{
    res.cookie("token",null,{
      expires:new Date(Date.now()),
     
    
    })
      res.status(200).json({
          success:true,
          message:"logged out",
      });
  });

  //forget password

  exports.forgetPassword = catchAsynErrors(async (req,res,next)=>{
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorHandler("user not found",404));
    }
    //get resertPassword Token
    const resetToken =user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});
    // link for reseting
    const resetPasswordUrl= `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const message = `your password reset token is : \n\n ${resetPasswordUrl} \n\n If you havenot requested this email then , please ignore it`;
    try{
        await sendEmail({
            email:user.email,
            subject:`ecommerce password recovery`,
            message,
        });
        res.status(200).json({
            success:true,
            message:`email sent to ${user.email} successfully `,
        });

    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPassordExpire = undefined;

        await user.save({validateBeforeSave:false});
        return next(new ErrorHandler(error.message,500));
    }
  
  });
  exports.resetPassword = catchAsynErrors(async (req,res,next)=>{
    // creating token hash 
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPassordExpire:{ $gt: Date.now() },
    });
    if(!user){
        return next(new ErrorHandler("Reset password token is invalid or has been expired",404));
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("password doesnot match",400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPassordExpire = undefined;

    await user.save();
    sendToken(user,200,res);
  });

  //get user details
exports.getUserDetails = catchAsynErrors(async (req,res,next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user,
    })

  })

//update user password
  exports.updatePassword = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if(!isPasswordMatched){
        return next (new ErrorHandler("old password is incorrect",400));
    }
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password doesnot match",400));

    }
    user.password = req.body.newPassword;
    await user.save();
    sendToken(user,200,res);


    res.status(200).json({
        success:true,
        user,
    })

  })

  //update user profile


  exports.updateProfile = catchAsyncErrors(async (req, res, next)=>{
    const newUserData={
        name: req.body.name,
        email: req.body.email,
       
    };
    // we will add cloudinary later
    if(req.body.avatar !==""){
        const user= await User.findById(req.user.id);
        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);
        const myCloud= await cloudinary.v2.uploader.upload(req.body.avatar,{
            folder:"avatars",
            width:150,
            crop:"scale"
        });
        newUserData.avatar={
            public_id: myCloud.public_id,
            url:myCloud.secure_url,
        }

    }
     const user =  await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        usefindAndModify:false,
     });
     res.status(200).json({
        success:true,
     });
  }) ; 


  //get all users (admin)

  exports.getAllUser = catchAsyncErrors(async (req,res,next)=>{
    const users= await User.find();
    
    res.status(200).json({
        success:true,
        users,
    });
  });
  //get single user(admin)
  exports.getSingleUser = catchAsyncErrors(async (req,res,next)=>{
    const user= await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`user doesnot exists with Id : ${req.params.id}`));
    }
    res.status(200).json({
        success:true,
        user,
    })
  })
//update user role
  exports.updateUserRole = catchAsyncErrors(async (req, res, next)=>{
    const newUserData={
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };
    // we will add cloudinary later
     const user =  await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        usefindAndModify:false,
     });
     res.status(200).json({
        success:true,
     });
  }) ; 

  //delete user

  exports.deleteProfile = catchAsyncErrors(async (req, res, next)=>{
    
    const user= await user.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`user doesnot exists with id : ${req.params.id}`))
    }
    await user.remove();
     res.status(200).json({
        success:true,
     });
  }) ; 