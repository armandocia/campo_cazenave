const bcrypt = require("bcrypt");
const pool = require("./db");

async function crearUsuario() {
  const usuario = "admin";
  const clave = "1234";

  const hash = await bcrypt.hash(clave, 10);

  await pool.query(
    "INSERT INTO usuarios (usuario, clave, rol) VALUES ($1, $2, $3)",
    [usuario, hash, "admin"]
  );

  console.log("Usuario creado con contraseña encriptada");
}

crearUsuario();