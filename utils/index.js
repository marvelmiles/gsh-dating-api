export const getAll = async (model, reqQuery, match) => {
  const page = parseInt(reqQuery.page) || 1;
  const size = parseInt(reqQuery.size) || 10;

  const totalDocs = await model.countDocuments(match);
  const totalPages = Math.ceil(totalDocs / size);

  const data = await model
    .find(query)
    .skip((page - 1) * size)
    .limit(size);

  return {
    totalDocs,
    totalPages,
    data,
  };
};

export const setFutureDate = (number, format = "day", date = new Date()) => {
  return new Date(
    new Date(date).getTime() +
      number *
        {
          day: 86400000,
          mins: 60000,
        }[format]
  );
};
