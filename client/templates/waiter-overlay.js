Template.waiterOverlay.callWaiter = () => {
	const code = $('input').val();
	Meteor.call('waiter', code, function (err) {
		if (err) {
			$('.code').addClass('error');
			$('.alert').fadeIn(500);
			setTimeout("$('.alert').fadeOut(500); $('.code').removeClass('error')", 3000);
		} else {
			localStorage.setItem('code', code);
			Meteor.subscribe('notifications', localStorage.getItem('code'));
			Overlay.close();
			Router.go('home');
		}
	});
}
Template.waiterOverlay.events({
	'keydown input'(e, instance) {
		if (e.keyCode === 13) {
			e.preventDefault();
			Template.waiterOverlay.callWaiter();
		}
	},

	'click .js-call'(e) {
		e.preventDefault();
		Template.waiterOverlay.callWaiter();
	},
})

Template.waiterOverlay.onRendered(function() {
	setTimeout(() => { $('input').focus(); }, 300);
})
