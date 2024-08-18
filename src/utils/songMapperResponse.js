const songMapperResponse = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

const songMapperDetailResponse = ({
  id,
  title,
  year,
  performer,
  genre, 
  duration, 
  album_id,
}) => ({
  id,
  title,
  year, 
  performer,
  genre,
  duration: parseInt(duration, 10),
  albumId: album_id,
});

module.exports = { songMapperResponse, songMapperDetailResponse };
