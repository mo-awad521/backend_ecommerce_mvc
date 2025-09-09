import * as reviewService from "../services/reviewService.js";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";

export const addReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    const review = await reviewService.addReview(req.user.userId, productId, {
      rating,
      comment,
    });

    res
      .status(ResponseStatus.RESOURCE_CREATED.code)
      .json(
        new CustomResponse(
          ResponseStatus.RESOURCE_CREATED,
          "Review added successfully",
          review
        )
      );
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    const review = await reviewService.updateReview(
      req.user.userId,
      productId,
      {
        rating,
        comment,
      }
    );

    res.json(
      new CustomResponse(
        ResponseStatus.OK,
        "Review updated successfully",
        review
      )
    );
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { productId } = req.body;
    await reviewService.deleteReview(req.user.userId, productId);

    res.json(
      new CustomResponse(ResponseStatus.OK, "Review deleted successfully")
    );
  } catch (err) {
    next(err);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await reviewService.getProductReviews(Number(productId));

    res.json(
      new CustomResponse(
        ResponseStatus.OK,
        "Reviews fetched successfully",
        reviews
      )
    );
  } catch (err) {
    next(err);
  }
};
