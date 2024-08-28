const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const { playlistMapperResponse } = require('../utils/playlistMapperResponse');
const NotFoundError = require('../exceptions/NotFoundError');
const { songsOnPlaylistMapperResponse } = require('../utils/songsOnPlaylistMapperResponse');
const AuthorizationError = require('../exceptions/AuthorizationError');
const { playlistActivityMapperResponse } = require('../utils/playlistActivityMapperResponse');
const { activityMapperResponse } = require('../utils/activityMapperResponse');

class PlaylistsService {
  constructor(songsService, collaborationService) {
    this._pool = new Pool();
    this._songService = songsService;
    this._collaborationService = collaborationService;
  }

  async addPlaylist(name, user_id) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlists(id, name, user_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, user_id, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan.');
    }
 
    return result.rows[0].id;
  }

  async getPlaylists(user_id) {
    const textQuery = 'SELECT p.*, u.username FROM playlists AS p JOIN users AS u ON u.id = p.user_id LEFT JOIN collaborations AS c ON p.id = c.playlist_id WHERE u.id = $1 OR c.user_id = $1';

    const query = {
      text: textQuery,
      values: [user_id],
    };

    const result = await this._pool.query(query);
    return result.rows.map(playlistMapperResponse);
  }

  async getPlaylistById(playlist_id) {
    const query = {
      text: 'SELECT * FROM playlists JOIN users on playlists.user_id = users.id WHERE playlists.id = $1',
      values: [playlist_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan.');
    }

    const songs = await this._songService.getSongsByPlaylist(playlist_id);
    return songsOnPlaylistMapperResponse(result.rows[0], songs);
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
 
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan.');
    }

    return result.rows[0];
  }

  async addSongOnPlaylist(playlist_id, song_id) {
    const id = `playlist_songs-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const query = {
      text: 'INSERT INTO playlist_songs (id, playlist_id, song_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlist_id, song_id, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan lagu pada playlist ini.');
    }
    return result.rows[0].id;
  }

  async deleteSongOnPlaylist(playlist_id, song_id) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlist_id, song_id],
    };
 
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus lagu dari playlist ini.');
    }

    return result.rows[0];
  }

  async verifyPlaylistOwner(id, user_id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan.');
    }
    const playlist = result.rows[0];
    if (playlist.user_id !== user_id) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini.');
    }
  }

  async verifySongExisting(song_id) {
    const song = await this._songService.getSongById(song_id);
    if (!song) {
      throw new NotFoundError('Playlist tidak ditemukan.');
    }
  }

  async verifyPlaylistAccess(playlist_id, user_id) {
    try {
      await this.verifyPlaylistOwner(playlist_id, user_id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlist_id, user_id);
      } catch {
        throw error;
      }
    }
  }

  async postPlaylistActivity(playlist_id, song_id, user_id, action) {
    const id = `activity-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlist_song_activities(id, playlist_id, song_id, user_id, action, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, playlist_id, song_id, user_id, action, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Activity gagal ditambahkan.');
    }
 
    return result.rows[0].id;
  }

  async getPlaylistActivity(playlist_id) {
    const query = {
      text: 'SELECT u.username, s.title, pa.action, pa.created_at FROM playlist_song_activities AS pa JOIN users AS u ON pa.user_id = u.id JOIN playlists AS ps on ps.id = pa.playlist_id JOIN songs AS s ON s.id = pa.song_id  WHERE pa.playlist_id = $1',
      values: [playlist_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan.');
    }

    const activities = result.rows.map(activityMapperResponse);
    return playlistActivityMapperResponse(playlist_id, activities);
  }
}

module.exports = PlaylistsService;