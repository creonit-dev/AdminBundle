declare var $:any;
declare var twig:any;
declare var Twig:any;
declare var tinymce:any;
declare var Typograf:any;

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

tinymce.PluginManager.add('typograf', function (editor, url) {
    'use strict';

    var scriptLoader = new tinymce.dom.ScriptLoader(),
        tp,
        typo = function () {
            if (tp) {
                editor.setContent(tp.execute(editor.getContent()));
                editor.undoManager.add();
            }
        };

    scriptLoader.add(url + '/../../../typograf/typograf.min.js');

    scriptLoader.loadQueue(function () {
        tp = new Typograf({
            locale: 'ru',
            mode: 'name'
        });
    });

    editor.addButton('typograf', {
        title: 'Типографика',
        icon: 'blockquote',
        onclick: typo
    });

    editor.addMenuItem('typograf', {
        context: 'format',
        text: 'Типографика',
        icon: 'blockquote',
        onclick: typo
    });
});

$(function(){
    Creonit.Admin.Component.Utils.initializeComponents();
});