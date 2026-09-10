import express from "express";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes"

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
    });
});

app.use("/", productRoutes);
app.use("/", categoryRoutes);

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