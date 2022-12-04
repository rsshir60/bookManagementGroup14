const bookModel = require("../models/booksModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");
const mongoose = require('mongoose')
const { ISBNValidate } = require('../validations/validators');


//__create_books
const createBooks = async function (req, res) {
    try {
        let input1 = req.body
        const userIdFromToken =  req.decodedToken.userId
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = input1

        if (Object.keys(input1) == 0) { return res.status(400).send({ status: false, message: "Body can not be empty" }) }

        //Checking if body entries are present
        if (!title) { return res.status(400).send({ status: false, msg: "title is mandatory" }) }
        if (!excerpt) { return res.status(400).send({ status: false, msg: "excerpt is mandatory" }) }
        if (!ISBN) { return res.status(400).send({ status: false, msg: "ISBN is mandatory" }) }
        if (!category) { return res.status(400).send({ status: false, msg: "category is mandatory" }) }
        if (!userId) { return res.status(400).send({ status: false, msg: "userId is mandatory" }) }
        if (!subcategory) { return res.status(400).send({ status: false, msg: "subcategory is mandatory" }) }
        if (!releasedAt) { return res.status(400).send({ status: false, msg: "releasedAt is mandatory" }) }


        if (!mongoose.isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "invalid userId" }) }

        if(!mongoose.isValidObjectId(userIdFromToken)){
            return res.status(400).send({status:false, message:'userId from token is not correct'})
        }

        //Checking for Duplicacy in books DB

        let userIdCheck = await userModel.findById({ _id: userId })
        if (!userIdCheck) { return res.status(400).send({ status: false, message: "userId not found" }) }

        if(userIdFromToken != userId ){
            return res.status(400).send({status:false, message:'you are not authorised to create book with other userId'})}

        let checktitle = await bookModel.findOne({ title: title })
        if (checktitle) { return res.status(400).send({ status: false, message: "title is already exists" }) }

        let checkISBN = await bookModel.findOne({ ISBN: ISBN })
        if (checkISBN) { return res.status(400).send({ status: false, message: "ISBN is already exists" }) }

        if (!ISBNValidate.test(ISBN)) { return res.status(400).send({ status: false, message: "ISBN number should be 10 or 13 digit" }) }


        //Book creation
        let createdBooks = await bookModel.create(input1)
        return res.status(201).send({ status: true, message: "Success", data: createdBooks })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



//GET /books
const getBooks = async function (req, res) {
    try {
        const input1 = req.query;
        let { userId, category, subcategory } = input1;

        //Returning all books if no filter is provided in req.query
        if (Object.keys(input1).length == 0) {
            let getAllBooks = await bookModel.find({ isDeleted: false })
                .select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1, })
                .sort({ title: 1 });

            return res.status(200).send({ status: true, message: "Books list", data: getAllBooks });
        }

        //Obj for searching
        const filterData = { isDeleted: false };


        if (userId) {
            if (!mongoose.isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Enter valid user id" }); }
            filterData.userId = userId
        }

        //setting key value pairs for search object
        if (category) { filterData.category = category }
        if (subcategory) { filterData.subcategory = subcategory }
        console.log(filterData)

        //findingBook with filters provided
        let books = await bookModel.find(filterData)
            .select({ title: 1, excerpt: 1, userId: 1, category: 1, subcategory: 1, releasedAt: 1, reviews: 1 })
            .sort({ title: 1 })

        if (books.length == 0) { return res.status(404).send({ status: false, message: "No data found" }) }

        return res.status(200).send({ status: true, message: "Books List", data: books });  //Respose OK

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}




//------- get By Id --------------
const getBookById = async function (req, res) {
    try {
        const bookId = req.params.bookId;

        if (!mongoose.isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: "Please provide a valid book id." }) }

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false })

        if (!book) { return res.status(404).send({ status: false, message: "Book Not Found" }) }

        if (book) {
            let reviews = await reviewModel.find({ bookId: book._id, isDeleted: false }, { createdAt: 0, updatedAt: 0, isDeleted: 0 })

            if (reviews) { return res.status(200).send({ status: true, message: "Book List", data: { book, "reviewData": reviews } }) }        //Response OK?
        }

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}





//------ Update book -----------------
const updatedBook = async function (req, res) {
    let inputBookId = req.params.bookId
    const userIdFromToken =  req.decodedToken.userId
    let input1 = req.body
    let { title, exercpt, releasedAt, ISBN } = input1

    if (Object.keys(input1) == 0) { return res.status(400).send({ status: false, message: "please enter update in body" }) }

    if(!mongoose.isValidObjectId(userIdFromToken)){
        return res.status(400).send({status:false, message:'userId from token is not correct'})
    }

    //input validation
    if (ISBN) {
        let checkISBN = await bookModel.findOne({ ISBN: ISBN })
        if (checkISBN) { return res.status(400).send({ status: false, msg: "ISBN already exists" }) }
        if (!ISBNValidate.test(ISBN)) { return res.status(400).send({ status: false, message: "Please enter valid ISBN." }) }
    }


    //Checking if BlogId to be updated exists
    let checkinputBookId = await bookModel.findById({ _id: inputBookId })
    if (!checkinputBookId) { return res.status(404).send({ status: false, message: "BookId not found." }) }

    if(userIdFromToken != checkinputBookId.userId ){
            return res.status(400).send({status:false, message:'you are not authorised to create book with other userId'})}

    //checking if unique entry already exists
    let checktitle = await bookModel.findOne({ title: title })
    if (checktitle) { return res.status(400).send({ status: false, message: "title already exists" }) }

    // updating books
    let updatedBookData = await bookModel.findOneAndUpdate({ _id: inputBookId, isDeleted: false },
        { $set: { title: title, excerpt: exercpt, releasedAt: releasedAt, ISBN: ISBN } },
        { new: true })

    if (!updatedBookData) { res.status(500).send({ status: false, message: "Can not be updated." }) }   ///for testing purpose

    return res.status(200).send({ status: true, message: "Success", data: updatedBookData }) //Response OK
}




//------ Delete book ---------------
const deleteBook = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let userIdFromToken = req.decodedToken.userId
        let bookdata = await bookModel.findById(bookId)


        if (!mongoose.isValidObjectId(userIdFromToken)) { return res.status(400).send({ status: false, message: 'userId from token is not valid userId' }) }
        if (!mongoose.isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: 'BookId is a not a valid bookId' }) }
        if (!bookdata) { return res.status(404).send({ message: "No Book exists with the bookid" }) }
        if (bookdata.isDeleted === true) { return res.status(400).send({ message: "Book is already deleted" }) }

        let userId = bookdata.userId

        if (userId.toString() !== userIdFromToken) {
            return res.status(400).send({ status: false, message: 'you not authorised to deleted this book' })
        }

        let deletebook = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })

        res.status(200).send({ status: true, message: "book is sucessfully deleted" })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}




module.exports = {createBooks, getBooks, getBookById, updatedBook, deleteBook }

