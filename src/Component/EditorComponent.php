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
            
            $this->saveData($request, $response);
            $response->flushError();
            $this->loadData($request, $response);
        });

        $this->setHandler('reload_data', function (ComponentRequest $request, ComponentResponse $response){

            $entity = $this->retrieveEntity($request, $response);

            foreach ($this->fields as $field){
                $field->save($entity, $field->extract($request));
            }

            foreach ($this->fields as $field){
                $response->data->set($field->getName(), $field->supportEntity($entity) ? $field->load($entity) : $field->decorate($request->data->get($field->getName())));
            }

            $this->decorate($request, $response, $entity);
        });
    }

    public function loadData(ComponentRequest $request, ComponentResponse $response)
    {
        $entity = $this->retrieveEntity($request, $response);

        foreach ($this->fields as $field){
            if($field->parameters->has('load')){
                
            }
            $response->data->set($field->getName(), $field->load($entity) ?: $field->decorate($response->data->get($field->getName())));
        }
        
        $this->decorate($request, $response, $entity);
    }

    public function decorate(ComponentRequest $request, ComponentResponse $response, $entity)
    {
    }



    protected function retrieveEntity(ComponentRequest $request, ComponentResponse $response){
        $key = $request->query->get('key');
        if($key){
            $entity = $this->createQuery()->findPk($key) or $response->flushError('Элемент не найден');
        }else{
            $entity = $this->createEntity();
        }
        return $entity;
    }

    public function saveData(ComponentRequest $request, ComponentResponse $response)
    {
        $entity = $this->retrieveEntity($request, $response);

        $dataMap = [];
        foreach ($this->fields as $field){
            $dataMap[$field->getName()] = $data = $field->extract($request);
            foreach($field->validate($data) as $error){
                $response->error($error->getMessage(), $field->getName());
            }
        }

        if($response->hasError()){
            return;
        }

        $this->validate($request, $response, $entity);

        if($response->hasError()){
            return;
        }

        foreach ($this->fields as $field){
            $field->save($entity, $dataMap[$field->getName()]);
        }

        $this->preSave($request, $response, $entity);

        $entity->save();

        $this->postSave($request, $response, $entity);


        $response->sendSuccess();

        $request->query->set('key', $key = $entity->getPrimaryKey());
        $response->query->set('key', $key);

    }

    /**
     * @param ComponentRequest $request
     * @param ComponentResponse $response
     * @param $entity
     */
    public function validate(ComponentRequest $request, ComponentResponse $response, $entity){}

    public function preSave(ComponentRequest $request, ComponentResponse $response, $entity){}

    public function postSave(ComponentRequest $request, ComponentResponse $response, $entity){}

/*
    public function dump()
    {
        $fields = [];
        foreach ($this->fields as $field) {
            $fields[$field->getName()] = $field->dump();
        }
        return array_merge(parent::dump(), ['fields' => $fields]);
    }
*/


}