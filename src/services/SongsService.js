const { Pool } = require("pg");
const { nanoid } = require('nanoid');
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");
const { songMapperResponse, songMapperDetailResponse } = require("../utils/songMapperResponse");

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong(
    {
      title, year, genre, performer, duration = null, albumId = null, 
    },
  ) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs (id, title, year, genre, performer, duration, album_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
 
    return result.rows[0].id;
  }

  async getSongs(title = null, performer = null) {
    let textQuery = 'SELECT * FROM songs';
    const values = [];

    if (title) {
      textQuery += ` WHERE LOWER(title) LIKE $${values.length + 1}`;
      values.push(`%${title.toLowerCase()}%`);
    }

    if (performer) {
      textQuery += `${values.length > 0 ? ' AND' : ' WHERE'} LOWER(performer) LIKE $${values.length + 1}`;
      values.push(`%${performer.toLowerCase()}%`);
    }

    const query = {
      text: textQuery,
      values,
    };

    const result = await this._pool.query(query);
    return result.rows.map(songMapperResponse);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(songMapperDetailResponse)[0];
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);
    return result.rows.map(songMapperDetailResponse);
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId, 
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };
 
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
 
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    return result.rows[0];
  }

  async getSongsByPlaylist(playlist_id) {
    const query = {
      text: 'SELECT songs.* FROM songs JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
      values: [playlist_id],
    };

    const result = await this._pool.query(query);
    return result.rows.map(songMapperResponse);
  }
}

module.exports = SongsService;
