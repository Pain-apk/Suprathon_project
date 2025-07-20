module.exports = {
  loadData: (req) => req.dataStore,
  saveData: (req, data) => {
    req.dataStore = data;
    return true;
  }
};
