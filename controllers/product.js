import Product from '../models/product.js';
import ErrorHandler from '../utils/errorHandler.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ApiFeatures from '../utils/apifeatures.js';

//Get all products
export const getAllProducts = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 3;
  const productCount = await Product.countDocuments();
  const apiFeature = new ApiFeatures(Product.find(), req.query)

    .filter()
    .search()
    .pagination(resultPerPage);
  const products = await apiFeature.query;

  // const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
    productCount,
  });
});

//Create Product -- Admin
export const createProduct = catchAsyncErrors(async (req, res) => {
  req.body.createdBy = req.user.id;
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

//Update Product -- Admin
export const updateProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.modifiedBy = req.user.id;
  let product = await Product.findById(req.params.id);

  if (!product) {
    // return res
    //   .status(500)
    //   .json({ success: false, message: 'Product not found' });
    return next(new ErrorHandler('Product not found', 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product -- Admin
export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    // return res
    //   .status(500)
    //   .json({ success: false, message: 'Product not found' });
    return next(new ErrorHandler('Product not found', 404));
  }

  //   product = await Product.findByIdAndRemove(req.params.id, req.body, {
  //     new: true,
  //     runValidators: true,
  //     useFindAndModify: false,
  //   });

  await product.remove();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

// Product Details
export const getProductDetails = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    // return res
    //   .status(500)
    //   .json({ success: false, message: 'Product not found' });
    return next(new ErrorHandler('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Create new review or update the review

export const createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  // console.log('first:', review.user.toString());
  // console.log('secod:', req.user._id.toString());

  const product = await Product.findById(productId);
  // console.log('DIlip Coming');
  const isReviewed = product.reviews.find((rev) => {
    rev.user.toString() === req.user._id.toString();
  });

  console.log(isReviewed);
  if (isReviewed) {
    console.log(rev.user);
    product.reviews.forEach((rev) => {
      console.log(rev.user);
      console.log(req.user._id);
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });
  res.status(200).json({ success: true });
});

// Get all reviews of a product

export const getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  console.log(req.query.id);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }
  res.status(200).json({ success: true, reviews: product.reviews });
});

// Delete reviews
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;
  await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, ratings, numOfReviews },
    { new: true, runValidators: true, useFindAndModify: false }
  );

  res.status(200).json({ success: true });
});
