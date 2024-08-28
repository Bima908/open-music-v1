const songsOnPlaylistMapperResponse = ({ id, name, username }, songs) => ({
  id,
  name,
  username,
  songs,
});

module.exports = { songsOnPlaylistMapperResponse };
