import { toast } from "react-toastify";

export const success = (msg, opts = {}) => toast.success(msg, { ...opts });
export const error = (msg, opts = {}) => toast.error(msg || "Something went wrong", { ...opts });
export const info = (msg, opts = {}) => toast.info(msg, { ...opts });
export const warn = (msg, opts = {}) => toast.warn(msg, { ...opts });
