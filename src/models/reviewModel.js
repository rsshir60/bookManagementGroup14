const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema(
  {
    bookId: {
      type: ObjectId,
      required: true,
      ref: "book",
    },
    reviewdBy: {
      type: String,
      required: true,
      default: "Guest",
      value: "reviewer name", //???
    },
    reviewedAt: {
      type: Date,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    review: {
      type: true, //optional
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("review", reviewSchema);
