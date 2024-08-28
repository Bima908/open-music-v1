require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require("@hapi/jwt");

const ClientError = require('./exceptions/ClientError');

// song & album
const AlbumsService = require('./services/AlbumsService');
const SongsService = require('./services/SongsService');
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const albums = require('./api/albums');
const songs = require('./api/songs');

// users
const UserService = require('./services/UserService');
const usersValidator = require('./validator/users');
const users = require('./api/users');

// authentications
const authentications = require("./api/authentications");
const AuthenticationsService = require('./services/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require("./validator/authentications");

// Playlist
const PlaylistValidator = require('./validator/playlists');
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/PlaylistsService');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborators');

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const userService = new UserService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService(songsService, collaborationsService);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: userService,
        validator: usersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService: userService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        userService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;
 
    // penanganan client error secara internal.
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }
     
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();