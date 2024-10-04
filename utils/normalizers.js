export const createSuccessBody = (
  data,
  message = "Request was successful",
  format = "json"
) => {
  switch (format) {
    default:
      return {
        data,
        code: "REQUEST_OK",
        success: true,
        statusCode: 200,
        status: 200,
        message,
        timestamp: new Date().toISOString(),
      };
  }
};

export const safeParseJSON = (value, errKey = "body value") => {
  try {
    return JSON.parse(value);
  } catch (err) {
    throw `Expected ${errKey} should be of type JSON`;
  }
};
