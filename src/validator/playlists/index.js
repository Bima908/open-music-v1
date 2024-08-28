const InvariantError = require("../../exceptions/InvariantError");
const { PlaylistPayloadSchema, SongOnPlaylistPayloadSchema, DeleteSongOnPlaylistPayloadSchema } = require("./PlaylistPayloadSchema");

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateSongOnPlaylistPayload: (payload) => {
    const validationResult = SongOnPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeleteSongOnPlaylistPayload: (payload) => {
    const validationResult = DeleteSongOnPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;