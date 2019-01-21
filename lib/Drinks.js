Drinks = {

}

if (Meteor.isClient) {
	Meteor.startup(function () {
		Meteor.autorun(() => {
			Recipes.find({ type: 'drinks' }).forEach((recipe) => {
				Drinks[recipe.name] = recipe;
			});
		})
	})
}
