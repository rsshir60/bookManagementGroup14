const bookModel = require("../models/booksModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");
const mongoose = require('mongoose')
const { ISBNValidate, isEmpty, ratingRange } = require('../validations/validators');
const { validate } = require("../models/booksModel");




//------- POST /books/:bookId/review -----------------

const createdReview = async function (req, res) {
    try {
        let requestBody = req.body;
        let bookId = req.params.bookId;

        //destructure
        let { reviewedBy, rating, review } = requestBody;

        if(!reviewedBy){ return res.status(400).send({ status: false, message: "(reviewedBy is mandatory)" })}
        if(!rating){ return res.status(400).send({ status: false, message: "(rating is mandatory)" }) }
        if(!review){ return res.status(400).send({ status: false, message: "(review is mandatory)" }) }


        //checking bookId from user
        if (!isEmpty(bookId)){ return res.status(400).send({ status: false, message: "boodId is required" })}
        if (!mongoose.isValidObjectId(bookId)) { return res.status(404).send({ status: false, message: "bookId is not a valid book id" }) }

        //checking if Book exists with bookId
        let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book){ return res.status(404).send({ status: false, message: "Book not found"}) }

        //validation for rating input
        if (!isEmpty(reviewedBy)) {return res.status(400).send({ status: false, message: "reviewedBy is required" })}
        if (!isEmpty(rating)) {return res.status(400).send({ status: false, message: "rating is required" })}
        if (!ratingRange(rating)) {return res.status(400).send({ status: false, message: 'rating should be in range 1 to 5' }) }


        //for creating review
        const reviewData = {
            bookId,
            reviewedBy,
            reviewedAt: new Date(),
            rating,
            review
        }

        const createdReview = await reviewModel.create(reviewData)

        //Increasing review count by 1 after successful review creation
        const bookReview = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false },{ $inc: { reviews: 1 } });
       
        //final response
        return res.status(201).send({ status: true, message: "Success", data: createdReview })

    } 
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}




//------------ PUT /books/:bookId/review/:reviewId ---------------------
const updatedReviews = async function (req, res) {
    try{
        let { bookId, reviewId } = req.params
        let { review, rating, reviewedBy } = req.body


        //validating Params input object Ids
        if (!mongoose.isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: "Please input valid bookId." }) }
        if (!mongoose.isValidObjectId(reviewId)) { return res.status(400).send({ status: false, message: "Please input valid reviewId." }) }

        //checking if book exists with bookId
        const checkBookData = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookData) { return res.status(404).send({ status: false, message: "Book not found." }) }

        //checking if any keys and values are present in req.body
        if (Object.keys(req.body).length == 0) { return res.status(400).send({ status: false, message: "Please enter keys in body to update." }) }
        if (Object.values(req.body).length == 0) { return res.status(400).send({ status: false, message: "Please enter values in body to update." }) }

        //Updating the review
        const updatedReview = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, { review: review, rating: rating, reviewedBy: reviewedBy },
        { new: true } )

        if (!updatedReview) { return res.status(400).send({ status: false, message: "Could not be updated, check your inputs." }) }

        //creating object for response with review array
            const {_id,title,excerpt,userId,ISBN,category,subcategory,reviews,isDeleted,releasedAt,createdAt,updatedAt}=checkBookData
        let obj = {
            _id,title,excerpt,userId,ISBN,category,subcategory,reviews,isDeleted,releasedAt,createdAt,updatedAt,
            reviewsData: updatedReview
        }

        return res.status(200).send({ status: true, message: "Success", data: obj })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}


//-----------DELETE /books/:bookId/review/:reviewId-------------
const deleteReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (!mongoose.isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: "please provide a valid bookId" }) }
        if (!mongoose.isValidObjectId(reviewId)) { return res.status(400).send({ status: false, message: "please provide a valid reviewId"}) }
       
        let bookdata = await bookModel.findById(bookId)
        if (!bookdata) { return res.status(400).send({ status: false, message: "No Book exists with the bookId" }) }
        if (bookdata.isDeleted === true) { return res.status(400).send({ status: false, message: "Book is already deleted" }) }

        //Deleting the review
        let reviewdata = await reviewModel.findOneAndDelete({ _id: reviewId, bookId: bookId, isDeleted: false }, { $set: { isDeleted: true } })
        if (!reviewdata) {return res.status(400).send({ status: false, message: "No review exists with the bookId nd reviewId" }); }


        //Changing review count after successful deletion of review
        let updaterevievalue = await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })


        return res.status(200).send({ status: true, message: "Review Deleted" })
    } 
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}




module.exports = {createdReview, updatedReviews, deleteReview}