declare var $:any;
declare var twig:any;
declare var Twig:any;


$.fn.reverse = [].reverse;
$.fn.serializeObject = function(){
    var json = {};
    $.map($(this).serializeArray(), function(n, i){
        json[n['name']] = n['value'];
    });
    return json;
};

$(function(){
    Creonit.Admin.Component.find();
});