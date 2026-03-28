const express = require("express");
const path = require("path");
const pool = require("./db");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ARCHIVOS PUBLICOS
app.use(express.static(path.join(__dirname, "../public")));

// LOGIN
app.post("/login", async (req,res)=>{
  const {usuario,clave} = req.body;

  try{
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE usuario=$1 AND clave=$2",
      [usuario,clave]
    );

    if(result.rows.length > 0){
      const user = result.rows[0];

      res.json({
        ok:true,
        usuario:user.usuario,
        rol:user.rol
      });

    } else {
      res.json({ok:false});
    }

  }catch(err){
    console.error(err);
    res.status(500).json({error:"Error login"});
  }
});

// LEVANTAR SERVIDOR
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});