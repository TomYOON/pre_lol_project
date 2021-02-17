const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrpyt = require('bcryptjs');
const User = require('./models/User');
dotenv.config({ path: './config/.env' });

//connect db
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.LOL_MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

connectDB();

for (let i = 0; i < 30; i++) {
  const name = `userTest${i}`;
  const email = `${name}@${name}.com`;
  const password = 'aaaaaa';
  const point = 1000 + i * 10;
  const newUser = new User({
    name,
    email,
    password,
    point,
  });

  bcrpyt.genSalt(10, (
    err,
    salt //자릿수, 콜백
  ) =>
    bcrpyt.hash(newUser.password, salt, (err, hash) => {
      //password, salt, callback
      if (err) throw err;
      // Set password to hashed
      newUser.password = hash; //콜백된 해쉬를 패스워드에 넣음
      // Save user
      newUser
        .save() //몽고DB에 save promise 반환
        .then((user) => {})
        .catch((err) => console.log(err));
    })
  );
}
