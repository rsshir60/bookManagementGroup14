const bookModel = require("../models/booksModel");
const userModel = require("../models/userModel");
const isValidObjectId = require('mongoose')

//const moment = require('moment')
let {ISBNValidate} = require('../validations/validators')

//__create_books
const createBooks = async function(req,res){
    try{                                                                                        //?tryCatch
      let input1 = req.body

      if(Object.keys(input1)==0){
        return res.status(400).send({status:false, message:"Body can not be empty"})}

      let {title, excerpt, userId, ISBN, category, subcategory, releasedAt, isDeleted, reviews} = input1 //?releasedAt 
     
      if(!title || !excerpt || !ISBN || !category || !userId|| !subcategory || !releasedAt){
        return res.status(400).send({status:false, msg:"title,excerpt,ISBN, category,subcategory,releasedAt is mandatory"})
      }

      if(!isValidObjectId(userId)){
        return res.status(400).send({status:false, message:"invalid userId"})
        
      }           //????handle

      let userIdCheck= await userModel.findById({_id: userId})
      if(!userIdCheck){
        return res.status(400).send({status:false, message:"Invalid userId /user not found"})}

      let checktitle = await bookModel.findOne({title: title})
      if(checktitle){
        return res.status(400).send({status:false, message: "title is already exists"})
      }  

      let checkISBN = await bookModel.findOne({ISBN: ISBN})
      if(checkISBN){
        return res.status(400).send({status:false, msg:"ISBN is already exists"})
      }

      if(!ISBNValidate.test(ISBN)){
        return res.status(400).send({status:false, msg:"ISBN number should be 10 or 13 digit"})
      }

      //let dateReleasedAt = await bookModel.findOne({releasedAt: moment().format("YYYY-MM-DD") })

      let createdBooks= await bookModel.create(input1)
      return res.status(201).send({status:true, message:"Success", data:createdBooks}) 


    }catch(err){
        return res.status(500).send({status:false, msg: err.message})
    }

}

 
//__get_books
const getBooks = async function(req,res){
    try{ 
      let bookData = await bookModel
      .find({isDeleted:false})
      .select({title:1,excerpt:1,userId:1,category:1,releasedAt:1,reviews:1})

       if(!(bookData) || bookData.length == 0){
       return res.status(404).send({status:false, message:"No Books Found."})}

        return res.status(200).send({status:true, message:"Success", data: bookData})
        
    }catch(err){
        return res.status(500).send({status:false, msg:err.message})
    }  
}

module.exports.createBooks=createBooks
module.exports.getBooks=getBooks

