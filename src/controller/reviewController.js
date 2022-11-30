const bookModel = require("../models/booksModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");
const mongoose = require('mongoose')
const { ISBNValidate, isEmpty }  = require('../validations/validators');
const { validate } = require("../models/booksModel");




//------- POST /books/:bookId/review -----------------
const createdReview = async function (req,res){
    try{
        let requestBody = req.body;
        let bookId = req.params.bookId;

        //destructure
        let { reviewedBy, rating, review} = requestBody;
        
        if(!reviewedBy || ! review || !rating ){
            return res.status(400).send({status:false,message:"(reviewedBy , review ,rating is mandatory)"})
        }
        //validations
        if(!validator.isEmpty(bookId)){
           return res.status(400).send({status:false, message:"boodId is required"})
       }

        if(!mongoose.isValidObjectId(bookId)){
            return res.status(404).send({status:false, message:"bookId is not a valid book id"})
        }

        let book = await bookModel.findOne({_id: bookId, isDeleted:false })  
       
        if(!book){
            return res.status(404).send({status:false,message:"Book not found"})
        }

        
        if(!validator.isEmpty(rating)){
            return res.status(400).send({status:false, message:"rating is required"})
        }

        if(!validator.ratingRange(rating)){
            return res.status(400).send({status:false, message:'rating should be in range 1 to 5'})
        }

       //validation end

       const reviewData = {
        bookId, 
        reviewedBy,
        reviewedAt: new Date(),
        rating,
        review
       }
    
       const createdReview = await reviewModel.create(reviewData)
       console.log("createdReview",createdReview)

       const bookReview = await bookModel.findOneAndUpdate(
        {_id: bookId, isDeleted:false},
        {$inc: {reviews: 1 }});
        console.log(bookReview)

        return res.status(201).send({status:true, message:"Success", data: createdReview})

    }catch(err){
        console.log(err)
        return res.status(500).send({status:false , message:err.message})
    }
}





//------------ PUT /books/:bookId/review/:reviewId ---------------------
const updatedReviews = async function(req,res){
 
    let {bookId, reviewId}=req.params
    let {review,rating,reviewedBy}= req.body

    // reviewId.bookid == bookId ??????????????????????????  Throw error
    // Also not geting updated reviewedBy ?????????????????


    //validating Params input object Ids
    if(!mongoose.isValidObjectId(bookId)){return res.status(400).send({status:false ,message:"Please input valid bookId."})}
    if(!mongoose.isValidObjectId(reviewId)){return res.status(400).send({status:false, message:"Please input valid reviewId."})}

    //checking if book exists with bookId
    const checkBookData= await bookModel.findOne({_id:bookId, isDeleted:false})
    if(!checkBookData){return res.status(404).send({status:false, message:"Book not found."})}

    //checking if any keys and values are present in req.body
    if(Object.keys(req.body).length == 0){return res.status(400).send({status:false, message:"Please enter keys in body to update."})}
    if(Object.values(req.body).length == 0){return res.status(400).send({status:false, message:"Please enter values in body to update."})}

    //Updating the review
    const updatedReview = await reviewModel.findOneAndUpdate({_id:reviewId, isDeleted:false}, {review:review , rating:rating, reviewedBy:reviewedBy}, 
    {new:true} )

    if(!updatedReview){return res.status(400).send({status:false, message:"Could not be updated, check your inputs."})}

    //Creating response: Bookdata + added review 
    //????????????? take a look at the response ||  {_id,title,excerpt,userId,category,subcategory,...}=checkBookdata , then obj._id:_id,...
    let obj={
        book:checkBookData,
        reviewsData:updatedReview 
    }
    
    return res.status(200).send({status:true, message:"Success", data:obj})
}




//-----------DELETE /books/:bookId/review/:reviewId-------------
const deleteReview = async function (req, res){
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        if(!mongoose.isValidObjectId(bookId)){
            return res.status(400).send({status: false, message: "please provide a valid bookId"});

        }
        if(!mongoose.isValidObjectId(reviewId)){
            return res.status(400).send({status: false, message: "please provide a valid reviewId"});

        }
        let bookdata = await bookModel.findById(bookId)
        if(!bookdata){
            return res.status(400).send({status: false, message: "No Book exists with the bookId"});
        }
       if(bookdata.isDeleted===true){
      return res.status(400).send({status: false, message: "Book is already deleted"});
        }
        let reviewdata = await reviewModel.findOneAndDelete({_id: reviewId, bookId:bookId, isDeleted: false}, {$set:{isDeleted: true}})
        if(!reviewdata){
            return res.status(400).send({status: false, message: "No review exists with the bookId nd reviewId"});
        }

        let updaterevievalue = await bookModel.findOneAndUpdate({_id:bookId},{$inc:{reviews:-1}})
       
        return res.status(200).send({status:true, message: "Review Deleted"})
        
    }  catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}





module.exports.createdReview = createdReview
module.exports.updatedReviews   = updatedReviews
module.exports.deleteReview   = deleteReview