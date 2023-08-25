import { db } from "../database/database.connection.js";
import axios from "axios";
import { checkFollowUser } from "./user.repository.js";

export async function publicPost(link, description, userId) {
  const result = db.query(
    `
    INSERT INTO posts (link, description, "userId") VALUES ($1, $2, $3)
    RETURNING "id";
    `,
    [link, description, userId]
  );
  return result;
}

export async function publicHasthtag(name) {
  const result = db.query(
    `
    INSERT INTO hashtags (name) VALUES ($1) RETURNING "id";
    `,
    [name]
  );
  return result;
}

export async function postTags(postId, tagId) {
  const result = db.query(
    `
    INSERT INTO post_hashtags ("postId", "tagId") VALUES ($1, $2);
    `,
    [postId, tagId]
  );
  return result;
}

export async function getPostTags(postId) {
  const hashtagsQuery = await db.query(
    `SELECT h.name FROM hashtags h
    JOIN post_hashtags ph ON h.id = ph."tagId"
    WHERE ph."postId" = $1`,
    [postId]
  );
  return hashtagsQuery.rows.map((row) => row.name);
}

export async function checkUserLikedPost(userId, postId) {
  try {
    const result = await db.query(
      `SELECT COUNT(*) FROM likes WHERE "postId" = $1 AND "userId" = $2`,
      [postId, userId]
    );
    const likeCount = parseInt(result.rows[0].count);
    return likeCount > 0;
  } catch (err) {
    console.error("Error checking user like:", err);
    return false;
  }
}

async function getUrlMetaData(url) {
  try {
    const meta = await axios.get(`https://jsonlink.io/api/extract?url=${url}`);
    return meta.data;
  } catch (error) {
    console.error("Erro ao obter metadados da URL:", error);
    return null;
  }
}

