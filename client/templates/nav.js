Template.nav.helpers({
  // Iron Router stores {initial: true} in history state if this is
  // the first route that we hit in an app. There are a variety of
  // unexpected ways that this can happen (for example oauth, or
  // hot code push), but we can't rely on going back in such cases.
  back: function () {
    return this.back && ! history.state.initial;
	},

	cartCount() {
		return Cart.find({ removed: { $ne: true } }).count();
	},

	code() {
		return localStorage.getItem('code');
	}
});


Template.nav.events({
	'click .js-code': () => {
		return Overlay.open('codeOverlay');
	}
})
