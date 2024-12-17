import express from "express";
import requestIp from "request-ip";
import hpp from "hpp";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import corsOptions from "./middleware/global/cors.js";
import helmetOptions from "./middleware/global/helemt.js";
import rateLimiter from "./middleware/global/rateLimiter.js";

const app = express();

const PORT = process.env.PORT || 8080;

// GLOBAL MIDDELWRE
app.use(corsOptions());
app.use(requestIp.mw()); // get user Ip
app.use("/api", rateLimiter()); // Rate limiter to avoid misuse of the service and avoid cost spikes
app.use(helmetOptions()); // security headers
app.use(hpp());
app.use(compression());

// logging middleware

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// body parser middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // get data from the url
app.use(cookieParser());

// GLobal Error Handler

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "develeopment" && { stack: err.stack }),
  });
});

//  404 route if some thing crashese the server
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route/Page Dose Not Exist",
  });
});

export { app };