async function getComments(userId, postId) {
  try {
    const result = await db.query(      
        `SELECT
        c."comment",
        u."image" AS "image",
        u."username" AS "username",
        CASE
          WHEN c."userId" = p."userId" THEN 'post''s author'
          WHEN f."followerId" = $1 THEN 'following'
          ELSE NULL
        END AS "relationship"
    FROM
        "comments" c
    JOIN
        "users" u ON c."userId" = u."id"
        JOIN
    "posts" p ON c."postId" = p."id"
    LEFT JOIN
        "follows" f ON u."id" = f."userId" AND f."followerId" = $1
    WHERE
        c."postId" = $2;    
        `, [userId, postId]
      );    
    return result;
  } catch (err) {
    res.status(500).send(err.message);
  }
}
export async function getPosts(req, res) {
  const { userId } = req.query;

  try {
    const postsQuery = await db.query(
      `SELECT * FROM posts ORDER BY "createdAt" DESC`
    );
     
    const posts = await Promise.all(
      postsQuery.rows.map(async (post) => {
        const likesQuery = await db.query(
          `SELECT COUNT(*) FROM likes WHERE "postId" = $1`,
          [post.id]
        );
        const likesCount = parseInt(likesQuery.rows[0].count);

        const userQuery = await db.query(
          `SELECT username, image FROM users WHERE id = $1`,
          [post.userId]
        );
        const user = userQuery.rows[0];

        const hashtags = await getPostTags(post.id);

        const liked = await checkUserLikedPost(userId, post.id);

        const urlData = await getUrlMetaData(post.link);

        const comments = await getComments(userId, post.id);

        return {
          ...post,
          likes: likesCount,
          ownerUsername: user.username,
          ownerImage: user.image,
          hashtags: hashtags,
          liked: liked,
          urlData: urlData,
          comments: comments.rows
        };
      })
    );

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function getPostsRefactor(req, res) {
  const { userId } = req.query;

  try {
    const postsQuery = await db.query(
      `
      SELECT
      p.*,
      COALESCE(r."userId", p."userId") AS "ownerUserId",
      COALESCE(u.username, ru.username) AS "ownerUsername",
      COALESCE(u.image, ru.image) AS "ownerImage",
      COUNT(l.id) AS likes,
      ARRAY_AGG(h.name) AS hashtags,
      CASE WHEN EXISTS (
        SELECT 1
        FROM likes
        WHERE likes."postId" = p.id AND likes."userId" = $1
      ) THEN true ELSE false END AS liked,
      ARRAY_AGG(
        json_build_object(
          'reposted', EXISTS (
            SELECT 1
            FROM "rePosts"
            WHERE "rePosts"."postId" = p.id AND "rePosts"."userId" = r."userId"
          ),
          'repostCount', (SELECT COUNT(*) FROM "rePosts" WHERE "rePosts"."postId" = p.id),
          'userId', r."userId",
          'userName', ru.username
        )
      ) AS repost
      FROM posts p
      LEFT JOIN "rePosts" r ON p.id = r."postId"
      LEFT JOIN users u ON p."userId" = u.id
      LEFT JOIN users ru ON r."userId" = ru.id
      LEFT JOIN likes l ON p.id = l."postId"
      LEFT JOIN post_hashtags ph ON p.id = ph."postId"
      LEFT JOIN hashtags h ON ph."tagId" = h.id
      GROUP BY p.id, "ownerUserId", "ownerUsername", "ownerImage"
      ORDER BY "createdAt" DESC;
      `,
      [userId]
    );
    const posts = await Promise.all(
      postsQuery.rows.map(async (post) => {
        const urlData = await getUrlMetaData(post.link);
        const comments = await getComments(userId, post.id);
        
        return {
          ...post,
          urlData: urlData,
          comments: comments.rows
        };
      })
    );

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function likePost(req, res) {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    await db.query(`INSERT INTO likes ("postId", "userId") VALUES ($1, $2)`, [
      postId,
      userId,
    ]);
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function unlikePost(req, res) {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    await db.query(`DELETE FROM likes WHERE "postId" = $1 AND "userId" = $2`, [
      postId,
      userId,
    ]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function searchUserRepository(user, userId) {
  try {
    const result = await db.query(
      `SELECT * FROM users WHERE username LIKE $1;`,
      [user + "%"]
    );

    const usersWithFollowing = await Promise.all(
      result.rows.map(async (searchedUser) => {
        const isFollowing = await checkFollowUser(searchedUser.id, userId);
        return { ...searchedUser, following: isFollowing };
      })
    );

    usersWithFollowing.sort((a, b) => {
      if (b.following && !a.following) return 1;
      if (!b.following && a.following) return -1;
      return a.username.localeCompare(b.username);
    });

    return usersWithFollowing;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
}

export async function getTagByName(id, hashtag) {
  try {
    const postsQuery = await db.query(
      `
      SELECT
        "p"."id",
        "p"."link",
        "p"."description",
        "p"."userId",
      COALESCE("p"."createdAt", NOW()) AS "createdAt",
        "u"."id" AS "ownerUserId",
        "u"."username" AS "ownerUsername",
        "u"."image" AS "ownerImage",
      COUNT("l"."id") AS "likes",
      ARRAY_AGG("h"."name") AS "hashtags",
      CASE
      WHEN EXISTS (SELECT 1 FROM "likes" WHERE "postId" = "p"."id" AND "userId" = $1) THEN TRUE
      ELSE FALSE
      END AS "liked",
        jsonb_build_array(
          jsonb_build_object(
            'reposted', false,
            'repostCount', COUNT("r"."id"),
            'userId', NULL,
            'userName', NULL
          )
        ) AS "repost"
      FROM
        "posts" "p"
      JOIN
        "users" "u" ON "p"."userId" = "u"."id"
      LEFT JOIN
        "likes" "l" ON "p"."id" = "l"."postId"
      LEFT JOIN
        "rePosts" "r" ON "p"."id" = "r"."postId"
      JOIN
        "post_hashtags" "ph" ON "p"."id" = "ph"."postId"
      JOIN
        "hashtags" "h" ON "ph"."tagId" = "h"."id"
      WHERE
        "h"."name" = $2
      GROUP BY
        "p"."id", "p"."link", "p"."description", "p"."userId", "p"."createdAt", "u"."id", "u"."username", "u"."image", "liked"
      ORDER BY
        "createdAt" DESC;
      `,
      [id, hashtag]
    );
    const posts = await Promise.all(
      postsQuery.rows.map(async (post) => {
        const urlData = await getUrlMetaData(post.link);
        //const comments = await getComments(post, post.id);

        return {
          ...post,
          urlData: urlData,
          //comments: comments.rows
        };
      })
    );
    return posts;
  } catch (err) {
    console.log(err.message);
  }
}

export async function deletePostsRepository(postId) {
  await db.query(`DELETE FROM posts WHERE "id" = $1;`, [postId]);
}

export async function updatePostRepository(postId, description) {
  await db.query('UPDATE posts SET description = $1 WHERE "id" = $2', [
    description,
    postId,
  ]);
}

export async function userPosts(userId) {
  const result = await db.query(`SELECT * FROM posts WHERE "userId" = $1;`, [
    userId,
  ]);
  return result;
}

export async function userInfo(id) {
  const result = await db.query(
    `SELECT id, username, image FROM users WHERE id = $1;`,
    [id]
  );
  return result;
}
export async function getPostsTimeLine(req, res) {
  const { userId } = req.query;

  try {
    const postsQuery = await db.query(
      `
      WITH PostDetails AS (
        SELECT
          p."id" AS "id",
          p."link" AS "link",
          p."description" AS "description",
          p."userId" AS "userId",
        COALESCE(p."createdAt", NOW()) AS "createdAt",
          u."id" AS "ownerUserId",
          u."username" AS "ownerUsername",
          u."image" AS "ownerImage",
        (SELECT COUNT(*) FROM "likes" l WHERE l."postId" = p."id") AS "likes",
          EXISTS (
          SELECT 1
          FROM "likes" l
          WHERE l."userId" = $1 
          AND l."postId" = p."id"
        ) AS "liked"
        FROM "posts" p
        JOIN "users" u ON p."userId" = u."id"
        WHERE p."userId" IN (SELECT "userId" FROM "follows" WHERE "followerId" = $1)
        GROUP BY p."id", u."id"
      ),
      RepostDetails AS (
        SELECT
          p."id" AS "id",
          p."link" AS "link",
          p."description" AS "description",
          p."userId" AS "userId",
        COALESCE(r."createdAt", NOW()) AS "createdAt",
          u."id" AS "ownerUserId",
          u."username" AS "ownerUsername",
          u."image" AS "ownerImage",
        (SELECT COUNT(*) FROM "likes" l WHERE l."postId" = p."id") AS "likes",
          EXISTS (
          SELECT 1
          FROM "likes" l
          WHERE l."userId" = $1
          AND l."postId" = p."id"
        ) AS "liked",
        TRUE AS "reposted",
        (SELECT COUNT(*) FROM "rePosts" rp WHERE rp."postId" = p."id") AS "repostCount",
        r."userId" AS "repostUserId",
        ru."username" AS "repostUsername"
        FROM "rePosts" r
        JOIN "posts" p ON r."postId" = p."id"
        JOIN "users" u ON p."userId" = u."id"
        JOIN "users" ru ON r."userId" = ru."id"
        WHERE r."userId" IN (SELECT "userId" FROM "follows" WHERE "followerId" = $1)
        GROUP BY p."id", r."createdAt", u."id", r."userId", ru."username"
      )
      SELECT
        "id",
        "link",
        "description",
        "userId",
        "createdAt",
        "ownerUserId",
        "ownerUsername",
        "ownerImage",
        "likes"::text,
      (
        SELECT ARRAY_AGG(h."name")
        FROM "post_hashtags" ph
        INNER JOIN "hashtags" h ON ph."tagId" = h."id"
        WHERE ph."postId" = rd."id"
      ) AS "hashtags",
        "liked",
      CASE
      WHEN "reposted" THEN
        jsonb_build_array(
          jsonb_build_object(
            'reposted', true,
            'repostCount', "repostCount",
            'userId', "repostUserId",
            'userName', "repostUsername"
          )
        )
      ELSE
        jsonb_build_array(
          jsonb_build_object(
            'userId', NULL,
            'reposted', false,
            'userName', NULL,
            'repostCount', 0
          )
        )
      END AS "repost"
      FROM RepostDetails rd

      UNION ALL

      SELECT
        "id",
        "link",
        "description",
        "userId",
        "createdAt",
        "ownerUserId",
        "ownerUsername",
        "ownerImage",
        "likes"::text,
      (
        SELECT ARRAY_AGG(h."name")
        FROM "post_hashtags" ph
        INNER JOIN "hashtags" h ON ph."tagId" = h."id"
        WHERE ph."postId" = pd."id"
      ) AS "hashtags",
        "liked",
          jsonb_build_array(
            jsonb_build_object(
              'userId', NULL,
              'reposted', false,
              'userName', NULL,
              'repostCount', 0
            )
          ) AS "repost"
      FROM PostDetails pd
      ORDER BY "createdAt" DESC;
      `,
      [userId]
    );
    const posts = await Promise.all(
      postsQuery.rows.map(async (post) => {
        const urlData = await getUrlMetaData(post.link);
        const comments = await getComments(userId, post.id);

        return {
          ...post,
          urlData: urlData,
          comments: comments.rows
        };
      })
    );

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
