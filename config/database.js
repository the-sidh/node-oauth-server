var env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/OAUTH';
} else if (env === 'test') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/OAUTH'
}

module.exports = {
    'secret':'kokdkdsisfis93939487717qejjdj',
    'database': process.env.MONGODB_URI
  };