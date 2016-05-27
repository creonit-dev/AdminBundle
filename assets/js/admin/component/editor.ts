module Creonit{
    export module Admin{
        export module Component{
            export class Editor extends Component{

                static increment = 0;

                render(){
                    this.node.empty();
                    this.patterns.forEach((pattern:Pattern) => {
                        this.node.append(pattern.template.render($.extend({}, this.data[pattern.name], {parameters: this.parameters})));
                    });

                    var formId = `form${++Editor.increment}`,
                        $form = $(`<form id="${formId}"></form>`);

                    this.node.append($form);
                    this.node.find('input, textarea, select, button').attr('form', formId);


                    $form.on('submit', (e) => {
                        e.preventDefault();
                        var $form = $(e.currentTarget);
                        var data = $form.serializeObject();

                        $form.find('input[type="file"]').each(function(){
                            data[$(this).attr('name')] = $(this)[0].files[0];
                        });


                        this.sendData(data)



                    });

                    find(this.node, {parent: this});
                }
            }
        }
    }

}