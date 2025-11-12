import { createRequestHandler } from "@react-router/vercel";
import * as build from "@react-router/dev/server-build";

export default createRequestHandler({ build, mode: process.env.NODE_ENV });
