module Creonit.Admin.Component{
    export class Table extends Component{


        render(){

            this.node.empty();

            var node = this.node;

            if(this.options.modal){
                this.node.append(node = $(`
                    <div class="modal-content"> 
                        <div class="modal-header"> 
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button> 
                            <h4 class="modal-title">${this.schema.title}</h4> 
                        </div> 
                        
                        <div class="modal-body">
                        </div>
                   </div>    
                `));
                node = node.find('.modal-body');

                this.node.find('.modal-header .close').on('click', () => {
                    this.node.arcticmodal('close');
                });
            }


            node.html(this.template.render($.extend({}, this.data, {parameters: this.query})));

            this.node.find('[js-component-action]').on('click', (e) => {
                e.preventDefault();
                let $action = $(e.currentTarget);
                this.action($action.data('name'), $action.data('options'));
            });


            this.patterns.forEach((pattern:Pattern) => {
                this.data.entities.forEach((entity:any) => {
                    let $entity = $('<tr>' + pattern.template.render(entity) + '</tr>');

                    $entity.find('[js-component-action]').on('click', function(e){
                        e.preventDefault();
                        let $action = $(this);
                        pattern.action($action.data('name'), $action.data('options'));
                    });
                    this.node.find('tbody').append($entity);
                });
            });


            if(!this.node.find('tbody').children().length){
                this.node.find('tbody').html('<tr><td colspan="'+(this.node.find('thead td').length)+'">Список пуст</td></tr>');
            }


            Utils.initializeComponents(this.node, this);
        }

    }

}