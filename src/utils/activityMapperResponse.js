const activityMapperResponse = ({
  username, title, action, created_at, 
}) => ({
  username, title, action, time: created_at,
});

module.exports = { activityMapperResponse };
