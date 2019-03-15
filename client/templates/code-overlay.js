Template.codeOverlay.setCode = () => {
	const code = $('input').val();
	Meteor.call('checkCode', code, function (err) {
		if (err) {
			$('.code').addClass('error');
			$('.alert').fadeIn(500);
			setTimeout("$('.alert').fadeOut(500); $('.code').removeClass('error')", 3000);
		} else {
			localStorage.setItem('code', code);
			Meteor.subscribe('notifications', localStorage.getItem('code'));
			Overlay.close();
			Router.go('home');
			$('nav .code').text(code);
		}
	});
}
Template.codeOverlay.events({
	'keydown input'(e, instance) {
		if (e.keyCode === 13) {
			e.preventDefault();
			Template.codeOverlay.setCode();
		}
	},

	'click .js-call'(e) {
		e.preventDefault();
		Template.codeOverlay.setCode();
	},
})

Template.codeOverlay.onRendered(function() {
	setTimeout(() => { $('input').focus(); }, 300);
})
