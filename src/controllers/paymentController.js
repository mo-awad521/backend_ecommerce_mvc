import * as paymentService from "../services/paymentService.js";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";

export const createPayment = async (req, res, next) => {
  try {
    const { orderId, provider, transactionId, status } = req.body;
    const payment = await paymentService.createPayment(
      orderId,
      provider,
      transactionId,
      status
    );
    res
      .status(ResponseStatus.RESOURCE_CREATED.code)
      .json(
        new CustomResponse(
          ResponseStatus.BAD_REQUEST,
          "Payment Created",
          payment
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentByOrder(
      parseInt(req.params.orderId)
    );
    res.json(new CustomResponse(ResponseStatus.OK, "Payment", payment));
  } catch (error) {
    next(error);
  }
};

export const updatePayment = async (req, res, next) => {
  try {
    const payment = await paymentService.updatePaymentStatus(
      req.params.orderId,
      req.body.status
    );
    res.json(
      new CustomResponse(
        ResponseStatus.OK,
        "Payment Updated Successfully",
        payment
      )
    );
  } catch (error) {
    next(error);
  }
};
