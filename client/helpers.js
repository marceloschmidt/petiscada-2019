pluralize = function(n, thing, options) {
  var plural = thing;
  if (_.isUndefined(n)) {
    return thing;
  } else if (n !== 1) {
    if (thing.slice(-1) === 's')
      plural = thing + 'es';
    else
      plural = thing + 's';
  }

  if (options && options.hash && options.hash.wordOnly)
    return plural;
  else
    return n + ' ' + plural;
}

Handlebars.registerHelper('pluralize', pluralize);

var DIMENSIONS = {
  small: '320x350',
  large: '640x480',
  full: '640x800'
};

UI.registerHelper('itemImage', function(options) {
  var size = options.hash.size || 'large';

	if (options.hash.item)
		return '/img/menu/' + DIMENSIONS[size] + '/' + options.hash.item.name + '.jpg';

});

UI.registerHelper('moneyFormat', function(number) {
		let dec = 2;
		let dsep = ',';
		let tsep = '.';
		if (isNaN(number) || number == null) return '';

		number = number.toFixed(~~dec);
		tsep = typeof tsep == 'string' ? tsep : ',';

		var parts = number.split('.'),
			fnums = parts[0],
			decimals = parts[1] ? (dsep || '.') + parts[1] : '';

		return fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
});

UI.registerHelper('getTime', function(date) {
		return ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2);
});

UI.registerHelper('getTimeDiff', function(date) {
	const d = new Date();
	return Math.floor((d.getTime() - date.getTime())/60000);
});

Handlebars.registerHelper('activePage', function() {
  // includes Spacebars.kw but that's OK because the route name ain't that.
  var routeNames = arguments;

  return _.include(routeNames, Router.current().route.name) && 'active';
});
