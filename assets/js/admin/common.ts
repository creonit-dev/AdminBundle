declare var $:any;
declare var twig:any;
declare var Twig:any;

$.arcticmodal('setDefault', {
    modal: false,
    closeOnEsc: false,
    openEffect: {
        type: 'none'
    },
    closeEffect: {
        type: 'none'
    },
    //fixed: '.header.is-fixed',
    closeOnOverlayClick: true
});


$.fn.reverse = [].reverse;
$.fn.serializeObject = function(){
    var json = {};
    $.map($(this).serializeArray(), function(n, i){
        json[n['name']] = n['value'];
    });
    return json;
};

$(function(){
    Creonit.Admin.Component.Utils.initializeComponents();
});