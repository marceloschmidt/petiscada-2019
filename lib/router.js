// Global subscriptions
if (Meteor.isClient) {
	Meteor.subscribe('notifications', localStorage.getItem('code'));
	Meteor.subscribe('recipes');
}

Router.configure({
  layoutTemplate: 'appBody'
});

ComidasController = RouteController.extend({
  data: function () {
    return _.values(Foods);
  }
});

BebidasController = RouteController.extend({
  data: function () {
    return _.values(Drinks);
  }
});

SobremesasController = RouteController.extend({
  data: function () {
		return _.values(Desserts);
  }
});

PedidoController = RouteController.extend({
  data: function () {
		return Foods[this.params.name] || Drinks[this.params.name] || Desserts[this.params.name];
  }
});

Router.route('home', {
  path: '/'
});

Router.route('comidas', { template: 'foods' });
Router.route('bebidas', { template: 'drinks' });
Router.route('sobremesas', { template: 'desserts' });
Router.route('pedidos', { template: 'orders' });

Router.route('pedido', {
	path: '/pedido/:name',
	template: 'order'
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
