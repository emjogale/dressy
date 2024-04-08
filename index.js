const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const app = require('./app'); // the actual Express application

// console.log('the environment is', app.get('env'));
// console.log('the process env is', process.env);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
