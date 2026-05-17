import express from  "express";
import  cors from  "cors";
import helmet from "helmet";
import morgan from "morgan"
import cookieParser from "cookie-parser";
import errorHandler,{notFound} from "./middleware/error.middleware.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js"
import jobRoutes from "./routes/job.routes.js"
import refferalRoute from "./routes/referral.routes.js"
import messageRoutes from "./routes/message.routes.js" 
import notificationRoutes from "./routes/notification.routes.js";
import { globalLimiter } from "./middleware/rateLimit.middleware.js";
const app =express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
app.use(helmet());
app.use(globalLimiter);
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/jobs",jobRoutes);
app.use("/api/v1/referrals",refferalRoute);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/notifications", notificationRoutes);


app.get("/",(req,res)=>{
    res.send("api running ");
})
app.use(notFound);
app.use(errorHandler);



export default app;




