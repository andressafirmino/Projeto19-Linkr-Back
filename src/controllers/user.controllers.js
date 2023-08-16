import { db } from "../database/database.connection.js";

export async function getPostsFromUser(req ,res){
    const { id } = req.params;
    try {
        const result = await db.query(`SELECT * FROM posts WHERE "userId" = $1`, [id]);
        res.status(200).send(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
}