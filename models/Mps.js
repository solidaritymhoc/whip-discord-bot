module.exports = (sequelize, DataTypes) => {
    return sequelize.define('mps', {
        name: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
    }, {
        paranoid: true,
        timestamps: true,
    });
};