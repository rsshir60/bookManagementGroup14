const express = require('express');
const router = express.Router();

const Auth = require('../middleware/auth')
const userController = require('../controller/userController')
const bookController = require('../controller/bookController')
const reviewController = require('../controller/reviewController')



//---------------- Users APIs --------------------
router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)


//---------------- Books APIs ---------------------
router.post("/books",Auth.authentication,bookController.createBooks)
router.get('/books',Auth.authentication,bookController.getBooks)
router.get('/books/:bookId',Auth.authentication,bookController.getBookById)
router.put('/books/:bookId',Auth.authentication,bookController.updatedBook)
router.delete('/books/:bookId',Auth.authentication,bookController.deleteBook)



//----------------- Review APIs ----------------------
router.post('/books/:bookId/review',reviewController.createdReview)
router.put('/books/:bookId/review/:reviewId',reviewController.updatedReviews)
router.delete('/books/:bookId/review/:reviewId',reviewController.deleteReview)


//------------ incase of wrong path -----------------------
router.all("/*", (req, res)=>{ return res.status(400).send({status:false, message:"check your URL"}) })


module.exports = router;