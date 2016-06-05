module Creonit.Admin.Component {
    export class Manager{
        protected static instance:Manager;

        protected timerInstance:any;
        protected requestStack:Request[] = [];

        static getInstance():Manager{
            if(!this.instance){
                this.instance = new this;
                this.instance.timer();
            }
            return this.instance;
        }

        request(request:Request){
            this.requestStack.push(request);
            if(this.requestStack.length > 100){
                this.requestSend();
            }
        }

        protected requestSend(){
            var stack = this.requestStack.splice(0, this.requestStack.length),
                form:any = new FormData;

            function getType(any) {
                return Object.prototype.toString.call(any).slice(8, -1);
            }

            function toName(path) {
                let array = path.map((part) => `[${part}]`);
                array[0] = path[0];
                return array.join('');
            }


            stack.forEach((request: Request) => {
                let appendToForm = function(path, node, filename?) {
                    let name = toName(path);

                    if (typeof filename == 'undefined') {
                        form.append(name, node);
                    } else {
                        form.append(name, node, filename);
                    }
                };

                let check = function (node) {
                    let type = getType(node);
                    switch (type) {
                        case 'Array':
                            return true; // step into
                        case 'Object':
                            return true; // step into
                        case 'FileList':
                            return true; // step into
                        default:
                            return false; // prevent step into
                    }
                };

                function iterator(object, parentPath){
                    $.each(object, function (name, node) {
                        var path = parentPath.slice();
                        path.push(name);
                        var type = getType(node);
                        switch (type) {
                            case 'Array':
                                break;
                            case 'Object':
                                break;
                            case 'FileList':
                                break;
                            case 'File':
                                appendToForm(path, node);
                                break;
                            case 'Blob':
                                appendToForm(path, node, node.name);
                                break;
                            default:
                                appendToForm(path, node);
                                break;
                        }

                        if(check(node)){
                            iterator(node, path)
                        }
                    });
                }

                iterator(request.getQuery(), ['request[c'+request.getId()+']']);


            });


            $.ajax({
                url: '/admin/',
                type: 'post',
                dataType: 'json',
                data: form,
                processData: false,
                contentType: false,
                success: (response:any[]) => {
                    stack.forEach((request: Request, i:number) => {
                        request.passResponse(new Response(response[i]));
                    });
                },
                complete: () => {
                }
            });
        }

        protected timer(){
            this.timerInstance = setTimeout(() => {
                if(this.requestStack.length){
                    this.requestSend();
                }
                this.timer();
            }, 10);
        }

    }
}