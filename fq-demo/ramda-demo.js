requirejs.config({
  paths: {
    ramda: 'https://cdnjs.cloudflare.com/ajax/libs/ramda/0.13.0/ramda.min',
    jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min'
  }
});

require([
    'ramda',
    'jquery'
  ],
  function (_, $) {

    const Impure = {
      getJSON: _.curry((callback, url)=> $.getJSON(url, callback)),

      setHtml: _.curry((sel, html)=> $(sel).html(html)),
    };

    const img = function(url) {
      return $('<img />', { src: url });
    };

// old
    // const mediaUrl = _.compose(_.prop('m'), _.prop('media'));
    
    // const srcs = _.compose(_.map(mediaUrl), _.prop('items'));

    // const images = _.compose(_.map(img), srcs);
    
// new
    // const mediaUrl = _.compose(_.prop('m'), _.prop('media'));

    // const images = _.compose(_.map(img), _.map(mediaUrl), _.prop('items'));

// next
    const mediaUrl = _.compose(_.prop('m'), _.prop('media'));
    const images = _.compose(_.map(_.compose(img, mediaUrl)), _.prop('items'));


    const url = term=> 'https://api.flickr.com/services/feeds/photos_public.gne?tags=' + term + '&format=json&jsoncallback=?';

    const renderImages = _.compose(Impure.setHtml('body'), images);

    // const log = _.curry((tag, x)=> {
    //   console.log(tag, x);
    //   return x;
    // });

    // const t = _.compose(log('response'), renderImages);

    const app = _.compose(Impure.getJSON(renderImages), url);

    app('cat');

});


var compose = function(f,g) {
  return function(x) {
    return f(g(x));
  };
};