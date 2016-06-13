<?php

namespace Creonit\AdminBundle\Component\Pattern;

use Creonit\AdminBundle\Component\ListComponent;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;

class ListPattern extends Pattern
{
    /** @var ListComponent */
    protected $component;
    
    protected $decorator;
    

    public function getData(ComponentRequest $request, ComponentResponse $response){
        $response->data->set('entities', $this->loadData());
    }

    protected function loadData($id = null){
        $storage = $this->getStorage();
        $entities = $storage->getEntities([
            'entity' => $this->getEntity(),
        ]);

        $data = [];
        foreach ($entities as $entity){
            $entityData = [];
            foreach ($this->fields as $field){
                $entityData[$field->getName()] = $storage->getData($entity, $field);
            }
            $entityData['_key'] = $storage->getKey($entity);
            $data[] = $this->decorate($entityData, $entity);
        }
        

        return $data;
    }

    protected function decorate($data, $entity){
        if(null !== $this->decorator){
            $closure = $this->decorator;
            $data = $closure($data, $entity);
            $data = $this->component->decorate($this, $data, $entity);
            return $data;
            
        }else{
            return $data;
        }
    }

    public function setDecorator(\Closure $closure)
    {
        $this->decorator = $closure;
    }

   

}