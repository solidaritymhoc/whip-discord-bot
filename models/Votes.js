module.exports = (sequelize, DataTypes) => {
    return sequelize.define('votes', {
        vote_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        whip: {
            type: DataTypes.STRING,
            defaultValue: 'abs',
            allowNull: false,
        },
    }, {
        timestamps: true,
    });
};