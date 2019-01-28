Template.home.helpers({
  featuredItems: function() {
    var selection = [];
		var menu = Menu.find({type: 'foods'}).fetch();
    for (var i = 0;i < 2;i++)
      selection.push(menu.splice(_.random(menu.length - 1), 1)[0]);
		menu = Menu.find({ type: 'drinks' }).fetch();
		selection.push(menu.splice(_.random(menu.length - 1), 1)[0]);
		menu = Menu.find({ type: 'desserts' }).fetch();
		selection.push(menu.splice(_.random(menu.length - 1), 1)[0]);

    return selection;
  }
});

Template.home.events({
	'click .waiter': () => {
			return Overlay.open('waiterOverlay');
	}
})
