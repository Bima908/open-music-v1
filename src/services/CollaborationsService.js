const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaborator(playlistId, userId) {
    const id = `collaboration-${nanoid()}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const query = {
      text: "INSERT INTO collaborations (id, playlist_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      values: [id, playlistId, userId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan collaborator.');
    }
    return result.rows[0].id;
  }

  async deleteCollaborator(playlistId, userId) {
    const query = {
      text: "DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id",
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menghapus collaborator.');
    }
    return result.rows[0].id;
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    
    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }

  async verifyCollaboratorOwner(owner_id) {
    const query = {
      text: "SELECT * FROM collaborations as c JOIN playlist as p ON c.playlist_id = p.id WHERE user_id = $1",
      values: [owner_id],
    };

    const result = this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan collaborator.');
    }
    return result.rows[0].id;
  }
}

module.exports = CollaborationsService;
