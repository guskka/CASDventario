import { fakerPT_BR as faker } from "@faker-js/faker";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateData() {
  const users = [];

  for (let i = 1; i <= 20; i++) {
    users.push({
      id: String(i),
      name: faker.person.fullName(),
      username: faker.internet.username(),
      status: faker.helpers.arrayElement(["ATIVO", "PENDENTE", "INATIVO"]),
      role: faker.helpers.arrayElement(["BASICO", "MESTRE"]),
      email: faker.internet.email().toLocaleLowerCase(),
    });
  }

  const db = { users };

  const filePath = path.join(__dirname, "db.json");

  fs.writeFileSync(filePath, JSON.stringify(db, null, 2), "utf-8");

  console.log("✅ db.json gerado com sucesso com 20 usuários!");
}

generateData();
