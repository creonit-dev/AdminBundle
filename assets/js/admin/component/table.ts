module Creonit.Admin.Component{
    export class Table extends Component{

        applySchema(schema:any){
            super.applySchema(schema);

            this.actions['_visible'] = (options) => {
                var $row = this.findRowById(options.row_id),
                    $button = $row.find('.table-row-visible'),
                    visible = !$button.hasClass('mod-visible');

                $button.toggleClass('mod-visible', visible);
                this.request('_visible', {key: options.key, scope: options.scope}, {visible: visible}, (response) => {
                    if(this.checkResponse(response)){
                        $button.toggleClass('mod-visible', response.data.visible);
                    }
                })
            };

            this.actions['_delete'] = (options) => {
                if(!confirm('Элемент будет удален, продолжить?')){
                    return;
                }

                this.findRowById(options.row_id).remove();
                this.request('_delete', options, null, (response) => {
                    this.checkResponse(response);
                });
                this.loadData();
            };
        }

        findRowById(id:number){
            var result = this.node.find(`tr[data-row-id=${id}]:eq(0)`);
            return result.length ? result : null;
        }

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


            node.html(this.template.render($.extend({}, this.data, {_query: this.query})));



            this.scopes.forEach((scope:Scope) => {
                this.data.entities.forEach((entity:any) => {
                    let rowId = Utils.generateId();
                    let $entity = $(`<tr data-row-id="${rowId}">` + scope.template.render($.extend({}, entity, {
                            _visible: function(){
                                return Utils.raw(Helpers.action(Utils.raw(Helpers.button('', {size: 'xs', icon: 'eye', className: `table-row-visible ${entity.visible ? 'mod-visible' : ''}`})), ['_visible', {scope: scope.name, key: entity._key, row_id: rowId}]));
                            },
                            _delete: function(){
                                return Utils.raw(Helpers.action(Utils.raw(Helpers.button('', {size: 'xs', icon: 'remove'})), ['_delete', {scope: scope.name, key: entity._key, row_id: rowId}]));
                            }
                        })) + '</tr>');
                    this.node.find('tbody').append($entity);
                });
            });




            this.node.find('[js-component-action]').on('click', (e) => {
                e.preventDefault();
                let $action = $(e.currentTarget);
                this.action($action.data('name'), $action.data('options'));
            });


            if(!this.node.find('tbody').children().length){
                this.node.find('tbody').html('<tr><td colspan="'+(this.node.find('thead td').length)+'">Список пуст</td></tr>');
            }


            Utils.initializeComponents(this.node, this);
        }

    }

}