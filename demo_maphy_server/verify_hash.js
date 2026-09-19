const bcrypt = require('bcryptjs');

const hash = "$2a$10$7Z9VWrngoD5mgclF1FkW5OfGAlnu5sHwLaEIOluslDL33vNMz.u22";
const candidates = ['admin', 'password', 'Admin@123', 'admin123', 'maphy', 'shriram', 'demo@123'];

async function test() {
  for (const cand of candidates) {
    const match = await bcrypt.compare(cand, hash);
    console.log(`Candidate '${cand}': ${match ? 'MATCH ✅' : 'NO MATCH ❌'}`);
  }
}

test();
