module Creonit{
    export module Admin{
        export module Component{
            export class List extends Component{
                render(){

                    var childrenComponents = this.node.find('['+ Creonit.Admin.Component.ATTR_HANDLER +']').detach();

                    this.node.html(this.template.render($.extend({}, this.data, {parameters: this.parameters})));

                    this.patterns.forEach((pattern:Pattern) => {
                        this.data[pattern.name].entities.forEach((entity:any) => {
                            this.node.find('.component-list-body').append(pattern.template.render(entity));
                        });
                    });

                    if(childrenComponents.length){
                        this.node.find('['+ Creonit.Admin.Component.ATTR_HANDLER +']').each(function(i){
                            $(this).after(childrenComponents.eq(i)).remove();
                        });
                    }

                    find(this.node, {parent: this});
                }
            }
        }
    }

}