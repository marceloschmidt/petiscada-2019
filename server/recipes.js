Meteor.startup(function() {
	if (Recipes.find().fetch().length === 0) {
		for (let key of Object.keys(Foods)) {
			Recipes.insert(Foods[key]);
		}
		for (let key of Object.keys(Drinks)) {
			Recipes.insert(Drinks[key]);
		}
		for (let key of Object.keys(Desserts)) {
			Recipes.insert(Desserts[key]);
		}
	}
});

