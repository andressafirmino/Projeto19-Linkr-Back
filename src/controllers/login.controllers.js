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
