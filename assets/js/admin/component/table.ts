module Creonit.Admin.Component{
    export class Table extends Component{

        static SORTABLE_COLUMN_NAME_QUERY:string = '_sortable_column_name';
        static SORTABLE_COLUMN_DIRECTION_QUERY:string = '_sortable_column_direction';

        protected expanded:any = {};
        protected pagination:any = {};

        initialize(){
            this.node.addClass('component component-table');
        }

        getQuery() {
            return $.extend(super.getQuery(), {expanded: this.expanded, pagination: this.pagination});
        }

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
                        this.trigger('visible', {options: options, visible: visible});
                    }
                })
            };

            this.actions['_delete'] = (options) => {
                if(!confirm('Элемент будет удален, продолжить?')){
                    return;
                }

                //this.findRowById(options.row_id).remove();
                this.request('_delete', $.extend(this.getQuery(), options), null, (response) => {
                    if(this.checkResponse(response)){
                        this.trigger('delete', {options: options});
                    }
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
                        
                        <div class="modal-body mod-table"></div>
                   </div>    
                `));
                node = node.find('.modal-body');

                this.node.find('.modal-header .close').on('click', () => {
                    this.close();
                });
            }


            node.html(this.template.render($.extend({}, this.data, {_query: this.query})));


            this.scopes.forEach((scope:Scope) => {
                if(scope.parameters.independent){

                    if(scope.parameters.recursive){
                        $.each(this.parameters.relations, (i, relation) => {
                            if(relation.source.scope == scope.parameters.name){
                                this.renderScope(scope, relation);
                                return false;
                            }
                        });

                    }else{
                        this.renderScope(scope)
                    }

                }
                /*

                */
            });




            this.node.find('[js-component-action]').on('click', (e) => {
                e.preventDefault();
                let $action = $(e.currentTarget);
                this.action($action.data('name'), $action.data('options'), e);
            });


            if(!this.node.find('tbody').children().length){
                this.node.find('.table:eq(0)').replaceWith('<div class="component-table-empty">Список пуст</div>')
            }

            this.node.find('[data-toggle="tooltip"]').tooltip({container: 'body', trigger: 'hover'});

            var sortData,
                $table = this.node.find('table');

            var $sortableColumns = $table.find('[js-sortable-column]');
            if ($sortableColumns.length) {
                var sortableColumnTimer;

                $sortableColumns.on('click.sortable-column', (e) => {
                    e.preventDefault();

                    var $sortableColumn = $(e.currentTarget);
                    var columnName = $sortableColumn.data('sortable-column-name');
                    var columnDirection = $sortableColumn.data('sortable-column-direction');
                    var columnDirectionMode = $sortableColumn.data('sortable-column-direction-mode');
                    var currentDirection = $sortableColumn.hasClass('is-asc') ? 'asc' : ($sortableColumn.hasClass('is-desc') ? 'desc' : null);
                    var direction = null;

                    if (columnDirectionMode === 'strict') {
                        if (!currentDirection) {
                            direction = columnDirection;
                        }

                    } else if (columnDirectionMode === 'default') {
                        if (!currentDirection) {
                            direction = columnDirection;
                        } else if (currentDirection === 'asc' && columnDirection === 'asc') {
                            direction = 'desc';
                        } else if (currentDirection === 'desc' && columnDirection === 'desc') {
                            direction = 'asc';
                        }

                    } else {
                        return;
                    }

                    $sortableColumns.trigger('state.sortable-column', null);

                    if (direction) {
                        $sortableColumn.trigger('state.sortable-column', direction);

                        this.query[Table.SORTABLE_COLUMN_NAME_QUERY] = columnName;
                        this.query[Table.SORTABLE_COLUMN_DIRECTION_QUERY] = direction;

                    } else {
                        delete this.query[Table.SORTABLE_COLUMN_NAME_QUERY];
                        delete this.query[Table.SORTABLE_COLUMN_DIRECTION_QUERY];

                        var $defaultColumn = $sortableColumns.filter('[data-sortable-column-default="1"]').eq(0);
                        if ($defaultColumn.length) {
                            $defaultColumn.click();
                            return;
                        }
                    }

                    clearTimeout(sortableColumnTimer);
                    sortableColumnTimer = setTimeout(() => this.loadData(), 200);

                });

                $sortableColumns.on('state.sortable-column', function (e, direction) {
                    var $sortableColumn = $(e.currentTarget);

                    $sortableColumn.removeClass('is-asc is-desc');

                    if (direction) {
                        $sortableColumn.addClass(`is-${direction}`);
                    }
                });

                if (this.query[Table.SORTABLE_COLUMN_NAME_QUERY]) {
                    var $sortableColumn = $sortableColumns.filter(`[data-sortable-column-name="${this.query[Table.SORTABLE_COLUMN_NAME_QUERY]}"]`);

                    $sortableColumn.trigger('state.sortable-column', this.query[Table.SORTABLE_COLUMN_DIRECTION_QUERY]);

                    $table.find('.list-controls-sort').remove();
                }
            }

            $table.find('.list-controls-flex.has-children').on('click', (e) => {
                var $row = $(e.currentTarget).closest('tr'),
                    mask = $row.data('mask'),
                    key = $row.data('key'),
                    index;

                if(!this.expanded[mask]){
                    this.expanded[mask] = [];
                }

                if((index = this.expanded[mask].indexOf(key)) >= 0){
                    this.expanded[mask].splice(index, 1);
                }else{
                    this.expanded[mask].push(key);
                }

                this.loadData();
            });

            $table.find('.list-pagination li:not(.active) span').on('click', (e) => {
                var $button = $(e.currentTarget),
                    $row = $button.closest('tr'),
                    page = $button.data('page');

                if(!page){
                    return;
                }

                this.pagination[$row.data('mask')] = page;
                this.loadData();
            });

            $table.tableDnD({
                onDragClass: 'move',
                onDrop: (_, row) => {
                    if(sortData !== $.tableDnD.serialize()){
                        var item = $(row).closest('tr'),
                            mask = item.data('mask'),
                            selector = 'tr[data-mask="'+mask+'"]:first',
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
                        mask = item.data('mask');

                    sortData = $.tableDnD.serialize();

                    $table.addClass('sorting');
                    item.addClass('sorting');


                    $('> thead > tr', this.node.find('table')).addClass('nodrop');
                    $('> tbody > tr:not([data-mask="'+mask+'"])', this.node.find('table')).addClass('nodrop');
                },
                dragHandle: '.list-controls-sort',
                serializeRegexp: false
            });


            this.node.find('.panel-heading form').on('submit', (e) => {
                e.preventDefault();
                var $form = $(e.currentTarget);

                $.extend(this.query, $form.serializeObject());
                this.loadData();
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

            this.trigger('render', {});

            Utils.initializeComponents(this.node, this);
        }


        protected renderScope(scope:Scope, relation = null, relationValue = null, level = 0){
            var mask = `${scope.parameters.name}.${relation ? `${relation.target.scope}.${relationValue || ''}` : '_'}`;
            if(!this.data.entities[mask]){
                return;
            }
            this.data.entities[mask].forEach((entity:any) => {
                let rowId = Utils.generateId();
                let className = entity._row_class;
                let $entity = $(`<tr data-row-id="${rowId}" data-key="${JSON.stringify(entity._key).replace(/(^"|"$)/g, '')}" data-scope="${scope.parameters.name}" data-mask="${mask}" ${className ? `class="${className}"` : ''}>` + scope.template.render($.extend({}, entity, {
                        _data: this.data,
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
                                    ${scope.parameters.collapsed ? `<div class="list-controls-flex ${entity._has_children ? 'has-children' : ''}">${!entity._has_children ? '<i class="fa fa-square-o"></i>' : (this.expanded[mask] && this.expanded[mask].indexOf(entity._key) >= 0) ? '<i class="fa fa-minus-square-o"></i>' : '<i class="fa fa-plus-square-o"></i>'}</div>` : ''}
                                    <div class="list-controls-value">${value}</div>
                                    ${scope.parameters.sortable ? `<div class="list-controls-sort"><i class="fa fa-arrows-v"></i></div>` : ''}
                                    ${options ? `<div class="list-controls-options">${options}</div>` : ''}
                                </div>
                            `;
                        }
                    })) + '</tr>');
                this.node.find('tbody').append($entity);


                $.each(this.parameters.relations, (i, rel) => {
                    if(rel.target.scope == scope.parameters.name){
                        if(!scope.parameters.collapsed || (this.expanded[mask] && this.expanded[mask].indexOf(entity._key) >= 0)){
                            this.renderScope(this.getScope(rel.source.scope), rel, entity[rel.target.field], level+1);
                        }
                    }
                });

            });

            if(this.data.pagination && this.data.pagination[mask]){
                let pagination = this.data.pagination[mask];

                const pagesLimit = 20;
                const halfPagesLimit = Math.floor(pagesLimit / 2);
                let startPage = pagination.page - halfPagesLimit + 1 - pagesLimit % 2;
                let endPage = pagination.page + halfPagesLimit;

                if (startPage <= 0) {
                    startPage = 1;
                    endPage = pagesLimit;
                }
                if (endPage > pagination.last_page) {
                    startPage = pagination.last_page - pagesLimit + 1;
                    endPage = pagination.last_page;
                }


                if (pagination.last_page > 1) {
                    const paginationNumbers = [];
                    for (let i = 1; i <= pagination.last_page; i++) {
                        if (i !== 1 && i !== pagination.last_page && (i < startPage || i > endPage)) {
                            continue;
                        }

                        if (i === pagination.last_page && i > endPage + 1) {
                            paginationNumbers.push(`<li><span data-page="${Math.floor((pagination.last_page + endPage) / 2)}">...</span></li>`);
                        }

                        paginationNumbers.push(`<li ${i == pagination.page ? 'class="active"' : ''}><span data-page="${i}">${i}</span></li>`);

                        if (i === 1 && i < startPage - 1) {
                            paginationNumbers.push(`<li><span data-page="${Math.floor((1 + startPage) / 2)}">...</span></li>`);
                        }
                    }

                    this.node.find('tbody').append(
                        $(`<tr class="list-pagination" data-mask="${mask}"><td colspan="15">${(new Array(level + 1).join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'))}<ul class="pagination pagination-info">${paginationNumbers.join('')}</ul></td></tr>`)
                    );
                }
            }

        }

    }

}