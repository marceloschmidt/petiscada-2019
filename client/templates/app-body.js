var ANIMATION_DURATION = 300;
var MENU_KEY = 'menuOpen';
var IGNORE_CONNECTION_ISSUE_KEY = 'ignoreConnectionIssue';
var CONNECTION_ISSUE_TIMEOUT = 5000;

Session.setDefault(IGNORE_CONNECTION_ISSUE_KEY, true);
Session.setDefault(MENU_KEY, false);

// XXX: this work around until IR properly supports this
//   IR refactor will include Location.back, which will ensure that initator is
//   set
var nextInitiator = null, initiator = null;
Deps.autorun(function() {
  // add a dep
  Router.current();

  initiator = nextInitiator;
  nextInitiator = null;
});

Meteor.startup(function () {

  // set up a swipe left / right handler
  $(document.body).touchwipe({
    wipeLeft: function () {
      Session.set(MENU_KEY, false);
    },
    wipeRight: function () {
      Session.set(MENU_KEY, true);
    },
    preventDefaultEvents: false
  });
});

Template.appBody.onRendered(function() {
  this.find("#content-container")._uihooks = {
    insertElement: function(node, next) {
      // short-circuit and just do it right away
      if (initiator === 'menu')
        return $(node).insertBefore(next);

      var start = (initiator === 'back') ? '-100%' : '100%';

      $.Velocity.hook(node, 'translateX', start);
      $(node)
      .insertBefore(next)
      .velocity({translateX: [0, start]}, {
        duration: ANIMATION_DURATION,
        easing: 'ease-in-out',
        queue: false
      });
    },
    removeElement: function(node) {
      if (initiator === 'menu')
        return $(node).remove();

      var end = (initiator === 'back') ? '100%' : '-100%';

      $(node)
      .velocity({translateX: end}, {
        duration: ANIMATION_DURATION,
        easing: 'ease-in-out',
        queue: false,
        complete: function() {
          $(node).remove();
        }
      });
    }
  };

  this.find(".notifications")._uihooks = {
    insertElement: function(node, next) {
      $(node)
      .insertBefore(next)
      .velocity("slideDown", {
        duration: ANIMATION_DURATION,
        easing: [0.175, 0.885, 0.335, 1.05]
      });
    },
    removeElement: function(node) {
      $(node)
      .velocity("fadeOut", {
        duration: ANIMATION_DURATION,
        complete: function() {
          $(node).remove();
        }
      });
    }
	};
});

Template.appBody.onCreated(function() {
	this.toggleCart = (bool) => {
		const cartWrapper = $('.cd-cart-container');
		const cartIsOpen = (typeof bool === 'undefined') ? cartWrapper.hasClass('cart-open') : bool;

		if (cartIsOpen) {
			cartWrapper.removeClass('cart-open');
			//reset undo
			if (Cart.clearTimeout) {
				Meteor.clearTimeout(Cart.clearTimeout);
			}
		} else {
			cartWrapper.addClass('cart-open');
		}
	}
})

Template.appBody.helpers({
  menuOpen: function() {
    return Session.get(MENU_KEY) && 'menu-open';
  },

  overlayOpen: function() {
    return Overlay.isOpen() ? 'overlay-open' : '';
  },

  connected: function() {
    return Session.get(IGNORE_CONNECTION_ISSUE_KEY) ||
      Meteor.status().connected;
  },

  notifications: function() {
    return Notifications.find();
	},

	itemsCount() {
		const items = Cart.find({ removed: { $ne: true }}).fetch();
		return items.reduce((total, item) => { return total + item.quantity }, 0);
	},

	items() {
		return Cart.find({ removed: { $ne: true } });
	},

	itemsTotal() {
		const items = Cart.find({ removed: { $ne: true } }).fetch();
		return items.reduce((total, item) => { return total + Number(item.price) * Number(item.quantity) }, 0)
	},

	quantity(num) {
		return this.quantity === num ? 'selected' : '';
	},

	itemRemoved() {
		return Cart.findOne({ removed: true }) ? 'visible' : '';
	}
});

Template.appBody.events({
  'click .js-menu': function(event) {
    event.stopImmediatePropagation();
    event.preventDefault();
    Session.set(MENU_KEY, ! Session.get(MENU_KEY));
  },

  'click .js-back': function(event) {
    nextInitiator = 'back';

    // XXX: set the back transition via Location.back() when IR 1.0 hits
    history.back();
    event.stopImmediatePropagation();
    event.preventDefault();
  },

  'click .content-overlay': function(event) {
    Session.set(MENU_KEY, false);
    event.preventDefault();
  },

  'click #menu a': function(event) {
    nextInitiator = 'menu'
    Session.set(MENU_KEY, false);
  },

  'click .js-notification-action': function() {
    if (_.isFunction(this.callback)) {
      this.callback();
      Notifications.remove(this._id);
    } else {
      Notifications.remove(this._id);
		}
	},

	'click .cd-cart-container .delete-item'(event) {
		event.preventDefault();
		Cart.remove({ removed: true }, () => {
			Cart.update({ _id: this._id }, { $set: { removed: true } });
			Cart.clearTimeout = Meteor.setTimeout(() => { Cart.remove({ removed: true }) }, 10000);
		});
	},

	'change .cd-cart-container select'(event) {
		event.preventDefault();
		Cart.update({ _id: this._id }, { $set: { quantity: Number($(event.currentTarget).val()) }});
	},

	'click .cd-cart-container .undo'(event) {
		event.preventDefault();
		if (Cart.clearTimeout) {
			Meteor.clearTimeout(Cart.clearTimeout);
		}
		Cart.update({}, { $unset: { removed: 1 }}, { multi: true });
	},

	'click .cd-cart-container .checkout'(event, instance) {
		event.preventDefault();
		instance.toggleCart(true);
		if (Cart.find({ removed: { $ne: true } }).count() > 0) {
			Overlay.open('buyOverlay');
		}
	},

	'click .cd-cart-container .cd-cart-trigger'(event, instance) {
		event.preventDefault();
		instance.toggleCart();
	},

	'click .cd-cart-container'(event, instance) {
		if ($(event.target).is($('.cd-cart-container'))) instance.toggleCart(true);
	}
});
