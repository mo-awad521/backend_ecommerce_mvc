import * as orderService from "../services/orderService.js";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";

export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrderFromCart(
      req.user.userId,
      req.body.paymentMethod
    );
    res
      .status(ResponseStatus.RESOURCE_CREATED.code)
      .json(
        new CustomResponse(
          ResponseStatus.RESOURCE_CREATED,
          "Order created successfully from cart",
          order
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const orders = await orderService.getUserOrders(userId);
    res.json(new CustomResponse(ResponseStatus.OK, "Orders", orders));
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.id);
    const order = await orderService.getOrderById(userId, orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.id, 10);

    const order = await orderService.cancelOrder(userId, orderId);

    res.json(
      new CustomResponse(
        ResponseStatus.OK,
        "Order canceled successfully",
        order
      )
    );
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    // مرونة: بعض التوكنات تعرض userId، وبعضها id
    const actorUserId = req.user?.userId || req.user?.id;
    const actorRole = req.user?.role;

    const orderId = Number(req.params.id || req.params.orderId);
    const { status } = req.body;

    const updated = await orderService.changeOrderStatus(
      actorUserId,
      actorRole,
      orderId,
      status
    );
    res.json(
      new CustomResponse(
        ResponseStatus.OK,
        "Updated Status Successfully",
        updated
      )
    );
  } catch (error) {
    next(error);
  }
};
