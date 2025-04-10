import { createLogger, format, transports } from "winston";

// 判断是否为客户端环境
const isClient = typeof window !== "undefined";

// 根据环境选择合适的标签
const label = isClient ? "client" : "server";

// 自定义日志格式
const myFormat = format.printf(
  ({ level, message, label, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${label}] ${level}: ${message}`;
    if (metadata && Object.keys(metadata).length > 0) {
      msg += `\n\tMetadata:\n${JSON.stringify(metadata, null, 2)}`;
    }
    return msg;
  },
);

const logger = createLogger({
  format: format.combine(format.label({ label }), format.timestamp(), myFormat),
  // 默认只在服务端输出到文件
  transports: [],
});

// 如果是开发环境且非生产环境，将日志输出到控制台
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), myFormat),
    }),
  );
}

// 如果是在服务端，添加文件传输
if (!isClient) {
  logger.add(new transports.File({ filename: "error.log", level: "error" }));
  logger.add(new transports.File({ filename: "combined.log", level: "info" }));
}

export default logger;
