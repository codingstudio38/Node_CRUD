const database = process.env.DATABASE_NAME;
const mongooseConnect = require('mongoose');
mongooseConnect.connect(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    //console.log(`Successfully connected.`);
}).catch((error) => {
    console.log(`Failed to connect database..!! `, error);
})
module.exports = mongooseConnect;
