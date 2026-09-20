import express from "express";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import adminRoutes from "./routes/admin.routes";
import superAdminRoutes from "./routes/superAdmin.routes";
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/order.routes";
import shopContactRoutes from "./routes/shopContact.routes";
import orderContactRoutes from "./routes/orderContact.routes";
import cors from "cors";
import helmet from "helmet";
import { generalLimiter } from "./middleware/rateLimiters";

const app = express();

app.use(express.json());

app.use(cors());
app.use(helmet());
app.use(generalLimiter);

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
    });
});

app.use("/", productRoutes);
app.use("/", categoryRoutes);
app.use("/", adminRoutes);
app.use("/", superAdminRoutes);
app.use("/", authRoutes);
app.use("/", orderRoutes);
app.use("/", shopContactRoutes)
app.use("/", orderContactRoutes);

// Catch-all for unmatched routes.
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
    });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if ((err as any).type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON in request body"
        });
    }

    console.log(err);
    res.status(500).json({
        message: "something went wrong",
    });
});

export default app;