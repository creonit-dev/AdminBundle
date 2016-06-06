module Creonit.Admin.Component{
    export class Editor extends Component{

        static increment = 0;

        render(){
            this.node.empty();
            this.patterns.forEach((pattern:Pattern) => {
                this.node.append(pattern.template.render($.extend({}, this.data, {parameters: this.query})));
            });

            var formId = `form${++Editor.increment}`,
                $form = $(`<form id="${formId}"></form>`);

            this.node.append($form);
            this.node.find('input, textarea, select, button').attr('form', formId);


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