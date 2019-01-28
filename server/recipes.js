Meteor.startup(function() {
	if (Menu.find().fetch().length === 0) {
		for (let key of Object.keys(Foods)) {
			Menu.insert(Foods[key]);
		}
		for (let key of Object.keys(Drinks)) {
			Menu.insert(Drinks[key]);
		}
		for (let key of Object.keys(Desserts)) {
			Menu.insert(Desserts[key]);
		}
	}
});

