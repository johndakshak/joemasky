import app from "./app";
import "dotenv/config";

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`JoeMasky digital store assistant is listening on Port ${port}`);
});
