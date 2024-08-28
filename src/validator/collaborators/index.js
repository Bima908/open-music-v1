const InvariantError = require("../../exceptions/InvariantError");
const { PostDeleteCollaboratorPayload } = require("./schema");

const CollaboratorsValidator = {
  validateCollaborationPayload: (payload) => {
    const validationResult = PostDeleteCollaboratorPayload.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CollaboratorsValidator;
