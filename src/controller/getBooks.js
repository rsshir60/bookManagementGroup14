// ### GET /books/:bookId
/*### GET /books/:bookId
- Returns a book with complete details including reviews. Reviews array would be in the form of Array. Response example [here](#book-details-response)
- Return the HTTP status 200 if any documents are found. The response structure should be like [this](#successful-response-structure) 
- If the book has no reviews then the response body should include book detail as shown [here](#book-details-response-no-reviews) and an empty array for reviewsData.
- If no documents are found then return an HTTP status 404 with a response like [this](#error-response-structure) */




const getBooks = async function (req, res) {
  try {
    const data = req.query;
    const { userId, category, subcategory } = data;

    const filterData = { isDeleted: false };

    if (Object.keys(data).length == 0) {
      let getAllBooks = await bookModel
        .find(filterData)
        .sort({ title: 1 })
        .select({
          _id: 1,
          title: 1,
          excerpt: 1,
          userId: 1,
          category: 1,
          subcategory: 1,
          releasedAt: 1,
          reviews: 1,
        });
      return res
        .status(200)
        .send({ status: true, message: "Books list", data: getAllBooks });
    }

    if (userId) {
      let isValidId = mongoose.Types.ObjectId.isValid(userId);
      if (!isValidId) {
        return res
          .status(400)
          .send({ status: false, message: "Enter valid user id" });
      }
      filterData.userId = userId;
    }
    if (category) {
      filterData.category = category;
    }
    if (subcategory) {
      filterData.subcategory = subcategory;
    }

    let books = await bookModel.find(filterData).sort({ title: 1 }).select({
      _id: 1,
      title: 1,
      excerpt: 1,
      userId: 1,
      category: 1,
      subcategory: 1,
      releasedAt: 1,
      reviews: 1,
    });
    if (books.length == 0) {
      return res.status(404).send({ status: false, message: "No data found" });
    }

    return res
      .status(200)
      .send({ status: true, message: "Books list", data: books });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, message: err.message });
  }
};
