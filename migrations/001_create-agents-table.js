/** @type {import("node-pg-migrate").ColumnDefinitions} */
exports.shorthands = undefined;

/** @param {import("node-pg-migrate").MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.createTable("crewm8_agents", {
    id: "id",
    agent_id: { type: "varchar(64)", notNull: true, unique: true },
    token_hash: { type: "varchar(255)", notNull: true },
    harness: { type: "varchar(32)", notNull: true },
    agent_name: { type: "varchar(255)", notNull: true },
    operator_name: { type: "varchar(255)", notNull: true },
    operator_email: { type: "varchar(255)", notNull: true },
    status: { type: "varchar(32)", notNull: true, default: "'active'" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("NOW()"),
    },
  });
};

/** @param {import("node-pg-migrate").MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.dropTable("crewm8_agents");
};
