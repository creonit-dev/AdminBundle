module Creonit.Admin.Component{
    export class Table extends Component{

        applySchema(schema:any){
            super.applySchema(schema);

            this.actions['_visible'] = (options) => {
                var $row = this.findRowById(options.row_id),
                    $button = $row.find('.table-row-visible'),
                    visible = !$button.hasClass('mod-visible');

                $button.toggleClass('mod-visible', visible);
                this.request('_visible', $.extend(this.getQuery(), {key: options.key, scope: options.scope}), {visible: visible}, (response) => {
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
                this.request('_delete', $.extend(this.getQuery(), options), null, (response) => {
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
                            <h4 class="modal-title">${this.parameters.title}</h4> 
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
                if(scope.parameters.independent){

                    if(scope.parameters.recursive){
                        $.each(this.parameters.relations, (i, relation) => {
                            if(relation.source.scope == scope.parameters.name){
                                this.renderRow(scope, relation);
                                return false;
                            }
                        });

                    }else{
                        this.renderRow(scope)
                    }
                }
                /*

                */
            });




            this.node.find('[js-component-action]').on('click', (e) => {
                e.preventDefault();
                let $action = $(e.currentTarget);
                this.action($action.data('name'), $action.data('options'));
            });


            if(!this.node.find('tbody').children().length){
                this.node.find('thead').remove();
                this.node.find('tbody').html('<tr><td colspan="'+(this.node.find('thead td').length)+'">Список пуст</td></tr>');
            }

            this.node.find('[data-toggle="tooltip"]').tooltip({container: 'body', trigger: 'hover'});

            var sortData,
                $table = this.node.find('table');



            $table.tableDnD({
                onDragClass: 'move',
                onDrop: (_, row) => {
                    if(sortData !== $.tableDnD.serialize()){
                        var item = $(row).closest('tr'),
                            sort = item.data('sort'),
                            selector = 'tr[data-sort="'+sort+'"]:first',
                            prev = $(row).prevAll(selector),
                            next = $(row).nextAll(selector);


                        $table.addClass('sorting-send');

                        this.request('_sort',
                            $.extend(this.getQuery(), {key: item.data('key'), scope: item.data('scope')}),
                            {prev: (prev.length ? prev.data('key') : 0), next: (next.length ? next.data('key') : 0)},
                            (response) => this.checkResponse(response)
                        );
                        this.loadData();

                    }else{
                        $('> tbody > tr', this.node.find('table')).removeClass('nodrop');
                        $table.removeClass('sorting');
                    }

                },
                onDragStart: (_, row) => {
                    var item = $(row).closest('tr'),
                        sort = item.data('sort');

                    sortData = $.tableDnD.serialize();

                    $table.addClass('sorting');
                    item.addClass('sorting');


                    $('> thead > tr', this.node.find('table')).addClass('nodrop');
                    $('> tbody > tr:not([data-sort="'+sort+'"])', this.node.find('table')).addClass('nodrop');
                },
                dragHandle: '.list-controls-sort',
                serializeRegexp: false
            });



            Utils.initializeComponents(this.node, this);
        }

        protected renderRow(scope:Scope, relation = null, relationValue = null, level = 0){
            var mask = `${scope.parameters.name}.${relation ? `${relation.target.scope}.${relationValue || ''}` : '_'}`;
            this.data.entities[mask].forEach((entity:any) => {
                let rowId = Utils.generateId();
                let className = entity._row_class;
                let $entity = $(`<tr data-row-id="${rowId}" data-key="${entity._key}" data-scope="${scope.parameters.name}" data-sort="${mask}" ${className ? `class="${className}"` : ''}>` + scope.template.render($.extend({}, entity, {
                        _query: this.getQuery(),
                        _row_id: rowId,
                        _level: function(){
                            return Utils.raw(new Array(level + 1).join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'));
                        },
                        _visible: function(){
                            return Utils.raw(Helpers.action(
                                    Utils.raw(Helpers.button('', {size: 'xs', icon: 'eye', className: `table-row-visible ${entity.visible ? 'mod-visible' : ''}`})),
                                ['_visible', {scope: scope.parameters.name, key: entity._key, row_id: rowId}]));
                        },
                        _delete: function(){
                            return Utils.raw(Helpers.action(
                                    Utils.raw(Helpers.button('', {size: 'xs', icon: 'remove'})),
                                ['_delete', {scope: scope.parameters.name, key: entity._key, row_id: rowId}]));
                        },
                        _controls: (value:any, [options = ''] = ['']) => {
                            return `
                                <div class="list-controls">
                                    <div class="list-controls-level">${(new Array(level + 1).join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'))}</div>
                                    <div class="list-controls-value">${value}</div>
                                    <div class="list-controls-sort"><i class="fa fa-arrows-v"></i></div>
                                    ${options ? `<div class="list-controls-options">${options}</div>` : ''}
                                </div>
                            `;
                        }
                    })) + '</tr>');
                this.node.find('tbody').append($entity);


                $.each(this.parameters.relations, (i, rel) => {
                    if(rel.target.scope == scope.parameters.name){
                        this.renderRow(this.getScope(rel.source.scope), rel, entity[rel.target.field], level+1);
                        return false;
                    }
                });



            });
        }

    }

}