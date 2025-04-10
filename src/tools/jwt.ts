import type { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

/**
 * JWT 工具类
 */
class JwtService {
  private secretKey: string;

  /**
   * 构造函数
   * @param secretKey - 用于签名和验证的密钥
   */
  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  /**
   * 生成 JWT Token
   * @param payload - 要加密的数据（可以是对象或字符串）
   * @param options - 签名选项（可选）
   * @returns 生成的 JWT Token
   */
  public generateToken(
    payload: string | object,
    options?: SignOptions,
  ): string {
    try {
      return jwt.sign(payload, this.secretKey, options);
    } catch (error: any) {
      throw new Error(`Failed to generate token: ${error.message}`);
    }
  }

  /**
   * 验证并解析 JWT Token
   * @param token - 要验证的 JWT Token
   * @returns 解析后的数据（payload）
   * @throws 如果 Token 无效或过期，则抛出错误
   */
  public verifyToken<T extends JwtPayload | string>(token: string): T {
    try {
      return jwt.verify(token, this.secretKey) as T;
    } catch (error: any) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }

  /**
   * 检查 Token 是否已过期
   * @param token - 要检查的 JWT Token
   * @returns true 表示已过期，false 表示未过期
   */
  public isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded.payload === "string") {
        return true; // 无法解析 Token
      }

      const { exp } = decoded.payload as JwtPayload;
      return !!exp && Date.now() >= exp * 1000;
    } catch (error) {
      return true; // 解析失败则视为已过期
    }
  }
}

const jwtService = new JwtService(process.env.JWT_SECRET_KEY!);
export default jwtService;
