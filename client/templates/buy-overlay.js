Template.buyOverlay.helpers({
	code() {
		return localStorage.getItem('code');
	}
})

Template.buyOverlay.buy = () => {
	const code = $('input').val();
	if (code && code !== localStorage.getItem('code') && !localStorage.getItem('newCode')) {
		$('.code').addClass('error');
		$('.alert-newcode').fadeIn(500);
		localStorage.setItem('newCode', code)
	} else {
		$('.alert-newcode').fadeOut(500);
		$('.code').removeClass('error');
		localStorage.removeItem('newCode');

		$('.btn-confirm').attr('disabled', true);
		Meteor.call('buy', code, Cart.find({ removed: { $ne: true } }).fetch(), function(err) {
			$('.btn-confirm').attr('disabled', false);
			if (err) {
				$('.code').addClass('error');
				$('.alert').fadeIn(500);
				setTimeout("$('.alert').fadeOut(500); $('.code').removeClass('error')", 3000);
			} else {
				localStorage.setItem('code', code);
				Cart.remove({});
				Meteor.subscribe('notifications', localStorage.getItem('code'));
				Overlay.close();
				Router.go('home');
			}
		});
	}
}

Template.buyOverlay.events({
	'click .js-buy': function(event) {
		Template.buyOverlay.buy();
	},

	'keydown input'(e) {
		if (e.keyCode === 13) {
			e.preventDefault();
			Template.buyOverlay.buy();
		}
	},
})

Template.buyOverlay.onRendered(function() {
	setTimeout(() => { $('input').focus() }, 300);
})
