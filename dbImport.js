const { users } = require('./mps.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});
const Mps = require('./models/Mps.js')(sequelize, Sequelize.DataTypes);
const force = process.argv.includes('--force') || process.argv.includes('-f');

console.log(`Found ${users.length} MPs`);

if (users.length === 0) {
    console.log('No Mps to import. Aborting.');
    return;
}
sequelize.sync({ force }).then(async () => {
    for (const user of users) {
        const upsert = Mps.upsert({ name: user.reddit, discord_id: user.discord_id });
        await Promise.resolve(upsert);
        console.log(`Imported ${user.reddit}`);
    }
    console.log('Database synced!');

    sequelize.close();
}).catch(console.error);

