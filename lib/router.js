// Global subscriptions
if (Meteor.isClient) {
	Meteor.subscribe('notifications', localStorage.getItem('code'));
	Meteor.subscribe('menu');
}

Router.configure({
	layoutTemplate: 'appBody'
});

Router.route('home', {
  path: '/'
});

Router.route('comidas', {
	template: 'menu',
	data() {
		return {
			title: 'Comidas',
			items: Menu.find({ type: 'foods' })
		}
	}
});
Router.route('bebidas', {
	template: 'menu',
	data() {
		return {
			title: 'Bebidas',
			items: Menu.find({type: 'drinks'})
		}
	}
});
Router.route('sobremesas', {
	template: 'menu',
	data() {
		return {
			title: 'Sobremesas',
			items: Menu.find({ type: 'desserts' })
		}
	}
});

Router.route('pedidos', { template: 'orders' });

Router.route('pedido', {
	path: '/pedido/:name',
	template: 'order',
	data() {
		return Menu.findOne({ name: this.params.name });
	}
});
Router.route('admin', {
	layoutTemplate: null
});
Router.route('admin-customers', {
	path: '/admin/clientes',
	layoutTemplate: null
});
Router.route('admin-kitchen', {
	path: '/admin/cozinha',
	layoutTemplate: null
});
Router.route('admin-delivery', {
	path: '/admin/balcao',
	layoutTemplate: null
});
Router.route('admin-orders', {
	path: '/admin/pedidos',
	layoutTemplate: null
});
Router.route('cozinha', {
	layoutTemplate: null
});
Router.route('balcao', {
	layoutTemplate: null
});
Router.route('admin-settings', {
	path: '/admin/settings',
	layoutTemplate: null
});
