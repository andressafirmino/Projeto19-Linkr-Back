import { db } from "../database/database.connection.js";

export async function authenticateToken(req, res, next) {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) return res.status(401).send("Unauthorized");

        const token = authorization.replace("Bearer ", "");

        const user = await db.query(`SELECT "userId" FROM sessions WHERE token = $1`, [token]);
        if (user.rowCount === 0) return res.status(401).send("Unauthorized");

        req.userId = user.rows[0].userId;
        next();
    } catch (error) {
        res.status(500).send(error.message);
    }
}
