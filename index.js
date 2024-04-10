const app = require('./app'); // the actual Express application
const config = require('./utils/config');
const logger = require('./utils/logger');

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});

//console.log('the environment is', app.get('env'));
console.log('the process env is', process.env.NODE_ENV);
