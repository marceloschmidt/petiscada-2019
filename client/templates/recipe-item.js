Template.recipeItem.helpers({
  path: function () {
    return Router.path('pedido', this.recipe);
  },

  highlightedClass: function () {
    if (this.size === 'large')
      return 'highlighted';
  }
});
