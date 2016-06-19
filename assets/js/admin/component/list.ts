module Creonit.Admin.Component{
    export class List extends Component {
        render() {


            this.node.html(this.template.render($.extend({}, this.data, {parameters: this.query})));

    

            Utils.initializeComponents(this.node, this);
        }
    }
}