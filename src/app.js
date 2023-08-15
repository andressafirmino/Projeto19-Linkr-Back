import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/index.routes.js";

const app = express();

dotenv.config();
app.use(json());
app.use(cors());
app.use(router);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`O servidor esta logado na porta ${port}`));
