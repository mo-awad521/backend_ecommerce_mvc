import * as userService from "../services/userService.js";
import { ResponseStatus, CustomResponse } from "../utils/customResponse.js";

export const register = async (req, res, next) => {
  try {
    const user = await userService.register(req.body);
    res
      .status(ResponseStatus.RESOURCE_CREATED.code)
      .json(
        new CustomResponse(
          ResponseStatus.RESOURCE_CREATED,
          "User Registered, please verify your email!",
          user
        )
      );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await userService.login(req.body);

    if (!user.isVerified) {
      return res
        .status(ResponseStatus.FORBIDDEN.code)
        .json(
          new CustomResponse(
            ResponseStatus.FORBIDDEN,
            "Please verify your email before login"
          )
        );
    }

    res.status(ResponseStatus.OK.code).json(
      new CustomResponse(ResponseStatus.OK, "Login Successfully", {
        user,
        token,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const token = req.params.token;
    const result = await userService.verifyEmail(token);

    if (result.alreadyVerified) {
      return res
        .status(ResponseStatus.OK.code)
        .json(new CustomResponse(ResponseStatus.OK, result.message, null));
    }

    res
      .status(ResponseStatus.OK.code)
      .json(
        new CustomResponse(
          ResponseStatus.OK,
          "Email verified successfully!",
          result
        )
      );
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await userService.resendVerificationEmail(email);

    return res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, result.message));
  } catch (error) {
    return res
      .status(ResponseStatus.BAD_REQUEST.code)
      .json(
        new CustomResponse(
          ResponseStatus.BAD_REQUEST,
          error.message || "Unable to resend verification email"
        )
      );
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    await userService.requestPasswordReset(req.body.email);
    res
      .status(ResponseStatus.OK.code)
      .json(
        new CustomResponse(ResponseStatus.OK, "Password reset email sent!")
      );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await userService.resetPassword(req.params.token, req.body.password);
    res
      .status(ResponseStatus.OK.code)
      .json(
        new CustomResponse(ResponseStatus.OK, "Password reset successful!")
      );
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.userId);
    res.status(ResponseStatus.OK.code).json(user);
  } catch (error) {
    next(error);
  }
};
