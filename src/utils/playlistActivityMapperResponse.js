const playlistActivityMapperResponse = (playlist_id, activity) => ({
  playlistId: playlist_id,
  activities: activity,
});

module.exports = { playlistActivityMapperResponse };
