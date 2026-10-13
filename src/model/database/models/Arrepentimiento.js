// Solicitudes del "Botón de arrepentimiento" (Res. 424/2020 de la Secretaría de
// Comercio Interior): el cliente cancela una compra dentro de los 10 días y
// recibe un código de identificación de su pedido.
module.exports = (sequelize, DataTypes) => {
  const Arrepentimiento = sequelize.define(
    "Arrepentimiento",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      codigo: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      usuarioId: DataTypes.INTEGER.UNSIGNED,
      pedidoId: DataTypes.INTEGER.UNSIGNED, // si el número coincide con un pedido de ese email
      numeroPedido: { type: DataTypes.STRING(20), allowNull: false }, // lo que escribió el cliente
      nombre: { type: DataTypes.STRING(90), allowNull: false },
      email: { type: DataTypes.STRING(120), allowNull: false },
      telefono: DataTypes.STRING(20),
      motivo: DataTypes.STRING(500),
      estado: { type: DataTypes.ENUM("recibida", "resuelta"), allowNull: false, defaultValue: "recibida" },
      resueltaEn: DataTypes.DATE,
    },
    { tableName: "arrepentimientos", updatedAt: false }
  );

  Arrepentimiento.associate = (db) => {
    Arrepentimiento.belongsTo(db.Pedido, { as: "pedido", foreignKey: "pedidoId", constraints: false });
  };

  return Arrepentimiento;
};
