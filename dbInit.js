const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Votes = require('./models/Votes.js')(sequelize, Sequelize.DataTypes);
const Mps = require('./models/Mps.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
    const votes = [
        Votes.upsert({ id: 'B1458', whip: 'aye' }),
    ];

    const mps = [
        Mps.upsert({ name: 'cocoiadrop_' }),
    ];

    await Promise.all(votes);
    await Promise.all(mps);
    console.log('Database synced');

    sequelize.close();
}).catch(console.error);