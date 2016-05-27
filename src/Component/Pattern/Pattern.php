<?php

namespace Creonit\AdminBundle\Component\Pattern;

use Creonit\AdminBundle\Component\Component;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Field\Field;
use Creonit\AdminBundle\Manager;

abstract class Pattern
{

    protected $name;
    protected $entity;

    protected $storage;

    protected $template = '';
    
    /** @var Manager */
    protected $manager;
    
    /** @var Component */
    protected $component;

    /** @var Pattern|null */
    protected $parentPattern;
    
    /** @var Field[] */
    protected $fields = [];


    /**
     * ComponentPattern constructor.
     * @param $name
     */
    public function __construct($name)
    {
        $this->name = $name;
    }

    /**
     * @param Pattern|null $parentPattern
     */
    public function setParentPattern($parentPattern){
        $this->parentPattern = $parentPattern;
    }

    public function getName(){
        return $this->name;
    }

    public function setName($name){
        $this->name = $name;
    }

    public function addField(Field $field){
        $this->fields[$field->getName()] = $field;
        return $this;
    }


    public function fillResponse($response)
    {
        if($this->storage){
            foreach($this->getFields() as $field){
                $response->data->set($field->getName(), $field->getData());
            }
        }
        return $this;
    }

    public function getTemplate()
    {
        return $this->template;
    }

    /**
     * @param mixed $template
     * @return Pattern
     */
    public function setTemplate($template)
    {
        $this->template = $template;
        return $this;
    }

    /**
     * @return Field[]
     */
    public function getFields()
    {
        return $this->fields;
    }


    public function dump(){
        $pattern = [
            'name' => $this->name,
            'template' => $this->template,
            'fields' => []
        ];

        foreach ($this->fields as $field){
            $pattern['fields'][] = $field->dump();
        }

        return $pattern;
    }


    public function applySchemaAnnotations($annotations){
        foreach ($annotations as $annotation){
            $this->applySchemaAnnotation($annotation);
        }
        return $this;
    }

    public function applySchemaAnnotation($annotation){
        switch($annotation['key']){
            case 'storage':
                $this->setStorage($annotation['value']);
                break;
            case 'field':
                $this->addField(new Field($annotation['value']));
                break;
            case 'entity':
                $this->setEntity($annotation['value']);
                break;
            case 'template':
                $this->setTemplate($annotation['value']);
                break;
        }
        return $this;
    }

    abstract public function getData(ComponentRequest $request);


    public function setData(ComponentRequest $request){
    }

    /**
     * @param Component $component
     * @return Pattern
     */
    public function setComponent($component)
    {
        $this->component = $component;
        return $this;
    }

    /**
     * @param Manager $manager
     * @return Pattern
     */
    public function setManager($manager)
    {
        $this->manager = $manager;
        return $this;
    }

    /**
     * @param mixed $entity
     * @return Pattern
     */
    public function setEntity($entity)
    {
        $this->entity = $entity;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getEntity()
    {
        return $this->entity ?: $this->name;
    }

    public function prepareTemplate()
    {
        $this->template = preg_replace_callback(
            '/\{\{\s*([\w_]+)\s*\|\s*(textarea|text)(\(?\)?)(.*?\}\})/usi',
            function($match){
                $this->addField(new Field($match[1]));
                return "{{ {$match[1]} | {$match[2]}" . (($match[3] && $match[3] != '()') ? "('{$match[1]}', " : "('{$match[1]}')") . $match[4];
            },
            $this->template
        );

        if(preg_match_all('/\{\{\s*([\w_]+)\s*(?:\||\}\})/usi', $this->template, $matches, PREG_SET_ORDER)){
            foreach($matches as $match){
                $this->addField(new Field($match[1]));
            }
        }

        return $this;
    }


    protected function getStorage()
    {
        return $this->storage ? $this->storage : $this->manager->getStorage();
    }

    /**
     * @param $storage
     * @return Pattern
     */
    protected function setStorage($storage)
    {
        $this->storage = $storage;
        return $this;
    }

}