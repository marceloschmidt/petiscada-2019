Template.home.helpers({
  featuredRecipes: function() {
    var selection = [];
		var recipes = Recipes.find({type: 'foods'}).fetch();
    for (var i = 0;i < 2;i++)
      selection.push(recipes.splice(_.random(recipes.length - 1), 1)[0]);
		recipes = Recipes.find({ type: 'drinks' }).fetch();
		selection.push(recipes.splice(_.random(recipes.length - 1), 1)[0]);
		recipes = Recipes.find({ type: 'desserts' }).fetch();
		selection.push(recipes.splice(_.random(recipes.length - 1), 1)[0]);

    return selection;
  }
});

Template.home.events({
	'click .waiter': () => {
			return Overlay.open('waiterOverlay');
	}
})
