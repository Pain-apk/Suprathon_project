module.exports = {
  loadData: (req) => {
    return req.dataStore;
  },
  saveData: (req, data) => {
    req.dataStore = data;
    return true;
  }
};