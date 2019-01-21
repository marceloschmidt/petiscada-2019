Foods = {

}


if (Meteor.isClient) {
	Meteor.startup(function () {
		Meteor.autorun(() => {
			Recipes.find({ type: 'foods' }).forEach((recipe) => {
				Foods[recipe.name] = recipe;
			});
		})
	})
}
