import * as cartService from "../services/cartService.js";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";

export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCartByUserId(req.user.userId);
    res.json(new CustomResponse(ResponseStatus.OK, "My Cart", cart));
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const item = await cartService.addItemToCart(
      req.user.userId,
      productId,
      quantity
    );
    res
      .status(ResponseStatus.RESOURCE_CREATED.code)
      .json(
        new CustomResponse(
          ResponseStatus.RESOURCE_CREATED,
          "added item to cart",
          item
        )
      );
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await cartService.updateCartItem(
      parseInt(req.params.itemId),
      req.body.quantity
    );
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removeItem = async (req, res, next) => {
  try {
    await cartService.removeCartItem(parseInt(req.params.itemId));
    res.json(new CustomResponse(ResponseStatus.OK, "Deleted"));
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    await cartService.clearCart(req.user.userId);
    res.json(new CustomResponse(ResponseStatus.OK, "Cart Cleared"));
  } catch (error) {
    next(error);
  }
};
