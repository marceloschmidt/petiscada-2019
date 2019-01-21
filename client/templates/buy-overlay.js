// If the auth overlay is on the screen but the user is logged in,
//   then we have come back from the loginWithTwitter flow,
//   and the user has successfully signed in.
//
// We have to use an autorun for this as callbacks get lost in the
//   redirect flow.
Template.buyOverlay.buy = () => {
	const code = $('input').val();
	$('.btn-confirm').attr('disabled', true);
	Meteor.call('buy', code, Session.get('overlayData'), function(err) {
		$('.btn-confirm').attr('disabled', false);
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

Template.buyOverlay.onRendered(function() {
	$('input').val(localStorage.getItem('code') || '')
})

Template.buyOverlay.events({
	'click .js-buy': function(event) {
		Template.buyOverlay.buy();
	},

	'focus input': function(event) {
		// if (focusedElement == this) return;
		focusedElement = $(event.target);
		setTimeout(function () { focusedElement.select(); }, 50);
	},

	'keydown input'(e) {
		if (e.keyCode === 13) {
			e.preventDefault();
			Template.buyOverlay.buy();
		}
	},
})
