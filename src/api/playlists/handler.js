const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { name } = request.payload;
    
    this._validator.validatePlaylistPayload({ name, user_id: credentialId });
    const playlist_id = await this._service.addPlaylist(name, credentialId);
  
    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan.',
      data: {
        playlistId: playlist_id,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(id, credentialId);
      await this._service.deletePlaylistById(id);
     
      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
     
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async postSongOnPlaylistHandler(request, h) {
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const { id: playlist_id } = request.params;

    this._validator.validateSongOnPlaylistPayload({ songId, user_id: credentialId });

    try {
      await this._service.verifyPlaylistAccess(playlist_id, credentialId);
      await this._service.verifySongExisting(songId);
      
      const id = await this._service.addSongOnPlaylist(playlist_id, songId);
      await this._service.postPlaylistActivity(playlist_id, songId, credentialId, "add");
      const response = h.response({
        status: 'success',
        message: 'Lagu pada Playlist ini berhasil ditambahkan.',
        data: {
          id,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
   
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      
      await this._service.verifyPlaylistAccess(id, credentialId);
      
      const playlist = await this._service.getPlaylistById(id);
      
      return {
        status: 'success',
        data: {
          playlist,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
   
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteSongOnPlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      const { songId } = request.payload;

      this._validator.validateDeleteSongOnPlaylistPayload(request.payload);

      await this._service.verifyPlaylistAccess(id, credentialId);
      await this._service.deleteSongOnPlaylist(id, songId);
      await this._service.postPlaylistActivity(id, songId, credentialId, "delete");
     
      return {
        status: 'success',
        message: 'Lagu dari Playlist berhasil dihapus.',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
     
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistActivityHandler(request, h) {
    try {
      const { id: playlist_id } = request.params;
      const { id: credentialId } = request.auth.credentials;
  
      await this._service.verifyPlaylistAccess(playlist_id, credentialId);
      const activities = await this._service.getPlaylistActivity(playlist_id);
      console.log(activities);
      
      return {
        status: 'success',
        data: activities,
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
   
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = PlaylistHandler;
