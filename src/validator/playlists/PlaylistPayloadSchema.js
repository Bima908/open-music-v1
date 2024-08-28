const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
  user_id: Joi.string().required(),
});

const SongOnPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
  user_id: Joi.string().required(),
});

const DeleteSongOnPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { 
  PlaylistPayloadSchema, 
  SongOnPlaylistPayloadSchema, 
  DeleteSongOnPlaylistPayloadSchema, 
};
