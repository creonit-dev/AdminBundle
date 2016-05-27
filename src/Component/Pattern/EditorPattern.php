<?php

namespace Creonit\AdminBundle\Component\Pattern;

use Creonit\AdminBundle\Component\Request\ComponentRequest;

class EditorPattern extends Pattern
{

    public function getData(ComponentRequest $request)
    {
        $data = [];
        $key = $request->parameters->get('key');
        $storage = $this->getStorage();
        if($key){
            $entity = $storage->getEntity([
                'entity' => $this->getEntity(),
                'key' => $key
            ]);
        }else{
            $entity = $storage->createEntity([
                'entity' => $this->getEntity()
            ]);
        }

        foreach ($this->fields as $field){
            $data[$field->getName()] = $storage->getData($entity, $field);
        }

        return $data;
    }

    public function setData(ComponentRequest $request)
    {
        $key = $request->parameters->get('key');
        $storage = $this->getStorage();
        if($key){
            $entity = $storage->getEntity([
                'entity' => $this->getEntity(),
                'key' => $key
            ]);
        }else{
            $entity = $storage->createEntity([
                'entity' => $this->getEntity()
            ]);
        }

        foreach ($this->fields as $field){
            if($data = $request->data->get($field->getName())){
                $storage->setData($entity, $field, $data);
            }
        }

        $storage->saveEntity($entity);

        $request->parameters->set('key', $storage->getKey($entity));

    }


}