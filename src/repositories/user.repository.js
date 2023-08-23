import { db } from "../database/database.connection.js";

export async function followUser(userId, followerId) {
  try {
    const existingFollow = await db.query(
      `SELECT * FROM follows WHERE "userId" = $1 AND "followerId" = $2`,
      [userId, followerId]
    );

    if (existingFollow.rows.length > 0) {
      return { status: 400, message: "Você já está seguindo este usuário." };
    }

    await db.query(
      `INSERT INTO follows ("userId", "followerId") VALUES ($1, $2)`,
      [userId, followerId]
    );

    return { status: 201, message: "Seguindo com sucesso." };
  } catch (error) {
    console.error("Erro ao seguir o usuário:", error);
    return { status: 500, message: "Ocorreu um erro ao seguir o usuário." };
  }
}

export async function unfollowUser(userId, followerId) {
  try {
    const existingFollow = await db.query(
      `SELECT * FROM follows WHERE "userId" = $1 AND "followerId" = $2`,
      [userId, followerId]
    );

    if (existingFollow.rows.length === 0) {
      return { status: 400, message: "Você não está seguindo este usuário." };
    }

    await db.query(
      `DELETE FROM follows WHERE "userId" = $1 AND "followerId" = $2`,
      [userId, followerId]
    );

    return { status: 200, message: "Deixou de seguir com sucesso." };
  } catch (error) {
    console.error("Erro ao deixar de seguir o usuário:", error);
    return {
      status: 500,
      message: "Ocorreu um erro ao deixar de seguir o usuário.",
    };
  }
}

export async function checkFollowUser(userId, followerId) {
  try {
    const existingFollow = await db.query(
      `SELECT * FROM follows WHERE "userId" = $1 AND "followerId" = $2`,
      [userId, followerId]
    );

    return existingFollow.rows.length > 0;
  } catch (error) {
    console.error("Erro ao verificar se o usuário segue outro:", error);
    return false;
  }
}
