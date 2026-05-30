import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncController<T extends Request> = (
  req: T,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export function asyncHandler<T extends Request>(
  fn: AsyncController<T>,
): RequestHandler {
  return (req, res, next) => {
    fn(req as T, res, next).catch(next);
  };
}
