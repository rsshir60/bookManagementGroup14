const express = require('express');
const router = express.Router();

const authController = require('../authController/auth')
const userController = require('../controller/userController')
const bookController = require('../controller/bookController')



//__Users_APIs
router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)

//__Books_APIs
router.post("/books", authController.authentication ,bookController.createBooks)
router.get('/books',authController.authentication,bookController.getBooks)
router.get('/books',authController.authentication,bookController.getBookById)
router.put('/books/:bookId',authController.authentication,bookController.updatedBook)
router.delete('/books/:bookId',authController.authentication,bookController.deleteBook)

//__Review_APIs




router.all("/*", (req, res)=>{
    return res.status(400).send({status:false, message:"check your URL"})
})

module.exports = router