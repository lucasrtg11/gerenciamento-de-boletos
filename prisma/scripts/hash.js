const bcrypt = require("bcryptjs");

async function run() {
  const password = process.argv[2];

  if (!password) {
    console.log("Informe a senha");
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  console.log("\nSenha:", password);
  console.log("Hash:", hash, "\n");
}

run();
