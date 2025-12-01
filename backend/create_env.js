const fs = require('fs');
const content = `MONGO_URL=mongodb+srv://exam_admin:exam12345@examcluster.8qyerxj.mongodb.net/?appName=examcluster
PORT=3000
JWT_SECRET=secret_key_change_me`;

fs.writeFileSync('.env', content);
console.log('.env file created successfully');
