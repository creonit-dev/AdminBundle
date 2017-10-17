module Creonit.Admin.Component{
    export class Editor extends Component{

        protected locked = false;

        static increment = 0;


        initialize(){
            this.node.addClass('component component-editor');
        }


        render(){
            this.node.empty();

            var node = this.node;

            if(this.options.modal){
                this.node.append(node = $(`
                    <div class="modal-content"> 
                        <div class="modal-header"> 
                            <button type="button" class="close"><span>×</span></button> 
                            <h4 class="modal-title">${this.parameters.title}</h4> 
                        </div> 
                        
                        <div class="modal-body">
                        </div>
                   </div>    
                `));
                node = node.find('.modal-body');

                this.node.find('.modal-content').append(`<div class="modal-footer">${Helpers.submit('Сохранить и закрыть', {className: 'editor-save-and-close'})} ${Helpers.submit('Сохранить')} ${Helpers.button('Закрыть')}</div>`);

                this.node.find('.modal-footer button[type=button], .modal-header .close').on('click', () => {
                    this.close();
                });
            }



                node.append(this.template.render($.extend({}, this.data, {_query: this.query, _key: this.query.key || null})));

            if(!this.options.modal){
                this.node.append(Helpers.submit('Сохранить'));
            }


            var formId = `form${++Editor.increment}`,
                $form = $(`<form id="${formId}"></form>`);

            this.node.append($form);
            this.node.find('input, textarea, select, button').attr('form', formId).filter('input').eq(0).focus();

            this.node.find('select[js-component-select-reload]').change(() => {

                var data = $form.serializeObject(),
                    query = this.getQuery();


                this.request('reload_data', query, data, (response) => {
                    if (this.checkResponse(response)) {
                        this.applyResponse(response);
                    }
                });

            });

            this.node.find('.text-editor').tinymce({
                doctype: 'html5',
                element_format: 'html',
                plugins: ['anchor autolink code colorpicker contextmenu image fullscreen hr link lists media paste nonbreaking  visualblocks table searchreplace charmap'],
                resize: true,
                height: 150,
                visualblocks_default_state: true,
                relative_urls : false,
                paste_data_images: true,
                paste_as_text: true,
                keep_styles: false,
                language: 'ru',
                statusbar: false,
                toolbar: 'formatselect | bold italic removeformat | link unlink | bullist numlist | image media | code fullscreen',
                image_advtab: true,
                menubar: 'edit insert view format table tools',
                browser_spellcheck: true,
                setup: function(editor) {

                }
            });


            this.node.find('input')
                .filter('[data-inputmask]')
                .inputmask()
                .end()
                .filter('[data-datetimepicker]')
                .each(function(i, input){
                    const $input = $(input);
                    $input.datetimepicker($.extend({
                        locale: 'ru',
                        showClear: true,
                        showTodayButton: true,
                        showClose: true,
                        useCurrent: false
                    }, $input.data('datetimepicker')));
                });


            this.node.find('.editor-save-and-close').on('click', (e) => {
                $(e.currentTarget).attr('clicked', true);
            });

            this.node.find('[js-component-action]').on('click', (e) => {
                e.preventDefault();
                let $action = $(e.currentTarget);
                this.action($action.data('name'), $action.data('options'));
            });

            $form.on('submit', (e) => {
                e.preventDefault();

                if(this.locked){
                    return;
                }

                this.locked = true;


                var data = $form.serializeObject(),
                    query = this.getQuery(),
                    $buttonCloseAfterSave = this.node.find('.editor-save-and-close[clicked]'),
                    closeAfterSave = !!$buttonCloseAfterSave.length;

                $buttonCloseAfterSave.removeAttr('clicked');

                if(closeAfterSave){
                    query.closeAfterSave = 1;
                }

                this.node.find(`input[type="file"][form="${formId}"]`).each(function(){
                    var value = $(this)[0].files[0];
                    if(value){
                        data[$(this).attr('name')] = $(this)[0].files[0];
                    }
                });

                this.node.find('.error-message').each(function(){
                    var $message = $(this),
                        $group = $message.closest('.form-group');

                    $message.remove();
                    $group.removeClass('has-error');
                });


                this.request('send_data', query, data, (response) => {
                    this.locked = false;
                    if(this.checkResponse(response)){
                        if(closeAfterSave){
                            this.close();
                        }else{
                            this.applyResponse(response);
                        }
                        this.trigger('save', {response: response});

                    }else{
                        $.each(response.error, (scope, messages) => {
                            if('_' == scope) return;
                            this.node.find(`input[name=${scope}], select[name=${scope}], textarea[name=${scope}]`).each(function(){
                                var $control = $(this),
                                    $group = $control.closest('.form-group');

                                $group.addClass('has-error');
                                $control.after(`<span class="help-block error-message">${messages.join('<br>')}</span>`);
                            });
                        });
                    }
                });

                if (this.parent) {
                    this.parent.loadData();
                }
            });

            this.trigger('render', {});

            Utils.initializeComponents(this.node, this);
        }
    }
}