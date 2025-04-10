import type { NextApiRequest, NextApiResponse } from "next";

import jwtService from "@/tools/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: "Refresh token is required" });
  //创建jwt
  if (jwtService.isTokenExpired(refreshToken))
    return res.status(304).json({ message: "Refresh token is expired" });
  const user: any = jwtService.verifyToken(refreshToken);
  console.log(user);
  return res.status(200).json({
    accessToken: jwtService.generateToken(
      {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        birth_date: user.birth_date,
        id_number: user.id_number,
        address_code: user.address_code,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      {
        expiresIn: "7d",
      },
    ),
  });
}
