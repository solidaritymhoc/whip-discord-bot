module.exports = (sequelize, DataTypes) => {
    return sequelize.define('divisions', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
        },
        whip: {
            type: DataTypes.STRING,
        },
        url: {
            type: DataTypes.TEXT,
        },
        end_date: {
            type: DataTypes.DATE,
        },
    });
};