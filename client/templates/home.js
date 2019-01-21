Template.home.helpers({
  // selects FEATURED_COUNT number of recipes at random
  featuredRecipes: function() {
    var selection = [];
		var recipes = _.values(Foods)
    for (var i = 0;i < 2;i++)
      selection.push(recipes.splice(_.random(recipes.length - 1), 1)[0]);
		recipes = _.values(Drinks)
		selection.push(recipes.splice(_.random(recipes.length - 1), 1)[0]);
		recipes = _.values(Desserts)
		selection.push(recipes.splice(_.random(recipes.length - 1), 1)[0]);

    return selection;
  }
});

Template.home.events({
	'click .waiter': () => {
			return Overlay.open('waiterOverlay');
	}
})
