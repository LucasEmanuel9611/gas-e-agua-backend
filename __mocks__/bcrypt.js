module.exports = {
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn().mockResolvedValue(true),
};
