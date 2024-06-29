import { NextFunction } from "express";

const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default asyncHandler;
