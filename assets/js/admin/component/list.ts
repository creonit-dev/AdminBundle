module Creonit.Admin.Component{
    export class List extends Component {
        render() {


            this.node.html(this.template.render($.extend({}, this.data, {parameters: this.query})));

            this.patterns.forEach((pattern:Pattern) => {
                this.data[pattern.name].entities.forEach((entity:any) => {
                    this.node.find('.component-list-body').append(pattern.template.render(entity));
                });
            });


            Utils.initializeComponents(this.node, this);
        }
    }
}