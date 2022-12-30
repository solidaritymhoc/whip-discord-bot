const { usernames } = require('./mps.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});
const Mps = require('./models/Mps.js')(sequelize, Sequelize.DataTypes);
const force = process.argv.includes('--force') || process.argv.includes('-f');

console.log(`Found ${usernames.length} MPs`);

if (usernames.length === 0) {
    console.log('No Mps to import. Aborting.');
    return;
}
sequelize.sync({ force }).then(async () => {
    for (const username of usernames) {
        const upsert = Mps.upsert({ name: username });
        await Promise.resolve(upsert);
        console.log(`Imported ${username}`);
    }
    console.log('Database synced!');

    sequelize.close();
}).catch(console.error);

