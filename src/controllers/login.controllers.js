import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { getLogin, session, checkEmail, postSignUp } from "../repositories/login.repository.js";
import { db } from "../database/database.connection.js";

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = await getLogin(email);
    if (result.rowCount != 1) {
      return res
        .status(404)
        .send({ message: "Nenhum usuario com esse email foi achado" });
    }

    if (bcrypt.compareSync(password, result.rows[0].password) === false) {
      return res.status(401).send({ message: "Senha incorreta" });
    }
    const token = uuid();

    session(token, result.rows[0].id);

    res.status(200).send({
      userId: result.rows[0].id,
      username: result.rows[0].username,
      image: result.rows[0].image,
      token: token,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function signUp(req, res) {
  const { username, email, password, image } = req.body;
  try {
    const userExists = await checkEmail(email);

    if (userExists.rowCount > 0)
      return res.status(409).send("Já existe um usuário com esse email");

    if (!username || !email || !password || !image)
      return res.status(400).send("Preencha todos os campos");

    const hashPassword = bcrypt.hashSync(password, 10);

    await postSignUp(username, email, hashPassword, image);

    res.status(201).send("Usuário cadastrado com sucesso");
  } catch (err) {
    res.status(500).send(err.message);
  }
}
