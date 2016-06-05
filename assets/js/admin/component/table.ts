module Creonit.Admin.Component{
    export class Table extends Component{


        render(){

            this.node.html(this.template.render($.extend({}, this.data, {parameters: this.query})));

            this.node.find('[js-component-action]').on('click', (e) => {
                e.preventDefault();
                let $action = $(e.currentTarget);
                this.action($action.data('name'), $action.data('options'));
            });


            this.patterns.forEach((pattern:Pattern) => {
                this.data[pattern.name].entities.forEach((entity:any) => {
                    let $entity = $('<tr>' + pattern.template.render(entity) + '</tr>');


                    $entity.find('[js-component-action]').on('click', function(e){
                        e.preventDefault();
                        let $action = $(this);
                        pattern.action($action.data('name'), $action.data('options'));
                    });
                    this.node.find('tbody').append($entity);
                });
            });


            Utils.initializeComponents(this.node, this);
        }

    }

}