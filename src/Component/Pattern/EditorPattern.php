<?php

namespace Creonit\AdminBundle\Component\Pattern;

use Creonit\AdminBundle\Component\EditorComponent;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;

class EditorPattern extends Pattern
{

    /** @var  EditorComponent */
    protected $component;

    public function getData(ComponentRequest $request, ComponentResponse $response)
    {
        $key = $request->query->get('key');
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
            $field->load($storage, $entity);
            $response->data->set($field->getName(), $field->getData());
        }

    }

    public function setData(ComponentRequest $request, ComponentResponse $response)
    {
        $key = $request->query->get('key');
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
            $field->extract($request);
            $field->validate();
        }
        
        $this->component->validate($request, $response);
        
        foreach ($this->fields as $field){
            $field->save($storage, $entity);
        }
        
        $this->component->preSave($request, $response, $entity);

        $storage->saveEntity($entity);

        $this->component->postSave($request, $response, $entity);


        $response->sendSuccess();

        $request->query->set('key', $storage->getKey($entity));

    }


}