Template.menuItem.helpers({
  path: function () {
    return Router.path('pedido', this.item);
  },

  highlightedClass: function () {
    if (this.size === 'large')
      return 'highlighted';
  }
});
