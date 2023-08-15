import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { getLogin, session } from "../repositories/login.repository.js";

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = getLogin(email);
    if (result.rowCount != 1) {
      return res
        .status(401)
        .send({ message: "Nenhum usuario com esse email foi achado" });
    }

    if (bcrypt.compareSync(password, result.rows[0].password) === false) {
      return res.status(401).send({ message: "Senha incorreta" });
    }
    const token = uuid();

    session(token, result.rows[0].id);

    res.status(200).send({ token });
  } catch (err) {
    res.status(500).send(err.message);
  }
}


export async function signUp(req, res) {
  const { username, email, password, image } = req.body;
  try {
    const userExists = await db.query(`SELECT id FROM users WHERE email = $1`, [email]);
    if(userExists.rowCount > 0) return res.status(409).send("Já existe um usuário com esse email");

    if(!username || !email || !password || !image) return res.status(400).send("Preencha todos os campos");

    const hashPassword = bcrypt.hashSync(password, 10);

    await db.query(`INSERT INTO users (username, email, password, image) VALUES ($1, $2, $3, $4)`, [username, email, hashPassword, image]);
    
    res.status(201).send("Usuário cadastrado com sucesso");
  } catch (err) {
    res.status(500).send(err.message);
  }
}