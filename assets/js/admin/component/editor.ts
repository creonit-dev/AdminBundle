module Creonit.Admin.Component{
    export class Editor extends Component{

        static increment = 0;

        render(){
            this.node.empty();

            var node = this.node;

            if(this.options.modal){
                this.node.append(node = $(`
                    <div class="modal-content"> 
                        <div class="modal-header"> 
                            <button type="button" class="close"><span>×</span></button> 
                            <h4 class="modal-title">${this.schema.title}</h4> 
                        </div> 
                        
                        <div class="modal-body">
                        </div>
                   </div>    
                `));
                node = node.find('.modal-body');

                this.node.find('.modal-content').append(`<div class="modal-footer">${Helpers.submit('Сохранить и закрыть')} ${Helpers.submit('Сохранить')} ${Helpers.button('Закрыть')}</div>`);

                this.node.find('.modal-footer button[type=button], .modal-header .close').on('click', () => {
                    this.node.arcticmodal('close');
                });
            }



            this.patterns.forEach((pattern:Pattern) => {
                node.append(pattern.template.render($.extend({}, this.data, {parameters: this.query})));
            });

            if(!this.options.modal){
                this.node.append(Helpers.submit('Сохранить'));
            }


            var formId = `form${++Editor.increment}`,
                $form = $(`<form id="${formId}"></form>`);

            this.node.append($form);
            this.node.find('input, textarea, select, button').attr('form', formId);


            console.log(this.node.find('.text-editor'));

            this.node.find('.text-editor').tinymce({
                doctype: 'html5',
                element_format: 'html',
                plugins: ['anchor autolink code image fullscreen hr link media paste nonbreaking visualblocks table'],

                resize: true,
                height: 150,


                visualblocks_default_state: true,
                relative_urls : false,
                paste_data_images: true,

                paste_as_text: true,
                keep_styles: false,
                language: 'ru',
                statusbar: false,
                //toolbar: 'undo redo | bold italic | styleselect | link image code fullscreen hr link media nonbreaking visualblocks table',
                toolbar: 'styleselect | bold italic removeformat | link unlink | bullist numlist | table | image media | code fullscreen',
                image_advtab: true,
                menubar: false,
                setup: function(editor) {

                }
            });


            $form.on('submit', (e) => {
                e.preventDefault();
                var $form = $(e.currentTarget);
                var data = $form.serializeObject();

                this.node.find(`input[type="file"][form="${formId}"]`).each(function(){
                    var value = $(this)[0].files[0];
                    if(value){
                        data[$(this).attr('name')] = $(this)[0].files[0];
                    }
                });


                this.sendData(data)

            });

            Utils.initializeComponents(this.node, this);
        }
    }
}