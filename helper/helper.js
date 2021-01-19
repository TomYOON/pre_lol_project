module.exports = {
  formatDate: function (date) {
    return date.toISOString().substring(0, 10).replace(/-/g, '');
  },
};
