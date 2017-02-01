declare var baseUrl:string;

module Creonit.Admin {
    export class Manager{
        protected static instance:Manager;

        protected timerInstance:any;
        protected requestStack:Component.Request[] = [];

        protected events = {};
        
        static getInstance():Manager{
            if(!this.instance){
                this.instance = new this;
                this.instance.timer();
            }
            return this.instance;
        }


        trigger(event:string, data:any){
            if(!this.events[event]){
                return;
            }

            this.events[event].forEach((listener:(data: any) => void) => {
                listener.call(this, data);
            });

        }

        on(event:string, callback: (data: any) => void){
            if(!this.events[event]){
                this.events[event] = [];
            }

            if(this.events[event].indexOf(callback) == -1){
                this.events[event].push(callback);
            }
        }
        
        request(request:Component.Request){
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


            stack.forEach((request: Component.Request) => {
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
                url: baseUrl + '/admin/',
                type: 'post',
                dataType: 'json',
                data: form,
                processData: false,
                contentType: false,
                success: (response:any[]) => {
                    stack.forEach((request: Component.Request, i:number) => {
                        request.passResponse(new Component.Response(response[i]));
                    });
                },
                complete: (xhr:any) => {
                    if(xhr.status == 401 || xhr.status == 403){
                        document.location.reload();
                    }
                },
                error: () => {
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