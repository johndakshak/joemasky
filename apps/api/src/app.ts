import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
    });
});

// Catch-all for unmatched routes.
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
    });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(err);
    res.status(500).json({
        message: "something went wrong",
    });
});

export default app;