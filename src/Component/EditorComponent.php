<?php

namespace Creonit\AdminBundle\Component;

use Creonit\AdminBundle\Component\Pattern\EditorPattern;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;

abstract class EditorComponent extends Component
{
    protected function prepareSchema()
    {
        $this->setHandler('send_data', function (ComponentRequest $request, ComponentResponse $response){
            foreach($this->patterns as $pattern){
                $pattern->setData($request, $response);
                $pattern->getData($request, $response);
            }
        });
    }


    public function applySchemaAnnotation($annotation)
    {
        switch($annotation['key']){
            case 'jopa':
                break;
            default:
                parent::applySchemaAnnotation($annotation);
        }
    }

    /**
     * @param $name
     * @return EditorPattern
     */
    public function createPattern($name)
    {
        $pattern = $this->container->get('creonit_admin.component.pattern.editor');
        $pattern->setName($name);
        return $pattern;
    }

    /**
     * @param ComponentRequest $request
     * @param ComponentResponse $response
     * @param $entity
     */
    public function validate(ComponentRequest $request, ComponentResponse $response, $entity){}

    public function preSave(ComponentRequest $request, ComponentResponse $response, $entity){}

    public function postSave(ComponentRequest $request, ComponentResponse $response, $entity){}

    /**
     * @return Storage\Storage
     */
    public function getStorage(){
        return $this->patterns[0]->getStorage();
    }

}