/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("collaborations", {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      unique: true,
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    created_at: {
      type: 'TEXT',
      notNull: true,
      default: new Date().toISOString(),
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
      default: new Date().toISOString(),
    },
  });

  pgm.createConstraint("collaborations", "fk_collaborations.users_id.id", "FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE");

  pgm.createConstraint("collaborations", "fk_collaborations.playlist_id.id", "FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("collaborations");
};
