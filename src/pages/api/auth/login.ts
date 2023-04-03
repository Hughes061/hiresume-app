// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { HandleError, LoggedInUser } from "../../../backend-utils/types";
import { handleBodyNotEmpty } from "../../../backend-utils/validation";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { User } from "@prisma/client";

type Data = {
  loggedin: LoggedInUser | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "POST") {
      return res.status(403).json({
        loggedin: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }
    const noEmptyValues = handleBodyNotEmpty(req.body);

    if (noEmptyValues.length > 0) {
      return res.status(200).json({
        loggedin: null,
        errors: [...noEmptyValues],
      });
    }
    const { email, password } = req.body;

    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!findUser) {
      return res.status(200).json({
        loggedin: null,
        errors: [
          {
            message: "incorrect username or password",
          },
        ],
      });
    }
    const valid = await argon2.verify(`${findUser?.password}`, password);

    if (!valid) {
      return res.status(200).json({
        loggedin: null,
        errors: [
          {
            message: "incorrect username or password",
          },
        ],
      });
    }

    var access_token = jwt.sign(
      { user_id: findUser?.id, email: findUser?.email },
      `${process.env.JWT_SECRET}`,
      {
        expiresIn: "2h",
      }
    );

    //send cookie with jwt
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("access_token", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 60 * 120,
        sameSite: "strict",
        path: "/",
      })
    );

    const { password: userPass, ...loggedin } = findUser;

    return res.status(200).json({
      loggedin: loggedin,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      loggedin: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
