import { reportService } from "../services/index.js";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await reportService.getDashboardStats();

    res
      .status(ResponseStatus.OK.code)
      .json(
        new CustomResponse(
          ResponseStatus.OK,
          "Dashboard stats fetched successfully",
          stats
        )
      );
  } catch (error) {
    next(error);
  }
};
