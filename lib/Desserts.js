Desserts = {

}

if (Meteor.isClient) {
	Meteor.startup(function() {
		Meteor.autorun(() => {
			Recipes.find({ type: 'desserts' }).forEach((recipe) => {
				Desserts[recipe.name] = recipe;
			});
		})
	})
}
