const Joi = require("joi");

const PostDeleteCollaboratorPayload = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { PostDeleteCollaboratorPayload };
