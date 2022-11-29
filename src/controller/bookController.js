const bookModel = require("../models/booksModel");
const userModel = require("../models/userModel");
const mongoose = require('mongoose')
const { ISBNValidate }  = require('../validations/validators')


//__create_books
const createBooks = async function (req, res) {
    try {                                                                                       
        let input1 = req.body

        if (Object.keys(input1) == 0) {
            return res.status(400).send({ status: false, message: "Body can not be empty" })
        }

        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt  } = input1 

        if (!title || !excerpt || !ISBN || !category || !userId || !subcategory || !releasedAt) {
            return res.status(400).send({ status: false, msg: "title,excerpt,ISBN, category,subcategory,releasedAt is mandatory" })
        }

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "invalid userId" })
        }       

        let userIdCheck = await userModel.findById({ _id: userId })
        if (!userIdCheck) {
            return res.status(400).send({ status: false, message: "user not found" })
        }

        let checktitle = await bookModel.findOne({ title: title })
        if (checktitle) {
            return res.status(400).send({ status: false, message: "title is already exists" })
        }

        let checkISBN = await bookModel.findOne({ ISBN: ISBN })
        if (checkISBN) {
            return res.status(400).send({ status: false, message: "ISBN is already exists" })
        }

        if (!ISBNValidate.test(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN number should be 10 or 13 digit" })
        }

        let createdBooks = await bookModel.create(input1)
        return res.status(201).send({ status: true, message: "Success", data: createdBooks })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


//__get_books
const getBooks = async function (req, res) {
    try {
        let bookData = await bookModel.find({ isDeleted: false }).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

        if (!(bookData) || bookData.length == 0) {
            return res.status(404).send({ status: false, message: "No Books Found." })
        }

        return res.status(200).send({ status: true, message: "Success", data: bookData })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


//__GET-BOOKS
// const getBooks = async function (req, res) {
//   try {
//        const data = req.query;
//        let { userId, category, subcategory } = data;
//        const filterData = { isDeleted: false };
//     if (Object.keys(data).length == 0){
//        let getAllBooks = await bookModel.find(filterData).sort({ title: 1 })
//        .select({_id: 1,title: 1,excerpt: 1,userId: 1,category: 1,releasedAt: 1,reviews: 1,});
//        return res.status(200).send({ status: true, message: "Books list", data: getAllBooks });}
//     if (userId){
//        let isValidId = mongoose.Types.ObjectId.isValid(userId);
//        if (!isValidId){return res.status(400).send({ status: false, message: "Enter valid user id" });}
//        filterData.userId = userId;}
//     if (category){filterData.category = category;}
//     if (subcategory){filterData.subcategory = subcategory;}
//     let books = await bookModel.find(filterData).sort({ title: 1 }).select({
//       _id: 1,title: 1,excerpt: 1,userId: 1,category: 1,subcategory: 1,releasedAt: 1,reviews: 1,});
//     if (books.length == 0){return res.status(404).send({ status: false, message: "No data found" })}
//        return res.status(200).send({ status: true, message: "Books list", data: books });
//   }catch(err){
//     return res.status(500).send({ status: false, message: err.message });
//   }
// }


//__get_Book_By_Id
const getBookById = async function (req, res) {
  try {
      let bookId = req.params.bookId

      if (!isValidObjectId(bookId)) {
          return res.status(400).send({ status: false, message: "Please provide a valid book id." })
      }

      let bookData = await bookModel.findOne({ id: bookId, isDeleted: false }).select({ "ISBN": 0, "isDeleted": 0, "subcategory": 0, "_v": 0, "createdAt": 0, "updatedAt": 0 })

      if (bookData) {
          return res.status(200).send({ status: true, message: "Books List", data: bookData })
      } else {
          return res.status(400).send({ status: false, message: "No books found with this id." })
      }
  }
  catch (error) {
      return res.status(500).send({ status: false, message: error.message })
  }
}


//__update_book
const updatedBook = async function (req, res) {
    let inputBookId = req.params.bookId
    // console.log(req.params)
    let input1 = req.body
    let { title, exercpt, releasedAt, ISBN } = input1

     if(Object.keys(input1)==0){
      return res.status(400).send({status:false,message:"please enter update in body"})
     }

    //input validation
    if(!ISBNValidate.test(ISBN)){ return res.status(400).send({status:false,message:"Please enter valid ISBN."})}

    //Checking if BlogId to be updated exists
    let checkinputBookId = await bookModel.findById({_id:inputBookId})
    if(!checkinputBookId){return res.status(404).send({status:false, message:"BookId not found."})}

    //checking if unique entry already exists
    let checktitle = await bookModel.findOne({ title: title })
    if (checktitle) {return res.status(400).send({ status: false, message: "title already exists" }) }

    let checkISBN = await bookModel.findOne({ ISBN: ISBN })
    if (checkISBN) {return res.status(400).send({ status: false, msg: "ISBN already exists" }) }

    // updating books
    let updatedBookData = await bookModel.findOneAndUpdate({ _id: inputBookId, isDeleted: false },
    { $set: {title: title, excerpt: exercpt, releasedAt: releasedAt, ISBN: ISBN }},
    { new: true } )
    
    if(!updatedBookData){res.status(500).send({status:false, message:"Can not be updated."})}   ///for testing purpose

    return res.status(200).send({ status: true, message: "Success", data: updatedBookData })
}


//__delete_book
const deleteBook = async function (req,res){
  try {
    let bookId= req.params.bookId
    let bookdata = await booksModel.findById(bookId)
    if(!bookdata){
      return res.status(404).send({message: "No Book exists with the bookid"})
    }
    if(bookdata.isDeleted===true){
      return res.status(400).send({message: "Book is already deleted"})  
    }

    let deletebook = await booksModel.findOneAndUpdate({_id:bookId}, {$set:{ isDeleted: true, deletedAt:new Date() } }, {new: true})
    res.status(200).send({ status: true, message: "book is sucessfully deleted" })

  } catch (err) {
    return res.status(500).send({status:false, msg: err.message});
  }
}




module.exports.createBooks  = createBooks
module.exports.getBooks     = getBooks
module.exports.getBookById  = getBookById
module.exports.updatedBook  = updatedBook
module.exports.deleteBook   = deleteBook


